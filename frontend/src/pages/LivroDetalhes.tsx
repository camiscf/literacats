import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatarMesDaLeitura } from '../lib/datas'
import type { Leitura, LivroComMedia } from '../types'
import { BookCover } from '../components/BookCover/BookCover'
import { Patinhas, formatarPatinhas } from '../components/ui/Patinhas'
import { Badge } from '../components/ui/Badge'
import { Icone } from '../components/ui/Icone'
import { Carregando, EstadoVazio, Erro } from '../components/ui/Estados'

type Comentario = Leitura & { membras: { nome: string } | null }

// Antes do encontro, comentário marcado como spoiler só abre com toque intencional
function TextoComSpoiler({ texto, oculto }: { texto: string; oculto: boolean }) {
  const [revelado, setRevelado] = useState(false)
  if (!oculto || revelado) return <p className="text-[15px] leading-relaxed">{texto}</p>
  return (
    <button
      type="button"
      onClick={() => setRevelado(true)}
      className="rounded-2xl bg-pantufa/50 px-4 py-3 text-left text-sm"
    >
      <span className="font-semibold">Comentário com spoiler.</span> Tocar pra ver mesmo assim
    </button>
  )
}

export function LivroDetalhes() {
  const { id } = useParams<{ id: string }>()
  const [livro, setLivro] = useState<LivroComMedia | null>(null)
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  const buscarPaginaDoLivro = useCallback(async () => {
    if (!id) return
    setCarregando(true)
    setErro(false)
    const [resLivro, resLeituras] = await Promise.all([
      supabase.from('livros_com_media').select('*').eq('id', id).maybeSingle(),
      supabase
        .from('leituras')
        .select('*, membras(nome)')
        .eq('livro_id', id)
        .not('patinhas', 'is', null)
        .order('atualizado_em', { ascending: false }),
    ])
    if (resLivro.error || resLeituras.error) setErro(true)
    setLivro((resLivro.data as LivroComMedia | null) ?? null)
    setComentarios((resLeituras.data ?? []) as Comentario[])
    setCarregando(false)
  }, [id])

  useEffect(() => {
    buscarPaginaDoLivro()
  }, [buscarPaginaDoLivro])

  if (carregando) return <Carregando />
  if (erro) return <Erro texto="Não deu pra abrir esse livro." aoTentarDeNovo={buscarPaginaDoLivro} />
  if (!livro) return <EstadoVazio titulo="Livro não encontrado" acao={<Link to="/biblioteca" className="font-semibold underline">Voltar pra biblioteca</Link>} />

  const distribuicao = [
    { nota: 5, total: livro.notas_5 },
    { nota: 4, total: livro.notas_4 },
    { nota: 3, total: livro.notas_3 },
    { nota: 2, total: livro.notas_2 },
    { nota: 1, total: livro.notas_1 },
  ]
  const maiorFaixa = Math.max(1, ...distribuicao.map((d) => d.total))
  // A página de um livro já lido libera spoilers: a leitura do clube acabou
  const encontroJaPassou = livro.lido_no_encontro_em !== null && new Date(livro.lido_no_encontro_em) <= new Date()

  return (
    <div className="flex flex-col gap-6">
      <Link to="/biblioteca" className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold">
        <Icone nome="voltar" tamanho={18} /> Biblioteca
      </Link>

      {encontroJaPassou && (
        <div className="self-start">
          <Badge tom="scar">Spoiler liberado!</Badge>
        </div>
      )}

      <header className="flex gap-4">
        <BookCover titulo={livro.titulo} autora={livro.autora} capa={livro.capa_url} className="h-40 w-28 shrink-0 rounded-xl border-2 border-preto" />
        <div className="flex flex-col justify-center gap-1">
          <h1 className="text-3xl leading-none">{livro.titulo}</h1>
          <p className="text-preto-suave">{livro.autora}</p>
          {livro.lido_no_encontro_em && (
            <p className="text-sm text-preto-suave">Leitura de {formatarMesDaLeitura(livro.lido_no_encontro_em)}</p>
          )}
          {livro.genero && (
            <div className="mt-1">
              <Badge>{livro.genero}</Badge>
            </div>
          )}
        </div>
      </header>

      <section aria-label="Notas do clube" className="flex gap-5 rounded-3xl border-2 border-preto bg-white p-4">
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="font-display text-5xl leading-none">
            {livro.media_patinhas !== null ? formatarPatinhas(livro.media_patinhas) : '—'}
          </span>
          {livro.media_patinhas !== null && <Patinhas valor={livro.media_patinhas} tamanho={14} />}
          <span className="text-xs text-preto-suave">
            {livro.total_avaliacoes} {livro.total_avaliacoes === 1 ? 'avaliação' : 'avaliações'}
          </span>
        </div>
        <ul className="flex flex-1 flex-col justify-center gap-1">
          {distribuicao.map((faixa) => (
            <li key={faixa.nota} className="flex items-center gap-2 text-xs">
              <span className="w-2 font-semibold">{faixa.nota}</span>
              <span className="h-2.5 flex-1 rounded-full bg-novelo">
                <span
                  className="block h-2.5 rounded-full bg-scar"
                  style={{ width: `${(faixa.total / maiorFaixa) * 100}%` }}
                />
              </span>
              <span className="sr-only">
                {faixa.total} {faixa.total === 1 ? 'avaliação' : 'avaliações'} com {faixa.nota} patinhas
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl leading-none">Comentários</h2>
        {comentarios.length === 0 ? (
          <EstadoVazio titulo="Ninguém comentou ainda" texto="As avaliações das gatinhas aparecem aqui." />
        ) : (
          <ul className="flex flex-col gap-3">
            {comentarios.map((c) => (
              <li key={c.membra_id} className="flex flex-col gap-2 rounded-3xl border-2 border-preto bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{c.membras?.nome ?? 'Gatinha'}</span>
                  {c.patinhas !== null && <Patinhas valor={c.patinhas} tamanho={14} />}
                </div>
                {c.comentario && <TextoComSpoiler texto={c.comentario} oculto={c.tem_spoiler && !encontroJaPassou} />}
                {c.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {c.tags.map((tag) => (
                      <Badge key={tag} tom="novelo">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {c.personagem_favorita && (
                  <p className="text-sm text-preto-suave">Personagem favorita: {c.personagem_favorita}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
