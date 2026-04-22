import { defineStore } from 'pinia'
import api from '@/config/api'

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

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('nexushub_token')
      localStorage.removeItem('nexushub_user')
    },
  },
})
