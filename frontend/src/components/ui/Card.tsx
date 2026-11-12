import type { HTMLAttributes } from 'react'

type Tom = 'claro' | 'escuro' | 'pantufa'

const TONS: Record<Tom, string> = {
  claro: 'bg-white text-preto border-preto',
  escuro: 'bg-preto text-novelo border-preto',
  pantufa: 'bg-pantufa text-preto border-preto',
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tom?: Tom
}

export function Card({ tom = 'claro', className = '', ...props }: CardProps) {
  return <div className={`rounded-3xl border-2 p-5 ${TONS[tom]} ${className}`} {...props} />
}
