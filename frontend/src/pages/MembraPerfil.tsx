import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { BookCover } from '../components/BookCover/BookCover'
import {
  buscarMembra,
  buscarLivrosDaMembra,
  listarLivros,
  atualizarMembra,
  type Membra,
  type MembraLivro,
  type Livro,
} from '../services/api'
import { useAuth } from '../contexts/AuthContext'

// Lê em UTC pra não exibir o mês anterior por causa do timezone do Brasil
function formatarMesAno(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  return `${meses[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

function Estrelas({ quantidade }: { quantidade: number }) {
  return (
    <span className="text-yellow-500 text-sm">
      {'★'.repeat(quantidade)}{'☆'.repeat(5 - quantidade)}
    </span>
  )
}

const corPorStatus: Record<MembraLivro['status'], string> = {
  Lido: 'bg-pink-primary text-white',
  Lendo: 'bg-pink-light text-pink-hot',
  QueroLer: 'bg-cream text-black/60',
}

const labelStatus: Record<MembraLivro['status'], string> = {
  Lido: 'Lido',
  Lendo: 'Lendo',
  QueroLer: 'Quero ler',
}

export function MembraPerfil() {
  const { id } = useParams<{ id: string }>()
  const { membra: membraLogada } = useAuth()
  const [membra, setMembra] = useState<Membra | null>(null)
  const [livrosDaMembra, setLivrosDaMembra] = useState<MembraLivro[]>([])
  const [todosLivros, setTodosLivros] = useState<Livro[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)
  const [bioEdit, setBioEdit] = useState('')
  const [metaEdit, setMetaEdit] = useState(12)
  const [salvando, setSalvando] = useState(false)

  const ehProprioPerfil = membraLogada?.id === id

  const abrirEdicao = () => {
    if (!membra) return
    setBioEdit(membra.bio ?? '')
    setMetaEdit(membra.metaLeituraAnual)
    setEditando(true)
  }

  const salvarEdicao = async () => {
    if (!id) return
    setSalvando(true)
    try {
      const atualizada = await atualizarMembra(id, {
        bio: bioEdit.trim(),
        metaLeituraAnual: metaEdit,
      })
      setMembra(atualizada)
      setEditando(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSalvando(false)
    }
  }

  useEffect(() => {
    if (!id) return

    Promise.all([
      buscarMembra(id),
      buscarLivrosDaMembra(id),
      listarLivros(),
    ])
      .then(([m, lm, ls]) => {
        setMembra(m)
        setLivrosDaMembra(lm)
        setTodosLivros(ls)
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [id])

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin text-4xl">🐱</div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="text-center py-16">
        <p className="text-2xl mb-4">😿</p>
        <p className="text-red-500">{erro}</p>
        <Link to="/membras" className="text-pink-hot hover:underline mt-4 inline-block">
          Voltar para lista de membras
        </Link>
      </div>
    )
  }

  if (!membra) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🐱</p>
        <p className="text-black/60">Membra não encontrada</p>
        <Link to="/membras" className="text-pink-hot hover:underline mt-4 inline-block">
          Voltar para lista de membras
        </Link>
      </div>
    )
  }

  // Lookup rápido de livro por id
  const livrosPorId = new Map(todosLivros.map((l) => [l.id, l]))

  const livrosLidos = livrosDaMembra.filter((l) => l.status === 'Lido')
  const totalPaginas = livrosLidos.reduce((acc, ml) => {
    const livro = livrosPorId.get(ml.livroId)
    return acc + (livro?.paginas ?? 0)
  }, 0)
  const resenhas = livrosDaMembra.filter((l) => l.resenha)
  const avaliacoes = livrosDaMembra.filter((l) => l.estrelas != null)
  const mediaEstrelas = avaliacoes.length > 0
    ? avaliacoes.reduce((acc, ml) => acc + (ml.estrelas ?? 0), 0) / avaliacoes.length
    : 0

  // Ordena por data de leitura DESC; livros sem data ficam no fim
  const leiturasOrdenadas = [...livrosDaMembra].sort((a, b) => {
    const dataA = a.dataLeitura ? new Date(a.dataLeitura).getTime() : 0
    const dataB = b.dataLeitura ? new Date(b.dataLeitura).getTime() : 0
    return dataB - dataA
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/membras" className="inline-flex items-center text-pink-hot hover:text-pink-primary transition-colors">
        <span className="mr-2">←</span> Voltar para membras
      </Link>

      {/* Header do perfil */}
      <div className="bg-white rounded-2xl p-8 shadow-lg shadow-pink-primary/10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-pink-primary to-pink-hot rounded-full flex items-center justify-center shadow-lg overflow-hidden">
            {membra.foto ? (
              <img src={membra.foto} alt={membra.nome} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl md:text-6xl">🐱</span>
            )}
          </div>

          <div className="flex-1 text-center md:text-left w-full">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-black">{membra.nome}</h1>
                <p className="text-pink-hot font-medium">@{membra.apelido}</p>
              </div>
              {ehProprioPerfil && !editando && (
                <button
                  onClick={abrirEdicao}
                  className="text-sm text-pink-hot hover:text-pink-primary font-medium px-3 py-1 rounded-lg hover:bg-pink-light/50 transition-colors flex-shrink-0"
                >
                  Editar
                </button>
              )}
            </div>

            {editando ? (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1">Bio</label>
                  <textarea
                    value={bioEdit}
                    onChange={(e) => setBioEdit(e.target.value)}
                    rows={3}
                    placeholder="Conta um pouquinho sobre você..."
                    className="w-full px-3 py-2 border-2 border-pink-light rounded-xl focus:border-pink-primary focus:outline-none resize-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-black/70 mb-1">Meta de leitura anual</label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={metaEdit}
                    onChange={(e) => setMetaEdit(Number(e.target.value) || 1)}
                    className="w-32 px-3 py-2 border-2 border-pink-light rounded-xl focus:border-pink-primary focus:outline-none text-sm"
                  />
                  <span className="ml-2 text-sm text-black/60">livros / ano</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={salvarEdicao}
                    disabled={salvando}
                    className="bg-pink-primary hover:bg-pink-hot text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {salvando ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    onClick={() => setEditando(false)}
                    className="text-black/60 hover:bg-pink-light/50 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {membra.bio ? (
                  <p className="text-black/70 mt-3">{membra.bio}</p>
                ) : (
                  ehProprioPerfil && (
                    <p className="text-black/40 italic text-sm mt-3">
                      Sem bio ainda. Clica em "Editar" pra contar sobre você 🐱
                    </p>
                  )
                )}
                {membra.membraDesde && (
                  <p className="text-black/50 text-sm mt-2">🐱 Membra desde {formatarMesAno(membra.membraDesde)}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard valor={livrosLidos.length} label="Livros lidos" icone="📚" />
        <StatCard
          valor={totalPaginas > 0 ? totalPaginas.toLocaleString('pt-BR') : '—'}
          label="Páginas"
          icone="📖"
        />
        <StatCard valor={resenhas.length} label="Resenhas" icone="✍️" />
        <StatCard
          valor={mediaEstrelas > 0 ? mediaEstrelas.toFixed(1) : '—'}
          label="Média"
          icone="⭐"
        />
      </div>

      {/* Meta de leitura */}
      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
        <h2 className="font-display text-xl font-semibold mb-4">Meta de Leitura Anual</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-pink-light rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-pink-primary to-pink-hot transition-all"
              style={{ width: `${Math.min(100, (livrosLidos.length / membra.metaLeituraAnual) * 100)}%` }}
            />
          </div>
          <span className="text-lg font-semibold text-black">
            {livrosLidos.length}/{membra.metaLeituraAnual}
          </span>
        </div>
      </div>

      {/* Leituras */}
      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10">
        <h2 className="font-display text-xl font-semibold mb-4">Leituras</h2>
        {leiturasOrdenadas.length === 0 ? (
          <p className="text-black/50 text-sm py-6 text-center">Nenhum livro registrado ainda.</p>
        ) : (
          <div className="space-y-3">
            {leiturasOrdenadas.map((ml) => {
              const livro = livrosPorId.get(ml.livroId)
              if (!livro) return null
              return (
                <Link
                  key={ml.livroId}
                  to={`/livro/${livro.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-pink-light/30 transition-colors"
                >
                  <BookCover
                    titulo={livro.titulo}
                    autor={livro.autor}
                    capa={livro.capa}
                    className="w-12 h-16 rounded shadow flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-black text-sm truncate">{livro.titulo}</p>
                    <p className="text-xs text-black/50 truncate">{livro.autor}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${corPorStatus[ml.status]}`}>
                      {labelStatus[ml.status]}
                    </span>
                    {ml.estrelas != null && <Estrelas quantidade={ml.estrelas} />}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ valor, label, icone }: { valor: string | number; label: string; icone: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg shadow-pink-primary/10 text-center">
      <span className="text-2xl">{icone}</span>
      <p className="text-2xl font-display font-bold text-black mt-1">{valor}</p>
      <p className="text-xs text-black/60">{label}</p>
    </div>
  )
}
