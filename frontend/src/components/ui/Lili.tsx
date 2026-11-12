// PROVISÓRIO: versão simplificada da Lili desenhada em SVG só para marcar o
// lugar das reações. Trocar pelas ilustrações oficiais do manual (pág. 40–42)
// quando a designer enviar os arquivos — a API do componente continua igual.

export type ReacaoLili = 'neutra' | 'feliz' | 'paixao' | 'triste' | 'tedio' | 'raiva'

const DESCRICAO: Record<ReacaoLili, string> = {
  neutra: 'Lili, a gatinha do clube',
  feliz: 'Lili feliz',
  paixao: 'Lili apaixonada',
  triste: 'Lili triste',
  tedio: 'Lili entediada',
  raiva: 'Lili brava',
}

interface LiliProps {
  reacao?: ReacaoLili
  tamanho?: number
  /** true quando a imagem só enfeita e o texto ao lado já diz tudo */
  decorativa?: boolean
  className?: string
}

const ROSA = '#F4A8C7'
const PRETO = '#1A1A19'
const NOVELO = '#ECEBE1'

function Olhos({ reacao }: { reacao: ReacaoLili }) {
  if (reacao === 'feliz') {
    return (
      <g stroke={NOVELO} strokeWidth="3.5" fill="none" strokeLinecap="round">
        <path d="M29 50q7-8 14 0M57 50q7-8 14 0" />
      </g>
    )
  }
  if (reacao === 'paixao') {
    return (
      <g fill={ROSA}>
        <path d="M36 56l-7-7a4 4 0 0 1 7-5 4 4 0 0 1 7 5z" />
        <path d="M64 56l-7-7a4 4 0 0 1 7-5 4 4 0 0 1 7 5z" />
      </g>
    )
  }
  const pupila = (cx: number) => (
    <g key={cx}>
      <circle cx={cx} cy="50" r="9" fill={ROSA} />
      <circle cx={cx} cy="51" r="6" fill="#3B1F2B" />
      <circle cx={cx + 2} cy="48" r="1.8" fill="#FFFFFF" />
    </g>
  )
  return (
    <g>
      {pupila(36)}
      {pupila(64)}
      {reacao === 'tedio' && (
        <g fill={PRETO}>
          <rect x="26" y="40" width="20" height="9" />
          <rect x="54" y="40" width="20" height="9" />
        </g>
      )}
      {reacao === 'raiva' && (
        <g stroke={NOVELO} strokeWidth="3" strokeLinecap="round">
          <path d="M28 39l14 5M72 39l-14 5" />
        </g>
      )}
      {reacao === 'triste' && <circle cx="29" cy="60" r="2.5" fill="#7FB3E8" />}
    </g>
  )
}

export function Lili({ reacao = 'neutra', tamanho = 96, decorativa = false, className = '' }: LiliProps) {
  return (
    <svg
      width={tamanho}
      height={tamanho * 0.8}
      viewBox="0 0 100 80"
      role={decorativa ? undefined : 'img'}
      aria-hidden={decorativa || undefined}
      aria-label={decorativa ? undefined : DESCRICAO[reacao]}
      className={className}
    >
      <path d="M18 34L24 6l18 16M82 34L76 6 58 22" fill={PRETO} />
      <path d="M24 26l3-13 8 8M76 26l-3-13-8 8" fill={ROSA} />
      <ellipse cx="50" cy="50" rx="38" ry="27" fill={PRETO} />
      <Olhos reacao={reacao} />
      <path d="M48 59h4l-2 2.5z" fill={ROSA} />
      {reacao === 'triste' || reacao === 'raiva' ? (
        <path d="M45 66q5-4 10 0" stroke={NOVELO} strokeWidth="2" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M46 63q4 3 8 0" stroke={NOVELO} strokeWidth="2" fill="none" strokeLinecap="round" />
      )}
      <g stroke={NOVELO} strokeWidth="1.6" strokeLinecap="round">
        <path d="M4 52l14 2M5 59l13-2M96 52l-14 2M95 59l-13-2" />
      </g>
    </svg>
  )
}
