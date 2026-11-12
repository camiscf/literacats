import { Link } from 'react-router-dom'
import { Icone } from '../ui/Icone'
import { useAvisosNaoLidos } from '../../hooks/useAvisosNaoLidos'

export function Cabecalho() {
  const naoLidos = useAvisosNaoLidos()
  const rotuloSino = naoLidos > 0 ? `Avisos, ${naoLidos} ${naoLidos === 1 ? 'novo' : 'novos'}` : 'Avisos'

  return (
    <header className="sticky top-0 z-30 bg-novelo/95 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2" aria-label="Literacats, ir para o início">
          <img src="/icone.svg" alt="" className="h-9 w-9 rounded-xl border-2 border-preto" />
          <span className="font-display text-2xl leading-none tracking-wide">LITERACATS</span>
        </Link>
        <Link
          to="/avisos"
          aria-label={rotuloSino}
          className="relative flex h-12 w-12 items-center justify-center rounded-full border-2 border-preto bg-white"
        >
          <Icone nome="sino" />
          {naoLidos > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-scar px-1 text-[11px] font-bold text-novelo"
            >
              {naoLidos > 9 ? '9+' : naoLidos}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
