import { useEffect, useState, type FormEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Botao } from '../components/ui/Botao'
import { Lili } from '../components/ui/Lili'

const ESPERA_PARA_REENVIAR = 60

export function Login() {
  const { sessao, enviarCodigo, confirmarCodigo } = useAuth()
  const local = useLocation()
  const [etapa, setEtapa] = useState<'email' | 'codigo'>('email')
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [segundosParaReenviar, setSegundosParaReenviar] = useState(0)

  useEffect(() => {
    if (segundosParaReenviar <= 0) return
    const t = window.setTimeout(() => setSegundosParaReenviar((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [segundosParaReenviar])

  if (sessao) {
    const destino = (local.state as { de?: string } | null)?.de ?? '/'
    return <Navigate to={destino} replace />
  }

  const pedirCodigo = async (e?: FormEvent) => {
    e?.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await enviarCodigo(email)
      setEtapa('codigo')
      setCodigo('')
      setSegundosParaReenviar(ESPERA_PARA_REENVIAR)
    } catch (err) {
      setErro((err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  const entrarComCodigo = async (e: FormEvent) => {
    e.preventDefault()
    setErro(null)
    setEnviando(true)
    try {
      await confirmarCodigo(email, codigo)
      // o AuthContext recebe a sessão e o <Navigate> acima redireciona
    } catch (err) {
      setErro((err as Error).message)
      setEnviando(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-8 px-6 py-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <Lili reacao={etapa === 'codigo' ? 'feliz' : 'neutra'} tamanho={120} decorativa />
        <p className="font-display text-5xl leading-none tracking-wide">LITERACATS</p>
        <p className="font-script text-2xl text-scar">Hey, gatinha!</p>
      </div>

      {etapa === 'email' ? (
        <form onSubmit={pedirCodigo} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Seu e-mail</span>
            <input
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="min-h-12 rounded-2xl border-2 border-preto bg-white px-4 text-base outline-none focus:border-scar"
            />
          </label>
          <p className="text-sm text-preto-suave">A gente manda um código de 6 números pra você entrar. Sem senha!</p>
          {erro && (
            <p role="alert" className="rounded-2xl bg-scar px-4 py-3 text-sm font-semibold text-novelo">
              {erro}
            </p>
          )}
          <Botao type="submit" larguraTotal disabled={enviando || !email}>
            {enviando ? 'Enviando...' : 'Receber código'}
          </Botao>
        </form>
      ) : (
        <form onSubmit={entrarComCodigo} className="flex flex-col gap-4">
          <p className="text-center text-sm">
            Mandamos um e-mail para <strong className="break-all">{email}</strong>. Digite o código ou toque no link do e-mail. Confere também o spam.
          </p>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Código</span>
            <input
              type="text"
              required
              autoFocus
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
              className="min-h-14 rounded-2xl border-2 border-preto bg-white px-4 text-center text-3xl font-bold tracking-[0.5em] outline-none focus:border-scar"
            />
          </label>
          {erro && (
            <p role="alert" className="rounded-2xl bg-scar px-4 py-3 text-sm font-semibold text-novelo">
              {erro}
            </p>
          )}
          <Botao type="submit" larguraTotal disabled={enviando || codigo.length !== 6}>
            {enviando ? 'Entrando...' : 'Entrar'}
          </Botao>
          <div className="flex justify-between text-sm">
            <button
              type="button"
              className="min-h-11 font-semibold underline"
              onClick={() => {
                setEtapa('email')
                setErro(null)
              }}
            >
              Trocar e-mail
            </button>
            <button
              type="button"
              className="min-h-11 font-semibold underline disabled:no-underline disabled:opacity-50"
              disabled={segundosParaReenviar > 0 || enviando}
              onClick={() => pedirCodigo()}
            >
              {segundosParaReenviar > 0 ? `Reenviar em ${segundosParaReenviar}s` : 'Reenviar código'}
            </button>
          </div>
        </form>
      )}
    </main>
  )
}
