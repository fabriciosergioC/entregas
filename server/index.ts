/**
 * Servidor WebSocket com Socket.IO + Supabase
 * 
 * Este servidor gerencia:
 * - Conexões WebSocket em tempo real
 * - Eventos de localização de entregadores
 * - Notificações de pedidos
 * - Integração com Supabase para persistência
 */

import http from 'http';
import { Server } from 'socket.io';
import { createClient } from '@supabase/supabase-js';

// =============================================
// CONFIGURAÇÃO
// =============================================

const PORT = Number(process.env.PORT) || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =============================================
// SERVIDOR HTTP + SOCKET.IO
// =============================================

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      socketsConectados: io.engine.clientsCount,
      ambiente: NODE_ENV,
    }));
    return;
  }

  // Debug de sockets
  if (req.url === '/debug/sockets') {
    io.fetchSockets().then(sockets => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        total: sockets.length,
        clientsCount: io.engine.clientsCount,
      }));
    });
    return;
  }

  // OPTIONS para CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API básica
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Configuração do Socket.IO
const corsOrigin = process.env.CORS_ORIGIN || '*';
const io = new Server(server, {
  cors: {
    origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

// =============================================
// MAPAS EM MEMÓRIA (Cache)
// =============================================

// Cache de entregadores conectados
const entregadoresOnline = new Map<string, {
  id: string;
  socketId: string;
  nome: string;
  localizacao?: { lat: number; lng: number };
}>();

// =============================================
// SOCKET.IO EVENTOS
// =============================================

io.on('connection', (socket) => {
  console.log('✅ Cliente conectado:', socket.id);
  console.log('📊 Total de clientes:', io.engine.clientsCount);

  // =============================================
  // ENTRAR NA SALA DO ENTREGADOR
  // =============================================
  socket.on('entrar-sala-entregador', async (entregadorId: string) => {
    socket.join(`entregador-${entregadorId}`);
    console.log(`📍 Entregador ${entregadorId} entrou na sala`);

    // Atualizar cache
    try {
      const { data: entregador } = await supabase
        .from('entregadores')
        .select('id, nome, localizacao_lat, localizacao_lng')
        .eq('id', entregadorId)
        .single();

      if (entregador) {
        entregadoresOnline.set(entregadorId, {
          id: entregadorId,
          socketId: socket.id,
          nome: entregador.nome,
          localizacao: entregador.localizacao_lat && entregador.localizacao_lng
            ? { lat: entregador.localizacao_lat, lng: entregador.localizacao_lng }
            : undefined,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar entregador:', error);
    }
  });

  // =============================================
  // ENVIAR LOCALIZAÇÃO
  // =============================================
  socket.on('localizacao', async (data: { entregadorId: string; lat: number; lng: number }) => {
    console.log('📡 Localização recebida:', data);

    // Atualizar no Supabase
    try {
      await supabase
        .from('entregadores')
        .update({
          localizacao_lat: data.lat,
          localizacao_lng: data.lng,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.entregadorId);

      // Atualizar cache
      const entregador = entregadoresOnline.get(data.entregadorId);
      if (entregador) {
        entregador.localizacao = { lat: data.lat, lng: data.lng };
        entregadoresOnline.set(data.entregadorId, entregador);
      }

      // Emitir para todos os clientes
      io.emit('nova-localizacao', data);

      // Emitir para sala específica
      io.to(`entregador-${data.entregadorId}`).emit('sua-localizacao', data);
    } catch (error) {
      console.error('Erro ao atualizar localização:', error);
    }
  });

  // =============================================
  // LOGIN DE ENTREGADOR
  // =============================================
  socket.on('entregador-login', (data: { id: string }) => {
    console.log('📝 Entregador login:', data.id);
    
    // Atualizar cache
    const existente = entregadoresOnline.get(data.id);
    if (existente) {
      existente.socketId = socket.id;
      entregadoresOnline.set(data.id, existente);
    }
  });

  // =============================================
  // EVENTOS DE PEDIDOS (Broadcast)
  // =============================================
  socket.on('pedido-aceito-event', (data: { pedidoId: string; entregadorId: string }) => {
    console.log('📦 Pedido aceito:', data);
    
    // Emitir para todos os clientes
    io.emit('pedido-aceito', {
      id: data.pedidoId,
      entregadorId: data.entregadorId,
      status: 'aceito',
    });

    // Emitir para o entregador específico
    io.to(`entregador-${data.entregadorId}`).emit('seu-pedido-aceito', data);
  });

  socket.on('pedido-iniciado-event', (data: { pedidoId: string }) => {
    console.log('🚚 Pedido iniciado:', data.pedidoId);
    
    io.emit('pedido-iniciado', data);
  });

  socket.on('pedido-finalizado-event', (data: { pedidoId: string }) => {
    console.log('✅ Pedido finalizado:', data.pedidoId);
    
    io.emit('pedido-finalizado', data);
  });

  // =============================================
  // DISCONNECT
  // =============================================
  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
    console.log('📊 Total de clientes:', io.engine.clientsCount);

    // Remover do cache
    for (const [entregadorId, dados] of entregadoresOnline.entries()) {
      if (dados.socketId === socket.id) {
        entregadoresOnline.delete(entregadorId);
        console.log(`🗑️ Entregador ${entregadorId} removido do cache`);
        break;
      }
    }
  });

  // =============================================
  // ERROR
  // =============================================
  socket.on('error', (error: Error) => {
    console.error('❌ Erro no socket:', error);
  });
});

// =============================================
// SUPABASE REALTIME (Opcional)
// =============================================

// Escutar mudanças no banco de dados e emitir via Socket.IO
if (supabaseUrl && supabaseServiceKey) {
  const channel = supabase
    .channel('pedidos-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'pedidos',
      },
      (payload) => {
        console.log('📦 Novo pedido no banco:', payload.new);
        io.emit('novo-pedido', payload.new);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'pedidos',
      },
      (payload) => {
        console.log('📝 Pedido atualizado no banco:', payload.new);
        io.emit('pedido-atualizado', payload.new);
      }
    )
    .subscribe();

  console.log('✅ Supabase Realtime conectado');
}

// =============================================
// INICIAR SERVIDOR
// =============================================

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor WebSocket rodando em http://0.0.0.0:${PORT}`);
  console.log(`🌍 Ambiente: ${NODE_ENV}`);
  console.log(`📦 Supabase: ${supabaseUrl ? '✅' : '❌'}`);
  
  if (NODE_ENV === 'development') {
    console.log(`📱 Acesse do celular em: http://192.168.1.3:${PORT}`);
  } else {
    console.log(`☁️  Servidor em produção`);
  }
});

// =============================================
// GRACEFUL SHUTDOWN
// =============================================

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido, fechando servidor...');
  io.close();
  server.close(() => {
    console.log('✅ Servidor fechado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recebido, fechando servidor...');
  io.close();
  server.close(() => {
    console.log('✅ Servidor fechado');
    process.exit(0);
  });
});
