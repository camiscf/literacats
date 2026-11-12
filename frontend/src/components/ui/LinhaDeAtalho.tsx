import { Link } from 'react-router-dom'
import { Icone, type NomeIcone } from './Icone'

interface LinhaDeAtalhoProps {
  para: string
  icone: NomeIcone
  rotulo: string
  detalhe?: string
}

export function LinhaDeAtalho({ para, icone, rotulo, detalhe }: LinhaDeAtalhoProps) {
  return (
    <Link to={para} className="flex min-h-14 items-center gap-3 rounded-2xl border-2 border-preto bg-white px-4">
      <Icone nome={icone} />
      <span className="flex-1 font-semibold">{rotulo}</span>
      {detalhe && <span className="text-sm text-preto-suave">{detalhe}</span>}
      <Icone nome="seta" tamanho={18} />
    </Link>
  )
}
