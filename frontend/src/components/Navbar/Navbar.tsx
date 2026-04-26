import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Biblioteca', icone: '📚' },
  { to: '/dashboard', label: 'Dashboard', icone: '📊' },
  { to: '/membras', label: 'Membras', icone: '👥' },
  { to: '/sorteio', label: 'Sorteio', icone: '🎰' },
  { to: '/recomendacoes', label: 'IA', icone: '✨' },
]

export function Navbar() {
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <nav className="bg-pink-primary shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="font-display text-2xl font-bold text-white">
            Literacats 🐱
          </NavLink>

          {/* Links desktop */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-pink-hot'
                      : 'text-white hover:bg-pink-hot'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Botão hamburguer mobile */}
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-pink-hot transition-colors"
            aria-label="Menu"
          >
            {menuAberto ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile dropdown */}
      {menuAberto && (
        <div className="md:hidden border-t border-white/20">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuAberto(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-white text-pink-hot'
                      : 'text-white hover:bg-pink-hot'
                  }`
                }
              >
                <span>{link.icone}</span>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
