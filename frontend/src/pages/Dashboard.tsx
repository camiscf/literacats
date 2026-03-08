import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Histórico de livros do clube - um por mês
const historicoLivros = [
  { mes: 'Jan/24', livro: 'Torto Arado', nota: 4.7 },
  { mes: 'Fev/24', livro: 'A Vegetariana', nota: 4.2 },
  { mes: 'Mar/24', livro: 'Quarto de Despejo', nota: 4.8 },
  { mes: 'Abr/24', livro: 'Hibisco Roxo', nota: 4.5 },
  { mes: 'Mai/24', livro: 'O Conto da Aia', nota: 4.3 },
]

const generos = [
  { nome: 'Ficção', quantidade: 12 },
  { nome: 'Não-ficção', quantidade: 4 },
  { nome: 'Romance', quantidade: 3 },
  { nome: 'Distopia', quantidade: 2 },
]

const proporcaoAutores = [
  { nome: 'Mulheres', quantidade: 15 },
  { nome: 'Homens', quantidade: 6 },
]

const CORES_GENERO = ['#F472B6', '#EC4899', '#EF4444', '#FCE7F3']
const CORES_AUTORES = ['#F472B6', '#1A1A1A']

export function Dashboard() {
  const totalLivros = 21
  const totalPaginas = 6840
  const mediaGeral = 4.5
  const anosAtivo = 2

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">Dashboard do Clube</h1>
        <p className="text-black/70">A jornada literária das Literacats 🐱</p>
      </header>

      {/* Cards principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard titulo="Livros Lidos" valor={totalLivros.toString()} icone="📚" />
        <StatCard titulo="Páginas Totais" valor={totalPaginas.toLocaleString('pt-BR')} icone="📖" />
        <StatCard titulo="Nota Média" valor={mediaGeral.toString()} icone="⭐" />
        <StatCard titulo="Anos de Clube" valor={anosAtivo.toString()} icone="🎂" />
      </div>

      {/* Gráficos principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
          <h2 className="font-display text-xl font-semibold mb-4">Notas por Livro</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={historicoLivros} layout="vertical">
              <XAxis type="number" domain={[0, 5]} />
              <YAxis type="category" dataKey="livro" width={120} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [`${value}/5`, 'Nota']}
                labelFormatter={(label) => `📖 ${label}`}
              />
              <Bar dataKey="nota" fill="#F472B6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
          <h2 className="font-display text-xl font-semibold mb-4">Gêneros Lidos</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={generos}
                dataKey="quantidade"
                nameKey="nome"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {generos.map((_, index) => (
                  <Cell key={index} fill={CORES_GENERO[index % CORES_GENERO.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Proporção autoras/autores + Linha do tempo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
          <h2 className="font-display text-xl font-semibold mb-4">Autoras vs Autores</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={proporcaoAutores}
                dataKey="quantidade"
                nameKey="nome"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              >
                {proporcaoAutores.map((_, index) => (
                  <Cell key={index} fill={CORES_AUTORES[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            <span className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-pink-primary"></span> Mulheres
            </span>
            <span className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-black"></span> Homens
            </span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
          <h2 className="font-display text-xl font-semibold mb-4">Últimas Leituras do Clube</h2>
          <div className="space-y-3">
            {historicoLivros.slice().reverse().map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-cream hover:bg-pink-light/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-pink-primary font-medium text-sm w-16">{item.mes}</span>
                  <span className="font-medium text-black">{item.livro}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="font-semibold">{item.nota}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ titulo, valor, icone }: { titulo: string; valor: string; icone: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg shadow-pink-primary/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-black/60 text-xs mb-1">{titulo}</p>
          <p className="text-2xl font-display font-bold text-black">{valor}</p>
        </div>
        <span className="text-2xl">{icone}</span>
      </div>
    </div>
  )
}
