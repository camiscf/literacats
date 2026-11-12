import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase, exigirDados } from '../lib/supabase'
import { formatarDataDoEvento, formatarMoeda } from '../lib/datas'
import { linkDoMapa } from '../lib/presenca'
import { useConsulta } from '../hooks/useConsulta'
import type { Evento as TipoDoEvento, Presenca } from '../types'
import { BotoesDePresenca } from '../components/Presenca/BotoesDePresenca'
import { Badge } from '../components/ui/Badge'
import { Icone } from '../components/ui/Icone'
import { Carregando, EstadoVazio, Erro } from '../components/ui/Estados'

export function Evento() {
  const { id } = useParams<{ id: string }>()
  const { membra } = useAuth()

  const { dados, carregando, erro, recarregar } = useConsulta(async () => {
    const [evento, presencas] = await Promise.all([
      exigirDados<TipoDoEvento | null>(supabase.from('eventos').select('*').eq('id', id!).maybeSingle()),
      exigirDados<Presenca[]>(supabase.from('presencas').select('*').eq('evento_id', id!)),
    ])
    return { evento, presencas }
  }, [id])

  if (carregando) return <Carregando />
  if (erro || !dados) return <Erro texto="Não deu pra abrir esse evento." aoTentarDeNovo={recarregar} />
  if (!dados.evento) {
    return <EstadoVazio titulo="Evento não encontrado" acao={<Link to="/" className="font-semibold underline">Voltar pra Início</Link>} />
  }

  const { evento, presencas } = dados
  const minhaResposta = presencas.find((p) => p.membra_id === membra?.id)?.resposta
  const confirmadas = presencas.filter((p) => p.resposta === 'vou').length
  const mapa = linkDoMapa(evento.local, evento.mapa_url)
  const jaPassou = new Date(evento.inicio).getTime() < Date.now() - 4 * 3_600_000

  return (
    <div className="flex flex-col gap-5">
      <Link to="/" className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold">
        <Icone nome="voltar" tamanho={18} /> Início
      </Link>

      <header className="flex flex-col gap-2">
        <div className="self-start">
          <Badge tom={evento.tipo === 'especial' ? 'scar' : 'pantufa'}>
            {evento.tipo === 'especial' ? 'Evento especial' : 'Encontro do mês'}
          </Badge>
        </div>
        <h1 className="text-5xl leading-none">{evento.titulo}</h1>
      </header>

      {evento.arte_url && <img src={evento.arte_url} alt={`Arte do evento ${evento.titulo}`} className="w-full rounded-3xl border-2 border-preto" />}

      <ul className="flex flex-col gap-3 rounded-3xl border-2 border-preto bg-white p-4 text-[15px]">
        <li className="flex items-center gap-3">
          <Icone nome="calendario" />
          {formatarDataDoEvento(evento.inicio)}
        </li>
        {evento.local && (
          <li className="flex items-center gap-3">
            <Icone nome="local" />
            <span>
              {evento.local}
              {mapa && (
                <>
                  {' · '}
                  <a href={mapa} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                    ver no mapa
                  </a>
                </>
              )}
            </span>
          </li>
        )}
        <li className="flex items-center gap-3">
          <Icone nome="carteira" />
          {evento.valor ? formatarMoeda(evento.valor) : 'Gratuito'}
        </li>
      </ul>

      {evento.descricao && <p className="whitespace-pre-line text-[15px] leading-relaxed">{evento.descricao}</p>}

      <section aria-label="Presença" className="flex flex-col gap-3 rounded-3xl bg-pantufa p-4">
        <p className="font-semibold">
          {confirmadas} {confirmadas === 1 ? 'gatinha já confirmou' : 'gatinhas já confirmaram'}
        </p>
        {jaPassou ? (
          <p className="text-sm">Esse evento já aconteceu.</p>
        ) : (
          <>
            <p className="text-sm">
              {minhaResposta === 'vou'
                ? 'Você vai! Pode mudar de ideia até o dia.'
                : minhaResposta === 'nao_vou'
                  ? 'Você disse que não vai. Mudou de ideia?'
                  : 'Você ainda não confirmou presença.'}
            </p>
            <BotoesDePresenca eventoId={evento.id} aoResponder={recarregar} />
          </>
        )}
      </section>
    </div>
  )
}
