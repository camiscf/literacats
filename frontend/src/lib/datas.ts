const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

// "Leitura de março/2026" em vez de "Cadastrado em 01/03/2026" (feedback da V1)
export function formatarMesDaLeitura(dataIso: string): string {
  const d = new Date(dataIso)
  return `${MESES[d.getMonth()]}/${d.getFullYear()}`
}

export function formatarDataRelativa(dataIso: string, agora = new Date()): string {
  const d = new Date(dataIso)
  const dias = Math.floor((agora.getTime() - d.getTime()) / 86_400_000)
  if (dias <= 0) return `hoje · ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
  if (dias === 1) return 'ontem'
  if (dias < 7) return `${dias} dias atrás`
  if (dias < 14) return 'semana passada'
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

const dois = (n: number) => String(n).padStart(2, '0')

// <input type="datetime-local"> trabalha no fuso do celular (Rio), sem "Z"
export function paraInputDataHora(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}T${dois(d.getHours())}:${dois(d.getMinutes())}`
}

export function deInputDataHora(valor: string): string {
  return new Date(valor).toISOString()
}

export function hojeEmTextoIso(d = new Date()): string {
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`
}

/** "AAAA-MM" do mês atual, formato do <input type="month"> */
export function mesAtualEmTexto(d = new Date()): string {
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}`
}

// "sáb., 24/01 · 16:00"
export function formatarDataDoEvento(iso: string): string {
  const d = new Date(iso)
  const dia = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${dia} · ${hora}`
}

// Recebe "2026-11-01" (date puro, sem fuso) e devolve "novembro/2026"
export function formatarCompetencia(competencia: string): string {
  const [ano, mes] = competencia.split('-').map(Number)
  return `${MESES[mes - 1]}/${ano}`
}

export function formatarDataSimples(data: string): string {
  const [ano, mes, dia] = data.slice(0, 10).split('-')
  return `${dia}/${mes}/${ano}`
}

export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
