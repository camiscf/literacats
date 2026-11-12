import { Outlet } from 'react-router-dom'
import { Cabecalho } from '../Cabecalho/Cabecalho'
import { TabBar } from '../TabBar/TabBar'

// Mobile-first: coluna única de até 512px; no desktop fica centralizada.
export function Layout() {
  return (
    <div className="min-h-dvh">
      <Cabecalho />
      <main className="mx-auto max-w-lg px-4 pb-[calc(96px+env(safe-area-inset-bottom))] pt-2">
        <Outlet />
      </main>
      <TabBar />
    </div>
  )
}
