import axios from 'axios'

import { getCookie } from '../utils/cookies'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api',
})

apiClient.interceptors.request.use((config) => {
  const token = getCookie('docuflow_access_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default apiClient
