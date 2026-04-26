import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookCover } from '../components/BookCover/BookCover'
import { listarLivros, type Livro } from '../services/api'

export function Biblioteca() {
  const [livros, setLivros] = useState<Livro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    listarLivros()
      .then(setLivros)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [])

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
        <p className="text-black/60 mt-2">Verifique se a API está rodando em localhost:5203</p>
      </div>
    )
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Biblioteca do Clube</h1>
        <p className="text-black/70">Todos os livros que as gatas já leram, estão lendo ou querem ler</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {livros.map((livro) => (
          <Link
            key={livro.id}
            to={`/livro/${livro.id}`}
            className="group block"
          >
            <div className="relative mb-3">
              <BookCover
                titulo={livro.titulo}
                autor={livro.autor}
                capa={livro.capa}
                className="w-full aspect-[2/3] rounded-lg shadow-lg group-hover:shadow-xl group-hover:shadow-pink-primary/20 transition-all group-hover:-translate-y-1"
              />
              <span className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm text-pink-hot px-2 py-1 rounded-full text-xs font-medium shadow">
                {livro.genero}
              </span>
            </div>
            <h2 className="font-display text-sm font-semibold text-black leading-tight mb-1 group-hover:text-pink-hot transition-colors">
              {livro.titulo}
            </h2>
            <p className="text-black/60 text-sm">{livro.autor}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
