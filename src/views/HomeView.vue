<template>
  <div class="home-view">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Início</h1>
        <p class="page-subtitle">Selecione um dashboard para começar</p>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="dashboardStore.loading" class="dashboard-grid">
      <div
        v-for="i in 6"
        :key="i"
        class="skeleton dashboard-card-skeleton"
      ></div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!dashboardStore.dashboards.length"
      class="empty-state"
    >
      <i class="bi bi-bar-chart-line"></i>
      <p>Nenhum dashboard disponível</p>
      <span class="text-xs text-muted">Entre em contato com o administrador</span>
    </div>

    <!-- Dashboard grid -->
    <div v-else class="dashboard-grid">
      <router-link
        v-for="dash in dashboardStore.dashboards"
        :key="dash.id"
        :to="`/dashboard/${dash.id}`"
        class="dashboard-card"
      >
        <div class="dashboard-card-icon">
          <i class="bi bi-graph-up-arrow"></i>
        </div>
        <div class="dashboard-card-info">
          <h3 class="dashboard-card-name">{{ dash.name }}</h3>
          <p class="dashboard-card-component text-xs text-muted">
            <i class="bi bi-puzzle"></i> {{ dash.vueComponent }}
          </p>
        </div>
        <div class="dashboard-card-arrow">
          <i class="bi bi-arrow-right"></i>
        </div>
      </router-link>
    </div>

    <!-- Welcome message -->
    <div class="welcome-banner">
      <div class="welcome-banner-content">
        <i class="bi bi-stars"></i>
        <div>
          <h3>Olá, {{ authStore.currentUser?.name || 'usuário' }}!</h3>
          <p>Você está conectado como <strong>{{ roleLabel }}</strong>. Use o menu lateral para navegar.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'

const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

const roleLabel = computed(() => {
  const roles = { super: 'Super Admin', admin: 'Administrador', member: 'Membro' }
  return roles[authStore.currentUser?.roles] || authStore.currentUser?.roles
})

onMounted(() => {
  if (!dashboardStore.dashboards.length) {
    dashboardStore.fetchDashboards()
  }
})
</script>

<style scoped>
.home-view {
  padding: 32px;
  max-width: 1200px;
  animation: slideUp var(--transition-normal);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.dashboard-card-skeleton {
  height: 100px;
  border-radius: var(--radius-lg);
}

.dashboard-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--color-card-bg);
  border: 1.5px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  transition: all var(--transition-fast);
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.dashboard-card:hover {
  border-color: var(--color-btn-bg);
  box-shadow: 0 4px 20px rgba(223, 166, 37, 0.15);
  transform: translateY(-2px);
}

.dashboard-card-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: rgba(223, 166, 37, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-btn-bg);
  font-size: 22px;
  flex-shrink: 0;
}

.dashboard-card-info {
  flex: 1;
  min-width: 0;
}

.dashboard-card-name {
  font-size: var(--font-md);
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dashboard-card-component {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dashboard-card-arrow {
  color: var(--color-placeholder);
  font-size: 18px;
  transition: all var(--transition-fast);
}

.dashboard-card:hover .dashboard-card-arrow {
  color: var(--color-btn-bg);
  transform: translateX(4px);
}

/* Welcome banner */
.welcome-banner {
  background: linear-gradient(135deg, var(--color-sidebar-bg) 0%, #454545 100%);
  border-radius: var(--radius-xl);
  padding: 24px 28px;
  margin-top: 8px;
  color: #fff;
  box-shadow: 0 4px 20px rgba(49, 49, 49, 0.2);
}

.welcome-banner-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.welcome-banner-content > i {
  font-size: 36px;
  color: var(--color-btn-bg);
  flex-shrink: 0;
}

.welcome-banner-content h3 {
  font-size: var(--font-lg);
  font-weight: 700;
  margin-bottom: 4px;
}

.welcome-banner-content p {
  font-size: var(--font-sm);
  color: rgba(255, 255, 255, 0.7);
}

.welcome-banner-content strong {
  color: var(--color-btn-bg);
}
</style>
