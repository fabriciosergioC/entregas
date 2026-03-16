import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

// Configuração do CORS para produção
const corsOrigin = process.env.CORS_ORIGIN || '*';
const corsOptions = {
  origin: corsOrigin === '*' ? '*' : corsOrigin.split(','),
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const io = new Server(server, {
  cors: corsOptions,
  // Configurações para produção no Render
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

const PORT = Number(process.env.PORT) || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(cors(corsOptions));
app.use(express.json());

// Dados em memória
const entregadores: Map<string, any> = new Map();
const pedidos: Map<string, any> = new Map();

// Seed inicial de pedidos
pedidos.set('1', {
  id: '1',
  cliente: 'João Silva',
  endereco: 'Rua das Flores, 123 - Centro',
  itens: ['Pizza Grande', 'Refrigerante 2L'],
  status: 'pendente',
  entregadorId: undefined,
  createdAt: new Date(),
});

pedidos.set('2', {
  id: '2',
  cliente: 'Maria Santos',
  endereco: 'Av. Paulista, 456 - Bela Vista',
  itens: ['Hambúrguer', 'Batata Frita'],
  status: 'pendente',
  entregadorId: undefined,
  createdAt: new Date(),
});

// Rotas de Entregadores
app.post('/entregadores/login', (req, res) => {
  const { nome, telefone } = req.body;
  
  // Verifica se entregador já existe
  let entregador = Array.from(entregadores.values()).find(
    (e) => e.nome === nome && e.telefone === telefone
  );

  if (!entregador) {
    // Cria novo entregador
    const id = String(Date.now());
    entregador = {
      id,
      nome,
      telefone,
      disponivel: true,
      localizacao: { lat: -23.5505, lng: -46.6333 },
    };
    entregadores.set(id, entregador);
  }

  res.json(entregador);
});

app.post('/entregadores/:id/localizacao', (req, res) => {
  const { id } = req.params;
  const { lat, lng } = req.body;

  const entregador = entregadores.get(id);
  if (entregador) {
    entregador.localizacao = { lat, lng };
    
    // Emite atualização de localização
    io.emit('nova-localizacao', { entregadorId: id, lat, lng });
    
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Entregador não encontrado' });
  }
});

// Rotas de Pedidos
app.get('/pedidos/disponiveis', (req, res) => {
  const disponiveis = Array.from(pedidos.values()).filter(
    (p) => p.status === 'pendente'
  );
  res.json(disponiveis);
});

app.get('/pedidos/entregador/:entregadorId', (req, res) => {
  const { entregadorId } = req.params;
  const meusPedidos = Array.from(pedidos.values()).filter(
    (p) => p.entregadorId === entregadorId
  );
  res.json(meusPedidos);
});

app.post('/pedidos/:id/aceitar', (req, res) => {
  const { id } = req.params;
  const { entregadorId } = req.body;

  console.log('📝 Recebida requisição para aceitar pedido:', id, 'Entregador:', entregadorId);

  const pedido = pedidos.get(id);
  if (pedido) {
    pedido.status = 'aceito';
    pedido.entregadorId = entregadorId;

    console.log('✅ Pedido atualizado:', pedido);
    console.log('📡 Emitindo evento pedido-aceito');
    io.emit('pedido-aceito', pedido);

    res.json(pedido);
  } else {
    console.error('❌ Pedido não encontrado:', id);
    res.status(404).json({ error: 'Pedido não encontrado' });
  }
});

app.post('/pedidos/:id/iniciar', (req, res) => {
  const { id } = req.params;

  const pedido = pedidos.get(id);
  if (pedido) {
    pedido.status = 'em_transito';
    
    io.emit('novo-pedido', pedido);
    
    res.json(pedido);
  } else {
    res.status(404).json({ error: 'Pedido não encontrado' });
  }
});

app.post('/pedidos/:id/finalizar', (req, res) => {
  const { id } = req.params;

  const pedido = pedidos.get(id);
  if (pedido) {
    pedido.status = 'entregue';
    
    io.emit('pedido-finalizado', pedido);
    
    res.json(pedido);
  } else {
    res.status(404).json({ error: 'Pedido não encontrado' });
  }
});

// Criar novo pedido (Estabelecimento)
app.post('/pedidos', (req, res) => {
  console.log('📝 [POST /pedidos] Recebida requisição:', req.body);
  
  const { cliente, endereco, itens } = req.body;

  if (!cliente || !endereco || !itens) {
    console.error('❌ [POST /pedidos] Campos inválidos:', { cliente, endereco, itens: !!itens });
    return res.status(400).json({ error: 'Campos obrigatórios: cliente, endereco, itens' });
  }

  const id = String(Date.now());
  const novoPedido = {
    id,
    cliente,
    endereco,
    itens,
    status: 'pendente' as const,
    entregadorId: undefined,
    createdAt: new Date(),
  };

  console.log('📦 [POST /pedidos] Criando pedido:', novoPedido);
  pedidos.set(id, novoPedido);

  // Notificar todos os entregadores via socket
  console.log('📡 [POST /pedidos] Emitindo evento novo-pedido para todos os clientes');
  console.log('📡 [POST /pedidos] Clientes conectados:', io.engine.clientsCount);

  io.emit('novo-pedido', novoPedido);

  // Verificar se foi emitido
  io.fetchSockets().then(sockets => {
    console.log('📡 [POST /pedidos] Total de sockets conectados:', sockets.length);
  });

  console.log('✅ [POST /pedidos] Pedido criado com sucesso:', id);

  res.json(novoPedido);
});

// Listar todos os pedidos (para o estabelecimento)
app.get('/pedidos', (req, res) => {
  const todosPedidos = Array.from(pedidos.values()).map(pedido => {
    // Adiciona informações do entregador se existir
    if (pedido.entregadorId) {
      const entregador = entregadores.get(pedido.entregadorId);
      return {
        ...pedido,
        entregadorNome: entregador?.nome || 'Entregador',
        entregadorTelefone: entregador?.telefone || '',
      };
    }
    return pedido;
  });
  res.json(todosPedidos);
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('✅ Cliente conectado:', socket.id, 'Origem:', socket.handshake.headers.origin);
  console.log('📊 Total de clientes conectados:', io.engine.clientsCount);

  socket.on('entrar-sala-entregador', (entregadorId: string) => {
    socket.join(`entregador-${entregadorId}`);
    console.log(`📍 Entregador ${entregadorId} entrou na sala`);
  });

  socket.on('localizacao', (data: { entregadorId: string; lat: number; lng: number }) => {
    console.log('📡 Recebida localização:', data);
    io.emit('nova-localizacao', data);
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
    console.log('📊 Total de clientes conectados:', io.engine.clientsCount);
  });
});

// Endpoint de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    pedidos: pedidos.size,
    entregadores: entregadores.size,
    socketsConectados: io.engine.clientsCount,
  });
});

// Endpoint de debug para verificar sockets
app.get('/debug/sockets', async (req, res) => {
  const sockets = await io.fetchSockets();
  res.json({
    total: sockets.length,
    clientsCount: io.engine.clientsCount,
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor backend rodando em http://0.0.0.0:${PORT}`);
  console.log(`🌍 Ambiente: ${NODE_ENV}`);
  if (NODE_ENV === 'development') {
    console.log(`📱 Acesse do celular em: http://192.168.1.3:${PORT}`);
  } else {
    console.log(`☁️  Servidor em produção - Render`);
  }
});
