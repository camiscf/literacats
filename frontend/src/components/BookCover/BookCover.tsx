import { useState, useEffect, useCallback } from 'react'

interface BookCoverProps {
  titulo: string
  autora: string
  capa?: string | null
  className?: string
}

export function BookCover({ titulo, autora, capa, className = '' }: BookCoverProps) {
  const [urlCapa, setUrlCapa] = useState<string | null>(null)
  const [erro, setErro] = useState(false)
  const [carregando, setCarregando] = useState(true)

  // Busca capa na Open Library pelo título + autor (usada quando não há capa
  // explícita ou quando a URL explícita falhou ao carregar).
  const buscarCapaNaOpenLibrary = useCallback(async () => {
    setCarregando(true)
    try {
      const query = encodeURIComponent(`${titulo} ${autora}`)
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${query}&limit=1&fields=cover_i,title,author_name`
      )
      const data = await response.json()

      if (data.docs?.[0]?.cover_i) {
        const coverId = data.docs[0].cover_i
        setUrlCapa(`https://covers.openlibrary.org/b/id/${coverId}-M.jpg`)
        setErro(false)
      } else {
        setErro(true)
      }
    } catch {
      setErro(true)
    } finally {
      setCarregando(false)
    }
  }, [titulo, autora])

  useEffect(() => {
    // Capa explícita do banco tem prioridade — evita rodar a busca quando já sabemos a URL
    if (capa) {
      setUrlCapa(capa)
      setErro(false)
      setCarregando(false)
      return
    }

    buscarCapaNaOpenLibrary()
  }, [titulo, autora, capa, buscarCapaNaOpenLibrary])

  // Carregando ou erro: mostra placeholder
  if (carregando) {
    return (
      <div aria-hidden="true" className={`animate-pulse bg-pantufa/60 ${className}`} />
    )
  }

  if (erro || !urlCapa) {
    return (
      <div className={`flex items-center justify-center bg-pantufa p-2 ${className}`}>
        <p className="line-clamp-3 text-center font-display text-sm uppercase leading-tight text-preto">{titulo}</p>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={urlCapa}
        alt={`Capa de ${titulo}`}
        className="w-full h-full object-cover"
        onError={() => {
          // URL explícita quebrada (404 etc.): tenta achar a capa na Open Library
          // antes de desistir e cair no placeholder.
          if (capa && urlCapa === capa) {
            buscarCapaNaOpenLibrary()
          } else {
            setErro(true)
          }
        }}
      />
    </div>
  )
}
