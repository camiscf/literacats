import { Link } from 'react-router-dom'
import { supabase, exigirDados } from '../../lib/supabase'
import { formatarCompetencia, formatarDataDoEvento, mesAtualEmTexto } from '../../lib/datas'
import { useConsulta } from '../../hooks/useConsulta'
import type { Evento, Mensalidade, Presenca } from '../../types'
import { CabecalhoDoPainel } from '../../components/Painel/CabecalhoDoPainel'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { LinhaDeAtalho } from '../../components/ui/LinhaDeAtalho'
import { Carregando, Erro } from '../../components/ui/Estados'

export function Painel() {
  const competencia = `${mesAtualEmTexto()}-01`

  const { dados, carregando, erro, recarregar } = useConsulta(async () => {
    const [proximoEncontro, ativas, mensalidades] = await Promise.all([
      exigirDados<Evento | null>(
        supabase
          .from('eventos')
          .select('*')
          .eq('tipo', 'encontro')
          .gte('inicio', new Date().toISOString())
          .order('inicio')
          .limit(1)
          .maybeSingle(),
      ),
      exigirDados<{ id: string }[]>(supabase.from('membras').select('id').eq('ativa', true)),
      exigirDados<Mensalidade[]>(supabase.from('mensalidades').select('*').eq('competencia', competencia)),
    ])
    const presencas = proximoEncontro
      ? await exigirDados<Presenca[]>(supabase.from('presencas').select('*').eq('evento_id', proximoEncontro.id))
      : []
    return { proximoEncontro, totalAtivas: ativas.length, presencas, mensalidades }
  }, [competencia])

  return (
    <div className="flex flex-col gap-5">
      <CabecalhoDoPainel titulo="Painel" voltarPara="/jornada" rotuloVoltar="Jornada" acao={<Badge tom="preto">Só organização</Badge>} />

      {carregando ? (
        <Carregando />
      ) : erro || !dados ? (
        <Erro texto="Não deu pra carregar os números." aoTentarDeNovo={recarregar} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Card tom="escuro" className="col-span-2 flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-pantufa">Próximo encontro</span>
            {dados.proximoEncontro ? (
              <>
                <span className="text-sm">{formatarDataDoEvento(dados.proximoEncontro.inicio)}</span>
                <span className="font-display text-5xl leading-none">
                  {dados.presencas.filter((p) => p.resposta === 'vou').length}
                  <span className="text-2xl text-pantufa"> / {dados.totalAtivas}</span>
                </span>
                <span className="text-sm">presenças confirmadas</span>
                <span className="text-xs text-pantufa">
                  {dados.presencas.filter((p) => p.resposta === 'nao_vou').length} não vão ·{' '}
                  {dados.totalAtivas - dados.presencas.length} sem resposta
                </span>
              </>
            ) : (
              <Link to="/painel/eventos" className="text-sm font-semibold underline">
                Nenhum encontro marcado. Criar agora
              </Link>
            )}
          </Card>

          <Card className="col-span-2 flex flex-col gap-1">
            <span className="text-xs font-bold uppercase tracking-widest text-scar">
              Mensalidades de {formatarCompetencia(competencia)}
            </span>
            {dados.mensalidades.length === 0 ? (
              <Link to="/painel/mensalidades" className="text-sm font-semibold underline">
                Ainda não geradas. Gerar agora
              </Link>
            ) : (
              <div className="flex items-end gap-6">
                <span>
                  <span className="font-display text-4xl leading-none">
                    {dados.mensalidades.filter((m) => m.status === 'pendente').length}
                  </span>{' '}
                  <span className="text-sm">pendentes</span>
                </span>
                {dados.mensalidades.some((m) => m.status === 'aguardando') && (
                  <span className="text-sm font-semibold text-scar">
                    {dados.mensalidades.filter((m) => m.status === 'aguardando').length} aguardando sua confirmação
                  </span>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      <nav aria-label="Seções do painel" className="flex flex-col gap-2">
        <LinhaDeAtalho para="/painel/avisos" icone="sino" rotulo="Avisos" />
        <LinhaDeAtalho para="/painel/eventos" icone="calendario" rotulo="Encontros e eventos" />
        <LinhaDeAtalho para="/painel/mensalidades" icone="carteira" rotulo="Mensalidades" />
        <LinhaDeAtalho para="/painel/membras" icone="membras" rotulo="Membras" />
        <LinhaDeAtalho para="/painel/livros" icone="biblioteca" rotulo="Livros" />
        <LinhaDeAtalho para="/painel/inicio" icone="inicio" rotulo="Início do app" detalhe="livro do mês, banner" />
      </nav>
    </div>
  )
}
