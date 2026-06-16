import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { SubmitButton } from '../../shared/components/SubmitButton'
import { StatusMessage } from '../../shared/components/StatusMessage'
import { useAuth } from './useAuth'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('demo@local.test')
  const [password, setPassword] = useState('demo123')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  const redirectTo = location.state && typeof location.state === 'object' && 'from' in location.state
    ? String(location.state.from)
    : '/'

  if (isAuthenticated) {
    return <Navigate replace to="/" />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setPending(true)

    try {
      await login({ email, password })
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
        <span>Use a sessão exposta pela API do backend para acessar seus estudos.</span>

        {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input autoComplete="email" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
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
