import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Membra } from '../services/api'

// Subset da Membra que guardamos em localStorage. Sem bio/meta — só o necessário
// pra identificar quem está usando. Backend não valida sessão (app coletivo).
export interface MembraLogada {
  id: string
  nome: string
  apelido: string
  foto?: string
}

interface AuthContextValue {
  membra: MembraLogada | null
  entrar: (membra: Membra) => void
  sair: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'literacats:membra'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [membra, setMembra] = useState<MembraLogada | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try {
      return JSON.parse(raw) as MembraLogada
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (membra) localStorage.setItem(STORAGE_KEY, JSON.stringify(membra))
    else localStorage.removeItem(STORAGE_KEY)
  }, [membra])

  const entrar = (m: Membra) => {
    setMembra({ id: m.id, nome: m.nome, apelido: m.apelido, foto: m.foto })
  }

  const sair = () => setMembra(null)

  return (
    <AuthContext.Provider value={{ membra, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return ctx
}
