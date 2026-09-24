import { defineStore } from 'pinia'
import api from '@/config/api'

// Lê o `exp` do JWT sem validar a assinatura (quem valida é o backend).
// Devolve o instante de expiração em ms, ou null se o token não trouxer `exp`.
function tokenExpiraEm(token) {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(payload))
    return typeof exp === 'number' ? exp * 1000 : null
  } catch {
    return null
  }
}

function tokenExpirado(token) {
  const exp = tokenExpiraEm(token)
  return exp !== null && exp <= Date.now()
}

// setTimeout estoura acima de ~24,8 dias
const MAX_TIMEOUT = 2 ** 31 - 1
let expiryTimer = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('nexushub_token') || null,
    user: JSON.parse(localStorage.getItem('nexushub_user') || 'null'),
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.roles === 'admin' || state.user?.roles === 'super',
    isSuper: (state) => state.user?.roles === 'super',
    isMember: (state) => state.user?.roles === 'member',
    currentUser: (state) => state.user,
  },

  actions: {
    async login(userName, password) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('login', { userName, password })
        const { token } = response.data
        this.token = token
        localStorage.setItem('nexushub_token', token)
        this.scheduleExpiry()

        // Busca dados do usuário atual
        await this.fetchMe()
        return true
      } catch (err) {
        this.error = err.response?.data?.message || 'Credenciais inválidas'
        return false
      } finally {
        this.loading = false
      }
    },

    async fetchMe() {
      try {
        const response = await api.get('user/me')
        this.user = response.data
        localStorage.setItem('nexushub_user', JSON.stringify(response.data))
      } catch (err) {
        console.error('Erro ao buscar dados do usuário:', err)
      }
    },

    // Descarta o token se ele já venceu. `isAuthenticated` não serve para isso
    // porque o getter fica em cache e não percebe a passagem do tempo.
    ensureValidSession() {
      if (this.token && tokenExpirado(this.token)) this.logout()
      return !!this.token
    },

    // Desloga sozinho no instante em que o token vence
    scheduleExpiry() {
      clearTimeout(expiryTimer)
      expiryTimer = null
      if (!this.token) return

      const exp = tokenExpiraEm(this.token)
      if (exp === null) return

      const delay = Math.min(Math.max(exp - Date.now(), 0), MAX_TIMEOUT)
      expiryTimer = setTimeout(() => {
        if (!this.ensureValidSession()) {
          import('@/router').then(({ default: router }) => router.replace('/login'))
        } else {
          this.scheduleExpiry()
        }
      }, delay)
    },

    logout() {
      clearTimeout(expiryTimer)
      expiryTimer = null
      this.token = null
      this.user = null
      localStorage.removeItem('nexushub_token')
      localStorage.removeItem('nexushub_user')
    },
  },
})
