import { useCallback, useEffect, useState, type DependencyList } from 'react'

// Carrega dados com os estados que toda tela precisa (carregando/erro) e
// devolve recarregar() para depois de salvar algo.
export function useConsulta<T>(buscar: () => Promise<T>, dependencias: DependencyList) {
  const [dados, setDados] = useState<T | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recarregar = useCallback(buscar, dependencias)

  const executar = useCallback(async () => {
    setCarregando(true)
    setErro(null)
    try {
      setDados(await recarregar())
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setCarregando(false)
    }
  }, [recarregar])

  useEffect(() => {
    executar()
  }, [executar])

  return { dados, carregando, erro, recarregar: executar }
}
