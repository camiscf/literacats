import { useState, type FormEvent } from 'react'
import { supabase, exigirDados } from '../../lib/supabase'
import { formatarCompetencia, formatarDataSimples, formatarMoeda, mesAtualEmTexto } from '../../lib/datas'
import { useConsulta } from '../../hooks/useConsulta'
import type { Membra, Mensalidade, StatusMensalidade } from '../../types'
import { CabecalhoDoPainel } from '../../components/Painel/CabecalhoDoPainel'
import { Badge } from '../../components/ui/Badge'
import { Botao } from '../../components/ui/Botao'
import { Card } from '../../components/ui/Card'
import { Campo, Entrada, MensagemDeErro } from '../../components/ui/Campos'
import { useConfirmacao } from '../../components/ui/Confirmacao'
import { Carregando, EstadoVazio, Erro } from '../../components/ui/Estados'

const VALOR_PADRAO = '16,90'

// Ordem da lista: o que pede ação da organização primeiro
const ORDEM: Record<StatusMensalidade | 'sem', number> = { aguardando: 0, pendente: 1, sem: 2, paga: 3 }

function SeloDoStatus({ status }: { status: StatusMensalidade | 'sem' }) {
  if (status === 'paga') return <Badge tom="pantufa">Paga</Badge>
  if (status === 'aguardando') return <Badge tom="preto">Diz que pagou</Badge>
  if (status === 'pendente') return <Badge tom="scar">Pendente</Badge>
  return <Badge tom="novelo">Sem cobrança</Badge>
}

interface FormularioDeGeracaoProps {
  competencia: string
  faltando: Pick<Membra, 'id'>[]
  aoGerar: (quantidade: number) => void
}

