import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, exigirDados } from '../lib/supabase'
import { calcularNivelDaJornada, descreverTempoDeClube } from '../lib/jornada'
import { formatarDataDoEvento } from '../lib/datas'
import { linkDoMapa } from '../lib/presenca'
import { useConsulta } from '../hooks/useConsulta'
import type { Aviso, ConfigHome, Evento, Leitura, Livro, Presenca, RespostaPresenca } from '../types'
import { BookCover } from '../components/BookCover/BookCover'
import { BotoesDePresenca } from '../components/Presenca/BotoesDePresenca'
import { Badge } from '../components/ui/Badge'
import { BotaoLink, Botao } from '../components/ui/Botao'
import { Carrossel } from '../components/ui/Carrossel'
import { ContagemRegressiva } from '../components/ui/ContagemRegressiva'
import { Icone } from '../components/ui/Icone'
import { useConfirmacao } from '../components/ui/Confirmacao'
import { Carregando, EstadoVazio, Erro } from '../components/ui/Estados'

// Um evento continua no carrossel até 4 h depois do início (enquanto acontece)
const TOLERANCIA_EVENTO_EM_ANDAMENTO_MS = 4 * 3_600_000

function textoDaPresenca(resposta: RespostaPresenca | undefined) {
  if (resposta === 'vou') return 'Presença: confirmada'
  if (resposta === 'nao_vou') return 'Presença: você não vai'
  return 'Presença: aguardando sua resposta'
}

function CardDoEncontro({ evento, resposta }: { evento: Evento; resposta: RespostaPresenca | undefined }) {
  const mapa = linkDoMapa(evento.local, evento.mapa_url)
  return (
    <article className="flex h-full flex-col gap-4 rounded-3xl bg-preto p-5 text-novelo">
      <div className="self-start">
        <Badge tom="pantufa">Encontro do mês</Badge>
      </div>
      <ContagemRegressiva ate={evento.inicio} />
      <div className="flex flex-col gap-2 text-sm">
        <span className="flex items-center gap-2">
          <Icone nome="calendario" tamanho={16} className="text-pantufa" />
          {formatarDataDoEvento(evento.inicio)}
        </span>
        {evento.local && (
          <span className="flex items-center gap-2">
            <Icone nome="local" tamanho={16} className="text-pantufa" />
            <span>
              {evento.local}
              {mapa && (
                <>
                  {' · '}
                  <a href={mapa} target="_blank" rel="noopener noreferrer" className="font-semibold text-pantufa underline">
                    mapa
                  </a>
                </>
              )}
            </span>
          </span>
        )}
      </div>
      <span className={`mt-auto text-sm font-semibold ${resposta ? 'text-novelo' : 'text-pantufa'}`}>
        {textoDaPresenca(resposta)}
      </span>
    </article>
  )
}

function CardDoEventoEspecial({ evento, resposta }: { evento: Evento; resposta: RespostaPresenca | undefined }) {
  return (
    <Link to={`/evento/${evento.id}`} className="flex h-full flex-col gap-3 rounded-3xl bg-scar p-5 text-novelo">
      <div className="self-start">
        <Badge tom="novelo">Evento especial</Badge>
      </div>
      <span className="font-display text-4xl uppercase leading-none">{evento.titulo}</span>
      {evento.arte_url && <img src={evento.arte_url} alt="" className="h-24 w-full rounded-2xl object-cover" />}
      <span className="text-sm">
        {formatarDataDoEvento(evento.inicio)}
        {evento.local && ` · ${evento.local}`}
      </span>
      <span className="text-sm font-semibold">{textoDaPresenca(resposta)}</span>
      <span className="mt-auto inline-flex min-h-10 items-center self-start rounded-full bg-preto px-4 text-sm font-bold">
        Ver detalhes
      </span>
    </Link>
  )
}

interface CardDoLivroDoMesProps {
  livro: Livro
  leitura: Leitura | null
  aoAtualizar: () => void
}

