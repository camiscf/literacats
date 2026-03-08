import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Biblioteca } from './pages/Biblioteca'
import { LivroDetalhes } from './pages/LivroDetalhes'
import { Dashboard } from './pages/Dashboard'
import { Membras } from './pages/Membras'
import { MembraPerfil } from './pages/MembraPerfil'
import { Sorteio } from './pages/Sorteio'
import { Recomendacoes } from './pages/Recomendacoes'
import { Perfil } from './pages/Perfil'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Biblioteca />} />
          <Route path="livro/:id" element={<LivroDetalhes />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="membras" element={<Membras />} />
          <Route path="membra/:id" element={<MembraPerfil />} />
          <Route path="sorteio" element={<Sorteio />} />
          <Route path="recomendacoes" element={<Recomendacoes />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
