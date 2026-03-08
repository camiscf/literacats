import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BookCover } from '../components/BookCover/BookCover'
import { buscarLivro, type Livro } from '../services/api'
import type { Avaliacao } from '../types'

// Dados mock de avaliações - depois vem do backend
const avaliacoesMock: (Avaliacao & { membraNome: string })[] = [
  { livroId: '1', membraId: '1', membraNome: 'Maria', estrelas: 5, resenha: 'Leitura transformadora. A escrita do Itamar é poética e visceral ao mesmo tempo. Chorei no final.', dataLeitura: '2024-03-15' },
  { livroId: '1', membraId: '2', membraNome: 'Ana', estrelas: 4, resenha: 'Amei a ambientação no sertão e as vozes das personagens. Demorei pra entrar no ritmo mas valeu muito.', dataLeitura: '2024-03-20' },
  { livroId: '1', membraId: '3', membraNome: 'Julia', estrelas: 5, resenha: 'Obra-prima da literatura brasileira contemporânea. Obrigatório!', dataLeitura: '2024-03-18' },
]

function Estrelas({ quantidade }: { quantidade: number }) {
  return (
    <span className="text-yellow-500">
      {'★'.repeat(quantidade)}{'☆'.repeat(5 - quantidade)}
    </span>
  )
}

export function LivroDetalhes() {
  const { id } = useParams<{ id: string }>()
  const [livro, setLivro] = useState<Livro | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    buscarLivro(id)
      .then(setLivro)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [id])

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

  const avaliacoes = avaliacoesMock.filter(a => a.livroId === livro.id)
  const mediaEstrelas = avaliacoes.length > 0
    ? Math.round(avaliacoes.reduce((acc, a) => acc + a.estrelas, 0) / avaliacoes.length)
    : 0

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
            className="w-full aspect-[2/3] rounded-2xl shadow-xl"
          />
        </div>

        {/* Coluna de informações */}
        <div className="md:col-span-2">
          <span className="inline-block bg-pink-light text-pink-hot px-3 py-1 rounded-full text-sm font-medium mb-3">
            {livro.genero}
          </span>

          <h1 className="text-4xl font-display font-bold text-black mb-2">
            {livro.titulo}
          </h1>

          <p className="text-xl text-black/70 mb-4">{livro.autor}</p>

          {avaliacoes.length > 0 && (
            <div className="flex items-center gap-3 mb-6">
              <Estrelas quantidade={mediaEstrelas} />
              <span className="text-black/60">
                {mediaEstrelas}/5 ({avaliacoes.length} avaliações do clube)
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
            <div className="bg-white rounded-xl px-4 py-3 shadow">
              <p className="text-black/50 text-xs">Status</p>
              <p className="text-lg font-semibold text-green-600">✓ Lido</p>
            </div>
            {livro.dataCadastro && (
              <div className="bg-white rounded-xl px-4 py-3 shadow">
                <p className="text-black/50 text-xs">Cadastrado em</p>
                <p className="text-lg font-semibold">
                  {new Date(livro.dataCadastro).toLocaleDateString('pt-BR')}
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button className="bg-pink-primary hover:bg-pink-hot text-white px-6 py-3 rounded-xl font-medium transition-colors">
              ✏️ Escrever resenha
            </button>
            <button className="border-2 border-pink-primary text-pink-hot hover:bg-pink-light px-6 py-3 rounded-xl font-medium transition-colors">
              ♡ Favoritar
            </button>
          </div>
        </div>
      </div>

      {/* Resenhas das membras */}
      <section className="mt-12">
        <h2 className="text-2xl font-display font-bold text-black mb-6">
          O que as gatas acharam 🐱
        </h2>

        {avaliacoes.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow">
            <p className="text-black/60">Nenhuma resenha ainda. Seja a primeira!</p>
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
                      <p className="text-xs text-black/50">
                        {new Date(avaliacao.dataLeitura).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Estrelas quantidade={avaliacao.estrelas} />
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
