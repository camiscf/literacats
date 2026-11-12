import { EstadoVazio } from '../components/ui/Estados'

export function EmBreve({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="pt-2 text-4xl leading-none">{titulo}</h1>
      <EstadoVazio titulo="Chegando em breve" texto={texto} />
    </div>
  )
}
