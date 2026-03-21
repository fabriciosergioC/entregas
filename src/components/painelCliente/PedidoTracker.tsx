'use client';

import { useEffect, useState } from 'react';
import { api, Pedido, Entregador } from '@/services/api';
import RastreamentoMapa from './RastreamentoMapa';
import { useCompartilhamentoPedido } from '@/hooks/useCompartilhamentoPedido';

interface PedidoTrackerProps {
  pedidoId: string;
}

export default function PedidoTracker({ pedidoId }: PedidoTrackerProps) {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [entregador, setEntregador] = useState<Entregador | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());
  const [ultimaAtualizacaoRealtime, setUltimaAtualizacaoRealtime] = useState<number>(0);

  const { link, copiado, compartilhar } = useCompartilhamentoPedido(pedidoId);

  // Intervalo de atualização em ms (15 segundos)
  const INTERVALO_ATUALIZACAO = 15000;

  // Status labels e cores
  const statusInfo = {
    pendente: {
      label: '⏳ Aguardando Entregador',
      descricao: 'Seu pedido está aguardando um entregador aceitar',
      cor: 'yellow',
      progresso: 25,
    },
    aceito: {
      label: '✅ Pedido Aceito',
      descricao: 'Um entregador aceitou seu pedido e está indo ao estabelecimento',
      cor: 'blue',
      progresso: 50,
    },
    em_transito: {
      label: '🚗 Pedido a Caminho',
      descricao: 'Seu pedido está saindo para entrega',
      cor: 'purple',
      progresso: 75,
    },
    entregue: {
      label: '📦 Pedido Entregue',
      descricao: 'Seu pedido foi entregue com sucesso!',
      cor: 'green',
      progresso: 100,
    },
  };

  // Buscar pedido inicial
  useEffect(() => {
    const buscarPedido = async () => {
      try {
        setCarregando(true);
        const { data, error } = await api.listarTodosPedidos();

        if (error) throw error;

        const pedidoEncontrado = data?.find((p: Pedido) => p.id === pedidoId);

        if (!pedidoEncontrado) {
          setErro('Pedido não encontrado');
          return;
        }

        setPedido(pedidoEncontrado);

        // Buscar dados do entregador se existir
        if (pedidoEncontrado.entregador_id) {
          const { data: dadosEntregador } = await api.buscarEntregador(pedidoEncontrado.entregador_id);
          setEntregador(dadosEntregador || null);
        }
        
        setUltimaAtualizacao(new Date());
      } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        setErro('Erro ao carregar pedido. Tente novamente.');
      } finally {
        setCarregando(false);
      }
    };

    buscarPedido();

    // Polling como fallback - busca a cada 15 segundos
    const intervalo = setInterval(buscarPedido, INTERVALO_ATUALIZACAO);
    return () => clearInterval(intervalo);
  }, [pedidoId]);

  // Assinar atualizações em tempo real (com throttle de 15 segundos)
  useEffect(() => {
    if (!pedidoId) return;

    const cancelarInscricao = api.assinarPedidosTempoReal(
      (novoPedido) => {
        const agora = Date.now();
        // Throttle: só atualiza se passou 10 segundos desde a última atualização
        if (agora - ultimaAtualizacaoRealtime >= INTERVALO_ATUALIZACAO) {
          if (novoPedido.id === pedidoId) {
            setPedido(novoPedido);
            setUltimaAtualizacao(new Date());
            setUltimaAtualizacaoRealtime(agora);
          }
        }
      },
      (pedidoAtualizado) => {
        const agora = Date.now();
        // Throttle: só atualiza se passou 10 segundos desde a última atualização
        if (agora - ultimaAtualizacaoRealtime >= INTERVALO_ATUALIZACAO) {
          if (pedidoAtualizado.id === pedidoId) {
            setPedido(pedidoAtualizado);
            setUltimaAtualizacao(new Date());
            setUltimaAtualizacaoRealtime(agora);

            // Atualizar entregador se mudou
            if (pedidoAtualizado.entregador_id && pedidoAtualizado.entregador_id !== pedido?.entregador_id) {
              api.buscarEntregador(pedidoAtualizado.entregador_id).then(({ data }) => {
                setEntregador(data || null);
                setUltimaAtualizacao(new Date());
                setUltimaAtualizacaoRealtime(Date.now());
              });
            }
          }
        }
      }
    );

    // Assinar localização do entregador em tempo real (com throttle de 15 segundos)
    let cancelarLocalizacao: (() => void) | undefined;
    if (entregador?.id) {
      cancelarLocalizacao = api.assinarLocalizacaoTempoReal((entregadorAtualizado) => {
        const agora = Date.now();
        // Throttle: só atualiza se passou 10 segundos desde a última atualização
        if (agora - ultimaAtualizacaoRealtime >= INTERVALO_ATUALIZACAO) {
          if (entregadorAtualizado.id === entregador.id) {
            setEntregador(entregadorAtualizado);
            setUltimaAtualizacao(new Date());
            setUltimaAtualizacaoRealtime(agora);
          }
        }
      });
    }

    return () => {
      cancelarInscricao();
      cancelarLocalizacao?.();
    };
  }, [pedidoId, entregador?.id, pedido?.entregador_id, ultimaAtualizacaoRealtime]);

  const formatarValor = (valor: number | null | undefined) => {
    if (!valor) return 'R$ 0,00';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const infoAtual = pedido ? statusInfo[pedido.status] : statusInfo.pendente;
  const corProgresso = {
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
  }[infoAtual.cor];

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🔄</div>
          <p className="text-gray-600">Carregando informações do pedido...</p>
        </div>
      </div>
    );
  }

  if (erro || !pedido) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Erro</h2>
          <p className="text-gray-600 mb-4">{erro || 'Pedido não encontrado'}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Cabeçalho */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-800">📦 Acompanhamento do Pedido</h1>
                <span className="flex items-center gap-1 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  AO VIVO
                </span>
              </div>
              <p className="text-gray-500">Pedido #{pedido.id.slice(0, 8)}</p>
              <p className="text-xs text-gray-400 mt-1">
                🕐 Atualizado em: {ultimaAtualizacao.toLocaleTimeString('pt-BR')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={compartilhar}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                {copiado ? '✅ Copiado!' : '🔗 Compartilhar'}
              </button>
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold ${
                  infoAtual.cor === 'yellow'
                    ? 'bg-yellow-100 text-yellow-800'
                    : infoAtual.cor === 'blue'
                    ? 'bg-blue-100 text-blue-800'
                    : infoAtual.cor === 'purple'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {infoAtual.label}
              </span>
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Aguardando</span>
              <span>Aceito</span>
              <span>Em Trânsito</span>
              <span>Entregue</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${corProgresso} transition-all duration-500 ease-out`}
                style={{ width: `${infoAtual.progresso}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{infoAtual.descricao}</p>
          </div>
        </div>

        {/* Mapa de Rastreamento */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🗺️ Rastreamento em Tempo Real</h2>
          <RastreamentoMapa pedido={pedido} entregador={entregador} />
          
          {entregador && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🛵</span>
                <div>
                  <p className="font-bold text-gray-800">{entregador.nome}</p>
                  <p className="text-sm text-gray-600">📱 {entregador.telefone}</p>
                  {entregador.disponivel && (
                    <span className="text-xs text-green-600 font-medium">● Disponível</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detalhes do Pedido */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📋 Detalhes do Pedido</h2>
          
          <div className="space-y-4">
            {/* Cliente */}
            <div className="flex items-start gap-3">
              <span className="text-2xl">👤</span>
              <div>
                <p className="text-sm text-gray-500">Cliente</p>
                <p className="font-medium text-gray-800">{pedido.cliente}</p>
              </div>
            </div>

            {/* Endereço */}
            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-sm text-gray-500">Endereço de Entrega</p>
                <p className="font-medium text-gray-800">{pedido.endereco}</p>
              </div>
            </div>

            {/* Estabelecimento */}
            {pedido.estabelecimento_nome && (
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏪</span>
                <div>
                  <p className="text-sm text-gray-500">Estabelecimento</p>
                  <p className="font-medium text-gray-800">{pedido.estabelecimento_nome}</p>
                  {pedido.estabelecimento_endereco && (
                    <p className="text-sm text-gray-600">{pedido.estabelecimento_endereco}</p>
                  )}
                </div>
              </div>
            )}

            {/* Itens */}
            <div className="flex items-start gap-3">
              <span className="text-2xl">📝</span>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-2">Itens do Pedido:</p>
                <ul className="space-y-1">
                  {pedido.itens.map((item, index) => (
                    <li key={index} className="text-gray-700 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Valores */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                <p className="text-xs font-medium text-green-700 mb-1">💰 Valor do Pedido</p>
                <p className="text-lg font-bold text-green-900">{formatarValor(pedido.valor_pedido)}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <p className="text-xs font-medium text-purple-700 mb-1">🛵 Taxa do Entregador</p>
                <p className="text-lg font-bold text-purple-900">{formatarValor(pedido.valor_entregador)}</p>
              </div>
            </div>

            {/* Horário */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <span className="text-2xl">🕐</span>
              <div>
                <p className="text-sm text-gray-500">Pedido realizado em</p>
                <p className="font-medium text-gray-800">
                  {new Date(pedido.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📅 Linha do Tempo</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                pedido.status !== 'pendente' ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                <span className="text-white">⏳</span>
              </div>
              <div className="flex-1">
                <p className={`font-medium ${pedido.status !== 'pendente' ? 'text-green-600' : 'text-gray-400'}`}>
                  Pedido aguardando entregador
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(pedido.created_at).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>

            {pedido.status !== 'pendente' && pedido.updated_at && (
              <>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    pedido.status === 'aceito' || pedido.status === 'em_transito' || pedido.status === 'entregue' 
                      ? 'bg-blue-500' 
                      : 'bg-gray-300'
                  }`}>
                    <span className="text-white">✅</span>
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      pedido.status === 'aceito' || pedido.status === 'em_transito' || pedido.status === 'entregue'
                        ? 'text-blue-600' 
                        : 'text-gray-400'
                    }`}>
                      Pedido aceito pelo entregador
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(pedido.updated_at).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                </div>

                {pedido.status === 'em_transito' || pedido.status === 'entregue' ? (
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      pedido.status === 'em_transito' || pedido.status === 'entregue' 
                        ? 'bg-purple-500' 
                        : 'bg-gray-300'
                    }`}>
                      <span className="text-white">🚗</span>
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        pedido.status === 'em_transito' || pedido.status === 'entregue'
                          ? 'text-purple-600' 
                          : 'text-gray-400'
                      }`}>
                        Pedido saiu para entrega
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(pedido.updated_at).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ) : null}

                {pedido.status === 'entregue' ? (
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500">
                      <span className="text-white">📦</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-green-600">Pedido entregue com sucesso!</p>
                      <p className="text-sm text-gray-500">
                        {new Date(pedido.updated_at).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="text-center text-gray-500 text-sm pb-4">
          <p>🔄 Atualização automática a cada 15 segundos + Supabase Realtime</p>
        </div>
      </div>
    </div>
  );
}
