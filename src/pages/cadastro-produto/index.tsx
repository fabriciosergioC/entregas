import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import '@/app/globals.css';

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  categoria?: string;
  disponivel: boolean;
  imagem_url?: string;
  estabelecimento_id: string;
  created_at: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function CadastroProduto() {
  const router = useRouter();
  const [usuarioLogado, setUsuarioLogado] = useState<{ id: string; email: string; nome_estabelecimento?: string } | null>(null);
  const [nomeProduto, setNomeProduto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [precoFormatado, setPrecoFormatado] = useState('');
  const [categoria, setCategoria] = useState('');
  const [disponivel, setDisponivel] = useState(true);
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [uploadingImagem, setUploadingImagem] = useState(false);
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filtro, setFiltro] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar se usuário está logado
  useEffect(() => {
    const user = localStorage.getItem('estabelecimento_user');
    if (!user) {
      router.push('/login-estabelecimento');
      return;
    }
    const userData = JSON.parse(user);
    setUsuarioLogado(userData);
    carregarProdutos();
  }, []);

  // Formatar valor em moeda
  const handlePrecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '');
    valor = (Number(valor) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    setPrecoFormatado(`R$ ${valor}`);
    setPreco(valor.replace(',', '.'));
  };

  // Carregar produtos do estabelecimento
  const carregarProdutos = async () => {
    const user = localStorage.getItem('estabelecimento_user');
    if (!user) return;

    const userData = JSON.parse(user);
    const estabelecimentoId = userData.id;

    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('estabelecimento_id', estabelecimentoId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar produtos:', error);
        return;
      }

      if (data) {
        setProdutos(data);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
    }
  };

  // Upload de imagem para o Supabase Storage
  const uploadImagem = async (file: File): Promise<string | null> => {
    try {
      setUploadingImagem(true);
      
      const user = localStorage.getItem('estabelecimento_user');
      if (!user) {
        alert('Usuário não logado!');
        return null;
      }

      const userData = JSON.parse(user);
      const estabelecimentoId = userData.id;
      
      // Nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${estabelecimentoId}_${Date.now()}.${fileExt}`;
      const filePath = `produtos/${fileName}`;

      // Upload para o bucket
      const { error: uploadError } = await supabase.storage
        .from('produtos-imagens')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        alert('Erro ao fazer upload da imagem: ' + uploadError.message);
        return null;
      }

      // Obter URL pública
      const { data: urlData } = supabase.storage
        .from('produtos-imagens')
        .getPublicUrl(filePath);

      console.log('✅ Imagem uploadada com sucesso:', urlData.publicUrl);
      return urlData.publicUrl;
    } catch (err) {
      console.error('Erro ao fazer upload da imagem:', err);
      alert('Erro ao fazer upload da imagem!');
      return null;
    } finally {
      setUploadingImagem(false);
    }
  };

  // Selecionar imagem
  const handleSelecionarImagem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem!');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB!');
      return;
    }

    setImagemFile(file);

    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagemPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Cadastrar produto
  const handleCadastrarProduto = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeProduto || !preco) {
      alert('Preencha pelo menos o nome e o preço do produto!');
      return;
    }

    setLoading(true);

    try {
      const user = localStorage.getItem('estabelecimento_user');
      if (!user) {
        alert('Usuário não logado!');
        return;
      }

      const userData = JSON.parse(user);
      const estabelecimentoId = userData.id;

      let imagemUrl: string | null = null;

      // Fazer upload da imagem se houver
      if (imagemFile) {
        imagemUrl = await uploadImagem(imagemFile);
      }

      const { data, error } = await supabase
        .from('produtos')
        .insert([
          {
            nome: nomeProduto,
            descricao: descricao || null,
            preco: parseFloat(preco),
            categoria: categoria || null,
            disponivel,
            imagem_url: imagemUrl || null,
            estabelecimento_id: estabelecimentoId,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Erro ao cadastrar produto:', error);
        alert('Erro ao cadastrar produto: ' + error.message);
        return;
      }

      alert('✅ Produto cadastrado com sucesso!');
      setNomeProduto('');
      setDescricao('');
      setPreco('');
      setPrecoFormatado('');
      setCategoria('');
      setDisponivel(true);
      setImagemFile(null);
      setImagemPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      carregarProdutos();
    } catch (err) {
      console.error('Erro ao cadastrar produto:', err);
      alert('Erro ao cadastrar produto!');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar produto
  const handleAtualizarProduto = async (id: string, atualizacoes: Partial<Produto>) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .update(atualizacoes)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar produto:', error);
        return;
      }

      carregarProdutos();
    } catch (err) {
      console.error('Erro ao atualizar produto:', err);
    }
  };

  // Excluir produto
  const handleExcluirProduto = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto!');
        return;
      }

      alert('✅ Produto excluído com sucesso!');
      carregarProdutos();
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      alert('Erro ao excluir produto!');
    }
  };

  // Filtrar produtos
  const produtosFiltrados = produtos.filter((produto) =>
    produto.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    produto.categoria?.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Cadastrar Produtos</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#10b981" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-green-600 text-white p-4 shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">🛍️ Cadastro de Produtos</h1>
              {usuarioLogado && (
                <p className="text-xs text-green-200">🏪 {usuarioLogado.nome_estabelecimento}</p>
              )}
            </div>
            <button
              onClick={() => router.push('/estabelecimento')}
              className="bg-green-700 hover:bg-green-800 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm"
            >
              ← Voltar ao Painel
            </button>
          </div>
        </header>

        <main className="p-4 max-w-4xl mx-auto">
          {/* Formulário de Cadastro */}
          <section className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              Novo Produto
            </h2>

            <form onSubmit={handleCadastrarProduto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={nomeProduto}
                  onChange={(e) => setNomeProduto(e.target.value)}
                  placeholder="Ex: Pizza Calabresa"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Pizza grande com calabresa, cebola e queijo"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    💰 Preço *
                  </label>
                  <input
                    type="text"
                    value={precoFormatado}
                    onChange={handlePrecoChange}
                    placeholder="R$ 0,00"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🏷️ Categoria
                  </label>
                  <input
                    type="text"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    placeholder="Ex: Pizzas, Bebidas..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📷 Imagem do Produto
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {imagemPreview ? (
                    <div className="relative">
                      <img
                        src={imagemPreview}
                        alt="Preview do produto"
                        className="max-h-48 mx-auto rounded-lg shadow-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagemPreview(null);
                          setImagemFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="py-6">
                      <span className="text-4xl mb-2 block">📷</span>
                      <p className="text-gray-600 text-sm mb-3">
                        Clique para selecionar uma imagem
                      </p>
                      <p className="text-xs text-gray-500">
                        Formatos: JPG, PNG | Máximo 5MB
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSelecionarImagem}
                    disabled={uploadingImagem}
                    className="hidden"
                    id="imagem-produto"
                  />
                  <label
                    htmlFor="imagem-produto"
                    className={`mt-3 inline-block px-4 py-2 rounded-lg font-medium text-sm cursor-pointer transition-colors ${
                      uploadingImagem
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {uploadingImagem ? '⏳ Enviando...' : imagemPreview ? '🔄 Trocar Imagem' : '📁 Selecionar Imagem'}
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disponivel"
                  checked={disponivel}
                  onChange={(e) => setDisponivel(e.target.checked)}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <label htmlFor="disponivel" className="text-sm font-medium text-gray-700">
                  Produto disponível para venda
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
                  loading
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? 'Cadastrando...' : '✅ Cadastrar Produto'}
              </button>
            </form>
          </section>

          {/* Lista de Produtos */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📦</span>
              Meus Produtos
              <span className="text-sm font-normal text-gray-500">({produtosFiltrados.length})</span>
            </h2>

            {/* Filtro */}
            <div className="mb-4">
              <input
                type="text"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="🔍 Buscar produto..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {produtosFiltrados.length === 0 ? (
              <div className="text-center py-10">
                <span className="text-6xl">📦</span>
                <p className="text-gray-500 mt-4">
                  {filtro ? `Nenhum produto encontrado para "${filtro}"` : 'Nenhum produto cadastrado'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {produtosFiltrados.map((produto) => (
                  <div
                    key={produto.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {produto.imagem_url ? (
                        <img
                          src={produto.imagem_url}
                          alt={produto.nome}
                          className="w-24 h-24 object-cover rounded-lg flex-shrink-0 border border-gray-200"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200">
                          <span className="text-4xl">📦</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-800">{produto.nome}</h3>
                          {produto.disponivel ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              ✅ Disponível
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                              ❌ Indisponível
                            </span>
                          )}
                        </div>
                        {produto.descricao && (
                          <p className="text-sm text-gray-600 mb-1">{produto.descricao}</p>
                        )}
                        {produto.categoria && (
                          <p className="text-xs text-gray-500 mb-1">🏷️ {produto.categoria}</p>
                        )}
                        <p className="text-lg font-bold text-green-600">
                          {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAtualizarProduto(produto.id, { disponivel: !produto.disponivel })}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            produto.disponivel
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {produto.disponivel ? '⏸️ Pausar' : '▶️ Ativar'}
                        </button>
                        <button
                          onClick={() => handleExcluirProduto(produto.id)}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    </div>
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
