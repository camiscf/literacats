import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BookCover } from '../components/BookCover/BookCover'
import {
  buscarLivro,
  buscarAvaliacoesDoLivro,
  salvarMembraLivro,
  type Livro,
  type AvaliacaoLivro,
} from '../services/api'
import { useAuth } from '../contexts/AuthContext'

function EstrelasDisplay({ quantidade }: { quantidade: number }) {
  return (
    <span className="text-yellow-500">
      {'★'.repeat(quantidade)}{'☆'.repeat(5 - quantidade)}
    </span>
  )
}

function EstrelasInput({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((estrela) => (
        <button
          key={estrela}
          type="button"
          onClick={() => onChange(estrela)}
          onMouseEnter={() => setHover(estrela)}
          onMouseLeave={() => setHover(0)}
          className="text-3xl transition-transform hover:scale-110"
        >
          <span className={estrela <= (hover || valor) ? 'text-yellow-500' : 'text-gray-300'}>
            ★
          </span>
        </button>
      ))}
    </div>
  )
}

export function LivroDetalhes() {
  const { id } = useParams<{ id: string }>()
  const { membra } = useAuth()
  const [livro, setLivro] = useState<Livro | null>(null)
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoLivro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Formulário de avaliação
  const [mostrarForm, setMostrarForm] = useState(false)
  const [estrelas, setEstrelas] = useState(0)
  const [resenha, setResenha] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      buscarLivro(id),
      buscarAvaliacoesDoLivro(id),
    ])
      .then(([livroData, avaliacoesData]) => {
        setLivro(livroData)
        setAvaliacoes(avaliacoesData)
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [id])

  const handleEnviarAvaliacao = async () => {
    if (!id || !membra || estrelas === 0) return

    setEnviando(true)
    try {
      await salvarMembraLivro(membra.id, id, {
        membraId: membra.id,
        livroId: id,
        status: 'Lido',
        estrelas,
        resenha: resenha.trim() || undefined,
        dataLeitura: new Date().toISOString(),
      })

      // Recarregar avaliações
      const novasAvaliacoes = await buscarAvaliacoesDoLivro(id)
      setAvaliacoes(novasAvaliacoes)

      // Limpar formulário
      setMostrarForm(false)
      setEstrelas(0)
      setResenha('')
    } catch (e) {
      console.error('Erro ao enviar avaliação:', e)
    } finally {
      setEnviando(false)
    }
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin text-4xl">📚</div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="text-center py-16">
        <p className="text-2xl mb-4">😿</p>
        <p className="text-red-500">{erro}</p>
        <Link to="/" className="text-pink-hot hover:underline mt-4 inline-block">
          Voltar para a biblioteca
        </Link>
      </div>
    )
  }

  if (!livro) {
    return (
      <div className="text-center py-16">
        <p className="text-2xl mb-4">📚</p>
        <p className="text-black/60">Livro não encontrado</p>
        <Link to="/" className="text-pink-hot hover:underline mt-4 inline-block">
          Voltar para a biblioteca
        </Link>
      </div>
    )
  }

  const mediaEstrelas = avaliacoes.length > 0
    ? (avaliacoes.reduce((acc, a) => acc + (a.estrelas || 0), 0) / avaliacoes.length).toFixed(1)
    : null

  return (
    <div>
      <Link to="/" className="inline-flex items-center text-pink-hot hover:text-pink-primary mb-6 transition-colors">
        <span className="mr-2">←</span> Voltar para a biblioteca
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Coluna da capa */}
        <div className="md:col-span-1">
          <BookCover
            titulo={livro.titulo}
            autor={livro.autor}
            capa={livro.capa}
            className="w-full aspect-[2/3] rounded-2xl shadow-xl"
          />
        </div>

        {/* Coluna de informações */}
        <div className="md:col-span-2">
          <span className="inline-block bg-pink-light text-pink-hot px-3 py-1 rounded-full text-sm font-medium mb-3">
            {livro.genero}
          </span>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-black mb-2">
            {livro.titulo}
          </h1>

          <p className="text-xl text-black/70 mb-4">{livro.autor}</p>

          {mediaEstrelas && (
            <div className="flex items-center gap-3 mb-6">
              <EstrelasDisplay quantidade={Math.round(Number(mediaEstrelas))} />
              <span className="text-black/60">
                {mediaEstrelas}/5 ({avaliacoes.length} {avaliacoes.length === 1 ? 'avaliação' : 'avaliações'} do clube)
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-8">
            {livro.paginas && (
              <div className="bg-white rounded-xl px-4 py-3 shadow">
                <p className="text-black/50 text-xs">Páginas</p>
                <p className="text-lg font-semibold">{livro.paginas}</p>
              </div>
            )}
            {livro.dataCadastro && (
              <div className="bg-white rounded-xl px-4 py-3 shadow">
                <p className="text-black/50 text-xs">Cadastrado em</p>
                <p className="text-lg font-semibold">
                  {new Date(livro.dataCadastro).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-pink-primary hover:bg-pink-hot text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            {mostrarForm ? '✕ Cancelar' : '⭐ Avaliar este livro'}
          </button>
        </div>
      </div>

      {/* Formulário de avaliação */}
      {mostrarForm && (
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
          <h2 className="font-display text-xl font-semibold mb-4">Sua avaliação</h2>

          <div className="space-y-4">
            <p className="text-sm text-black/60">
              Avaliando como <span className="font-medium text-black">{membra?.nome}</span>
            </p>

            {/* Estrelas */}
            <div>
              <label className="block text-sm font-medium text-black/70 mb-2">
                Nota
              </label>
              <EstrelasInput valor={estrelas} onChange={setEstrelas} />
            </div>

            {/* Resenha */}
            <div>
              <label className="block text-sm font-medium text-black/70 mb-2">
                Resenha <span className="text-black/40">(opcional)</span>
              </label>
              <textarea
                value={resenha}
                onChange={(e) => setResenha(e.target.value)}
                placeholder="O que você achou do livro?"
                rows={4}
                className="w-full px-4 py-3 border-2 border-pink-light rounded-xl focus:border-pink-primary focus:outline-none resize-none"
              />
            </div>

            <button
              onClick={handleEnviarAvaliacao}
              disabled={enviando || estrelas === 0}
              className="bg-pink-primary hover:bg-pink-hot text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviando ? 'Enviando...' : 'Enviar avaliação'}
            </button>
          </div>
        </div>
      )}

      {/* Resenhas das membras */}
      <section className="mt-8">
        <h2 className="text-2xl font-display font-bold text-black mb-6">
          O que as gatas acharam 🐱
        </h2>

        {avaliacoes.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow">
            <p className="text-black/60">Nenhuma avaliação ainda. Seja a primeira!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {avaliacoes.map((avaliacao, index) => (
              <article key={index} className="bg-white rounded-2xl p-6 shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-light rounded-full flex items-center justify-center">
                      <span>🐱</span>
                    </div>
                    <div>
                      <p className="font-medium text-black">{avaliacao.membraNome}</p>
                      {avaliacao.dataLeitura && (
                        <p className="text-xs text-black/50">
                          {new Date(avaliacao.dataLeitura).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </p>
                      )}
                    </div>
                  </div>
                  {avaliacao.estrelas > 0 && <EstrelasDisplay quantidade={avaliacao.estrelas} />}
                </div>
                {avaliacao.resenha && (
                  <p className="text-black/80 leading-relaxed">{avaliacao.resenha}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
