import { NavLink } from 'react-router-dom'
import { Icone, type NomeIcone } from '../ui/Icone'

const ABAS: { para: string; rotulo: string; icone: NomeIcone }[] = [
  { para: '/', rotulo: 'Início', icone: 'inicio' },
  { para: '/papo', rotulo: 'Papo', icone: 'papo' },
  { para: '/biblioteca', rotulo: 'Biblioteca', icone: 'biblioteca' },
  { para: '/jornada', rotulo: 'Jornada', icone: 'jornada' },
]

export function TabBar() {
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-preto bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {ABAS.map((aba) => (
          <li key={aba.para}>
            <NavLink
              to={aba.para}
              end={aba.para === '/'}
              className={({ isActive }) =>
                `flex min-h-[60px] flex-col items-center justify-center gap-1 text-[11px] ${
                  isActive ? 'font-bold text-preto' : 'text-preto-suave'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-8 w-14 items-center justify-center rounded-full transition-colors ${
                      isActive ? 'bg-rosa' : ''
                    }`}
                  >
                    <Icone nome={aba.icone} />
                  </span>
                  {aba.rotulo}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
