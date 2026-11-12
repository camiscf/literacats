import { useState, type FormEvent } from 'react'
import { supabase, exigirDados } from '../../lib/supabase'
import { deInputDataHora, formatarDataDoEvento, formatarDataRelativa } from '../../lib/datas'
import { useConsulta } from '../../hooks/useConsulta'
import { ROTULO_CATEGORIA } from '../../lib/avisos'
import type { Aviso, CategoriaAviso, Evento } from '../../types'
import { CabecalhoDoPainel } from '../../components/Painel/CabecalhoDoPainel'
import { Badge } from '../../components/ui/Badge'
import { Botao } from '../../components/ui/Botao'
import { Card } from '../../components/ui/Card'
import { AreaDeTexto, Campo, Entrada, MensagemDeErro, Selecao } from '../../components/ui/Campos'
import { Icone } from '../../components/ui/Icone'
import { useConfirmacao } from '../../components/ui/Confirmacao'
import { Carregando, EstadoVazio, Erro } from '../../components/ui/Estados'

function FormularioDeAviso({ eventos, aoEnviar }: { eventos: Evento[]; aoEnviar: (agendado: boolean) => void }) {
  const [categoria, setCategoria] = useState<CategoriaAviso>('presenca')
  const [titulo, setTitulo] = useState('')
  const [corpo, setCorpo] = useState('')
  const [eventoId, setEventoId] = useState(eventos[0]?.id ?? '')
  const [agendar, setAgendar] = useState(false)
  const [quando, setQuando] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const enviarAviso = async (e: FormEvent) => {
    e.preventDefault()
    if (agendar && new Date(quando) <= new Date()) {
      setErro('A data do agendamento precisa ser no futuro.')
      return
    }
    setEnviando(true)
    setErro(null)
    // Agendado = enviado_em no futuro. A regra de leitura do banco
    // (enviado_em <= agora) faz o aviso aparecer sozinho na hora marcada.
    const enviadoEm = agendar ? deInputDataHora(quando) : new Date().toISOString()
    const { error } = await supabase.from('avisos').insert({
      categoria,
      titulo: titulo.trim(),
      corpo: corpo.trim() || null,
      evento_id: categoria === 'presenca' && eventoId ? eventoId : null,
      agendado_para: agendar ? enviadoEm : null,
      enviado_em: enviadoEm,
    })
    if (error) {
      setErro('Não deu pra enviar o aviso.')
      setEnviando(false)
      return
    }
    setTitulo('')
    setCorpo('')
    setAgendar(false)
    setQuando('')
    setEnviando(false)
    aoEnviar(agendar)
  }

  return (
    <Card tom="pantufa">
      <form onSubmit={enviarAviso} className="flex flex-col gap-4">
        <p className="font-semibold">Novo aviso</p>
        <Campo rotulo="Categoria">
          <Selecao value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaAviso)}>
            {Object.entries(ROTULO_CATEGORIA).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </Selecao>
        </Campo>
        {categoria === 'presenca' && (
          <Campo rotulo="Evento" dica="O aviso mostra os botões 'Vou sim!' e 'Não vou poder' para esse evento.">
            <Selecao value={eventoId} onChange={(e) => setEventoId(e.target.value)}>
              {eventos.length === 0 && <option value="">Nenhum evento marcado</option>}
              {eventos.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.titulo} · {formatarDataDoEvento(ev.inicio)}
                </option>
              ))}
            </Selecao>
          </Campo>
        )}
        <Campo rotulo="Título">
          <Entrada required value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Hey, gatinhas! Faltam 7 dias pro encontro" />
        </Campo>
        <Campo rotulo="Mensagem">
          <AreaDeTexto value={corpo} onChange={(e) => setCorpo(e.target.value)} />
        </Campo>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-semibold">Quando</legend>
          <div className="flex gap-2">
            {[
              { valor: false, rotulo: 'Enviar agora' },
              { valor: true, rotulo: 'Agendar' },
            ].map((opcao) => (
              <label
                key={opcao.rotulo}
                className={`flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-full border-2 border-preto text-sm font-semibold ${
                  agendar === opcao.valor ? 'bg-preto text-novelo' : 'bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="quando"
                  className="sr-only"
                  checked={agendar === opcao.valor}
                  onChange={() => setAgendar(opcao.valor)}
                />
                {opcao.rotulo}
              </label>
            ))}
          </div>
          {agendar && (
            <Entrada type="datetime-local" required value={quando} onChange={(e) => setQuando(e.target.value)} aria-label="Data e horário do envio" />
          )}
        </fieldset>
        <p className="text-xs text-preto-suave">O aviso aparece no sininho do app. Notificação no celular chega em breve.</p>
        <MensagemDeErro texto={erro} />
        <Botao type="submit" variante="escuro" disabled={enviando}>
          {enviando ? 'Enviando...' : agendar ? 'Agendar aviso' : 'Enviar aviso'}
        </Botao>
      </form>
    </Card>
  )
}

export function PainelAvisos() {
  const mostrarConfirmacao = useConfirmacao()

  const { dados, carregando, erro, recarregar } = useConsulta(async () => {
    const [avisos, eventos] = await Promise.all([
      // admin enxerga também os agendados (regra do banco)
      exigirDados<Aviso[]>(supabase.from('avisos').select('*').order('enviado_em', { ascending: false }).limit(30)),
      exigirDados<Evento[]>(supabase.from('eventos').select('*').gte('inicio', new Date().toISOString()).order('inicio')),
    ])
    return { avisos, eventos }
  }, [])

  const apagarAviso = async (aviso: Aviso) => {
    if (!window.confirm(`Apagar o aviso "${aviso.titulo}"? Ele some do app de todas.`)) return
    const { error } = await supabase.from('avisos').delete().eq('id', aviso.id)
    if (!error) {
      mostrarConfirmacao('Aviso apagado.')
      recarregar()
    }
  }

  const agora = new Date()

  return (
    <div className="flex flex-col gap-5">
      <CabecalhoDoPainel titulo="Avisos" />

      {carregando ? (
        <Carregando />
      ) : erro || !dados ? (
        <Erro texto="Não deu pra carregar os avisos." aoTentarDeNovo={recarregar} />
      ) : (
        <>
          <FormularioDeAviso
            eventos={dados.eventos}
            aoEnviar={(agendado) => {
              mostrarConfirmacao(agendado ? 'Aviso agendado!' : 'Aviso enviado!')
              recarregar()
            }}
          />
          <section className="flex flex-col gap-3">
            <h2 className="text-2xl leading-none">Enviados e agendados</h2>
            {dados.avisos.length === 0 ? (
              <EstadoVazio titulo="Nenhum aviso ainda" />
            ) : (
              <ul className="flex flex-col gap-2">
                {dados.avisos.map((aviso) => {
                  const agendado = aviso.enviado_em !== null && new Date(aviso.enviado_em) > agora
                  return (
                    <li key={aviso.id} className="flex items-start gap-3 rounded-3xl border-2 border-preto bg-white p-4">
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tom="preto">{ROTULO_CATEGORIA[aviso.categoria]}</Badge>
                          {agendado ? (
                            <Badge tom="pantufa">Agendado · {formatarDataDoEvento(aviso.enviado_em!)}</Badge>
                          ) : (
                            <span className="text-xs text-preto-suave">{formatarDataRelativa(aviso.enviado_em!)}</span>
                          )}
                        </div>
                        <span className="font-semibold leading-tight">{aviso.titulo}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => apagarAviso(aviso)}
                        aria-label={`Apagar aviso ${aviso.titulo}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-novelo"
                      >
                        <Icone nome="lixeira" tamanho={18} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
