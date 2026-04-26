import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { listarLivros, buscarAvaliacoesDoLivro, type Livro, type AvaliacaoLivro } from '../services/api'

const CORES_GENERO = ['#F472B6', '#EC4899', '#EF4444', '#FCE7F3', '#1A1A1A']

interface LivroComAvaliacoes {
  livro: Livro
  avaliacoes: AvaliacaoLivro[]
}

export function Dashboard() {
  const [dados, setDados] = useState<LivroComAvaliacoes[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    listarLivros()
      .then(async (livros) => {
        // Busca avaliações de cada livro em paralelo. Pra 4-30 livros é aceitável;
        // se virar gargalo, dá pra criar um endpoint /dashboard agregado.
        const comAvaliacoes = await Promise.all(
          livros.map(async (livro) => ({
            livro,
            avaliacoes: await buscarAvaliacoesDoLivro(livro.id),
          }))
        )
        setDados(comAvaliacoes)
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [])

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin text-4xl">📊</div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="text-center py-16">
        <p className="text-2xl mb-4">😿</p>
        <p className="text-red-500">{erro}</p>
      </div>
    )
  }

  // Agregações
  const totalLivros = dados.length
  const totalPaginas = dados.reduce((acc, d) => acc + (d.livro.paginas ?? 0), 0)

  const todasAvaliacoes = dados.flatMap((d) => d.avaliacoes)
  const mediaGeral = todasAvaliacoes.length > 0
    ? todasAvaliacoes.reduce((acc, a) => acc + (a.estrelas ?? 0), 0) / todasAvaliacoes.length
    : 0

  // Ordenado por dataCadastro DESC pra "histórico"
  const dadosOrdenados = [...dados].sort((a, b) => {
    const dataA = a.livro.dataCadastro ? new Date(a.livro.dataCadastro).getTime() : 0
    const dataB = b.livro.dataCadastro ? new Date(b.livro.dataCadastro).getTime() : 0
    return dataB - dataA
  })

  const livroAtual = dadosOrdenados[0]?.livro

  // Notas por livro (média de estrelas) — só inclui livros com ao menos 1 avaliação
  const notasPorLivro = dados
    .filter((d) => d.avaliacoes.length > 0)
    .map((d) => ({
      livro: d.livro.titulo,
      nota: Number(
        (d.avaliacoes.reduce((acc, a) => acc + (a.estrelas ?? 0), 0) / d.avaliacoes.length).toFixed(1)
      ),
    }))

  // Gêneros — count de livros por gênero
  const generosMap = new Map<string, number>()
  dados.forEach((d) => {
    generosMap.set(d.livro.genero, (generosMap.get(d.livro.genero) ?? 0) + 1)
  })
  const generos = Array.from(generosMap, ([nome, quantidade]) => ({ nome, quantidade }))

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Dashboard do Clube</h1>
        <p className="text-black/70">A jornada literária das Literacats 🐱</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard titulo="Livros do Clube" valor={totalLivros.toString()} icone="📚" />
        <StatCard
          titulo="Páginas Totais"
          valor={totalPaginas > 0 ? totalPaginas.toLocaleString('pt-BR') : '—'}
          icone="📖"
        />
        <StatCard
          titulo="Nota Média"
          valor={mediaGeral > 0 ? mediaGeral.toFixed(1) : '—'}
          icone="⭐"
        />
        <StatCard
          titulo="Livro do Mês"
          valor={livroAtual?.titulo ?? '—'}
          icone="🐱"
          pequeno
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
          <h2 className="font-display text-xl font-semibold mb-4">Notas por Livro</h2>
          {notasPorLivro.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={notasPorLivro} layout="vertical">
                <XAxis type="number" domain={[0, 5]} />
                <YAxis type="category" dataKey="livro" width={120} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [`${value}/5`, 'Nota']}
                  labelFormatter={(label) => `📖 ${label}`}
                />
                <Bar dataKey="nota" fill="#F472B6" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-black/50 text-sm py-12 text-center">
              Nenhuma avaliação ainda. Avaliem os livros lidos! ⭐
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
          <h2 className="font-display text-xl font-semibold mb-4">Gêneros Lidos</h2>
          {generos.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={generos}
                  dataKey="quantidade"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {generos.map((_, index) => (
                    <Cell key={index} fill={CORES_GENERO[index % CORES_GENERO.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-black/50 text-sm py-12 text-center">Sem livros ainda</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
        <h2 className="font-display text-xl font-semibold mb-4">Histórico do Clube</h2>
        {dadosOrdenados.length > 0 ? (
          <div className="space-y-3">
            {dadosOrdenados.map(({ livro, avaliacoes }) => {
              const media = avaliacoes.length > 0
                ? avaliacoes.reduce((acc, a) => acc + (a.estrelas ?? 0), 0) / avaliacoes.length
                : null
              return (
                <div
                  key={livro.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-cream hover:bg-pink-light/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-pink-primary font-medium text-sm w-16 flex-shrink-0">
                      {livro.dataCadastro ? formatarMesAno(livro.dataCadastro) : '—'}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-black truncate">{livro.titulo}</p>
                      <p className="text-xs text-black/50 truncate">{livro.autor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    {media !== null ? (
                      <>
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold">{media.toFixed(1)}</span>
                      </>
                    ) : (
                      <span className="text-xs text-black/40">sem nota</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-black/50 text-sm py-8 text-center">Nenhum livro cadastrado ainda</p>
        )}
      </div>
    </div>
  )
}

interface StatCardProps {
  titulo: string
  valor: string
  icone: string
  pequeno?: boolean
}

function StatCard({ titulo, valor, icone, pequeno }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg shadow-pink-primary/10">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-black/60 text-xs mb-1">{titulo}</p>
          <p className={`font-display font-bold text-black ${pequeno ? 'text-sm leading-tight' : 'text-2xl'}`}>
            {valor}
          </p>
        </div>
        <span className="text-2xl flex-shrink-0">{icone}</span>
      </div>
    </div>
  )
}

// Lê em UTC pra evitar que datas de meia-noite UTC sejam exibidas como o mês anterior
// no timezone do Brasil (UTC-3). A "data" aqui é semântica de mês, não momento exato.
function formatarMesAno(iso: string): string {
  const d = new Date(iso)
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${meses[d.getUTCMonth()]}/${d.getUTCFullYear().toString().slice(-2)}`
}
