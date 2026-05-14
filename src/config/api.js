import axios from 'axios'

export const API_BASE_URL = 'https://domador-n8n-tecnoiso.2wdiso.easypanel.host/webhook/'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - adiciona token JWT no header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexushub_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - trata erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Importação lazy para evitar dependência circular
      import('@/stores/auth').then(({ useAuthStore }) => {
        useAuthStore().logout()
      })
      import('@/router').then(({ default: router }) => {
        router.push('/login')
      })
    }
    return Promise.reject(error)
  }
)

export default api
