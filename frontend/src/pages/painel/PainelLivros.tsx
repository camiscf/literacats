import { useState, type FormEvent } from 'react'
import { supabase, exigirDados } from '../../lib/supabase'
import { useConsulta } from '../../hooks/useConsulta'
import type { Livro } from '../../types'
import { CabecalhoDoPainel } from '../../components/Painel/CabecalhoDoPainel'
import { BookCover } from '../../components/BookCover/BookCover'
import { Botao } from '../../components/ui/Botao'
import { Card } from '../../components/ui/Card'
import { Campo, Entrada, MensagemDeErro } from '../../components/ui/Campos'
import { Icone } from '../../components/ui/Icone'
import { useConfirmacao } from '../../components/ui/Confirmacao'
import { Carregando, EstadoVazio, Erro } from '../../components/ui/Estados'

function FormularioDeLivro({ livro, aoSalvar, aoCancelar }: { livro: Livro | null; aoSalvar: () => void; aoCancelar: () => void }) {
  const [titulo, setTitulo] = useState(livro?.titulo ?? '')
  const [autora, setAutora] = useState(livro?.autora ?? '')
  const [genero, setGenero] = useState(livro?.genero ?? '')
  const [paginas, setPaginas] = useState(livro?.paginas ? String(livro.paginas) : '')
  const [partes, setPartes] = useState(String(livro?.partes ?? 3))
  const [capaUrl, setCapaUrl] = useState(livro?.capa_url ?? '')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const salvarLivro = async (e: FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    setErro(null)
    const dados = {
      titulo: titulo.trim(),
      autora: autora.trim(),
      genero: genero.trim() || null,
      paginas: paginas ? Number(paginas) : null,
      partes: Number(partes),
      capa_url: capaUrl.trim() || null,
    }
    const { error } = livro
      ? await supabase.from('livros').update(dados).eq('id', livro.id)
      : await supabase.from('livros').insert(dados)
    if (error) {
      setErro('Não deu pra salvar o livro.')
      setSalvando(false)
      return
    }
    aoSalvar()
  }

  return (
    <Card tom="pantufa">
      <form onSubmit={salvarLivro} className="flex flex-col gap-4">
        <p className="font-semibold">{livro ? 'Editar livro' : 'Novo livro'}</p>
        <Campo rotulo="Título">
          <Entrada required value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </Campo>
        <Campo rotulo="Autora / autor">
          <Entrada required value={autora} onChange={(e) => setAutora(e.target.value)} />
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo rotulo="Gênero">
            <Entrada value={genero} onChange={(e) => setGenero(e.target.value)} placeholder="Romantasy" />
          </Campo>
          <Campo rotulo="Páginas">
            <Entrada type="number" min={1} inputMode="numeric" value={paginas} onChange={(e) => setPaginas(e.target.value)} />
          </Campo>
        </div>
        <Campo rotulo="Partes no Papo" dica="Em quantas partes dividir o livro para esconder spoilers no chat.">
          <Entrada type="number" min={1} max={10} required value={partes} onChange={(e) => setPartes(e.target.value)} />
        </Campo>
        <Campo rotulo="Link da imagem da capa" dica="Opcional: deixe vazio e o app procura sozinho. Use só se a capa vier errada: segure (ou clique com o botão direito) na imagem da capa em qualquer site → Copiar endereço da imagem.">
          <Entrada type="url" value={capaUrl} onChange={(e) => setCapaUrl(e.target.value)} placeholder="https://...jpg" />
        </Campo>
        {capaUrl.trim() && (
          <div className="flex items-center gap-3 text-sm">
            <BookCover titulo={titulo || 'Capa'} autora={autora} capa={capaUrl.trim()} className="h-20 w-14 shrink-0 rounded-md" />
            <span className="text-preto-suave">Prévia. Se aparecer só o título, o link não é de uma imagem.</span>
          </div>
        )}
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

export function PainelLivros() {
  const mostrarConfirmacao = useConfirmacao()
  const [emEdicao, setEmEdicao] = useState<Livro | 'novo' | null>(null)

  const { dados: livros, carregando, erro, recarregar } = useConsulta(
    () => exigirDados<Livro[]>(supabase.from('livros').select('*').order('criado_em', { ascending: false })),
    [],
  )

  return (
    <div className="flex flex-col gap-5">
      <CabecalhoDoPainel
        titulo="Livros"
        acao={
          !emEdicao && (
            <Botao onClick={() => setEmEdicao('novo')}>
              <Icone nome="mais" tamanho={18} /> Novo
            </Botao>
          )
        }
      />

      {emEdicao && (
        <FormularioDeLivro
          key={emEdicao === 'novo' ? 'novo' : emEdicao.id}
          livro={emEdicao === 'novo' ? null : emEdicao}
          aoCancelar={() => setEmEdicao(null)}
          aoSalvar={() => {
            setEmEdicao(null)
            mostrarConfirmacao('Livro salvo!')
            recarregar()
          }}
        />
      )}

      {carregando ? (
        <Carregando />
      ) : erro || !livros ? (
        <Erro texto="Não deu pra carregar os livros." aoTentarDeNovo={recarregar} />
      ) : livros.length === 0 ? (
        <EstadoVazio titulo="Nenhum livro cadastrado" />
      ) : (
        <ul className="flex flex-col gap-2">
          {livros.map((livro) => (
            <li key={livro.id} className="flex items-center gap-3 rounded-3xl border-2 border-preto bg-white p-3">
              <BookCover titulo={livro.titulo} autora={livro.autora} capa={livro.capa_url} className="h-16 w-11 shrink-0 rounded-md" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold">{livro.titulo}</span>
                <span className="truncate text-sm text-preto-suave">{livro.autora}</span>
              </div>
              <button
                type="button"
                onClick={() => setEmEdicao(livro)}
                aria-label={`Editar ${livro.titulo}`}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-novelo"
              >
                <Icone nome="editar" tamanho={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
