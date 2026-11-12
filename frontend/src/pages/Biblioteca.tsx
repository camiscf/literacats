import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatarMesDaLeitura } from '../lib/datas'
import type { LivroComMedia } from '../types'
import { BookCover } from '../components/BookCover/BookCover'
import { Patinhas, formatarPatinhas } from '../components/ui/Patinhas'
import { Carregando, EstadoVazio, Erro } from '../components/ui/Estados'

type Filtro = 'todos' | 'amados' | number

export function Biblioteca() {
  const [livros, setLivros] = useState<LivroComMedia[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  const [filtro, setFiltro] = useState<Filtro>('todos')

  const buscarLivrosLidosPeloClube = async () => {
    setCarregando(true)
    setErro(false)
    // Só entram livros que já tiveram encontro: é o acervo do que lemos juntas
    const { data, error } = await supabase
      .from('livros_com_media')
      .select('*')
      .not('lido_no_encontro_em', 'is', null)
      .lte('lido_no_encontro_em', new Date().toISOString())
      .order('lido_no_encontro_em', { ascending: false })
    if (error) setErro(true)
    else setLivros((data ?? []) as LivroComMedia[])
    setCarregando(false)
  }

  useEffect(() => {
    buscarLivrosLidosPeloClube()
  }, [])

  const anos = useMemo(
    () => [...new Set(livros.map((l) => new Date(l.lido_no_encontro_em!).getFullYear()))].sort((a, b) => b - a),
    [livros],
  )

  const livrosFiltrados = useMemo(() => {
    if (filtro === 'todos') return livros
    if (filtro === 'amados') {
      return livros
        .filter((l) => l.media_patinhas !== null)
        .sort((a, b) => (b.media_patinhas ?? 0) - (a.media_patinhas ?? 0))
    }
    return livros.filter((l) => new Date(l.lido_no_encontro_em!).getFullYear() === filtro)
  }, [livros, filtro])

  const opcoesDeFiltro: { valor: Filtro; rotulo: string }[] = [
    { valor: 'todos', rotulo: 'Todos' },
    ...anos.map((ano) => ({ valor: ano as Filtro, rotulo: String(ano) })),
    { valor: 'amados', rotulo: 'Mais amados' },
  ]

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1 pt-2">
        <h1 className="text-4xl leading-none">Biblioteca do clube</h1>
        {!carregando && !erro && (
          <p className="text-sm text-preto-suave">
            {livros.length} {livros.length === 1 ? 'livro lido' : 'livros lidos'} juntas
          </p>
        )}
      </header>

      {livros.length > 0 && (
        <div role="group" aria-label="Filtrar livros" className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
          {opcoesDeFiltro.map((opcao) => (
            <button
              key={opcao.rotulo}
              type="button"
              aria-pressed={filtro === opcao.valor}
              onClick={() => setFiltro(opcao.valor)}
              className={`min-h-10 shrink-0 rounded-full border-2 border-preto px-4 text-sm font-semibold ${
                filtro === opcao.valor ? 'bg-preto text-novelo' : 'bg-white'
              }`}
            >
              {opcao.rotulo}
            </button>
          ))}
        </div>
      )}

      {carregando ? (
        <Carregando texto="Buscando os livros na estante..." />
      ) : erro ? (
        <Erro texto="Não deu pra carregar a biblioteca." aoTentarDeNovo={buscarLivrosLidosPeloClube} />
      ) : livrosFiltrados.length === 0 ? (
        <EstadoVazio
          titulo={filtro === 'amados' ? 'Nenhuma avaliação ainda' : 'Nenhum livro por aqui ainda'}
          texto={filtro === 'amados' ? 'Quando as gatinhas avaliarem, os favoritos aparecem aqui.' : 'O primeiro encontro vem aí!'}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {livrosFiltrados.map((livro) => (
            <li key={livro.id}>
              <Link
                to={`/livro/${livro.id}`}
                className="flex gap-4 rounded-3xl border-2 border-preto bg-white p-3 transition-colors hover:bg-pantufa/30"
              >
                <BookCover
                  titulo={livro.titulo}
                  autora={livro.autora}
                  capa={livro.capa_url}
                  className="h-24 w-16 shrink-0 rounded-lg"
                />
                <div className="flex min-w-0 flex-col justify-center gap-1">
                  <p className="font-semibold leading-tight">{livro.titulo}</p>
                  <p className="text-sm text-preto-suave">
                    {livro.autora} · {formatarMesDaLeitura(livro.lido_no_encontro_em!)}
                  </p>
                  {livro.media_patinhas !== null ? (
                    <p className="flex items-center gap-2 text-sm">
                      <Patinhas valor={livro.media_patinhas} tamanho={16} />
                      <span className="font-semibold">{formatarPatinhas(livro.media_patinhas)}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-preto-suave">Sem avaliações ainda</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
