import { useState, type FormEvent } from 'react'
import { supabase, exigirDados } from '../../lib/supabase'
import { deInputDataHora, formatarDataDoEvento, formatarMoeda, paraInputDataHora } from '../../lib/datas'
import { useConsulta } from '../../hooks/useConsulta'
import type { Evento, Livro, RespostaPresenca, TipoEvento } from '../../types'
import { CabecalhoDoPainel } from '../../components/Painel/CabecalhoDoPainel'
import { Badge } from '../../components/ui/Badge'
import { Botao } from '../../components/ui/Botao'
import { Card } from '../../components/ui/Card'
import { AreaDeTexto, Campo, Entrada, MensagemDeErro, Selecao } from '../../components/ui/Campos'
import { Icone } from '../../components/ui/Icone'
import { useConfirmacao } from '../../components/ui/Confirmacao'
import { Carregando, EstadoVazio, Erro } from '../../components/ui/Estados'

type PresencaComNome = { evento_id: string; resposta: RespostaPresenca; membras: { nome: string } | null }

// "16,90" ou "16.90" → 16.9; vazio → null
function lerValor(texto: string): number | null {
  const limpo = texto.trim().replace(',', '.')
  return limpo === '' ? null : Number(limpo)
}

interface FormularioDeEventoProps {
  evento: Evento | null
  livros: Pick<Livro, 'id' | 'titulo'>[]
  aoSalvar: () => void
  aoCancelar: () => void
}

function FormularioDeEvento({ evento, livros, aoSalvar, aoCancelar }: FormularioDeEventoProps) {
  const [tipo, setTipo] = useState<TipoEvento>(evento?.tipo ?? 'encontro')
  const [titulo, setTitulo] = useState(evento?.titulo ?? '')
  const [inicio, setInicio] = useState(evento ? paraInputDataHora(evento.inicio) : '')
  const [local, setLocal] = useState(evento?.local ?? '')
  const [mapaUrl, setMapaUrl] = useState(evento?.mapa_url ?? '')
  const [valor, setValor] = useState(evento?.valor != null ? String(evento.valor).replace('.', ',') : '')
  const [livroId, setLivroId] = useState(evento?.livro_id ?? '')
  const [descricao, setDescricao] = useState(evento?.descricao ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const salvarEvento = async (e: FormEvent) => {
    e.preventDefault()
    const valorNumerico = lerValor(valor)
    if (valorNumerico !== null && (Number.isNaN(valorNumerico) || valorNumerico < 0)) {
      setErro('Valor inválido. Use só números, ex.: 35,00')
      return
    }
    setSalvando(true)
    setErro(null)
    const dados = {
      tipo,
      titulo: titulo.trim(),
      inicio: deInputDataHora(inicio),
      local: local.trim() || null,
      mapa_url: mapaUrl.trim() || null,
      valor: valorNumerico,
      livro_id: livroId || null,
      descricao: descricao.trim() || null,
    }
    const { error } = evento
      ? await supabase.from('eventos').update(dados).eq('id', evento.id)
      : await supabase.from('eventos').insert(dados)
    if (error) {
      setErro('Não deu pra salvar o evento.')
      setSalvando(false)
      return
    }
    aoSalvar()
  }

  return (
    <Card tom="pantufa">
      <form onSubmit={salvarEvento} className="flex flex-col gap-4">
        <p className="font-semibold">{evento ? 'Editar evento' : 'Novo evento'}</p>
        <Campo rotulo="Tipo">
          <Selecao value={tipo} onChange={(e) => setTipo(e.target.value as TipoEvento)}>
            <option value="encontro">Encontro do mês</option>
            <option value="especial">Evento especial (Girls Night, Litera Day...)</option>
          </Selecao>
        </Campo>
        <Campo rotulo="Título">
          <Entrada
            required
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder={tipo === 'encontro' ? 'Encontro de dezembro' : 'Girls Night'}
          />
        </Campo>
        <Campo rotulo="Data e horário">
          <Entrada type="datetime-local" required value={inicio} onChange={(e) => setInicio(e.target.value)} />
        </Campo>
        <Campo rotulo="Local">
          <Entrada value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Nome do lugar, bairro" />
        </Campo>
        <Campo rotulo="Link do mapa" dica="Cole o link de compartilhar do Google Maps.">
          <Entrada type="url" value={mapaUrl} onChange={(e) => setMapaUrl(e.target.value)} />
        </Campo>
        {tipo === 'encontro' ? (
          <Campo rotulo="Livro do encontro">
            <Selecao value={livroId} onChange={(e) => setLivroId(e.target.value)}>
              <option value="">Ainda não definido</option>
              {livros.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.titulo}
                </option>
              ))}
            </Selecao>
          </Campo>
        ) : (
          <Campo rotulo="Valor (R$)" dica="Deixe vazio se for gratuito.">
            <Entrada inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="35,00" />
          </Campo>
        )}
        <Campo rotulo="Descrição">
          <AreaDeTexto
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="O que vai rolar, dinâmicas, dress code..."
          />
        </Campo>
        <MensagemDeErro texto={erro} />
        <div className="flex gap-2">
          <Botao type="submit" variante="escuro" disabled={salvando} className="flex-1">
            {salvando ? 'Salvando...' : 'Salvar'}
          </Botao>
          <Botao variante="secundario" onClick={aoCancelar}>
            Cancelar
          </Botao>
        </div>
      </form>
    </Card>
  )
}

