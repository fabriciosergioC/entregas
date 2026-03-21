'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PainelClientePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pedidoId, setPedidoId] = useState('');
  const [erro, setErro] = useState('');

  // Verificar se vem um ID pela URL (parâmetro ?id=)
  useEffect(() => {
    const idParam = searchParams?.get('id');
    if (idParam) {
      setPedidoId(idParam);
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pedidoId.trim()) {
      setErro('Por favor, digite o ID do seu pedido');
      return;
    }

    // Validar formato do ID (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(pedidoId.trim())) {
      setErro('ID do pedido inválido. Verifique o formato.');
      return;
    }

    router.push(`/painel-cliente/${pedidoId.trim()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-green-700 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Ícone/Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-5xl">📦</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">
            Acompanhe seu Pedido
          </h1>
          <p className="text-green-100 text-lg">
            Digite o ID do pedido ou cole o link para rastrear em tempo real
          </p>
        </div>

        {/* Formulário */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="pedidoId" className="block text-sm font-medium text-gray-700 mb-2">
                ID do Pedido
              </label>
              <input
                type="text"
                id="pedidoId"
                value={pedidoId}
                onChange={(e) => {
                  setPedidoId(e.target.value);
                  setErro('');
                }}
                placeholder="00000000-0000-0000-0000-000000000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all text-gray-800 font-mono"
              />
              {erro && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span> {erro}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-colors text-lg"
            >
              🚀 Rastrear Pedido
            </button>
          </form>

          {/* Informações */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-800 mb-3">📍 Onde encontrar o ID do pedido?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>No comprovante enviado pelo estabelecimento (apenas o código UUID)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>No WhatsApp ou SMS recebido do estabelecimento</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500">✓</span>
                <span>Pergunte ao atendente do estabelecimento</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Funcionalidades */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <h3 className="text-white font-bold mb-4 text-center">O que você pode acompanhar:</h3>
          <div className="space-y-3 text-white">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🗺️</span>
              <span className="text-left">Localização do entregador em tempo real</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <span className="text-left">Status atualizado do seu pedido</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🛵</span>
              <span className="text-left">Dados do entregador responsável</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">📝</span>
              <span className="text-left">Detalhes completos do pedido</span>
            </div>
          </div>
        </div>

        {/* Voltar */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-green-100 hover:text-white transition-colors text-sm"
          >
            ← Voltar para página inicial
          </button>
        </div>
      </div>
    </div>
  );
}
