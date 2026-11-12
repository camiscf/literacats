import { useEffect, useState } from 'react'

function calcularFalta(ate: string) {
  const ms = Math.max(0, new Date(ate).getTime() - Date.now())
  return {
    dias: Math.floor(ms / 86_400_000),
    horas: Math.floor((ms % 86_400_000) / 3_600_000),
    minutos: Math.floor((ms % 3_600_000) / 60_000),
    acabou: ms === 0,
  }
}

export function ContagemRegressiva({ ate }: { ate: string }) {
  const [falta, setFalta] = useState(() => calcularFalta(ate))

  useEffect(() => {
    setFalta(calcularFalta(ate))
    // minuto é a menor unidade mostrada: atualizar a cada 30 s basta
    const t = window.setInterval(() => setFalta(calcularFalta(ate)), 30_000)
    return () => window.clearInterval(t)
  }, [ate])

  if (falta.acabou) {
    return <p className="font-display text-4xl leading-none text-pantufa">É hoje!</p>
  }

  const blocos = [
    { valor: falta.dias, rotulo: falta.dias === 1 ? 'dia' : 'dias', destaque: true },
    { valor: falta.horas, rotulo: falta.horas === 1 ? 'hora' : 'horas', destaque: false },
    { valor: falta.minutos, rotulo: 'min', destaque: false },
  ]

  return (
    <div
      className="flex gap-2"
      role="timer"
      aria-label={`Faltam ${falta.dias} dias, ${falta.horas} horas e ${falta.minutos} minutos`}
    >
      {blocos.map((b) => (
        <div
          key={b.rotulo}
          aria-hidden="true"
          className={`flex flex-1 flex-col items-center rounded-2xl py-2 text-preto ${b.destaque ? 'bg-rosa' : 'bg-pantufa'}`}
        >
          <span className="font-display text-3xl leading-none">{String(b.valor).padStart(2, '0')}</span>
          <span className="text-[11px]">{b.rotulo}</span>
        </div>
      ))}
    </div>
  )
}
