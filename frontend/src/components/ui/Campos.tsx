import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

const ESTILO =
  'w-full rounded-2xl border-2 border-preto bg-white px-4 text-base outline-none focus:border-scar disabled:opacity-60'

export function Campo({ rotulo, dica, children }: { rotulo: string; dica?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold">{rotulo}</span>
      {children}
      {dica && <span className="text-xs text-preto-suave">{dica}</span>}
    </label>
  )
}

export function Entrada({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${ESTILO} min-h-12 ${className}`} {...props} />
}

export function AreaDeTexto({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${ESTILO} min-h-28 py-3 ${className}`} {...props} />
}

export function Selecao({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`${ESTILO} min-h-12 ${className}`} {...props} />
}

export function MensagemDeErro({ texto }: { texto: string | null }) {
  if (!texto) return null
  return (
    <p role="alert" className="rounded-2xl bg-scar px-4 py-3 text-sm font-semibold text-novelo">
      {texto}
    </p>
  )
}
