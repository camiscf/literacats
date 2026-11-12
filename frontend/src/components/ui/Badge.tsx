import type { ReactNode } from 'react'

type Tom = 'pantufa' | 'preto' | 'scar' | 'novelo'

const TONS: Record<Tom, string> = {
  pantufa: 'bg-pantufa text-preto',
  preto: 'bg-preto text-novelo',
  scar: 'bg-scar text-novelo',
  novelo: 'bg-novelo text-preto',
}

export function Badge({ tom = 'pantufa', children }: { tom?: Tom; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${TONS[tom]}`}
    >
      {children}
    </span>
  )
}
