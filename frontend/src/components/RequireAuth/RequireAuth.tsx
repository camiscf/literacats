import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { membra } = useAuth()
  if (!membra) return <Navigate to="/login" replace />
  return <>{children}</>
}
