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

// A autenticação JWT dos webhooks do n8n responde 401 quando falta o token e
// 403 quando ele é inválido ou venceu, com o erro do JWT em texto no corpo
// ("jwt expired", "invalid signature", "invalid token"...). Um 403 com outro
// corpo é regra de negócio e não deve derrubar a sessão.
const JWT_ERROR = /jwt|token|signature/i

function isSessionError(error) {
  const status = error.response?.status
  if (status === 401) return true
  if (status !== 403) return false
  const data = error.response.data
  const message = typeof data === 'string' ? data : data?.message ?? ''
  return JWT_ERROR.test(message)
}

// Response interceptor - trata erros globais
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Na tela de login o 401 é "credenciais inválidas" e fica com o formulário
    if (isSessionError(error) && error.config?.url !== 'login') {
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
