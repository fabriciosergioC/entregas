// Configuração da API
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Pedido {
  id: string;
  cliente: string;
  endereco: string;
  itens: string[];
  status: 'pendente' | 'aceito' | 'em_transito' | 'entregue';
  entregadorId?: string;
  createdAt: Date;
}

export interface Entregador {
  id: string;
  nome: string;
  telefone: string;
  disponivel: boolean;
  localizacao?: {
    lat: number;
    lng: number;
  };
}

// API de Pedidos
export const api = {
  // Listar pedidos disponíveis
  async listarPedidosDisponiveis(): Promise<Pedido[]> {
    const response = await fetch(`${API_URL}/pedidos/disponiveis`);
    return response.json();
  },

  // Meus pedidos (entregador)
  async meusPedidos(entregadorId: string): Promise<Pedido[]> {
    const response = await fetch(`${API_URL}/pedidos/entregador/${entregadorId}`);
    return response.json();
  },

  // Aceitar pedido
  async aceitarPedido(id: string, entregadorId: string) {
    const response = await fetch(`${API_URL}/pedidos/${id}/aceitar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entregadorId }),
    });
    return response.json();
  },

  // Iniciar entrega
  async iniciarEntrega(id: string) {
    const response = await fetch(`${API_URL}/pedidos/${id}/iniciar`, {
      method: 'POST',
    });
    return response.json();
  },

  // Finalizar pedido
  async finalizarPedido(id: string) {
    const response = await fetch(`${API_URL}/pedidos/${id}/finalizar`, {
      method: 'POST',
    });
    return response.json();
  },

  // Login entregador
  async loginEntregador(nome: string, telefone: string) {
    const response = await fetch(`${API_URL}/entregadores/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone }),
    });
    return response.json();
  },

  // Atualizar localização
  async atualizarLocalizacao(entregadorId: string, lat: number, lng: number) {
    const response = await fetch(`${API_URL}/entregadores/${entregadorId}/localizacao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng }),
    });
    return response.json();
  },

  // Criar pedido (Estabelecimento)
  async criarPedido(cliente: string, endereco: string, itens: string[]) {
    const response = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cliente, endereco, itens }),
    });
    return response.json();
  },

  // Listar todos os pedidos
  async listarTodosPedidos(): Promise<Pedido[]> {
    const response = await fetch(`${API_URL}/pedidos`);
    return response.json();
  },
};
