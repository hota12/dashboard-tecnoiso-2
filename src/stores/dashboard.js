import { defineStore } from 'pinia'
import api from '@/config/api'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    dashboards: [],
    currentDashboard: null,
    fontsData: {},
    loading: false,
    fontsLoading: {},
    error: null,

    // Filtros globais
    filters: {
      startDate: '',
      endDate: '',
      compareStartDate: '',
      compareEndDate: '',
    },

    // Auto-refresh
    autoRefresh: {
      enabled: false,
      interval: 60, // segundos
      timer: null,
    },

    // Tela cheia
    isFullscreen: false,

    // Preset de datas
    activeDatePreset: null,
  }),

  getters: {
    currentFilters: (state) => state.filters,
    currentFontsData: (state) => state.fontsData,
    isLoading: (state) => state.loading,
    sortedDashboards: (state) => {
      return [...state.dashboards].sort((a, b) => a.name.localeCompare(b.name))
    }
  },

  actions: {
    async fetchDashboards() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('dashboards')
        this.dashboards = response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Erro ao carregar dashboards'
      } finally {
        this.loading = false
      }
    },

    async fetchDashboard(id) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get(`dashboard?id=${id}`)
        this.currentDashboard = response.data
        return response.data
      } catch (err) {
        this.error = err.response?.data?.message || 'Erro ao carregar dashboard'
        return null
      } finally {
        this.loading = false
      }
    },

    async fetchFontData(font) {
      const fontKey = font.url
      this.fontsLoading[fontKey] = true
      try {
        const params = {
          startDate: this.filters.startDate,
          endDate: this.filters.endDate,
        }

        let response
        if (font.method === 'GET') {
          response = await api.get(font.url, { params })
        } else {
          response = await api[font.method.toLowerCase()](font.url, params)
        }

        this.fontsData[fontKey] = response.data
        return response.data
      } catch (err) {
        console.error(`Erro ao buscar fonte ${font.url}:`, err)
        this.fontsData[fontKey] = null
        return null
      } finally {
        this.fontsLoading[fontKey] = false
      }
    },

    async fetchAllFonts() {
      if (!this.currentDashboard?.fonts) return
      const promises = this.currentDashboard.fonts.map((font) => this.fetchFontData(font))
      await Promise.all(promises)
    },

    setFilters(filters) {
      this.filters = { ...this.filters, ...filters }
    },

    setDatePreset(preset) {
      this.activeDatePreset = preset
      const today = new Date()
      const year = today.getFullYear()
      const month = today.getMonth()

      let startDate, endDate, compareStart, compareEnd

      switch (preset) {
        case 'currentMonth':
          startDate = new Date(year, month, 1)
          endDate = new Date(year, month + 1, 0)
          compareStart = new Date(year, month - 1, 1)
          compareEnd = new Date(year, month, 0)
          break
        case 'lastMonth':
          startDate = new Date(year, month - 1, 1)
          endDate = new Date(year, month, 0)
          compareStart = new Date(year, month - 2, 1)
          compareEnd = new Date(year, month - 1, 0)
          break
        case 'currentYear':
          startDate = new Date(year, 0, 1)
          endDate = new Date(year, 11, 31)
          compareStart = new Date(year - 1, 0, 1)
          compareEnd = new Date(year - 1, 11, 31)
          break
        case 'last7':
          startDate = new Date(today)
          startDate.setDate(today.getDate() - 7)
          endDate = today
          compareStart = new Date(today)
          compareStart.setDate(today.getDate() - 14)
          compareEnd = new Date(today)
          compareEnd.setDate(today.getDate() - 7)
          break
        case 'last30':
          startDate = new Date(today)
          startDate.setDate(today.getDate() - 30)
          endDate = today
          compareStart = new Date(today)
          compareStart.setDate(today.getDate() - 60)
          compareEnd = new Date(today)
          compareEnd.setDate(today.getDate() - 30)
          break
        default:
          return
      }

      const fmt = (d) => d.toISOString().split('T')[0]
      this.filters = {
        startDate: fmt(startDate),
        endDate: fmt(endDate),
        compareStartDate: fmt(compareStart),
        compareEndDate: fmt(compareEnd),
      }
    },

    startAutoRefresh(seconds) {
      this.stopAutoRefresh()
      this.autoRefresh.enabled = true
      this.autoRefresh.interval = seconds
      this.autoRefresh.timer = setInterval(() => {
        this.fetchAllFonts()
      }, seconds * 1000)
    },

    stopAutoRefresh() {
      if (this.autoRefresh.timer) {
        clearInterval(this.autoRefresh.timer)
        this.autoRefresh.timer = null
      }
      this.autoRefresh.enabled = false
    },

    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen
      if (this.isFullscreen) {
        document.documentElement.requestFullscreen?.()
      } else {
        document.exitFullscreen?.()
      }
    },

    async createDashboard(payload) {
      try {
        const response = await api.post('dashboard', payload)
        this.dashboards.push(response.data)
        return response.data
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Erro ao criar dashboard')
      }
    },

    async updateDashboard(id, payload) {
      try {
        const response = await api.put(`dashboard?id=${id}`, payload)
        const updated = response.data ?? { ...payload, id }
        // Atualiza na lista
        const idx = this.dashboards.findIndex(d => d.id === id)
        if (idx !== -1) this.dashboards[idx] = { ...this.dashboards[idx], ...updated }
        // Atualiza o dashboard atual se for o mesmo
        if (this.currentDashboard?.id === id) {
          this.currentDashboard = { ...this.currentDashboard, ...updated }
        }
        return updated
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Erro ao atualizar dashboard')
      }
    },

    async deleteDashboard(id) {
      try {
        await api.delete(`dashboard?id=${id}`)
        this.dashboards = this.dashboards.filter((d) => d.id !== id)
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Erro ao excluir dashboard')
      }
    },

    async updatePermissions(id, usersIds) {
      try {
        await api.put(`dashboard/permission?id=${id}`, { UsersIds: usersIds })
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Erro ao atualizar permissões')
      }
    },

    async addFont(payload) {
      try {
        const response = await api.put('dashboard/font', payload)
        const saved = response.data ?? payload

        if (this.currentDashboard && this.currentDashboard.id === payload.dashboardId) {
          if (!this.currentDashboard.fonts) this.currentDashboard.fonts = []

          // Upsert pela URL — mesma lógica da API
          const idx = this.currentDashboard.fonts.findIndex(f => f.url === payload.url)
          if (idx !== -1) {
            this.currentDashboard.fonts[idx] = { ...this.currentDashboard.fonts[idx], ...saved }
          } else {
            this.currentDashboard.fonts.push(saved)
          }
        }
        return saved
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Erro ao salvar fonte')
      }
    },

    async removeFont(dashboardId, fontUrl) {
      try {
        await api.delete('dashboard/font', { data: { url: fontUrl } })
        if (this.currentDashboard?.fonts) {
          this.currentDashboard.fonts = this.currentDashboard.fonts.filter(f => f.url !== fontUrl)
        }
        delete this.fontsData[fontUrl]
      } catch (err) {
        throw new Error(err.response?.data?.message || 'Erro ao remover fonte')
      }
    },

    clearCurrentDashboard() {
      this.currentDashboard = null
      this.fontsData = {}
      this.stopAutoRefresh()
    },
  },
})
