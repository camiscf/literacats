import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Membra } from '../types'

interface AuthContextValue {
  sessao: Session | null
  membra: Membra | null
  carregando: boolean
  ehAdmin: boolean
  enviarCodigo: (email: string) => Promise<void>
  confirmarCodigo: (email: string, codigo: string) => Promise<void>
  sair: () => Promise<void>
  recarregarMembra: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// Traduz os erros do Supabase Auth para algo que as meninas entendem
function traduzirErroDeLogin(mensagem: string): string {
  const m = mensagem.toLowerCase()
  if (m.includes('signups not allowed') || m.includes('user not found')) {
    return 'Esse e-mail ainda não está no clube. Fala com a organização!'
  }
  if (m.includes('expired') || m.includes('invalid')) {
    return 'Código inválido ou expirado. Confere ou pede um novo.'
  }
  if (m.includes('rate limit') || m.includes('security purposes')) {
    return 'Muitas tentativas seguidas. Espera um minutinho e tenta de novo.'
  }
  return 'Não deu certo agora. Tenta de novo em instantes.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Session | null>(null)
  const [membra, setMembra] = useState<Membra | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session)
      if (!data.session) setCarregando(false)
    })
    // Sem await aqui dentro: chamar o Supabase dentro deste callback pode travar
    // o client. A busca do perfil fica no efeito abaixo.
    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const idUsuaria = sessao?.user.id

  const buscarPerfil = useCallback(async () => {
    if (!idUsuaria) {
      setMembra(null)
      return
    }
    const { data } = await supabase.from('membras').select('*').eq('id', idUsuaria).single()
    setMembra((data as Membra | null) ?? null)
  }, [idUsuaria])

  useEffect(() => {
    if (!idUsuaria) {
      setMembra(null)
      return
    }
    setCarregando(true)
    buscarPerfil().finally(() => setCarregando(false))
  }, [idUsuaria, buscarPerfil])

  const enviarCodigo = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        // só entra quem a organização cadastrou
        shouldCreateUser: false,
        // se ela tocar no link do e-mail, volta para onde o app está aberto
        emailRedirectTo: window.location.origin,
      },
    })
    if (error) throw new Error(traduzirErroDeLogin(error.message))
  }

  const confirmarCodigo = async (email: string, codigo: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: codigo.trim(),
      type: 'email',
    })
    if (error) throw new Error(traduzirErroDeLogin(error.message))
  }

  const sair = async () => {
    await supabase.auth.signOut()
    setMembra(null)
  }

  return (
    <AuthContext.Provider
      value={{
        sessao,
        membra,
        carregando,
        ehAdmin: membra?.papel === 'admin' && membra.ativa,
        enviarCodigo,
        confirmarCodigo,
        sair,
        recarregarMembra: buscarPerfil,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return ctx
}