function CardDoLivroDoMes({ livro, leitura, aoAtualizar }: CardDoLivroDoMesProps) {
  const { membra } = useAuth()
  const mostrarConfirmacao = useConfirmacao()
  const [editando, setEditando] = useState(false)
  const [progresso, setProgresso] = useState(leitura?.progresso_pct ?? 0)
  const [salvando, setSalvando] = useState(false)

  const atualizarProgresso = async () => {
    if (!membra) return
    setSalvando(true)
    const { error } = await supabase.from('leituras').upsert(
      {
        membra_id: membra.id,
        livro_id: livro.id,
        progresso_pct: progresso,
        terminou: progresso === 100,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: 'membra_id,livro_id' },
    )
    setSalvando(false)
    if (error) return
    setEditando(false)
    mostrarConfirmacao(progresso === 100 ? 'Terminou! Que tal avaliar?' : 'Progresso salvo!')
    aoAtualizar()
  }

  const progressoAtual = leitura?.progresso_pct ?? 0

  return (
    <section aria-label="Livro do mês" className="flex flex-col gap-4 rounded-3xl border-2 border-preto bg-white p-5">
      <span className="text-xs font-bold uppercase tracking-widest text-scar">Livro do mês</span>
      <Link to={`/livro/${livro.id}`} className="flex gap-4">
        <BookCover titulo={livro.titulo} autora={livro.autora} capa={livro.capa_url} className="h-28 w-[76px] shrink-0 rounded-lg" />
        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold leading-tight">{livro.titulo}</span>
          <span className="text-sm text-preto-suave">{livro.autora}</span>
          <span className="text-sm text-preto-suave">Escolhido por sorteio entre as indicações</span>
        </div>
      </Link>

      {editando ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-novelo p-4">
          <label className="flex flex-col gap-2">
            <span className="flex justify-between text-sm font-semibold">
              Até onde você leu? <span>{progresso}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={progresso}
              onChange={(e) => setProgresso(Number(e.target.value))}
              className="h-11 w-full accent-scar"
            />
          </label>
          <div className="flex gap-2">
            <Botao variante="escuro" className="flex-1" disabled={salvando} onClick={atualizarProgresso}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </Botao>
            <Botao variante="secundario" onClick={() => setProgresso(100)}>
              Terminei!
            </Botao>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-sm">
            <span>Seu progresso</span>
            <span className="font-bold">{progressoAtual}%</span>
          </div>
          <div
            className="h-2.5 rounded-full bg-novelo"
            role="progressbar"
            aria-valuenow={progressoAtual}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Seu progresso no livro do mês"
          >
            <div className="h-2.5 rounded-full bg-scar" style={{ width: `${progressoAtual}%` }} />
          </div>
          <span className="text-xs text-preto-suave">No seu ritmo: dá pra ir ao encontro mesmo sem terminar.</span>
        </div>
      )}

      <div className="flex gap-2">
        <BotaoLink to="/papo" variante="escuro" className="flex-1">
          Ir pro papo
        </BotaoLink>
        {!editando && (
          <Botao variante="secundario" className="flex-1" onClick={() => setEditando(true)}>
            Atualizar progresso
          </Botao>
        )}
      </div>
    </section>
  )
}

