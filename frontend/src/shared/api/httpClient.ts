import axios from 'axios'
import { apiConfig } from './config'

const tokenStorageKey = 'managerstudys.accessToken'

export const httpClient = axios.create({
  baseURL: apiConfig.baseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

httpClient.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(tokenStorageKey)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const authTokenStorage = {
  key: tokenStorageKey,
  get: () => window.localStorage.getItem(tokenStorageKey),
  set: (token: string) => window.localStorage.setItem(tokenStorageKey, token),
  clear: () => window.localStorage.removeItem(tokenStorageKey),
}
