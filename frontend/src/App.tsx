import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { RequireAuth } from './components/RequireAuth/RequireAuth'
import { Layout } from './components/Layout/Layout'
import { Biblioteca } from './pages/Biblioteca'
import { LivroDetalhes } from './pages/LivroDetalhes'
import { Dashboard } from './pages/Dashboard'
import { Membras } from './pages/Membras'
import { MembraPerfil } from './pages/MembraPerfil'
import { Sorteio } from './pages/Sorteio'
import { Recomendacoes } from './pages/Recomendacoes'
import { Login } from './pages/Login'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<Biblioteca />} />
            <Route path="livro/:id" element={<LivroDetalhes />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="membras" element={<Membras />} />
            <Route path="membra/:id" element={<MembraPerfil />} />
            <Route path="sorteio" element={<Sorteio />} />
            <Route path="recomendacoes" element={<Recomendacoes />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
