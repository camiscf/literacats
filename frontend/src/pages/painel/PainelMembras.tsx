import { useState, type FormEvent } from 'react'
import { supabase, exigirDados } from '../../lib/supabase'
import { hojeEmTextoIso } from '../../lib/datas'
import { calcularNivelDaJornada } from '../../lib/jornada'
import { useConsulta } from '../../hooks/useConsulta'
import { useAuth } from '../../contexts/AuthContext'
import type { Membra } from '../../types'
import { CabecalhoDoPainel } from '../../components/Painel/CabecalhoDoPainel'
import { Badge } from '../../components/ui/Badge'
import { Botao } from '../../components/ui/Botao'
import { Card } from '../../components/ui/Card'
import { Campo, Entrada, MensagemDeErro } from '../../components/ui/Campos'
import { Icone } from '../../components/ui/Icone'
import { useConfirmacao } from '../../components/ui/Confirmacao'
import { Carregando, EstadoVazio, Erro } from '../../components/ui/Estados'

function FormularioDeCadastro({ aoCadastrar, aoCancelar }: { aoCadastrar: () => void; aoCancelar: () => void }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [membraDesde, setMembraDesde] = useState(hojeEmTextoIso())
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const cadastrarMembra = async (e: FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    setErro(null)
    const { error } = await supabase.functions.invoke('cadastrar-membra', { body: { nome, email, membraDesde } })
    if (error) {
      // a função devolve { erro } com a mensagem pronta para mostrar
      const corpo = await (error as { context?: Response }).context?.json?.().catch(() => null)
      setErro(corpo?.erro ?? 'Não deu pra cadastrar agora. Tenta de novo.')
      setSalvando(false)
      return
    }
    aoCadastrar()
  }

  return (
    <Card tom="pantufa">
      <form onSubmit={cadastrarMembra} className="flex flex-col gap-4">
        <p className="font-semibold">Nova membra</p>
        <Campo rotulo="Nome">
          <Entrada required value={nome} onChange={(e) => setNome(e.target.value)} />
        </Campo>
        <Campo rotulo="E-mail" dica="É com ele que ela vai entrar no app.">
          <Entrada type="email" required inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Campo>
        <Campo rotulo="No clube desde" dica="Define o nível dela na Jornada.">
          <Entrada type="date" required max={hojeEmTextoIso()} value={membraDesde} onChange={(e) => setMembraDesde(e.target.value)} />
        </Campo>
        <MensagemDeErro texto={erro} />
        <div className="flex gap-2">
          <Botao type="submit" variante="escuro" disabled={salvando} className="flex-1">
            {salvando ? 'Cadastrando...' : 'Cadastrar'}
          </Botao>
          <Botao variante="secundario" onClick={aoCancelar}>
            Cancelar
          </Botao>
        </div>
      </form>
    </Card>
  )
}

export function PainelMembras() {
  const { membra: eu } = useAuth()
  const mostrarConfirmacao = useConfirmacao()
  const [cadastrando, setCadastrando] = useState(false)
  const [erroAcao, setErroAcao] = useState<string | null>(null)

  const { dados: membras, carregando, erro, recarregar } = useConsulta(
    () => exigirDados<Membra[]>(supabase.from('membras').select('*').order('ativa', { ascending: false }).order('nome')),
    [],
  )

  const atualizarMembra = async (id: string, mudancas: Partial<Pick<Membra, 'ativa' | 'papel'>>, mensagem: string) => {
    setErroAcao(null)
    const { error } = await supabase.from('membras').update(mudancas).eq('id', id)
    if (error) {
      setErroAcao('Não deu pra salvar a mudança.')
      return
    }
    mostrarConfirmacao(mensagem)
    recarregar()
  }

  const ativas = membras?.filter((m) => m.ativa).length ?? 0

  return (
    <div className="flex flex-col gap-5">
      <CabecalhoDoPainel
        titulo="Membras"
        acao={
          !cadastrando && (
            <Botao variante="primario" onClick={() => setCadastrando(true)}>
              <Icone nome="mais" tamanho={18} /> Nova
            </Botao>
          )
        }
      />

      {cadastrando && (
        <FormularioDeCadastro
          aoCancelar={() => setCadastrando(false)}
          aoCadastrar={() => {
            setCadastrando(false)
            mostrarConfirmacao('Cadastrada! Avise que ela já pode entrar com o e-mail.')
            recarregar()
          }}
        />
      )}

      <MensagemDeErro texto={erroAcao} />

      {carregando ? (
        <Carregando />
      ) : erro || !membras ? (
        <Erro texto="Não deu pra carregar as membras." aoTentarDeNovo={recarregar} />
      ) : membras.length === 0 ? (
        <EstadoVazio titulo="Nenhuma membra ainda" />
      ) : (
        <>
          <p className="text-sm text-preto-suave">{ativas} ativas</p>
          <ul className="flex flex-col gap-2">
            {membras.map((m) => {
              const souEu = m.id === eu?.id
              return (
                <li
                  key={m.id}
                  className={`flex flex-col gap-3 rounded-3xl border-2 border-preto bg-white p-4 ${m.ativa ? '' : 'opacity-60'}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{m.nome}</span>
                    {souEu && <span className="text-xs text-preto-suave">(você)</span>}
                    {m.papel === 'admin' && <Badge tom="preto">Organização</Badge>}
                    {!m.ativa && <Badge tom="scar">Inativa</Badge>}
                  </div>
                  <div className="flex flex-col text-sm text-preto-suave">
                    <span className="break-all">{m.email}</span>
                    <span>Literacat {calcularNivelDaJornada(m.membra_desde).nivel.nome}</span>
                  </div>
                  {!souEu && (
                    <div className="flex flex-wrap gap-2">
                      <Botao
                        variante="secundario"
                        className="min-h-10 px-4 text-sm"
                        onClick={() =>
                          atualizarMembra(m.id, { ativa: !m.ativa }, m.ativa ? `${m.nome} foi desativada.` : `${m.nome} voltou!`)
                        }
                      >
                        {m.ativa ? 'Desativar' : 'Reativar'}
                      </Botao>
                      {m.ativa && (
                        <Botao
                          variante="secundario"
                          className="min-h-10 px-4 text-sm"
                          onClick={() =>
                            atualizarMembra(
                              m.id,
                              { papel: m.papel === 'admin' ? 'membra' : 'admin' },
                              m.papel === 'admin' ? `${m.nome} saiu da organização.` : `${m.nome} agora é da organização.`,
                            )
                          }
                        >
                          {m.papel === 'admin' ? 'Remover da organização' : 'Tornar organização'}
                        </Botao>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
