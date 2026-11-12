import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatarDataRelativa } from '../lib/datas'
import { useAuth } from '../contexts/AuthContext'
import { avisarQueAvisosForamLidos } from '../hooks/useAvisosNaoLidos'
import type { Aviso, Presenca } from '../types'
import { ROTULO_CATEGORIA } from '../lib/avisos'
import { Badge } from '../components/ui/Badge'
import { BotoesDePresenca } from '../components/Presenca/BotoesDePresenca'
import { Carregando, EstadoVazio, Erro } from '../components/ui/Estados'

export function Avisos() {
  const { membra } = useAuth()
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const [jaLidos, setJaLidos] = useState<Set<string>>(new Set())
  const [minhasPresencas, setMinhasPresencas] = useState<Presenca[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  const buscarAvisos = useCallback(async () => {
    if (!membra) return
    setCarregando(true)
    setErro(false)
    const [resAvisos, resLidos] = await Promise.all([
      supabase
        .from('avisos')
        .select('*')
        .not('enviado_em', 'is', null)
        .lte('enviado_em', new Date().toISOString())
        .order('enviado_em', { ascending: false }),
      supabase.from('avisos_lidos').select('aviso_id').eq('membra_id', membra.id),
    ])
    if (resAvisos.error || resLidos.error) {
      setErro(true)
      setCarregando(false)
      return
    }
    const lista = (resAvisos.data ?? []) as Aviso[]
    // avisos de presença mostram os botões ou a resposta já dada
    const eventosDosAvisos = [...new Set(lista.map((a) => a.evento_id).filter(Boolean))] as string[]
    if (eventosDosAvisos.length) {
      const { data } = await supabase.from('presencas').select('*').eq('membra_id', membra.id).in('evento_id', eventosDosAvisos)
      setMinhasPresencas((data ?? []) as Presenca[])
    }
    const lidos = new Set((resLidos.data ?? []).map((l) => l.aviso_id as string))
    setAvisos(lista)
    setJaLidos(lidos)
    setCarregando(false)

    // Abrir a central marca tudo como lido; o destaque "novo" continua até sair da tela
    const novos = lista.filter((a) => !lidos.has(a.id)).map((a) => ({ aviso_id: a.id, membra_id: membra.id }))
    if (novos.length > 0) {
      await supabase.from('avisos_lidos').upsert(novos, { ignoreDuplicates: true })
      avisarQueAvisosForamLidos()
    }
  }, [membra])

  useEffect(() => {
    buscarAvisos()
  }, [buscarAvisos])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="pt-2 text-4xl leading-none">Avisos</h1>
      {carregando ? (
        <Carregando />
      ) : erro ? (
        <Erro texto="Não deu pra carregar os avisos." aoTentarDeNovo={buscarAvisos} />
      ) : avisos.length === 0 ? (
        <EstadoVazio titulo="Tudo em dia, gatinha" texto="Nenhum aviso da organização por enquanto." />
      ) : (
        <ul className="flex flex-col gap-3">
          {avisos.map((aviso) => {
            const novo = !jaLidos.has(aviso.id)
            return (
              <li key={aviso.id} className="flex flex-col gap-2 rounded-3xl border-2 border-preto bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <Badge tom="preto">{ROTULO_CATEGORIA[aviso.categoria]}</Badge>
                  <span className="flex items-center gap-2 text-xs text-preto-suave">
                    {novo && (
                      <span className="flex items-center gap-1 font-bold text-scar">
                        <span aria-hidden="true" className="h-2 w-2 rounded-full bg-scar" /> novo
                      </span>
                    )}
                    {formatarDataRelativa(aviso.enviado_em!)}
                  </span>
                </div>
                <p className="text-lg font-semibold leading-tight">{aviso.titulo}</p>
                {aviso.corpo && <p className="text-[15px] leading-relaxed text-preto-suave">{aviso.corpo}</p>}
                {aviso.categoria === 'presenca' && aviso.evento_id && (
                  <RespostaNoAviso
                    eventoId={aviso.evento_id}
                    resposta={minhasPresencas.find((p) => p.evento_id === aviso.evento_id)?.resposta}
                    aoResponder={(resposta) =>
                      setMinhasPresencas((atual) => [
                        ...atual.filter((p) => p.evento_id !== aviso.evento_id),
                        { evento_id: aviso.evento_id!, membra_id: membra!.id, resposta, respondido_em: new Date().toISOString() },
                      ])
                    }
                  />
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function RespostaNoAviso({
  eventoId,
  resposta,
  aoResponder,
}: {
  eventoId: string
  resposta: Presenca['resposta'] | undefined
  aoResponder: (resposta: Presenca['resposta']) => void
}) {
  const [mudando, setMudando] = useState(false)
  if (resposta && !mudando) {
    return (
      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
        {resposta === 'vou' ? 'Você confirmou presença.' : 'Você disse que não vai.'}
        <button type="button" onClick={() => setMudando(true)} className="min-h-11 underline">
          Mudar
        </button>
      </p>
    )
  }
  return (
    <BotoesDePresenca
      eventoId={eventoId}
      aoResponder={(r) => {
        setMudando(false)
        aoResponder(r)
      }}
    />
  )
}