export function Inicio() {
  const { membra } = useAuth()

  const { dados, carregando, erro, recarregar } = useConsulta(async () => {
    if (!membra) return null
    const desde = new Date(Date.now() - TOLERANCIA_EVENTO_EM_ANDAMENTO_MS).toISOString()
    const agora = new Date().toISOString()
    const [eventos, config, avisos, lidos] = await Promise.all([
      exigirDados<Evento[]>(supabase.from('eventos').select('*').gte('inicio', desde).order('inicio').limit(10)),
      exigirDados<ConfigHome>(supabase.from('config_home').select('*').eq('id', 1).single()),
      exigirDados<Aviso[]>(
        supabase.from('avisos').select('*').not('enviado_em', 'is', null).lte('enviado_em', agora).order('enviado_em', { ascending: false }).limit(2),
      ),
      exigirDados<{ aviso_id: string }[]>(supabase.from('avisos_lidos').select('aviso_id').eq('membra_id', membra.id)),
    ])
    const [presencas, livroDoMes, leitura] = await Promise.all([
      eventos.length
        ? exigirDados<Presenca[]>(
            supabase.from('presencas').select('*').eq('membra_id', membra.id).in('evento_id', eventos.map((e) => e.id)),
          )
        : Promise.resolve([] as Presenca[]),
      config.livro_do_mes_id
        ? exigirDados<Livro | null>(supabase.from('livros').select('*').eq('id', config.livro_do_mes_id).maybeSingle())
        : Promise.resolve(null),
      config.livro_do_mes_id
        ? exigirDados<Leitura | null>(
            supabase.from('leituras').select('*').eq('membra_id', membra.id).eq('livro_id', config.livro_do_mes_id).maybeSingle(),
          )
        : Promise.resolve(null),
    ])
    return { eventos, config, avisos, lidos: new Set(lidos.map((l) => l.aviso_id)), presencas, livroDoMes, leitura }
  }, [membra?.id])

  if (!membra) return null
  const { nivel, mesesDeClube } = calcularNivelDaJornada(membra.membra_desde)
  const primeiroNome = (membra.apelido || membra.nome).split(' ')[0]

  // Encontro do mês primeiro, depois os especiais por data (ordem do protótipo)
  const proximoEncontro = dados?.eventos.find((e) => e.tipo === 'encontro')
  const especiais = dados?.eventos.filter((e) => e.tipo === 'especial') ?? []
  const respostaDe = (eventoId: string) => dados?.presencas.find((p) => p.evento_id === eventoId)?.resposta
  const precisaConfirmar = proximoEncontro && !respostaDe(proximoEncontro.id)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-0.5 pt-2">
        <span className="text-sm text-preto-suave">
          Literacat {nivel.nome} · {descreverTempoDeClube(mesesDeClube)}
        </span>
        <h1 className="font-script text-4xl normal-case tracking-normal text-scar">Hey, {primeiroNome}!</h1>
      </header>

      {carregando ? (
        <Carregando texto="Abrindo as novidades..." />
      ) : erro || !dados ? (
        <Erro texto="Não deu pra carregar a Início." aoTentarDeNovo={recarregar} />
      ) : (
        <>
          {precisaConfirmar && (
            <section aria-label="Confirmação de presença pendente" className="flex flex-col gap-3 rounded-3xl bg-scar p-4 text-novelo">
              <div className="flex items-start gap-2.5">
                <Icone nome="sino" className="mt-0.5 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-bold">Você ainda não confirmou presença</span>
                  <span className="text-sm">
                    {proximoEncontro.titulo} · {formatarDataDoEvento(proximoEncontro.inicio)}
                  </span>
                </div>
              </div>
              <BotoesDePresenca eventoId={proximoEncontro.id} sobre="fundo-escuro" aoResponder={recarregar} />
            </section>
          )}

          {dados.eventos.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl leading-none">Eventos</h2>
                {dados.eventos.length > 1 && <span className="text-xs text-preto-suave">arraste pro lado</span>}
              </div>
              <Carrossel rotulo="Próximos eventos">
                {[
                  ...(proximoEncontro ? [<CardDoEncontro key={proximoEncontro.id} evento={proximoEncontro} resposta={respostaDe(proximoEncontro.id)} />] : []),
                  ...especiais.map((e) => <CardDoEventoEspecial key={e.id} evento={e} resposta={respostaDe(e.id)} />),
                ]}
              </Carrossel>
              {proximoEncontro && respostaDe(proximoEncontro.id) && (
                <MudarRespostaDoEncontro eventoId={proximoEncontro.id} aoResponder={recarregar} />
              )}
            </section>
          )}

          {dados.avisos.length > 0 && (
            <section className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <h2 className="text-2xl leading-none">Novidades</h2>
                <Link to="/avisos" className="min-h-11 content-center text-sm font-semibold underline">
                  ver todas
                </Link>
              </div>
              <ul className="flex flex-col gap-2">
                {dados.avisos.map((aviso) => (
                  <li key={aviso.id}>
                    <Link to="/avisos" className="flex items-start gap-3 rounded-2xl bg-white p-4">
                      <span
                        aria-hidden="true"
                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dados.lidos.has(aviso.id) ? 'bg-pantufa' : 'bg-scar'}`}
                      />
                      <span className="flex flex-col gap-0.5">
                        <span className="font-semibold leading-tight">
                          {!dados.lidos.has(aviso.id) && <span className="sr-only">Novo: </span>}
                          {aviso.titulo}
                        </span>
                        {aviso.corpo && <span className="line-clamp-2 text-sm text-preto-suave">{aviso.corpo}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {dados.config.banner_titulo && (
            <a
              href={dados.config.banner_link ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-3xl border-2 border-preto bg-pantufa p-4"
            >
              {dados.config.banner_imagem_url ? (
                <img src={dados.config.banner_imagem_url} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
              ) : (
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white">
                  <Icone nome="loja" tamanho={32} />
                </span>
              )}
              <span className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-widest">Literacats Store</span>
                <span className="text-lg font-bold leading-tight">{dados.config.banner_titulo}</span>
                {dados.config.banner_texto && <span className="text-sm">{dados.config.banner_texto}</span>}
                {dados.config.banner_link && <span className="text-sm font-bold underline">Ver na lojinha</span>}
              </span>
            </a>
          )}

          {dados.livroDoMes && (
            <CardDoLivroDoMes
              key={dados.livroDoMes.id + (dados.leitura?.progresso_pct ?? 0)}
              livro={dados.livroDoMes}
              leitura={dados.leitura}
              aoAtualizar={recarregar}
            />
          )}

          {dados.eventos.length === 0 && !dados.livroDoMes && dados.avisos.length === 0 && (
            <EstadoVazio titulo="Tudo calmo por aqui" texto="Quando a organização marcar o próximo encontro, ele aparece aqui." />
          )}
        </>
      )}
    </div>
  )
}

// Depois de responder, o alerta some; quem mudar de ideia troca por aqui
function MudarRespostaDoEncontro({ eventoId, aoResponder }: { eventoId: string; aoResponder: () => void }) {
  const [aberto, setAberto] = useState(false)
  if (!aberto) {
    return (
      <button type="button" onClick={() => setAberto(true)} className="min-h-11 self-start text-sm font-semibold underline">
        Mudar minha resposta do encontro
      </button>
    )
  }
  return (
    <BotoesDePresenca
      eventoId={eventoId}
      aoResponder={() => {
        setAberto(false)
        aoResponder()
      }}
    />
  )
}
