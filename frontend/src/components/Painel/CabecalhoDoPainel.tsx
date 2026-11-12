import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Icone } from '../ui/Icone'

interface CabecalhoDoPainelProps {
  titulo: string
  voltarPara?: string
  rotuloVoltar?: string
  acao?: ReactNode
}

export function CabecalhoDoPainel({ titulo, voltarPara = '/painel', rotuloVoltar = 'Painel', acao }: CabecalhoDoPainelProps) {
  return (
    <div className="flex flex-col gap-1 pt-1">
      <Link to={voltarPara} className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold">
        <Icone nome="voltar" tamanho={18} /> {rotuloVoltar}
      </Link>
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-4xl leading-none">{titulo}</h1>
        {acao}
      </div>
    </div>
  )
}
