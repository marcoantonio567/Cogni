import { useMemo, useState, type ReactNode } from 'react'
import { api, type UserSession } from '../../shared/api'
import { authTokenStorage } from '../../shared/api/httpClient'
import { AuthContext, type AuthContextValue } from './authState'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(() => {
    const token = authTokenStorage.get()
    return token ? { id: 1, nome: 'Estudante', email: 'demo@local.test' } : null
  })

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      async login(credentials) {
        const response = await api.login(credentials)
        authTokenStorage.set(response.accessToken)
        setUser(response.user)
      },
      async logout() {
        await api.logout()
        authTokenStorage.clear()
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
