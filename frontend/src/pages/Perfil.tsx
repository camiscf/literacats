import { useState } from 'react'
import { BookCover } from '../components/BookCover/BookCover'

// Dados da membra logada — depois vem do backend via auth
const membraMock = {
  nome: 'Camila',
  apelido: 'camis',
  bio: 'Adoro correr, cozinhar, ler e às vezes lembro que também sou programadora',
  membraDesde: 'Fevereiro 2026',
  foto: null,
  metaLeituraAnual: 12,
  livrosLidosNoAno: 1,
  totalLivrosLidos: 1,
  totalPaginas: 224,
  totalResenhas: 0,
  mediaAvaliacoes: 0,
}

const livrosFavoritos: { titulo: string; autor: string }[] = []

const historicoRecente = [
  { titulo: 'Nem Todo Outono É Igual', autor: 'Carla Madeira', data: 'Fev 2026', nota: 0 },
]

const queroLer: { titulo: string; autor: string }[] = []

const conquistas = [
  { icone: '📖', titulo: 'Primeira Leitura', descricao: 'Leu o primeiro livro do clube' },
  { icone: '🐱', titulo: 'Gata Fundadora', descricao: 'Estava no clube desde o início' },
]

function Estrelas({ quantidade }: { quantidade: number }) {
  return (
    <span className="text-yellow-500 text-sm">
      {'★'.repeat(quantidade)}{'☆'.repeat(5 - quantidade)}
    </span>
  )
}

