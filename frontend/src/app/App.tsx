import { NavLink, Route, Routes } from 'react-router-dom'
import { LoginPage } from '../features/accounts/LoginPage'
import { ProtectedRoute } from '../features/accounts/ProtectedRoute'
import { useAuth } from '../features/accounts/useAuth'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { EstudosPage } from '../features/estudos/EstudosPage'
import { apiConfig, isMockApi } from '../shared/api/config'
import { StatusMessage } from '../shared/components/StatusMessage'

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

        <nav aria-label="Navegação principal">
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
          <span>Sessão ativa</span>
          <small>{user?.email}</small>
          <button className="button button--ghost" onClick={() => void logout()} type="button">
            Sair
          </button>
        </div>
      </aside>

      <div className="content-shell">
        {isMockApi ? (
          <StatusMessage>
            Modo mock temporário ativo. Configure <code>VITE_USE_MOCK_API=false</code> e{' '}
            <code>VITE_BACKEND_API_URL</code> para consumir a API Django real em {apiConfig.baseUrl}.
          </StatusMessage>
        ) : null}

        <Routes>
          <Route element={<EstudosPage />} path="/" />
          <Route element={<DashboardPage />} path="/dashboard" />
        </Routes>
      </div>
    </div>
  )
}
