import { useId } from 'react'

// Nota do clube: de 0,5 a 5 patinhas, em passos de meia.

function Patinha({ preenchimento, tamanho }: { preenchimento: 0 | 0.5 | 1; tamanho: number }) {
  const id = useId()
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={preenchimento * 100 + '%'} stopColor="#1A1A19" />
          <stop offset={preenchimento * 100 + '%'} stopColor="#1A1A19" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      <g fill={`url(#${id})`}>
        <ellipse cx="12" cy="16" rx="5.5" ry="4.5" />
        <ellipse cx="5" cy="10.5" rx="2.2" ry="2.8" />
        <ellipse cx="9.3" cy="6.5" rx="2.2" ry="2.8" />
        <ellipse cx="14.7" cy="6.5" rx="2.2" ry="2.8" />
        <ellipse cx="19" cy="10.5" rx="2.2" ry="2.8" />
      </g>
    </svg>
  )
}

function preenchimentoDa(posicao: number, valor: number): 0 | 0.5 | 1 {
  if (valor >= posicao) return 1
  if (valor >= posicao - 0.5) return 0.5
  return 0
}

export function formatarPatinhas(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: valor % 1 ? 1 : 0, maximumFractionDigits: 1 })
}

interface PatinhasProps {
  valor: number
  tamanho?: number
}

export function Patinhas({ valor, tamanho = 18 }: PatinhasProps) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${formatarPatinhas(valor)} de 5 patinhas`}>
      {[1, 2, 3, 4, 5].map((p) => (
        <Patinha key={p} preenchimento={preenchimentoDa(p, valor)} tamanho={tamanho} />
      ))}
    </span>
  )
}

interface PatinhasEditaveisProps {
  valor: number | null
  onChange: (valor: number) => void
  tamanho?: number
}

// Cada patinha tem duas metades tocáveis: a esquerda dá meia, a direita dá inteira.
// Usa radios nativos para o leitor de tela anunciar "4,5 patinhas, 9 de 10".
export function PatinhasEditaveis({ valor, onChange, tamanho = 40 }: PatinhasEditaveisProps) {
  const nome = useId()
  return (
    <fieldset className="flex gap-1">
      <legend className="sr-only">Quantas patinhas?</legend>
      {[1, 2, 3, 4, 5].map((p) => (
        <span key={p} className="relative" style={{ width: tamanho, height: tamanho }}>
          <Patinha preenchimento={preenchimentoDa(p, valor ?? 0)} tamanho={tamanho} />
          {[p - 0.5, p].map((opcao, i) => (
            <label
              key={opcao}
              className={`absolute top-0 h-full w-1/2 cursor-pointer ${i === 0 ? 'left-0' : 'right-0'}`}
            >
              <input
                type="radio"
                name={nome}
                value={opcao}
                checked={valor === opcao}
                onChange={() => onChange(opcao)}
                className="peer sr-only"
              />
              <span className="sr-only">{formatarPatinhas(opcao)} patinhas</span>
              <span className="absolute inset-0 rounded peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-scar" />
            </label>
          ))}
        </span>
      ))}
    </fieldset>
  )
}
