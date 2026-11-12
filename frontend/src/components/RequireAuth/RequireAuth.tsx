import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Carregando, Erro } from '../ui/Estados'
import { Botao } from '../ui/Botao'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { sessao, membra, carregando, sair } = useAuth()
  const local = useLocation()

  if (carregando) return <Carregando texto="Abrindo o clube..." />
  if (!sessao) return <Navigate to="/login" replace state={{ de: local.pathname }} />

  // Tem login mas o perfil foi removido ou desativado pela organização
  if (!membra || !membra.ativa) {
    return (
      <div className="mx-auto max-w-lg px-4">
        <Erro texto="Seu acesso ao clube não está ativo. Fala com a organização!" />
        <div className="flex justify-center">
          <Botao variante="secundario" onClick={sair}>
            Sair
          </Botao>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { ehAdmin } = useAuth()
  if (!ehAdmin) return <Navigate to="/" replace />
  return <>{children}</>
}
