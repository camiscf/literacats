import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ConfirmacaoProvider } from './components/ui/Confirmacao'
import { RequireAdmin, RequireAuth } from './components/RequireAuth/RequireAuth'
import { Layout } from './components/Layout/Layout'
import { Login } from './pages/Login'
import { Inicio } from './pages/Inicio'
import { Biblioteca } from './pages/Biblioteca'
import { LivroDetalhes } from './pages/LivroDetalhes'
import { Jornada } from './pages/Jornada'
import { Avisos } from './pages/Avisos'
import { Evento } from './pages/Evento'
import { EmBreve } from './pages/EmBreve'
import { Painel } from './pages/painel/Painel'
import { PainelMembras } from './pages/painel/PainelMembras'
import { PainelEventos } from './pages/painel/PainelEventos'
import { PainelAvisos } from './pages/painel/PainelAvisos'
import { PainelMensalidades } from './pages/painel/PainelMensalidades'
import { PainelLivros } from './pages/painel/PainelLivros'
import { PainelInicio } from './pages/painel/PainelInicio'
import { EstadoVazio } from './components/ui/Estados'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ConfirmacaoProvider>
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
              <Route index element={<Inicio />} />
              <Route
                path="papo"
                element={
                  <EmBreve
                    titulo="Papo do livro"
                    texto="O chat do livro do mês, sem spoiler: você diz até onde leu e o resto fica escondido."
                  />
                }
              />
              <Route path="biblioteca" element={<Biblioteca />} />
              <Route path="livro/:id" element={<LivroDetalhes />} />
              <Route path="jornada" element={<Jornada />} />
              <Route path="avisos" element={<Avisos />} />
              <Route path="evento/:id" element={<Evento />} />
              <Route
                path="mensalidade"
                element={<EmBreve titulo="Mensalidade" texto="Status do mês, histórico e pagamento por Pix ou cartão." />}
              />
              <Route path="painel" element={<RequireAdmin><Outlet /></RequireAdmin>}>
                <Route index element={<Painel />} />
                <Route path="membras" element={<PainelMembras />} />
                <Route path="eventos" element={<PainelEventos />} />
                <Route path="avisos" element={<PainelAvisos />} />
                <Route path="mensalidades" element={<PainelMensalidades />} />
                <Route path="livros" element={<PainelLivros />} />
                <Route path="inicio" element={<PainelInicio />} />
              </Route>
              <Route path="*" element={<EstadoVazio titulo="Página não encontrada" texto="Essa página fugiu pela janela." />} />
            </Route>
          </Routes>
        </ConfirmacaoProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
