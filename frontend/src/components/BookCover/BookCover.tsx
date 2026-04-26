import { useState, useEffect } from 'react'

interface BookCoverProps {
  titulo: string
  autor: string
  capa?: string
  className?: string
}

export function BookCover({ titulo, autor, capa, className = '' }: BookCoverProps) {
  const [urlCapa, setUrlCapa] = useState<string | null>(null)
  const [erro, setErro] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    // Capa explícita do banco tem prioridade — evita rodar a busca quando já sabemos a URL
    if (capa) {
      setUrlCapa(capa)
      setErro(false)
      setCarregando(false)
      return
    }

    // Sem capa explícita: tenta achar na Open Library pelo título + autor
    const buscarCapa = async () => {
      try {
        const query = encodeURIComponent(`${titulo} ${autor}`)
        const response = await fetch(
          `https://openlibrary.org/search.json?q=${query}&limit=1&fields=cover_i,title,author_name`
        )
        const data = await response.json()

        if (data.docs?.[0]?.cover_i) {
          const coverId = data.docs[0].cover_i
          setUrlCapa(`https://covers.openlibrary.org/b/id/${coverId}-M.jpg`)
        } else {
          setErro(true)
        }
      } catch {
        setErro(true)
      } finally {
        setCarregando(false)
      }
    }

    buscarCapa()
  }, [titulo, autor, capa])

  // Carregando ou erro: mostra placeholder
  if (carregando) {
    return (
      <div className={`bg-pink-light animate-pulse flex items-center justify-center ${className}`}>
        <span className="text-pink-primary text-2xl">📚</span>
      </div>
    )
  }

  if (erro || !urlCapa) {
    return (
      <div className={`bg-gradient-to-br from-pink-light to-pink-primary/30 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <span className="text-4xl mb-2 block">📖</span>
          <p className="text-pink-hot text-xs font-medium line-clamp-2">{titulo}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={urlCapa}
        alt={`Capa de ${titulo}`}
        className="w-full h-full object-cover"
        onError={() => setErro(true)}
      />
    </div>
  )
}
