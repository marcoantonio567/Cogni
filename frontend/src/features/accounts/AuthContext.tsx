import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, type UserSession } from '../../shared/api'
import { AuthContext, type AuthContextValue } from './authState'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null)

  useEffect(() => {
    api
      .session()
      .then(setUser)
      .catch(() => setUser(null))
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      async login(credentials) {
        const response = await api.login(credentials)
        setUser(response.user)
      },
      async logout() {
        await api.logout()
        setUser(null)
      },
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
