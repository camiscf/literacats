// A jornada sobe com o TEMPO de clube, não com quantidade de livros:
// é o valor "leitura sem pressão" do manual de marca.
export const NIVEIS_DA_JORNADA = [
  { nome: 'Novata', meses: 0 },
  { nome: 'Curiosa', meses: 3 },
  { nome: 'Leitora', meses: 6 },
  { nome: 'Gata de Biblioteca', meses: 12 },
  { nome: 'Gatona Lendária', meses: 24 },
] as const

export type NivelDaJornada = (typeof NIVEIS_DA_JORNADA)[number]

export function calcularMesesDeClube(membraDesde: string, hoje = new Date()): number {
  const [ano, mes, dia] = membraDesde.slice(0, 10).split('-').map(Number)
  let meses = (hoje.getFullYear() - ano) * 12 + (hoje.getMonth() + 1 - mes)
  // ainda não completou o mês corrente
  if (hoje.getDate() < dia) meses -= 1
  return Math.max(0, meses)
}

export function calcularNivelDaJornada(membraDesde: string, hoje = new Date()) {
  const mesesDeClube = calcularMesesDeClube(membraDesde, hoje)
  let indice = 0
  NIVEIS_DA_JORNADA.forEach((nivel, i) => {
    if (mesesDeClube >= nivel.meses) indice = i
  })
  const proximo = NIVEIS_DA_JORNADA[indice + 1] ?? null
  return {
    nivel: NIVEIS_DA_JORNADA[indice],
    indice,
    mesesDeClube,
    proximo,
    mesesParaProximo: proximo ? proximo.meses - mesesDeClube : 0,
  }
}

export function descreverTempoDeClube(meses: number): string {
  if (meses < 1) return 'Chegou agora'
  if (meses < 12) return `${meses} ${meses === 1 ? 'mês' : 'meses'} de clube`
  const anos = Math.floor(meses / 12)
  return `${anos} ${anos === 1 ? 'ano' : 'anos'} de clube`
}
