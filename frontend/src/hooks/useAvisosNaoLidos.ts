import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

// Contador do sininho: avisos já enviados menos os que ela já abriu.
export function useAvisosNaoLidos() {
  const { membra } = useAuth()
  const [naoLidos, setNaoLidos] = useState(0)

  const contarAvisosNaoLidos = useCallback(async () => {
    if (!membra) return
    const agora = new Date().toISOString()
    const [enviados, lidos] = await Promise.all([
      supabase
        .from('avisos')
        .select('id', { count: 'exact', head: true })
        .not('enviado_em', 'is', null)
        .lte('enviado_em', agora),
      supabase
        .from('avisos_lidos')
        .select('aviso_id', { count: 'exact', head: true })
        .eq('membra_id', membra.id),
    ])
    setNaoLidos(Math.max(0, (enviados.count ?? 0) - (lidos.count ?? 0)))
  }, [membra])

  useEffect(() => {
    contarAvisosNaoLidos()
    // reconta quando ela volta pro app (ex.: depois de abrir um push)
    const aoVoltar = () => document.visibilityState === 'visible' && contarAvisosNaoLidos()
    document.addEventListener('visibilitychange', aoVoltar)
    window.addEventListener('avisos-lidos', contarAvisosNaoLidos)
    return () => {
      document.removeEventListener('visibilitychange', aoVoltar)
      window.removeEventListener('avisos-lidos', contarAvisosNaoLidos)
    }
  }, [contarAvisosNaoLidos])

  return naoLidos
}

// A tela de Avisos dispara isso depois de marcar como lidos
export function avisarQueAvisosForamLidos() {
  window.dispatchEvent(new Event('avisos-lidos'))
}
