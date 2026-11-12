import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variante = 'primario' | 'secundario' | 'escuro' | 'urgente'

// Rosa com texto PRETO: texto claro sobre o Rosa Literacats não passa no contraste AA.
const ESTILOS: Record<Variante, string> = {
  primario: 'bg-rosa text-preto border-2 border-rosa hover:bg-pantufa hover:border-pantufa',
  secundario: 'bg-transparent text-preto border-2 border-preto hover:bg-preto/5',
  escuro: 'bg-preto text-novelo border-2 border-preto hover:bg-preto/90',
  urgente: 'bg-scar text-novelo border-2 border-scar hover:bg-scar/90',
}

const BASE =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-[15px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50'

interface BotaoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  larguraTotal?: boolean
}

export function Botao({ variante = 'primario', larguraTotal, className = '', ...props }: BotaoProps) {
  return (
    <button
      type="button"
      className={`${BASE} ${ESTILOS[variante]} ${larguraTotal ? 'w-full' : ''} ${className}`}
      {...props}
    />
  )
}

interface BotaoLinkProps extends LinkProps {
  variante?: Variante
  larguraTotal?: boolean
}

export function BotaoLink({ variante = 'primario', larguraTotal, className = '', ...props }: BotaoLinkProps) {
  return <Link className={`${BASE} ${ESTILOS[variante]} ${larguraTotal ? 'w-full' : ''} ${className}`} {...props} />
}
