import { useState, useEffect, useCallback } from 'react'
import confetti from 'canvas-confetti'
import { obterSorteioAtual, adicionarSugestao, realizarSorteio, type Sorteio as SorteioType, type Sugestao } from '../services/api'

type FaseSorteio = 'aguardando' | 'embaralhando' | 'roleta' | 'revelado'

export function Sorteio() {
  const [sorteio, setSorteio] = useState<SorteioType | null>(null)
  const [novaSugestao, setNovaSugestao] = useState('')
  const [fase, setFase] = useState<FaseSorteio>('aguardando')
  const [livroAtual, setLivroAtual] = useState<string | null>(null)
  const [livroSorteado, setLivroSorteado] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  // Carrega sorteio atual ao montar
  useEffect(() => {
    obterSorteioAtual()
      .then((s) => {
        setSorteio(s)
        if (s.livroSorteadoTitulo) {
          setLivroSorteado(s.livroSorteadoTitulo)
          setFase('revelado')
        }
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false))
  }, [])

  const sugestoes = sorteio?.sugestoes || []

  const handleAdicionarSugestao = async () => {
    if (!novaSugestao.trim()) return

    try {
      // Por enquanto usa membra fixa (depois vem do auth)
      await adicionarSugestao(novaSugestao, '1', 'Você')
      // Recarrega sorteio para ter lista atualizada
      const atualizado = await obterSorteioAtual()
      setSorteio(atualizado)
      setNovaSugestao('')
    } catch (e) {
      console.error('Erro ao adicionar sugestão:', e)
    }
  }

  const dispararConfete = useCallback(() => {
    // Explosão central
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F472B6', '#EC4899', '#FCE7F3', '#ffffff'],
    })

    // Canhões laterais
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#F472B6', '#EC4899'],
      })
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#F472B6', '#EC4899'],
      })
    }, 200)
  }, [])

  const sortearLivroDoMes = useCallback(async () => {
    if (sugestoes.length < 2) return

    setLivroSorteado(null)
    setFase('embaralhando')

    // Fase 1: Embaralhando (papéis voando) - 1.5s
    setTimeout(async () => {
      setFase('roleta')

      // Fase 2: Roleta com desaceleração
      let velocidade = 50
      let contador = 0
      let indice = 0

      const rodar = () => {
        indice = (indice + 1) % sugestoes.length
        setLivroAtual(sugestoes[indice].livroTitulo)
        contador++

        // Desacelera gradualmente
        if (contador < 10) {
          velocidade = 50
        } else if (contador < 20) {
          velocidade = 100
        } else if (contador < 28) {
          velocidade = 200
        } else if (contador < 33) {
          velocidade = 350
        } else {
          // Chama a API para sortear de verdade
          realizarSorteio()
            .then((resultado) => {
              setLivroAtual(resultado.livroSorteadoTitulo!)
              setLivroSorteado(resultado.livroSorteadoTitulo!)
              setSorteio(resultado)
              setFase('revelado')
              dispararConfete()
            })
            .catch((e) => {
              setErro(e.message)
              setFase('aguardando')
            })
          return
        }

        setTimeout(rodar, velocidade)
      }

      rodar()
    }, 1500)
  }, [sugestoes, dispararConfete])

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin text-4xl">🎰</div>
      </div>
    )
  }

  if (erro && !sorteio) {
    return (
      <div className="text-center py-16">
        <p className="text-2xl mb-4">😿</p>
        <p className="text-red-500">{erro}</p>
        <p className="text-black/60 mt-2">Verifique se a API está rodando em localhost:5203</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-black mb-2">Sorteio do Mês 🎰</h1>
        <p className="text-black/70">
          {sorteio && `${getNomeMes(sorteio.mes)} ${sorteio.ano}`} — Hora de descobrir o próximo livro das gatas!
        </p>
      </header>

      {/* Input de sugestão */}
      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10 mb-6">
        <h2 className="font-display text-xl font-semibold mb-4">Adicionar sugestão</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={novaSugestao}
            onChange={(e) => setNovaSugestao(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdicionarSugestao()}
            placeholder="Nome do livro..."
            disabled={fase !== 'aguardando' && fase !== 'revelado'}
            className="flex-1 px-4 py-3 border-2 border-pink-light rounded-xl focus:border-pink-primary focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleAdicionarSugestao}
            disabled={fase !== 'aguardando' && fase !== 'revelado'}
            className="bg-pink-primary hover:bg-pink-hot text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            Adicionar
          </button>
        </div>
      </div>

      {/* Papéis com sugestões */}
      {sugestoes.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10 mb-6 overflow-hidden">
          <h2 className="font-display text-xl font-semibold mb-4">
            Papéis no pote ({sugestoes.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {sugestoes.map((s: Sugestao, index: number) => (
              <span
                key={index}
                className={`
                  relative bg-pink-light text-pink-hot px-4 py-2 rounded-lg font-medium
                  transition-all duration-300 group
                  ${fase === 'embaralhando' ? 'animate-bounce' : ''}
                `}
                style={{
                  animationDelay: fase === 'embaralhando' ? `${index * 100}ms` : '0ms',
                }}
              >
                {s.livroTitulo}
                <span className="text-xs text-pink-hot/60 ml-2">por {s.membraNome}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Área do sorteio */}
      <div
        className={`
          relative rounded-2xl p-8 text-center overflow-hidden transition-all duration-500
          ${fase === 'revelado' ? 'bg-gradient-to-br from-pink-primary via-pink-hot to-pink-primary' : 'bg-pink-primary'}
        `}
      >
        {/* Efeito de brilho no fundo durante roleta */}
        {fase === 'roleta' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        )}

        {/* Conteúdo */}
        <div className="relative z-10">
          {fase === 'aguardando' && (
            <p className="text-white/80 text-lg">
              {sugestoes.length < 2
                ? `Adicione pelo menos ${2 - sugestoes.length} sugestão(ões) para sortear`
                : '✨ Pronto para a magia acontecer!'}
            </p>
          )}

          {fase === 'embaralhando' && (
            <div className="py-8">
              <div className="flex justify-center gap-2 mb-4">
                {['📄', '📃', '📄'].map((papel, i) => (
                  <span
                    key={i}
                    className="text-4xl animate-spin"
                    style={{ animationDuration: `${0.5 + i * 0.2}s` }}
                  >
                    {papel}
                  </span>
                ))}
              </div>
              <p className="text-white text-xl font-medium animate-pulse">
                Embaralhando os papéis...
              </p>
            </div>
          )}

          {fase === 'roleta' && (
            <div className="py-4">
              <p className="text-white/60 text-sm mb-2">🎰 Sorteando...</p>
              <div className="bg-white/20 rounded-xl p-6 backdrop-blur">
                <h2 className="text-3xl font-display font-bold text-white animate-pulse">
                  {livroAtual}
                </h2>
              </div>
            </div>
          )}

          {fase === 'revelado' && (
            <div className="py-4">
              <p className="text-white/80 text-lg mb-3">🎊 O livro do mês é:</p>
              <div className="bg-white rounded-xl p-6 shadow-2xl transform animate-bounce-slow">
                <h2 className="text-3xl font-display font-bold text-pink-hot">
                  {livroSorteado}
                </h2>
              </div>
              <p className="text-white/60 text-sm mt-4">
                Parabéns! Boa leitura, gatas! 🐱📚
              </p>
            </div>
          )}
        </div>

        {/* Botão */}
        {(fase === 'aguardando' || fase === 'revelado') && !sorteio?.livroSorteadoTitulo && (
          <button
            onClick={sortearLivroDoMes}
            disabled={sugestoes.length < 2}
            className={`
              mt-6 px-8 py-4 rounded-xl font-bold text-lg transition-all transform
              ${fase === 'revelado'
                ? 'bg-white/90 text-pink-hot hover:bg-white hover:scale-105'
                : 'bg-white text-pink-hot hover:bg-pink-light hover:scale-105'
              }
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            `}
          >
            {fase === 'revelado' ? '🔄 Sortear novamente!' : '🎲 Sortear!'}
          </button>
        )}

        {sorteio?.livroSorteadoTitulo && fase === 'revelado' && (
          <p className="text-white/60 text-sm mt-4">
            Sorteio já realizado em {sorteio.dataSorteio ? new Date(sorteio.dataSorteio).toLocaleDateString('pt-BR') : 'hoje'}
          </p>
        )}
      </div>

      {/* CSS para animação customizada */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

function getNomeMes(mes: number): string {
  const nomes = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  return nomes[mes] || ''
}
