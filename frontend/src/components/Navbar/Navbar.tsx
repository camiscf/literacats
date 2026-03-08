import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Biblioteca' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/membras', label: 'Membras' },
  { to: '/sorteio', label: 'Sorteio' },
  { to: '/recomendacoes', label: 'IA' },
]

export function Navbar() {
  // TODO: pegar do contexto de autenticação
  const usuarioLogado = true

  return (
    <nav className="bg-pink-primary shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink to="/" className="font-display text-2xl font-bold text-white">
            Literacats 🐱
          </NavLink>

          <div className="flex items-center gap-1">
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

            {/* Separador */}
            <div className="w-px h-8 bg-white/30 mx-2" />

            {/* Avatar / Login */}
            {usuarioLogado ? (
              <NavLink
                to="/perfil"
                className={({ isActive }) =>
                  `w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-white text-pink-hot ring-2 ring-white'
                      : 'bg-pink-hot text-white hover:bg-white hover:text-pink-hot'
                  }`
                }
                title="Meu Perfil"
              >
                🐱
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className="px-4 py-2 rounded-lg font-medium bg-white text-pink-hot hover:bg-pink-light transition-colors"
              >
                Entrar
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
