import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BookCover } from '../components/BookCover/BookCover'
import { buscarMembra, buscarLivrosDaMembra, type Membra, type MembraLivro } from '../services/api'

// Avatares por ID
const avatares: Record<string, string> = {
  '1': '🐱',
  '2': '🦊',
  '3': '🦉',
  '4': '🐰',
  '5': '🐼',
  '6': '🦇',
}

// Dados mock expandidos por membra (depois vem do backend)
const dadosCompletos: Record<string, {
  totalPaginas: number
  totalResenhas: number
  mediaAvaliacoes: number
  livrosFavoritos: { titulo: string; autor: string }[]
  historicoRecente: { titulo: string; autor: string; data: string; nota: number }[]
  conquistas: { icone: string; titulo: string }[]
}> = {
  '1': {
    totalPaginas: 9840,
    totalResenhas: 18,
    mediaAvaliacoes: 4.3,
    livrosFavoritos: [
      { titulo: 'Torto Arado', autor: 'Itamar Vieira Junior' },
      { titulo: 'A Vegetariana', autor: 'Han Kang' },
      { titulo: 'Hibisco Roxo', autor: 'Chimamanda Ngozi Adichie' },
    ],
    historicoRecente: [
      { titulo: 'O Conto da Aia', autor: 'Margaret Atwood', data: 'Mai 2024', nota: 4 },
      { titulo: 'Hibisco Roxo', autor: 'Chimamanda Ngozi Adichie', data: 'Abr 2024', nota: 5 },
    ],
    conquistas: [
      { icone: '📖', titulo: 'Primeira Leitura' },
      { icone: '✍️', titulo: 'Crítica Literária' },
      { icone: '🐱', titulo: 'Gata Veterana' },
    ],
  },
  '2': {
    totalPaginas: 14200,
    totalResenhas: 32,
    mediaAvaliacoes: 4.7,
    livrosFavoritos: [
      { titulo: 'Orgulho e Preconceito', autor: 'Jane Austen' },
      { titulo: 'O Nome do Vento', autor: 'Patrick Rothfuss' },
      { titulo: 'Circe', autor: 'Madeline Miller' },
    ],
    historicoRecente: [
      { titulo: 'Circe', autor: 'Madeline Miller', data: 'Mai 2024', nota: 5 },
      { titulo: 'A Canção de Aquiles', autor: 'Madeline Miller', data: 'Abr 2024', nota: 5 },
    ],
    conquistas: [
      { icone: '📖', titulo: 'Primeira Leitura' },
      { icone: '✍️', titulo: 'Crítica Literária' },
      { icone: '🔥', titulo: 'Em Chamas' },
      { icone: '🏆', titulo: 'Top Leitora' },
      { icone: '🐱', titulo: 'Gata Veterana' },
    ],
  },
  '3': {
    totalPaginas: 8400,
    totalResenhas: 15,
    mediaAvaliacoes: 4.1,
    livrosFavoritos: [
      { titulo: 'Sapiens', autor: 'Yuval Noah Harari' },
      { titulo: 'Quarto de Despejo', autor: 'Carolina Maria de Jesus' },
    ],
    historicoRecente: [
      { titulo: 'Quarto de Despejo', autor: 'Carolina Maria de Jesus', data: 'Mar 2024', nota: 5 },
    ],
    conquistas: [
      { icone: '📖', titulo: 'Primeira Leitura' },
      { icone: '🧠', titulo: 'Intelectual' },
    ],
  },
  '4': {
    totalPaginas: 5200,
    totalResenhas: 12,
    mediaAvaliacoes: 4.5,
    livrosFavoritos: [
      { titulo: 'Amora', autor: 'Natalia Borges Polesso' },
      { titulo: 'Felicidade Clandestina', autor: 'Clarice Lispector' },
    ],
    historicoRecente: [
      { titulo: 'Amora', autor: 'Natalia Borges Polesso', data: 'Mai 2024', nota: 5 },
    ],
    conquistas: [
      { icone: '📖', titulo: 'Primeira Leitura' },
      { icone: '📝', titulo: 'Poeta' },
    ],
  },
  '5': {
    totalPaginas: 11500,
    totalResenhas: 22,
    mediaAvaliacoes: 4.4,
    livrosFavoritos: [
      { titulo: 'O Conto da Aia', autor: 'Margaret Atwood' },
      { titulo: '1984', autor: 'George Orwell' },
      { titulo: 'Fahrenheit 451', autor: 'Ray Bradbury' },
    ],
    historicoRecente: [
      { titulo: 'O Conto da Aia', autor: 'Margaret Atwood', data: 'Mai 2024', nota: 5 },
      { titulo: 'Admirável Mundo Novo', autor: 'Aldous Huxley', data: 'Abr 2024', nota: 4 },
    ],
    conquistas: [
      { icone: '📖', titulo: 'Primeira Leitura' },
      { icone: '✍️', titulo: 'Crítica Literária' },
      { icone: '🛸', titulo: 'Viajante do Tempo' },
      { icone: '🐱', titulo: 'Gata Veterana' },
    ],
  },
  '6': {
    totalPaginas: 7200,
    totalResenhas: 14,
    mediaAvaliacoes: 4.2,
    livrosFavoritos: [
      { titulo: 'O Iluminado', autor: 'Stephen King' },
      { titulo: 'O Silêncio dos Inocentes', autor: 'Thomas Harris' },
    ],
    historicoRecente: [
      { titulo: 'O Iluminado', autor: 'Stephen King', data: 'Abr 2024', nota: 5 },
    ],
    conquistas: [
      { icone: '📖', titulo: 'Primeira Leitura' },
      { icone: '👻', titulo: 'Corajosa' },
    ],
  },
}

