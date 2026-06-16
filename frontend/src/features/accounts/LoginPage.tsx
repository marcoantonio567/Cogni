import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { SubmitButton } from '../../shared/components/SubmitButton'
import { StatusMessage } from '../../shared/components/StatusMessage'
import { useAuth } from './useAuth'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const redirectTo =
    location.state && typeof location.state === 'object' && 'from' in location.state ? String(location.state.from) : '/'

  if (isAuthenticated) {
    return <Navigate replace to="/" />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setPending(true)

    try {
      await login({ username, password })
      navigate(redirectTo, { replace: true })
    } catch {
      setError('Não foi possível autenticar com a API configurada.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel" aria-labelledby="login-title">
        <p className="eyebrow">Gerenciador de Estudos</p>
        <h1 id="login-title">Entrar</h1>
        <span>Acesse seu plano, marque progresso e acompanhe seus estudos em uma interface simples.</span>

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            Usuario
            <input autoComplete="username" onChange={(event) => setUsername(event.target.value)} required type="text" value={username} />
          </label>

          <label>
            Senha
            <input
              autoComplete="current-password"
              minLength={4}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          <SubmitButton pending={pending}>Entrar</SubmitButton>
        </form>
      </section>
    </main>
  )
}
