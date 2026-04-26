import { useState } from 'react'

export function Recomendacoes() {
  const [humor, setHumor] = useState('')
  const [genero, setGenero] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [recomendacao, setRecomendacao] = useState<string | null>(null)

  const buscarRecomendacao = async () => {
    setCarregando(true)

    // TODO: integrar com Lambda + Claude API
    // Simulando resposta da IA por enquanto
    await new Promise(resolve => setTimeout(resolve, 2000))

    setRecomendacao(
      `Baseado no histórico do clube e no seu humor "${humor || 'reflexivo'}", recomendo **"O Conto da Aia"** de Margaret Atwood. Vocês amaram "A Vegetariana" pela escrita intensa e temas de autonomia feminina — esse livro traz a mesma potência, mas em um cenário distópico que vai render discussões incríveis no encontro! 🐱`
    )
    setCarregando(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Recomendações da Clarice ✨</h1>
        <p className="text-black/70">A Clarice conhece o gosto das gatas e vai sugerir o próximo livro</p>
      </header>

      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-primary/10 mb-6">
        <h2 className="font-display text-xl font-semibold mb-4">O que você tá buscando?</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black/70 mb-2">
              Qual seu humor hoje?
            </label>
            <select
              value={humor}
              onChange={(e) => setHumor(e.target.value)}
              className="w-full px-4 py-3 border-2 border-pink-light rounded-xl focus:border-pink-primary focus:outline-none"
            >
              <option value="">Escolha...</option>
              <option value="leve">Quero algo leve e divertido</option>
              <option value="reflexivo">Tô querendo refletir sobre a vida</option>
              <option value="intenso">Me dá drama e emoção forte</option>
              <option value="escapismo">Quero fugir da realidade</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black/70 mb-2">
              Algum gênero específico?
            </label>
            <select
              value={genero}
              onChange={(e) => setGenero(e.target.value)}
              className="w-full px-4 py-3 border-2 border-pink-light rounded-xl focus:border-pink-primary focus:outline-none"
            >
              <option value="">Tanto faz</option>
              <option value="ficcao">Ficção</option>
              <option value="romance">Romance</option>
              <option value="fantasia">Fantasia</option>
              <option value="nao-ficcao">Não-ficção</option>
              <option value="terror">Terror/Suspense</option>
            </select>
          </div>

          <button
            onClick={buscarRecomendacao}
            disabled={carregando}
            className="w-full bg-pink-primary hover:bg-pink-hot text-white px-6 py-4 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {carregando ? 'Pensando...' : '✨ Me recomenda!'}
          </button>
        </div>
      </div>

      {recomendacao && (
        <div className="bg-pink-light rounded-2xl p-6 border-2 border-pink-primary">
          <h2 className="font-display text-xl font-semibold text-pink-hot mb-3">
            Recomendação da Claude:
          </h2>
          <p className="text-black leading-relaxed">{recomendacao}</p>
        </div>
      )}
    </div>
  )
}
