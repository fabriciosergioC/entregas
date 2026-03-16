import { useState, useEffect } from 'react';
import Head from 'next/head';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Pedido {
  id: string;
  cliente: string;
  endereco: string;
  itens: string[];
  status: 'pendente' | 'aceito' | 'em_transito' | 'entregue';
  entregadorId?: string;
  entregadorNome?: string;
  entregadorTelefone?: string;
  createdAt: Date;
}

type FiltroPedidos = 'todos' | 'pendentes' | 'em_entrega' | 'entregues';

export default function Estabelecimento() {
  const [cliente, setCliente] = useState('');
  const [endereco, setEndereco] = useState('');
  const [itens, setItens] = useState('');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtroAtivo, setFiltroAtivo] = useState<FiltroPedidos>('todos');
  const [statusConexao, setStatusConexao] = useState<'online' | 'offline' | 'conectando'>('conectando');

  // Verificar saúde do servidor
  const verificarSaudeServidor = async () => {
    try {
      setStatusConexao('conectando');
      const response = await fetch(`${API_URL}/health`);
      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }
      const data = await response.json();
      console.log('✅ Servidor saudável:', data);
      setStatusConexao('online');
      return true;
    } catch (error) {
      console.error('❌ Servidor indisponível:', error);
      setStatusConexao('offline');
      return false;
    }
  };

  // Carregar pedidos ao iniciar
  useEffect(() => {
    // Verificar saúde do servidor ao carregar
    verificarSaudeServidor().then(saudavel => {
      if (!saudavel) {
        alert('⚠️ Não foi possível conectar ao servidor backend!\n\nVerifique:\n1. O backend está rodando (npm run dev:backend)\n2. A URL está correta: ' + API_URL + '\n3. O firewall não está bloqueando a conexão');
      }
    });

    carregarPedidos();

    // Atualizar lista periodicamente
    const intervalo = setInterval(carregarPedidos, 5000);
    // Verificar saúde do servidor periodicamente
    const intervaloSaude = setInterval(verificarSaudeServidor, 10000);
    return () => {
      clearInterval(intervalo);
      clearInterval(intervaloSaude);
    };
  }, []);

  const carregarPedidos = async () => {
    try {
      const response = await fetch(`${API_URL}/pedidos`);
      const data = await response.json();
      setPedidos(data.reverse()); // Mais recentes primeiro
    } catch (error) {
      console.error('Erro ao carregar pedidos:', error);
    }
  };

  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (filtroAtivo === 'todos') return true;
    if (filtroAtivo === 'pendentes') return pedido.status === 'pendente' || pedido.status === 'aceito';
    if (filtroAtivo === 'em_entrega') return pedido.status === 'em_transito';
    if (filtroAtivo === 'entregues') return pedido.status === 'entregue';
    return true;
  });

  const contagemPedidos = {
    todos: pedidos.length,
    pendentes: pedidos.filter(p => p.status === 'pendente' || p.status === 'aceito').length,
    em_entrega: pedidos.filter(p => p.status === 'em_transito').length,
    entregues: pedidos.filter(p => p.status === 'entregue').length,
  };

  const handleCriarPedido = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cliente || !endereco || !itens) {
      alert('Preencha todos os campos!');
      return;
    }

    setLoading(true);

    try {
      console.log('📝 Enviando pedido para:', `${API_URL}/pedidos`);
      console.log('📦 Dados do pedido:', { cliente, endereco, itens: itens.split('\n').filter(item => item.trim()) });

      const response = await fetch(`${API_URL}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente,
          endereco,
          itens: itens.split('\n').filter(item => item.trim()),
        }),
      });

      console.log('📊 Status da resposta:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Pedido criado com sucesso:', data);
        alert('✅ Pedido criado e enviado para os entregadores!');
        setCliente('');
        setEndereco('');
        setItens('');
        carregarPedidos();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro na resposta:', response.status, errorData);
        alert(`Erro ao criar pedido: ${response.status} - ${errorData.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('❌ Erro ao criar pedido:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Erro de conexão com o servidor: ${errorMessage}\n\nVerifique:\n1. O backend está rodando?\n2. A URL ${API_URL} está correta?\n3. O firewall está bloqueando?`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente: '⏳ Pendente',
      aceito: '✅ Aceito',
      em_transito: '🚗 Em trânsito',
      entregue: '✅ Entregue',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: 'bg-yellow-100 text-yellow-800',
      aceito: 'bg-blue-100 text-blue-800',
      em_transito: 'bg-purple-100 text-purple-800',
      entregue: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      <Head>
        <title>Painel do Estabelecimento</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-blue-600 text-white p-4 shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">🏪 Painel do Estabelecimento</h1>
              <p className="text-sm text-blue-100">Crie e gerencie pedidos</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                statusConexao === 'online' ? 'bg-green-400' :
                statusConexao === 'offline' ? 'bg-red-400' :
                'bg-yellow-400 animate-pulse'
              }`}></span>
              <span className="text-xs">
                {statusConexao === 'online' ? '✅ Online' :
                 statusConexao === 'offline' ? '❌ Offline' :
                 '🔄 Conectando...'}
              </span>
            </div>
          </div>
          <p className="text-xs text-blue-200 mt-2">Backend: {API_URL}</p>
        </header>

        <main className="p-4 max-w-4xl mx-auto">
          {/* Formulário de Novo Pedido */}
          <section className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Criar Novo Pedido
            </h2>

            <form onSubmit={handleCriarPedido} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  value={cliente}
                  onChange={(e) => setCliente(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço de Entrega
                </label>
                <input
                  type="text"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Ex: Rua das Flores, 123 - Centro"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Itens do Pedido
                </label>
                <textarea
                  value={itens}
                  onChange={(e) => setItens(e.target.value)}
                  placeholder="Digite cada item em uma linha&#10;Ex: Pizza Grande&#10;Refrigerante 2L"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Digite cada item em uma linha separada</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                  loading
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Enviando...' : '📦 Criar Pedido e Enviar para Entregadores'}
              </button>
            </form>
          </section>

          {/* Lista de Pedidos */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span>
              Pedidos
              <span className="text-sm font-normal text-gray-500">({pedidosFiltrados.length})</span>
            </h2>

            {/* Filtros */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <button
                onClick={() => setFiltroAtivo('todos')}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  filtroAtivo === 'todos'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Todos ({contagemPedidos.todos})
              </button>
              <button
                onClick={() => setFiltroAtivo('pendentes')}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  filtroAtivo === 'pendentes'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Pendentes ({contagemPedidos.pendentes})
              </button>
              <button
                onClick={() => setFiltroAtivo('em_entrega')}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  filtroAtivo === 'em_entrega'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Em Entrega ({contagemPedidos.em_entrega})
              </button>
              <button
                onClick={() => setFiltroAtivo('entregues')}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
                  filtroAtivo === 'entregues'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Entregues ({contagemPedidos.entregues})
              </button>
            </div>

            {pedidosFiltrados.length === 0 ? (
              <div className="text-center py-10">
                <span className="text-6xl">📦</span>
                <p className="text-gray-500 mt-4">
                  {filtroAtivo === 'todos' 
                    ? 'Nenhum pedido registrado' 
                    : filtroAtivo === 'pendentes'
                    ? 'Nenhum pedido pendente'
                    : filtroAtivo === 'em_entrega'
                    ? 'Nenhum pedido em entrega'
                    : 'Nenhum pedido entregue'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pedidosFiltrados.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-gray-800">Pedido #{pedido.id.slice(-4)}</h3>
                        <p className="text-sm text-gray-600">{pedido.cliente}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pedido.status)}`}>
                        {getStatusLabel(pedido.status)}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      <p className="flex items-center gap-1">
                        <span>📍</span>
                        {pedido.endereco}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded p-2 mb-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Itens:</p>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {pedido.itens.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    {pedido.entregadorId && pedido.entregadorNome && (
                      <div className="bg-blue-50 rounded p-2 mb-2 border border-blue-100">
                        <p className="text-xs font-medium text-blue-700 mb-1">🛵 Entregador:</p>
                        <p className="text-sm text-blue-900 font-medium">{pedido.entregadorNome}</p>
                        {pedido.entregadorTelefone && (
                          <p className="text-xs text-blue-600">📞 {pedido.entregadorTelefone}</p>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(pedido.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
