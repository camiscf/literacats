import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { Lili } from './Lili'

// Confirmação curta no rodapé (3 s) para ações como "Presença confirmada!"
const ConfirmacaoContext = createContext<(texto: string) => void>(() => {})

export function ConfirmacaoProvider({ children }: { children: ReactNode }) {
  const [texto, setTexto] = useState<string | null>(null)
  const temporizador = useRef<number>()

  const mostrarConfirmacao = useCallback((novoTexto: string) => {
    window.clearTimeout(temporizador.current)
    setTexto(novoTexto)
    temporizador.current = window.setTimeout(() => setTexto(null), 3000)
  }, [])

  return (
    <ConfirmacaoContext.Provider value={mostrarConfirmacao}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(88px+env(safe-area-inset-bottom))] z-50 flex justify-center px-4"
      >
        {texto && (
          <div className="flex items-center gap-2 rounded-full border-2 border-preto bg-pantufa py-1.5 pl-2 pr-4 text-sm font-semibold shadow-lg">
            <Lili reacao="feliz" tamanho={32} decorativa />
            {texto}
          </div>
        )}
      </div>
    </ConfirmacaoContext.Provider>
  )
}

export function useConfirmacao() {
  return useContext(ConfirmacaoContext)
}
