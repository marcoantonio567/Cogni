import type { ApiMode } from './types'

const fallbackBackendUrl = 'http://localhost:8000/api/v1'

export const apiConfig = {
  baseUrl: import.meta.env.VITE_BACKEND_API_URL ?? fallbackBackendUrl,
  mode: (import.meta.env.VITE_USE_MOCK_API === 'false' ? 'live' : 'mock') as ApiMode,
}

export const isMockApi = apiConfig.mode === 'mock'