export function Perfil() {
  const [editandoBio, setEditandoBio] = useState(false)
  const [bio, setBio] = useState(membraMock.bio)
  const [editandoMeta, setEditandoMeta] = useState(false)
  const [meta, setMeta] = useState(membraMock.metaLeituraAnual)

  // TODO: integrar com Cognito
  const usuarioLogado = true

  const progresso = Math.round((membraMock.livrosLidosNoAno / meta) * 100)
  const livrosRestantes = meta - membraMock.livrosLidosNoAno

  // Tela de login (quando não estiver logada)
  if (!usuarioLogado) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-br from-pink-primary to-pink-hot rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-5xl">🐱</span>
        </div>
        <h1 className="text-3xl font-display font-bold text-black mb-3">Entre no clube!</h1>
        <p className="text-black/60 mb-8">
          Faça login para ver seu perfil, acompanhar suas leituras e participar dos sorteios.
        </p>
        <button className="bg-pink-primary hover:bg-pink-hot text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors">
          Entrar com e-mail
        </button>
        <p className="text-black/50 text-sm mt-4">
          Ainda não é membra? <a href="#" className="text-pink-hot hover:underline">Peça seu convite</a>
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner "Meu Perfil" */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-display font-bold text-black">Meu Perfil</h1>
        <div className="flex items-center gap-2">
          <button className="px-3 py-2 text-sm text-black/60 hover:text-black hover:bg-white rounded-lg transition-colors flex items-center gap-1.5">
            ⚙️ <span className="hidden sm:inline">Configurações</span>
          </button>
          <button className="px-3 py-2 text-sm text-red-accent hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5">
            🚪 <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>

      {/* Header do perfil */}
      <div className="bg-white rounded-2xl p-8 shadow-lg shadow-pink-primary/10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-pink-primary to-pink-hot rounded-full flex items-center justify-center shadow-lg">
              <span className="text-5xl md:text-6xl">🐱</span>
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-pink-hot hover:bg-pink-light transition-colors">
              📷
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-display font-bold text-black">{membraMock.nome}</h1>
            <p className="text-pink-hot font-medium">@{membraMock.apelido.toLowerCase()}</p>

            {/* Bio editável */}
            <div className="mt-3">
              {editandoBio ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="flex-1 px-3 py-2 border-2 border-pink-light rounded-lg focus:border-pink-primary focus:outline-none text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => setEditandoBio(false)}
                    className="px-3 py-2 bg-pink-primary text-white rounded-lg text-sm"
                  >
                    Salvar
                  </button>
                </div>
              ) : (
                <p
                  onClick={() => setEditandoBio(true)}
                  className="text-black/70 cursor-pointer hover:text-black transition-colors"
                >
                  {bio} <span className="text-pink-primary">✏️</span>
                </p>
              )}
            </div>

            <p className="text-black/50 text-sm mt-2">🐱 Membra desde {membraMock.membraDesde}</p>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard valor={membraMock.totalLivrosLidos} label="Livros lidos" icone="📚" />
        <StatCard valor={membraMock.totalPaginas.toLocaleString('pt-BR')} label="Páginas" icone="📖" />
        <StatCard valor={membraMock.totalResenhas} label="Resenhas" icone="✍️" />
        <StatCard valor={membraMock.mediaAvaliacoes.toString()} label="Média" icone="⭐" />
      </div>

      {/* Meta de leitura */}
      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold">Meta de Leitura 2024</h2>

          {editandoMeta ? (
            <div className="flex items-center gap-2">
              <span className="text-xl font-display font-bold text-black">
                {membraMock.livrosLidosNoAno}/
              </span>
              <input
                type="number"
                value={meta}
                onChange={(e) => setMeta(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1 text-xl font-display font-bold text-pink-hot border-2 border-pink-primary rounded-lg text-center focus:outline-none"
                min="1"
                autoFocus
              />
              <button
                onClick={() => setEditandoMeta(false)}
                className="px-3 py-1 bg-pink-primary text-white rounded-lg text-sm"
              >
                Salvar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditandoMeta(true)}
              className="text-2xl font-display font-bold text-pink-hot hover:text-pink-primary transition-colors flex items-center gap-2"
            >
              {membraMock.livrosLidosNoAno}/{meta}
              <span className="text-base">✏️</span>
            </button>
          )}
        </div>

        <div className="relative w-full bg-pink-light rounded-full h-6 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-pink-primary to-pink-hot rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progresso, 100)}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white mix-blend-difference">
            {progresso}%
          </span>
        </div>

        <p className="text-black/60 text-sm mt-3">
          {livrosRestantes > 0
            ? `Faltam ${livrosRestantes} livros! Você consegue! 💪`
            : '🎉 Meta batida! Que tal aumentar?'}
        </p>
      </div>

      {/* Conquistas */}
      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
        <h2 className="font-display text-xl font-semibold mb-4">Conquistas</h2>
        <div className="flex flex-wrap gap-3">
          {conquistas.map((conquista, index) => (
            <div
              key={index}
              className="group relative bg-pink-light hover:bg-pink-primary rounded-xl p-3 transition-colors cursor-pointer"
            >
              <span className="text-2xl">{conquista.icone}</span>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                <p className="font-semibold">{conquista.titulo}</p>
                <p className="text-white/70">{conquista.descricao}</p>
              </div>
            </div>
          ))}

          {/* Conquistas bloqueadas */}
          <div className="bg-gray-100 rounded-xl p-3 opacity-50">
            <span className="text-2xl grayscale">🏆</span>
          </div>
          <div className="bg-gray-100 rounded-xl p-3 opacity-50">
            <span className="text-2xl grayscale">📚</span>
          </div>
        </div>
      </div>

      {/* Livros favoritos */}
      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
        <h2 className="font-display text-xl font-semibold mb-4">Livros Favoritos ❤️</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {livrosFavoritos.map((livro, index) => (
            <div key={index} className="group cursor-pointer">
              <BookCover
                titulo={livro.titulo}
                autor={livro.autor}
                className="aspect-[2/3] rounded-lg shadow group-hover:shadow-lg group-hover:-translate-y-1 transition-all"
              />
              <p className="text-xs text-black/70 mt-1.5 line-clamp-1">{livro.titulo}</p>
            </div>
          ))}

          {/* Adicionar favorito */}
          <button className="aspect-[2/3] rounded-lg border-2 border-dashed border-pink-light hover:border-pink-primary flex items-center justify-center text-pink-primary hover:bg-pink-light/50 transition-colors">
            <span className="text-2xl">+</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Histórico recente */}
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
          <h2 className="font-display text-xl font-semibold mb-4">Leituras Recentes</h2>
          <div className="space-y-3">
            {historicoRecente.map((livro, index) => (
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

        {/* Quero ler */}
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
          <h2 className="font-display text-xl font-semibold mb-4">Quero Ler 📚</h2>
          <div className="space-y-3">
            {queroLer.map((livro, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-pink-light/30 transition-colors">
                <BookCover
                  titulo={livro.titulo}
                  autor={livro.autor}
                  className="w-12 h-16 rounded shadow"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-black text-sm truncate">{livro.titulo}</p>
                  <p className="text-xs text-black/50">{livro.autor}</p>
                </div>
              </div>
            ))}

            <button className="w-full py-3 border-2 border-dashed border-pink-light hover:border-pink-primary text-pink-hot rounded-lg text-sm font-medium hover:bg-pink-light/30 transition-colors">
              + Adicionar livro
            </button>
          </div>
        </div>
      </div>
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
