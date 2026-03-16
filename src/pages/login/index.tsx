import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { api } from '@/services/api';
import { conectarSocket } from '@/services/socket';

export default function Login() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [telefoneFormatado, setTelefoneFormatado] = useState('');
  const [statusServidor, setStatusServidor] = useState<'online' | 'offline' | 'verificando'>('verificando');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Verificar saúde do servidor ao carregar
  const verificarServidor = async () => {
    try {
      const response = await fetch(`${API_URL}/health`, { method: 'GET' });
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      console.log('✅ Servidor saudável:', data);
      setStatusServidor('online');
      return true;
    } catch (error) {
      console.error('❌ Servidor indisponível:', error);
      setStatusServidor('offline');
      return false;
    }
  };

  // Verificar servidor ao montar o componente
  React.useEffect(() => {
    verificarServidor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Formatar telefone enquanto digita
  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length > 11) valor = valor.slice(0, 11);
    
    if (valor.length > 10) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2, 7)}-${valor.slice(7)}`;
    } else if (valor.length > 6) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}-${valor.slice(6)}`;
    } else if (valor.length > 2) {
      valor = `(${valor.slice(0, 2)}) ${valor.slice(2)}`;
    } else if (valor.length > 0) {
      valor = `(${valor}`;
    }
    
    setTelefoneFormatado(valor);
    setTelefone(valor.replace(/\D/g, ''));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro('');

    if (telefone.replace(/\D/g, '').length < 10) {
      setErro('Por favor, informe um telefone válido');
      setLoading(false);
      return;
    }

    // Verificar servidor antes de tentar login
    if (statusServidor === 'offline') {
      setErro('Servidor indisponível. Verifique se o backend está rodando.');
      setLoading(false);
      return;
    }

    try {
      console.log('📝 Tentando login...', { nome, telefone });
      console.log('📡 URL da API:', API_URL);

      const entregador = await api.loginEntregador(nome, telefone);

      console.log('✅ Login realizado com sucesso:', entregador);

      // Salvar dados do entregador no localStorage
      localStorage.setItem('entregador', JSON.stringify(entregador));

      // Conectar ao socket
      conectarSocket();

      // Redirecionar para página de pedidos
      router.push('/pedidos');
    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      let mensagemErro = 'Erro ao fazer login.';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        mensagemErro = '❌ Não foi possível conectar ao servidor.\n\nVerifique:\n1. O backend está rodando (npm run dev:backend)\n2. A URL está correta: ' + API_URL + '\n3. O firewall não está bloqueando';
      } else if (error instanceof Error) {
        mensagemErro = `Erro: ${error.message}`;
      }
      
      setErro(mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Login - App do Entregador</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#10b981" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-300/10 rounded-full blur-xl"></div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10 border border-white/20">
          {/* Logo/Ícone */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-105 transition-transform duration-300">
              <span className="text-5xl">🛵</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">App do Entregador</h1>
            <p className="text-gray-500 mt-2 text-sm">Faça login para começar a receber pedidos</p>
            
            {/* Status do Servidor */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                statusServidor === 'online' ? 'bg-green-400' :
                statusServidor === 'offline' ? 'bg-red-400' :
                'bg-yellow-400 animate-pulse'
              }`}></span>
              <span className={`text-xs font-medium ${
                statusServidor === 'online' ? 'text-green-600' :
                statusServidor === 'offline' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {statusServidor === 'online' ? '✅ Servidor Online' :
                 statusServidor === 'offline' ? '❌ Servidor Offline' :
                 '🔄 Verificando...'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{API_URL}</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-5">
            {erro && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg text-sm animate-pulse">
                <span className="font-medium">⚠️ Erro:</span> {erro}
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-gray-700 font-semibold text-sm" htmlFor="nome">
                Nome Completo
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">👤</span>
                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-gray-700 font-semibold text-sm" htmlFor="telefone">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">📱</span>
                <input
                  id="telefone"
                  type="tel"
                  value={telefoneFormatado}
                  onChange={handleTelefoneChange}
                  className="w-full border-2 border-gray-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Divisor */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <span className="text-gray-400 text-xs">Rápido e seguro</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* Rodapé */}
          <div className="text-center">
            <p className="text-gray-500 text-xs leading-relaxed">
              🔒 Ao entrar, você concorda em compartilhar sua localização em tempo real para receber pedidos próximos
            </p>
          </div>
        </div>

        {/* Rodapé da página */}
        <div className="absolute bottom-4 text-center">
          <p className="text-white/60 text-xs">
            © 2024 App do Entregador - Todos os direitos reservados
          </p>
        </div>
      </div>
    </>
  );
}
