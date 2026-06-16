import axios from 'axios'
import { apiConfig } from './config'

export const httpClient = axios.create({
  baseURL: apiConfig.baseUrl,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})
