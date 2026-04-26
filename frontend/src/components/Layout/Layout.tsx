import { Outlet } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'

export function Layout() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="container mx-auto px-4 py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  )
}
