/**
 * Configuração do Socket.IO para Produção (Render)
 * 
 * Use este arquivo como referência para conectar seu frontend
 * ao backend hospedado no Render
 */

import { io } from 'socket.io-client';

// URL do backend no Render (substitua pela sua)
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://entregas-backend.onrender.com';

// Configuração otimizada para produção
export const socket = io(BACKEND_URL, {
  // Transports necessários para funcionar atrás de proxy/load balancer
  transports: ['websocket', 'polling'],
  
  // Reconexão automática
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  
  // Timeout para produção
  timeout: 20000,
  autoConnect: true,
  
  // Força WebSocket (mais eficiente)
  forceNew: false,
});

// Eventos de debug
socket.on('connect', () => {
  console.log('✅ Socket conectado:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Socket desconectado');
});

socket.on('connect_error', (error) => {
  console.error('Erro na conexão:', error.message);
});

socket.on('reconnect', (attemptNumber) => {
  console.log(`🔄 Reconectado após ${attemptNumber} tentativas`);
});

export default socket;
