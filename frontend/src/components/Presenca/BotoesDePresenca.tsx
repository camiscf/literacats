import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { responderPresenca } from '../../lib/presenca'
import type { RespostaPresenca } from '../../types'
import { useConfirmacao } from '../ui/Confirmacao'

interface BotoesDePresencaProps {
  eventoId: string
  /** 'claro' = botões sobre fundo escuro/vermelho; 'escuro' = sobre fundo claro */
  sobre?: 'fundo-escuro' | 'fundo-claro'
  aoResponder: (resposta: RespostaPresenca) => void
}

export function BotoesDePresenca({ eventoId, sobre = 'fundo-claro', aoResponder }: BotoesDePresencaProps) {
  const { membra } = useAuth()
  const mostrarConfirmacao = useConfirmacao()
  const [enviando, setEnviando] = useState<RespostaPresenca | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const confirmarPresenca = async (resposta: RespostaPresenca) => {
    if (!membra) return
    setEnviando(resposta)
    setErro(null)
    try {
      await responderPresenca(eventoId, membra.id, resposta)
      mostrarConfirmacao(resposta === 'vou' ? 'Anotado! Te vejo lá.' : 'Tudo bem! Fica pra próxima.')
      aoResponder(resposta)
    } catch (e) {
      setErro((e as Error).message)
    } finally {
      setEnviando(null)
    }
  }

  const principal =
    sobre === 'fundo-escuro' ? 'bg-novelo text-scar border-novelo' : 'bg-preto text-novelo border-preto'
  const secundario =
    sobre === 'fundo-escuro' ? 'bg-transparent text-novelo border-novelo' : 'bg-white text-preto border-preto'

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={enviando !== null}
          onClick={() => confirmarPresenca('vou')}
          className={`min-h-12 flex-1 rounded-full border-2 text-[15px] font-bold disabled:opacity-60 ${principal}`}
        >
          {enviando === 'vou' ? 'Salvando...' : 'Vou sim!'}
        </button>
        <button
          type="button"
          disabled={enviando !== null}
          onClick={() => confirmarPresenca('nao_vou')}
          className={`min-h-12 flex-1 rounded-full border-2 text-sm font-semibold disabled:opacity-60 ${secundario}`}
        >
          {enviando === 'nao_vou' ? 'Salvando...' : 'Não vou poder'}
        </button>
      </div>
      {erro && (
        <p role="alert" className="text-sm font-semibold">
          {erro}
        </p>
      )}
    </div>
  )
}
