import { defineStore } from 'pinia'
import api from '@/config/api'

export const useGoalsStore = defineStore('goals', {
  state: () => ({
    goals: [],
    loading: false,
    error: null,
    selectedYear: new Date().getFullYear().toString(),
  }),

  getters: {
    goalsByUserAndYear: (state) => {
      return state.goals.filter((g) => g.year === state.selectedYear)
    },

    getGoalByUserMonthYear: (state) => (userId, month, year) => {
      return state.goals.find(
        (g) => String(g.userId) === String(userId) && g.month === month && g.year === (year || state.selectedYear)
      )
    },
  },

  actions: {
    async fetchGoals() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('goals')
        this.goals = response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Erro ao carregar metas'
      } finally {
        this.loading = false
      }
    },

    async createGoal(payload) {
      this.loading = true
      this.error = null
      try {
        const response = await api.post('goal', payload)
        this.goals.push(response.data)
        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Erro ao criar meta'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateGoal(payload) {
      this.loading = true
      this.error = null
      try {
        const response = await api.put('goal', payload)
        const idx = this.goals.findIndex((g) => g.id === payload.id)
        if (idx !== -1) this.goals[idx] = { ...this.goals[idx], ...response.data }
        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Erro ao atualizar meta'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteGoal(id) {
      this.loading = true
      this.error = null
      try {
        await api.delete(`goal?id=${id}`)
        this.goals = this.goals.filter((g) => g.id !== id)
      } catch (err) {
        this.error = err.response?.data?.message || 'Erro ao excluir meta'
        throw err
      } finally {
        this.loading = false
      }
    },

    setYear(year) {
      this.selectedYear = year.toString()
    },
  },
})