function CardDoEvento({
  evento,
  presencas,
  aoEditar,
  aoApagar,
}: {
  evento: Evento
  presencas: PresencaComNome[]
  aoEditar: () => void
  aoApagar: () => void
}) {
  const [mostrarPresencas, setMostrarPresencas] = useState(false)
  const vao = presencas.filter((p) => p.resposta === 'vou')
  const naoVao = presencas.filter((p) => p.resposta === 'nao_vou')

  return (
    <li className="flex flex-col gap-3 rounded-3xl border-2 border-preto bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <Badge tom={evento.tipo === 'encontro' ? 'pantufa' : 'scar'}>
            {evento.tipo === 'encontro' ? 'Encontro' : 'Especial'}
          </Badge>
          <span className="text-lg font-semibold leading-tight">{evento.titulo}</span>
          <span className="text-sm text-preto-suave">
            {formatarDataDoEvento(evento.inicio)}
            {evento.local && ` · ${evento.local}`}
            {evento.valor != null && ` · ${formatarMoeda(evento.valor)}`}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setMostrarPresencas((v) => !v)}
        aria-expanded={mostrarPresencas}
        className="min-h-10 self-start text-sm font-semibold underline"
      >
        {vao.length} vão · {naoVao.length} não vão
      </button>
      {mostrarPresencas && (
        <div className="flex flex-col gap-2 rounded-2xl bg-novelo p-3 text-sm">
          <p>
            <strong>Vão:</strong> {vao.map((p) => p.membras?.nome).join(', ') || 'ninguém ainda'}
          </p>
          <p>
            <strong>Não vão:</strong> {naoVao.map((p) => p.membras?.nome).join(', ') || 'ninguém'}
          </p>
        </div>
      )}
      <div className="flex gap-2">
        <Botao variante="secundario" className="min-h-10 px-4 text-sm" onClick={aoEditar}>
          <Icone nome="editar" tamanho={16} /> Editar
        </Botao>
        <Botao variante="secundario" className="min-h-10 px-4 text-sm" onClick={aoApagar}>
          <Icone nome="lixeira" tamanho={16} /> Apagar
        </Botao>
      </div>
    </li>
  )
}

export function PainelEventos() {
  const mostrarConfirmacao = useConfirmacao()
  // null = formulário fechado; 'novo' = criando; Evento = editando
  const [emEdicao, setEmEdicao] = useState<Evento | 'novo' | null>(null)
  const [verAnteriores, setVerAnteriores] = useState(false)

  const { dados, carregando, erro, recarregar } = useConsulta(async () => {
    const [eventos, livros] = await Promise.all([
      exigirDados<Evento[]>(supabase.from('eventos').select('*').order('inicio', { ascending: false }).limit(60)),
      exigirDados<Pick<Livro, 'id' | 'titulo'>[]>(supabase.from('livros').select('id, titulo').order('titulo')),
    ])
    const presencas = eventos.length
      ? await exigirDados<PresencaComNome[]>(
          supabase.from('presencas').select('evento_id, resposta, membras(nome)').in('evento_id', eventos.map((e) => e.id)),
        )
      : []
    return { eventos, livros, presencas }
  }, [])

  const apagarEvento = async (evento: Evento) => {
    if (!window.confirm(`Apagar "${evento.titulo}"? As presenças desse evento também somem.`)) return
    const { error } = await supabase.from('eventos').delete().eq('id', evento.id)
    if (!error) {
      mostrarConfirmacao('Evento apagado.')
      recarregar()
    }
  }

  const agora = new Date()
  const proximos = (dados?.eventos ?? []).filter((e) => new Date(e.inicio) >= agora).reverse()
  const anteriores = (dados?.eventos ?? []).filter((e) => new Date(e.inicio) < agora)

  const renderizarLista = (eventos: Evento[]) => (
    <ul className="flex flex-col gap-3">
      {eventos.map((evento) => (
        <CardDoEvento
          key={evento.id}
          evento={evento}
          presencas={dados!.presencas.filter((p) => p.evento_id === evento.id)}
          aoEditar={() => setEmEdicao(evento)}
          aoApagar={() => apagarEvento(evento)}
        />
      ))}
    </ul>
  )

  return (
    <div className="flex flex-col gap-5">
      <CabecalhoDoPainel
        titulo="Eventos"
        acao={
          !emEdicao && (
            <Botao onClick={() => setEmEdicao('novo')}>
              <Icone nome="mais" tamanho={18} /> Novo
            </Botao>
          )
        }
      />

      {emEdicao && dados && (
        <FormularioDeEvento
          key={emEdicao === 'novo' ? 'novo' : emEdicao.id}
          evento={emEdicao === 'novo' ? null : emEdicao}
          livros={dados.livros}
          aoCancelar={() => setEmEdicao(null)}
          aoSalvar={() => {
            setEmEdicao(null)
            mostrarConfirmacao('Evento salvo!')
            recarregar()
          }}
        />
      )}

      {carregando ? (
        <Carregando />
      ) : erro || !dados ? (
        <Erro texto="Não deu pra carregar os eventos." aoTentarDeNovo={recarregar} />
      ) : (
        <>
          <section className="flex flex-col gap-3">
            <h2 className="text-2xl leading-none">Próximos</h2>
            {proximos.length === 0 ? (
              <EstadoVazio titulo="Nada marcado" texto="Crie o próximo encontro para as meninas confirmarem presença." />
            ) : (
              renderizarLista(proximos)
            )}
          </section>
          {anteriores.length > 0 && (
            <section className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setVerAnteriores((v) => !v)}
                aria-expanded={verAnteriores}
                className="flex min-h-11 items-center justify-between"
              >
                <h2 className="text-2xl leading-none">Anteriores ({anteriores.length})</h2>
                <span className="text-sm font-semibold underline">{verAnteriores ? 'Esconder' : 'Ver'}</span>
              </button>
              {verAnteriores && renderizarLista(anteriores)}
            </section>
          )}
        </>
      )}
    </div>
  )
}
