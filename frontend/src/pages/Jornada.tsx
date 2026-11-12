import { useAuth } from '../contexts/AuthContext'
import { NIVEIS_DA_JORNADA, calcularNivelDaJornada, descreverTempoDeClube } from '../lib/jornada'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Icone } from '../components/ui/Icone'
import { LinhaDeAtalho } from '../components/ui/LinhaDeAtalho'
import { Lili } from '../components/ui/Lili'

export function Jornada() {
  const { membra, ehAdmin, sair } = useAuth()
  if (!membra) return null
  const { nivel, indice, mesesDeClube, proximo, mesesParaProximo } = calcularNivelDaJornada(membra.membra_desde)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="pt-2 text-4xl leading-none">Minha jornada</h1>

      <Card tom="escuro" className="flex items-center gap-4">
        {/* a Lili é preta: sobre o card escuro ela precisa de um fundo para aparecer */}
        <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-pantufa">
          <Lili reacao="feliz" tamanho={72} decorativa />
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-widest text-pantufa">Nível {indice + 1}</span>
          <span className="font-script text-2xl leading-tight">Literacat {nivel.nome}</span>
          <span className="text-sm">Com a gente: {descreverTempoDeClube(mesesDeClube).replace(' de clube', '')}</span>
          {proximo && (
            <span className="text-sm text-pantufa">
              Falta{mesesParaProximo > 1 ? 'm' : ''} {mesesParaProximo} {mesesParaProximo === 1 ? 'mês' : 'meses'} pra
              desbloquear a {proximo.nome}
            </span>
          )}
        </div>
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="text-2xl leading-none">Minha coleção</h2>
          <span className="text-sm text-preto-suave">
            {indice + 1} de {NIVEIS_DA_JORNADA.length}
          </span>
        </div>
        <ul className="grid grid-cols-3 gap-3">
          {NIVEIS_DA_JORNADA.map((n, i) => {
            const desbloqueada = i <= indice
            return (
              <li
                key={n.nome}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-2 text-center ${
                  desbloqueada ? 'border-preto bg-white' : 'border-dashed border-preto-suave/50'
                }`}
              >
                <span className={desbloqueada ? '' : 'opacity-25 grayscale'}>
                  <Lili reacao={desbloqueada ? 'neutra' : 'tedio'} tamanho={56} decorativa />
                </span>
                <span className="text-xs font-semibold leading-tight">{n.nome}</span>
                <span className="text-[11px] text-preto-suave">
                  {desbloqueada ? 'Desbloqueada' : n.meses < 12 ? `${n.meses} meses` : `${n.meses / 12} ${n.meses === 12 ? 'ano' : 'anos'}`}
                </span>
              </li>
            )
          })}
        </ul>
        <p className="text-sm text-preto-suave">Gatinhas especiais também aparecem em encontros temáticos.</p>
      </section>

      <section className="flex flex-col gap-2">
        <LinhaDeAtalho para="/mensalidade" icone="carteira" rotulo="Mensalidade" />
        {ehAdmin && <LinhaDeAtalho para="/painel" icone="painel" rotulo="Painel da organização" />}
      </section>

      <div className="flex items-center justify-between">
        {ehAdmin && <Badge tom="preto">Organização</Badge>}
        <button type="button" onClick={sair} className="ml-auto inline-flex min-h-11 items-center gap-2 text-sm font-semibold">
          <Icone nome="sair" tamanho={18} /> Sair
        </button>
      </div>
    </div>
  )
}
