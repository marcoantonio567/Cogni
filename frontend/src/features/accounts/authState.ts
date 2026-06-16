import { createContext } from 'react'
import type { AuthCredentials, UserSession } from '../../shared/api'

export type AuthContextValue = {
  user: UserSession | null
  isAuthenticated: boolean
  login: (credentials: AuthCredentials) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
