import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listarMembras, type Membra } from '../services/api'

// Avatares por ID (depois pode vir do backend)
const avatares: Record<string, string> = {
  '1': '🐱',
  '2': '🦊',
  '3': '🦉',
  '4': '🐰',
  '5': '🐼',
  '6': '🦇',
}

function formatarData(data?: string): string {
  if (!data) return ''
  const d = new Date(data)
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  return `${meses[d.getMonth()]} ${d.getFullYear()}`
}

export function Membras() {
  const [membras, setMembras] = useState<Membra[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    listarMembras()
      .then(setMembras)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [])

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
        <p className="text-black/60 mt-2">Verifique se a API está rodando em localhost:5203</p>
      </div>
    )
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-black mb-2">Membras do Clube</h1>
        <p className="text-black/70">As gatas leitoras do Literacats 🐱</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {membras.map((membra) => (
          <Link
            key={membra.id}
            to={`/membra/${membra.id}`}
            className="group bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10 hover:shadow-xl hover:shadow-pink-primary/20 transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-primary to-pink-hot rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <span className="text-3xl">{avatares[membra.id] || '🐱'}</span>
              </div>
              <div>
                <h2 className="font-display text-xl font-semibold text-black group-hover:text-pink-hot transition-colors">
                  {membra.nome}
                </h2>
                <p className="text-pink-hot text-sm">@{membra.apelido}</p>
              </div>
            </div>

            <p className="text-black/70 text-sm mb-4 line-clamp-2">{membra.bio}</p>

            <div className="flex items-center justify-between text-sm">
              <span className="text-black/50">
                📚 Meta: {membra.metaLeituraAnual} livros/ano
              </span>
              <span className="text-black/50">
                Desde {formatarData(membra.membraDesde).split(' ')[0]}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
