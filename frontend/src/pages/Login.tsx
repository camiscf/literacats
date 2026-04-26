import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarMembras, login, criarPin, type Membra } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export function Login() {
  const navegar = useNavigate()
  const { entrar } = useAuth()

  const [membras, setMembras] = useState<Membra[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [membraSelecionada, setMembraSelecionada] = useState<Membra | null>(null)

  useEffect(() => {
    listarMembras()
      .then(setMembras)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [])

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin text-4xl">🐱</div>
      </div>
    )
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream p-4">
        <div className="text-center">
          <p className="text-2xl mb-4">😿</p>
          <p className="text-red-500">{erro}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-black mb-2">
            Literacats 🐱
          </h1>
          <p className="text-black/60">Escolha o seu nome pra entrar</p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {membras.map((m) => (
            <button
              key={m.id}
              onClick={() => setMembraSelecionada(m)}
              className="bg-white rounded-2xl p-4 shadow-lg shadow-pink-primary/10 hover:shadow-pink-primary/30 hover:-translate-y-1 transition-all text-center"
            >
              <div className="w-20 h-20 mx-auto bg-pink-light rounded-full flex items-center justify-center mb-3 text-3xl border-2 border-pink-primary">
                {m.foto ? (
                  <img src={m.foto} alt={m.nome} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>🐱</span>
                )}
              </div>
              <p className="font-medium text-black">{m.nome}</p>
              <p className="text-xs text-black/50">@{m.apelido}</p>
            </button>
          ))}
        </div>
      </div>

      {membraSelecionada && (
        <ModalPin
          membra={membraSelecionada}
          onCancelar={() => setMembraSelecionada(null)}
          onSucesso={(membraAutenticada) => {
            entrar(membraAutenticada)
            navegar('/')
          }}
        />
      )}
    </div>
  )
}

interface ModalPinProps {
  membra: Membra
  onCancelar: () => void
  onSucesso: (m: Membra) => void
}

function ModalPin({ membra, onCancelar, onSucesso }: ModalPinProps) {
  const modoCriar = !membra.temPin
  const [pin, setPin] = useState('')
  const [confirmaPin, setConfirmaPin] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const handleEnviar = async () => {
    setErro(null)

    if (pin.length < 4) {
      setErro('PIN precisa ter pelo menos 4 dígitos')
      return
    }
    if (modoCriar && pin !== confirmaPin) {
      setErro('PINs não conferem')
      return
    }

    setEnviando(true)
    try {
      const membraAutenticada = modoCriar
        ? await criarPin(membra.id, pin)
        : await login(membra.id, pin)
      onSucesso(membraAutenticada)
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro')
      setPin('')
      setConfirmaPin('')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-pink-light rounded-full flex items-center justify-center mb-3 text-2xl border-2 border-pink-primary">
            🐱
          </div>
          <h2 className="font-display text-xl font-bold text-black">
            Oi, {membra.nome}!
          </h2>
          <p className="text-black/60 text-sm mt-1">
            {modoCriar
              ? 'Primeiro acesso — crie um PIN de pelo menos 4 dígitos'
              : 'Digite seu PIN pra entrar'}
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="password"
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => !modoCriar && e.key === 'Enter' && handleEnviar()}
            placeholder="PIN"
            maxLength={6}
            className="w-full px-4 py-3 border-2 border-pink-light rounded-xl focus:border-pink-primary focus:outline-none text-center text-2xl tracking-widest"
          />

          {modoCriar && (
            <input
              type="password"
              inputMode="numeric"
              value={confirmaPin}
              onChange={(e) => setConfirmaPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleEnviar()}
              placeholder="Confirme o PIN"
              maxLength={6}
              className="w-full px-4 py-3 border-2 border-pink-light rounded-xl focus:border-pink-primary focus:outline-none text-center text-2xl tracking-widest"
            />
          )}

          {erro && (
            <p className="text-red-500 text-sm text-center">{erro}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={onCancelar}
              className="flex-1 px-4 py-3 rounded-xl font-medium text-black/60 hover:bg-pink-light/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleEnviar}
              disabled={enviando}
              className="flex-1 bg-pink-primary hover:bg-pink-hot text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {enviando ? '...' : modoCriar ? 'Criar PIN' : 'Entrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