function FormularioDeGeracao({ competencia, faltando, aoGerar }: FormularioDeGeracaoProps) {
  const [valor, setValor] = useState(VALOR_PADRAO)
  const [vencimento, setVencimento] = useState(competencia.slice(0, 8) + '10')
  const [link, setLink] = useState('')
  const [gerando, setGerando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const gerarMensalidades = async (e: FormEvent) => {
    e.preventDefault()
    const valorNumerico = Number(valor.replace(',', '.'))
    if (Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      setErro('Valor inválido. Ex.: 16,90')
      return
    }
    setGerando(true)
    setErro(null)
    const linhas = faltando.map((m) => ({
      membra_id: m.id,
      competencia,
      valor: valorNumerico,
      vencimento,
      link_pagamento: link.trim() || null,
    }))
    // ignoreDuplicates: rodar de novo nunca duplica a cobrança de quem já tem
    const { error } = await supabase
      .from('mensalidades')
      .upsert(linhas, { onConflict: 'membra_id,competencia', ignoreDuplicates: true })
    setGerando(false)
    if (error) {
      setErro('Não deu pra gerar as mensalidades.')
      return
    }
    aoGerar(linhas.length)
  }

  return (
    <Card tom="pantufa">
      <form onSubmit={gerarMensalidades} className="flex flex-col gap-4">
        <p className="font-semibold">
          Gerar mensalidade de {formatarCompetencia(competencia)} para {faltando.length}{' '}
          {faltando.length === 1 ? 'membra' : 'membras'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Campo rotulo="Valor (R$)">
            <Entrada required inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} />
          </Campo>
          <Campo rotulo="Vencimento">
            <Entrada type="date" required value={vencimento} onChange={(e) => setVencimento(e.target.value)} />
          </Campo>
        </div>
        <Campo rotulo="Link de pagamento (InfinitePay)" dica="Opcional. Aparece no botão 'Pagar' da membra.">
          <Entrada type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
        </Campo>
        <MensagemDeErro texto={erro} />
        <Botao type="submit" variante="escuro" disabled={gerando}>
          {gerando ? 'Gerando...' : 'Gerar mensalidades'}
        </Botao>
      </form>
    </Card>
  )
}

export function PainelMensalidades() {
  const mostrarConfirmacao = useConfirmacao()
  const [mes, setMes] = useState(mesAtualEmTexto())
  const competencia = `${mes}-01`

  const { dados, carregando, erro, recarregar } = useConsulta(async () => {
    const [membras, mensalidades] = await Promise.all([
      exigirDados<Pick<Membra, 'id' | 'nome'>[]>(supabase.from('membras').select('id, nome').eq('ativa', true).order('nome')),
      exigirDados<Mensalidade[]>(supabase.from('mensalidades').select('*').eq('competencia', competencia)),
    ])
    return { membras, mensalidades }
  }, [competencia])

  const mudarStatus = async (mensalidade: Mensalidade, status: StatusMensalidade, nome: string) => {
    const { error } = await supabase
      .from('mensalidades')
      .update({ status, paga_em: status === 'paga' ? new Date().toISOString() : null })
      .eq('id', mensalidade.id)
    if (!error) {
      mostrarConfirmacao(status === 'paga' ? `Baixa feita: ${nome}` : `Voltou para pendente: ${nome}`)
      recarregar()
    }
  }

  const linhas = (dados?.membras ?? [])
    .map((m) => {
      const mensalidade = dados!.mensalidades.find((x) => x.membra_id === m.id) ?? null
      return { membra: m, mensalidade, status: (mensalidade?.status ?? 'sem') as StatusMensalidade | 'sem' }
    })
    .sort((a, b) => ORDEM[a.status] - ORDEM[b.status])

  const faltando = linhas.filter((l) => l.status === 'sem').map((l) => l.membra)
  const contar = (s: StatusMensalidade) => linhas.filter((l) => l.status === s).length

  return (
    <div className="flex flex-col gap-5">
      <CabecalhoDoPainel titulo="Mensalidades" />

      <Campo rotulo="Mês">
        <Entrada type="month" value={mes} onChange={(e) => e.target.value && setMes(e.target.value)} />
      </Campo>

      {carregando ? (
        <Carregando />
      ) : erro || !dados ? (
        <Erro texto="Não deu pra carregar as mensalidades." aoTentarDeNovo={recarregar} />
      ) : linhas.length === 0 ? (
        <EstadoVazio titulo="Nenhuma membra ativa" />
      ) : (
        <>
          {faltando.length > 0 && (
            <FormularioDeGeracao
              key={competencia}
              competencia={competencia}
              faltando={faltando}
              aoGerar={(n) => {
                mostrarConfirmacao(`${n} ${n === 1 ? 'mensalidade gerada' : 'mensalidades geradas'}!`)
                recarregar()
              }}
            />
          )}

          {dados.mensalidades.length > 0 && (
            <p className="text-sm">
              <strong>{contar('paga')}</strong> pagas · <strong>{contar('pendente')}</strong> pendentes ·{' '}
              <strong className={contar('aguardando') ? 'text-scar' : ''}>{contar('aguardando')}</strong> dizem que pagaram
            </p>
          )}

          <ul className="flex flex-col gap-2">
            {linhas.map(({ membra, mensalidade, status }) => (
              <li key={membra.id} className="flex flex-col gap-2 rounded-3xl border-2 border-preto bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{membra.nome}</span>
                  <SeloDoStatus status={status} />
                </div>
                {mensalidade && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-preto-suave">
                      {formatarMoeda(mensalidade.valor)} · vence {formatarDataSimples(mensalidade.vencimento)}
                    </span>
                    {mensalidade.status === 'paga' ? (
                      <Botao variante="secundario" className="min-h-10 px-4 text-sm" onClick={() => mudarStatus(mensalidade, 'pendente', membra.nome)}>
                        Desfazer
                      </Botao>
                    ) : (
                      <Botao variante="escuro" className="min-h-10 px-4 text-sm" onClick={() => mudarStatus(mensalidade, 'paga', membra.nome)}>
                        Dar baixa
                      </Botao>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
