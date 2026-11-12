import type { ReactNode } from 'react'
import { Lili } from './Lili'
import { Botao } from './Botao'

// Os 4 estados de toda tela, sempre com a Lili e uma frase no tom do clube.

export function Carregando({ texto = 'Carregando...' }: { texto?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16 text-preto-suave">
      <Lili reacao="neutra" tamanho={72} decorativa className="animate-pulse" />
      <span className="text-sm">{texto}</span>
    </div>
  )
}

interface EstadoVazioProps {
  titulo: string
  texto?: string
  acao?: ReactNode
}

export function EstadoVazio({ titulo, texto, acao }: EstadoVazioProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <Lili reacao="tedio" tamanho={96} decorativa />
      <p className="text-lg font-semibold">{titulo}</p>
      {texto && <p className="max-w-xs text-sm text-preto-suave">{texto}</p>}
      {acao}
    </div>
  )
}

interface ErroProps {
  texto?: string
  aoTentarDeNovo?: () => void
}

export function Erro({ texto = 'Algo deu errado por aqui.', aoTentarDeNovo }: ErroProps) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <Lili reacao="triste" tamanho={96} decorativa />
      <p className="text-lg font-semibold">Ops, gatinha!</p>
      <p className="max-w-xs text-sm text-preto-suave">{texto}</p>
      {aoTentarDeNovo && (
        <Botao variante="secundario" onClick={aoTentarDeNovo}>
          Tentar de novo
        </Botao>
      )}
    </div>
  )
}
