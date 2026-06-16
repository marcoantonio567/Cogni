import { NavLink, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../features/accounts/LoginPage'
import { ProtectedRoute } from '../features/accounts/ProtectedRoute'
import { useAuth } from '../features/accounts/useAuth'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { EstudosPage } from '../features/estudos/EstudosPage'

export function App() {
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
        path="/*"
      />
    </Routes>
  )
}

function AppShell() {
  const { logout, user } = useAuth()

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span>GE</span>
          <div>
            <strong>Gerenciador</strong>
            <small>Estudos</small>
          </div>
        </div>

        <nav aria-label="Navegacao principal">
          <NavLink end to="/">
            <span aria-hidden="true">□</span>
            Estudos
          </NavLink>
          <NavLink to="/dashboard">
            <span aria-hidden="true">↗</span>
            Dashboard
          </NavLink>
        </nav>

        <div className="session-box">
          <span>Sessao ativa</span>
          <small>{user?.username ?? user?.email}</small>
          <button className="button button--ghost" onClick={() => void logout()} type="button">
            Sair
          </button>
        </div>
      </aside>

      <div className="content-shell">
        <Routes>
          <Route element={<EstudosPage />} path="/" />
          <Route element={<DashboardPage />} path="/dashboard" />
        </Routes>
      </div>
    </div>
  )
}
