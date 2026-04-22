import { defineStore } from 'pinia'
import api from '@/config/api'

export const useUsersStore = defineStore('users', {
  state: () => ({
    users: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchUsers() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('users')
        this.users = response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Erro ao carregar usuários'
      } finally {
        this.loading = false
      }
    },

    async createUser(payload) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('users/create', payload)
        this.users.push(response.data)
        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Erro ao criar usuário'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateUser(id, payload) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put(`user/update?id=${id}`, payload)
        const idx = this.users.findIndex((u) => u.id === id)
        if (idx !== -1) this.users[idx] = { ...this.users[idx], ...response.data }
        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Erro ao atualizar usuário'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updatePassword(id, password) {
      this.loading = true
      this.error = null
      try {
        await api.put(`user/password?id=${id}`, { password })
      } catch (err) {
        this.error = err.response?.data?.message || 'Erro ao atualizar senha'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteUser(userName) {
      this.loading = true
      this.error = null
      try {
        await api.delete('user', { data: { userName } })
        this.users = this.users.filter((u) => u.userName !== userName)
      } catch (err) {
        this.error = err.response?.data?.message || 'Erro ao excluir usuário'
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})
