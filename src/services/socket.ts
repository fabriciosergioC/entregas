import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export const conectarSocket = () => {
  if (socket) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Conectado ao servidor WebSocket');
  });

  socket.on('disconnect', () => {
    console.log('❌ Desconectado do servidor WebSocket');
  });

  socket.on('connect_error', (error) => {
    console.error('Erro de conexão:', error);
  });

  return socket;
};

export const aguardarConexao = (): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      socket = conectarSocket();
    }

    if (socket.connected) {
      resolve(socket);
      return;
    }

    socket.once('connect', () => {
      resolve(socket!);
    });

    socket.once('connect_error', (error) => {
      reject(error);
    });

    // Timeout de 5 segundos
    setTimeout(() => {
      reject(new Error('Timeout ao conectar socket'));
    }, 5000);
  });
};

export const desconectarSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

// Eventos do servidor
export const eventosServidor = {
  NOVO_PEDIDO: 'novo-pedido',
  PEDIDO_ACEITO: 'pedido-aceito',
  NOVA_LOCALIZACAO: 'nova-localizacao',
  PEDIDO_FINALIZADO: 'pedido-finalizado',
};

// Eventos do cliente
export const eventosCliente = {
  ENTRAR_SALA_ENTREGADOR: 'entrar-sala-entregador',
  ENVIAR_LOCALIZACAO: 'localizacao',
};
