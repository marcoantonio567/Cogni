const fallbackBackendUrl = 'http://localhost:8000/api/v1'

export const apiConfig = {
  baseUrl: import.meta.env.VITE_BACKEND_API_URL ?? fallbackBackendUrl,
}