function formatarData(data?: string): string {
  if (!data) return ''
  const d = new Date(data)
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  return `${meses[d.getMonth()]} ${d.getFullYear()}`
}

function Estrelas({ quantidade }: { quantidade: number }) {
  return (
    <span className="text-yellow-500 text-sm">
      {'★'.repeat(quantidade)}{'☆'.repeat(5 - quantidade)}
    </span>
  )
}

export function MembraPerfil() {
  const { id } = useParams<{ id: string }>()
  const [membra, setMembra] = useState<Membra | null>(null)
  const [livrosDaMembra, setLivrosDaMembra] = useState<MembraLivro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    Promise.all([
      buscarMembra(id),
      buscarLivrosDaMembra(id)
    ])
      .then(([membraData, livrosData]) => {
        setMembra(membraData)
        setLivrosDaMembra(livrosData)
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [id])

  const dados = id ? dadosCompletos[id] : null

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin text-4xl">🐱</div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="text-center py-16">
        <p className="text-2xl mb-4">😿</p>
        <p className="text-red-500">{erro}</p>
        <Link to="/membras" className="text-pink-hot hover:underline mt-4 inline-block">
          Voltar para lista de membras
        </Link>
      </div>
    )
  }

  if (!membra) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🐱</p>
        <p className="text-black/60">Membra não encontrada</p>
        <Link to="/membras" className="text-pink-hot hover:underline mt-4 inline-block">
          Voltar para lista de membras
        </Link>
      </div>
    )
  }

  const livrosLidos = livrosDaMembra.filter(l => l.status === 'lido').length || dados?.historicoRecente.length || 0

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/membras" className="inline-flex items-center text-pink-hot hover:text-pink-primary transition-colors">
        <span className="mr-2">←</span> Voltar para membras
      </Link>

      {/* Header do perfil */}
      <div className="bg-white rounded-2xl p-8 shadow-lg shadow-pink-primary/10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-32 h-32 bg-gradient-to-br from-pink-primary to-pink-hot rounded-full flex items-center justify-center shadow-lg">
            <span className="text-6xl">{avatares[membra.id] || '🐱'}</span>
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-display font-bold text-black">{membra.nome}</h1>
            <p className="text-pink-hot font-medium">@{membra.apelido}</p>
            <p className="text-black/70 mt-3">{membra.bio}</p>
            <p className="text-black/50 text-sm mt-2">🐱 Membra desde {formatarData(membra.membraDesde)}</p>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard valor={livrosLidos} label="Livros lidos" icone="📚" />
        <StatCard valor={dados?.totalPaginas.toLocaleString('pt-BR') || '0'} label="Páginas" icone="📖" />
        <StatCard valor={dados?.totalResenhas || 0} label="Resenhas" icone="✍️" />
        <StatCard valor={dados?.mediaAvaliacoes.toString() || '0'} label="Média" icone="⭐" />
      </div>

      {/* Meta de leitura */}
      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
        <h2 className="font-display text-xl font-semibold mb-4">Meta de Leitura Anual</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-pink-light rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-primary to-pink-hot transition-all"
              style={{ width: `${Math.min(100, (livrosLidos / membra.metaLeituraAnual) * 100)}%` }}
            />
          </div>
          <span className="text-lg font-semibold text-black">
            {livrosLidos}/{membra.metaLeituraAnual}
          </span>
        </div>
      </div>

      {/* Conquistas */}
      {dados && (
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
          <h2 className="font-display text-xl font-semibold mb-4">Conquistas</h2>
          <div className="flex flex-wrap gap-3">
            {dados.conquistas.map((conquista, index) => (
              <div
                key={index}
                className="group relative bg-pink-light hover:bg-pink-primary rounded-xl p-3 transition-colors"
              >
                <span className="text-2xl">{conquista.icone}</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {conquista.titulo}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Livros favoritos */}
      {dados && dados.livrosFavoritos.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
          <h2 className="font-display text-xl font-semibold mb-4">Livros Favoritos ❤️</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {dados.livrosFavoritos.map((livro, index) => (
              <div key={index} className="group">
                <BookCover
                  titulo={livro.titulo}
                  autor={livro.autor}
                  className="aspect-[2/3] rounded-lg shadow group-hover:shadow-lg group-hover:-translate-y-1 transition-all"
                />
                <p className="text-xs text-black/70 mt-2 line-clamp-1">{livro.titulo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leituras recentes */}
      {dados && (
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
          <h2 className="font-display text-xl font-semibold mb-4">Leituras Recentes</h2>
          <div className="space-y-3">
            {dados.historicoRecente.map((livro, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-pink-light/30 transition-colors">
                <BookCover
                  titulo={livro.titulo}
                  autor={livro.autor}
                  className="w-12 h-16 rounded shadow"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-black text-sm truncate">{livro.titulo}</p>
                  <p className="text-xs text-black/50">{livro.data}</p>
                </div>
                <Estrelas quantidade={livro.nota} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ valor, label, icone }: { valor: string | number; label: string; icone: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg shadow-pink-primary/10 text-center">
      <span className="text-2xl">{icone}</span>
      <p className="text-2xl font-display font-bold text-black mt-1">{valor}</p>
      <p className="text-xs text-black/60">{label}</p>
    </div>
  )
}
