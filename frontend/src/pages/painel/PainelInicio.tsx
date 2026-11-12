import { useEffect, useState, type FormEvent } from 'react'
import { supabase, exigirDados } from '../../lib/supabase'
import { useConsulta } from '../../hooks/useConsulta'
import type { ConfigHome, Livro } from '../../types'
import { CabecalhoDoPainel } from '../../components/Painel/CabecalhoDoPainel'
import { Botao } from '../../components/ui/Botao'
import { Card } from '../../components/ui/Card'
import { AreaDeTexto, Campo, Entrada, MensagemDeErro, Selecao } from '../../components/ui/Campos'
import { useConfirmacao } from '../../components/ui/Confirmacao'
import { Carregando, Erro } from '../../components/ui/Estados'

const VAZIO: ConfigHome = {
  livro_do_mes_id: null,
  banner_titulo: null,
  banner_texto: null,
  banner_imagem_url: null,
  banner_link: null,
  whatsapp_organizacao: null,
}

export function PainelInicio() {
  const mostrarConfirmacao = useConfirmacao()
  const [config, setConfig] = useState<ConfigHome>(VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erroAoSalvar, setErroAoSalvar] = useState<string | null>(null)

  const { dados, carregando, erro, recarregar } = useConsulta(async () => {
    const [configAtual, livros] = await Promise.all([
      exigirDados<ConfigHome>(supabase.from('config_home').select('*').eq('id', 1).single()),
      exigirDados<Pick<Livro, 'id' | 'titulo'>[]>(supabase.from('livros').select('id, titulo').order('titulo')),
    ])
    return { configAtual, livros }
  }, [])

  useEffect(() => {
    if (dados) setConfig(dados.configAtual)
  }, [dados])

  const mudar = (campo: keyof ConfigHome) => (e: { target: { value: string } }) =>
    setConfig((c) => ({ ...c, [campo]: e.target.value || null }))

  const salvarInicio = async (e: FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    setErroAoSalvar(null)
    const whatsapp = config.whatsapp_organizacao?.replace(/\D/g, '') || null
    const { error } = await supabase
      .from('config_home')
      .update({ ...config, whatsapp_organizacao: whatsapp, atualizado_em: new Date().toISOString() })
      .eq('id', 1)
    setSalvando(false)
    if (error) {
      setErroAoSalvar('Não deu pra salvar.')
      return
    }
    mostrarConfirmacao('Início atualizada!')
  }

  return (
    <div className="flex flex-col gap-5">
      <CabecalhoDoPainel titulo="Início do app" />
      {carregando ? (
        <Carregando />
      ) : erro || !dados ? (
        <Erro texto="Não deu pra carregar as configurações." aoTentarDeNovo={recarregar} />
      ) : (
        <form onSubmit={salvarInicio} className="flex flex-col gap-5">
          <Card className="flex flex-col gap-4">
            <p className="font-semibold">Livro do mês</p>
            <Campo rotulo="Livro" dica="Aparece em destaque na Início e abre o Papo.">
              <Selecao value={config.livro_do_mes_id ?? ''} onChange={mudar('livro_do_mes_id')}>
                <option value="">Nenhum</option>
                {dados.livros.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.titulo}
                  </option>
                ))}
              </Selecao>
            </Campo>
          </Card>

          <Card className="flex flex-col gap-4">
            <p className="font-semibold">Banner da Store</p>
            <Campo rotulo="Título">
              <Entrada value={config.banner_titulo ?? ''} onChange={mudar('banner_titulo')} placeholder="Kit Gatona de dezembro" />
            </Campo>
            <Campo rotulo="Texto">
              <AreaDeTexto value={config.banner_texto ?? ''} onChange={mudar('banner_texto')} placeholder="Produto, desconto ou prazo" />
            </Campo>
            <Campo rotulo="Link da imagem">
              <Entrada type="url" value={config.banner_imagem_url ?? ''} onChange={mudar('banner_imagem_url')} />
            </Campo>
            <Campo rotulo="Link do botão 'Ver na lojinha'">
              <Entrada type="url" value={config.banner_link ?? ''} onChange={mudar('banner_link')} />
            </Campo>
            <p className="text-xs text-preto-suave">Sem título, o banner não aparece na Início.</p>
          </Card>

          <Card className="flex flex-col gap-4">
            <p className="font-semibold">Contato da organização</p>
            <Campo rotulo="WhatsApp" dica="Com DDD e código do país, ex.: 55 21 99999-9999. Usado no 'Falar com a organização'.">
              <Entrada inputMode="tel" value={config.whatsapp_organizacao ?? ''} onChange={mudar('whatsapp_organizacao')} />
            </Campo>
          </Card>

          <MensagemDeErro texto={erroAoSalvar} />
          <Botao type="submit" variante="escuro" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Botao>
        </form>
      )}
    </div>
  )
}
