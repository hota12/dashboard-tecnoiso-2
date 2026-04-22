<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed, 'is-fullscreen': isFullscreen, 'sidebar-open': sidebarOpen }">
    <!-- Mobile overlay -->
    <div v-if="sidebarOpen" class="sidebar-overlay" @click="sidebarOpen = false"></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <!-- Logo area -->
      <div class="sidebar-logo">
        <transition name="fade-logo" mode="out-in">
          <img
            v-if="sidebarCollapsed"
            key="symbol"
            src="/simbolo.png"
            alt="NexusHub"
            class="logo-symbol"
          />
          <img
            v-else
            key="logo"
            src="/logo.png"
            alt="NexusHub"
            class="logo-full"
          />
        </transition>
      </div>

      <!-- Toggle button -->
      <button class="sidebar-toggle" @click="toggleSidebar">
        <i :class="sidebarCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
      </button>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <!-- Dashboards -->
        <div class="nav-section">
          <div class="nav-section-header">
            <p v-if="!sidebarCollapsed" class="nav-section-title">Dashboards</p>
            <button
              v-if="authStore.isAdmin"
              class="nav-add-btn"
              @click="showCreateDashModal = true"
              data-tooltip="Novo dashboard"
            ><i class="bi bi-plus-lg"></i></button>
          </div>
          <div
            v-if="dashboardStore.loading && !dashboardStore.dashboards.length"
            class="nav-skeletons"
          >
            <div class="skeleton nav-skeleton" v-for="i in 3" :key="i"></div>
          </div>
          <router-link
            v-for="dash in dashboardStore.sortedDashboards"
            :key="dash.id"
            :to="`/dashboard/${dash.id}`"
            class="nav-item"
            :class="{ active: $route.params.id === dash.id }"
            :data-tooltip="sidebarCollapsed ? dash.name : undefined"
          >
            <i class="bi bi-graph-up-arrow"></i>
            <span v-if="!sidebarCollapsed" class="nav-label">{{ dash.name }}</span>
          </router-link>

          <div v-if="!dashboardStore.loading && !dashboardStore.dashboards.length" class="nav-empty">
            <span v-if="!sidebarCollapsed">Nenhum dashboard</span>
          </div>
        </div>

        <!-- Admin section: visível apenas para admin/super -->
        <div v-if="authStore.isAdmin" class="nav-section">
          <p v-if="!sidebarCollapsed" class="nav-section-title">Administração</p>
          <router-link
            to="/users"
            class="nav-item"
            :class="{ active: $route.path === '/users' }"
            :data-tooltip="sidebarCollapsed ? 'Usuários' : undefined"
          >
            <i class="bi bi-people"></i>
            <span v-if="!sidebarCollapsed" class="nav-label">Usuários</span>
          </router-link>
        </div>

        <!-- Goals -->
        <div class="nav-section">
          <p v-if="!sidebarCollapsed" class="nav-section-title">Metas</p>
          <router-link
            to="/goals"
            class="nav-item"
            :class="{ active: $route.path === '/goals' }"
            :data-tooltip="sidebarCollapsed ? 'Metas' : undefined"
          >
            <i class="bi bi-bullseye"></i>
            <span v-if="!sidebarCollapsed" class="nav-label">Metas</span>
          </router-link>
        </div>
      </nav>

      <!-- User & Logout -->
      <div class="sidebar-footer">
        <div v-if="!sidebarCollapsed" class="sidebar-user">
          <div class="user-avatar">{{ userInitial }}</div>
          <div class="user-info">
            <p class="user-name">{{ authStore.currentUser?.name }}</p>
            <p class="user-role">
              <span class="role-badge" :class="'role-' + authStore.currentUser?.roles">
                {{ roleLabel }}
              </span>
            </p>
          </div>
        </div>
        <button
          class="logout-btn"
          @click="handleLogout"
          :data-tooltip="sidebarCollapsed ? 'Sair' : undefined"
        >
          <i class="bi bi-box-arrow-left"></i>
          <span v-if="!sidebarCollapsed">Sair</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="main-content">
      <!-- Mobile topbar -->
      <div class="mobile-topbar">
        <button class="hamburger-btn" @click="sidebarOpen = !sidebarOpen">
          <i :class="sidebarOpen ? 'bi bi-x-lg' : 'bi bi-list'"></i>
        </button>
        <img src="/logo.png" alt="NexusHub" class="mobile-logo" />
      </div>
      <router-view />
    </main>
  </div>

  <!-- Modal: Criar Dashboard -->
  <teleport to="body">
    <div v-if="showCreateDashModal" class="modal-overlay" @click.self="closeCreateDash">
      <div class="modal">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:34px;height:34px;border-radius:8px;background:rgba(223,166,37,0.12);color:var(--color-btn-bg);display:flex;align-items:center;justify-content:center">
              <i class="bi bi-bar-chart-line-fill"></i>
            </div>
            <h3 class="modal-title">Novo Dashboard</h3>
          </div>
          <button class="btn btn-ghost btn-icon" @click="closeCreateDash"><i class="bi bi-x-lg"></i></button>
        </div>

        <div v-if="createDash.error" class="alert alert-danger" style="margin-bottom:16px">
          <i class="bi bi-exclamation-circle-fill"></i> {{ createDash.error }}
        </div>

        <form @submit.prevent="submitCreateDash">
          <div class="modal-form">
            <div class="form-group">
              <label class="form-label">Nome do Dashboard *</label>
              <input
                v-model="createDash.name"
                type="text"
                class="form-input"
                placeholder="Ex: Vendas Mensais"
                required
                autofocus
              />
            </div>
            <div class="form-group">
              <label class="form-label">Componente Vue *</label>
              <input
                v-model="createDash.vueComponent"
                type="text"
                class="form-input"
                placeholder="Ex: VendasDashboard"
                required
              />
              <p style="font-size:11px;color:var(--color-placeholder);margin-top:4px">
                <i class="bi bi-info-circle"></i>
                Nome do arquivo em <code>src/dashboards/</code> sem o <code>.vue</code>
              </p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeCreateDash">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="createDash.saving">
              <span v-if="createDash.saving" class="spinner"></span>
              <span v-else><i class="bi bi-plus-lg"></i> Criar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

const sidebarCollapsed = ref(false)
const sidebarOpen = ref(false)
const isFullscreen = computed(() => dashboardStore.isFullscreen)

// Fecha sidebar mobile ao navegar
watch(() => route.path, () => { sidebarOpen.value = false })

// ---- Create Dashboard Modal ----
const showCreateDashModal = ref(false)
const createDash = reactive({ name: '', vueComponent: '', error: '', saving: false })

function closeCreateDash() {
  showCreateDashModal.value = false
  createDash.name = ''; createDash.vueComponent = ''; createDash.error = ''
}

async function submitCreateDash() {
  createDash.saving = true; createDash.error = ''
  try {
    await dashboardStore.createDashboard({ name: createDash.name, vueComponent: createDash.vueComponent })
    closeCreateDash()
  } catch (err) {
    createDash.error = err.message
  } finally {
    createDash.saving = false
  }
}

const userInitial = computed(() => {
  const name = authStore.currentUser?.name || authStore.currentUser?.userName || '?'
  return name.charAt(0).toUpperCase()
})

const roleLabel = computed(() => {
  const roles = {
    super: 'Super',
    admin: 'Admin',
    member: 'Membro',
  }
  return roles[authStore.currentUser?.roles] || authStore.currentUser?.roles
})

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebar_collapsed', sidebarCollapsed.value)
}

async function handleLogout() {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  const saved = localStorage.getItem('sidebar_collapsed')
  if (saved !== null) sidebarCollapsed.value = saved === 'true'
  // Sempre re-valida o usuário com a API no carregamento da página
  if (authStore.token) {
    authStore.fetchMe() // sem await — roda em background, já há dados no localStorage
  }
  await dashboardStore.fetchDashboards()
})
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--color-bg);
}

/* ---- Sidebar ---- */
.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-width);
  background-color: var(--color-sidebar-bg);
  color: var(--color-sidebar-text);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-normal), min-width var(--transition-normal);
  position: relative;
  z-index: 100;
  box-shadow: var(--shadow-sidebar);
  overflow: hidden;
}

.sidebar.collapsed {
  width: var(--sidebar-collapsed);
  min-width: var(--sidebar-collapsed);
}

/* Logo */
.sidebar-logo {
  padding: 20px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo-full {
  height: 38px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  animation: fadeIn var(--transition-normal);
}

.logo-symbol {
  height: 36px;
  width: 36px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  animation: fadeIn var(--transition-normal);
}

/* Toggle */
.sidebar-toggle {
  position: absolute;
  top: 24px;
  right: -14px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--color-btn-bg);
  color: var(--color-btn-text);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all var(--transition-fast);
  z-index: 10;
}
.sidebar-toggle:hover {
  background: #c9931f;
  transform: scale(1.1);
}

/* Nav */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}
.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-full);
}

.nav-section {
  padding: 0 8px;
  margin-bottom: 8px;
}

.nav-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 4px;
}

.nav-add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-sm);
  background: rgba(255, 255, 255, 0.08);
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 12px;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}
.nav-add-btn:hover {
  background: var(--color-btn-bg);
  color: var(--color-btn-text);
}

.nav-section-title {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.4);
  padding: 8px 8px 4px;
  white-space: nowrap;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  color: rgba(255, 255, 255, 0.75);
  font-size: var(--font-sm);
  font-weight: 600;
  transition: all var(--transition-fast);
  white-space: nowrap;
  cursor: pointer;
  position: relative;
}

.nav-item i {
  font-size: 18px;
  min-width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.nav-item:hover {
  background: var(--color-sidebar-hover);
  color: #fff;
}

.nav-item.active {
  background: var(--color-sidebar-active);
  color: var(--color-btn-bg);
  border-left: 3px solid var(--color-sidebar-active-border);
  padding-left: 9px;
}

.nav-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-skeletons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 0;
}

.nav-skeleton {
  height: 38px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  animation: skeleton-pulse 1.5s infinite;
}

.nav-empty {
  padding: 8px 12px;
  font-size: var(--font-xs);
  color: rgba(255, 255, 255, 0.35);
}

/* Footer */
.sidebar-footer {
  padding: 12px 8px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.user-avatar {
  width: 36px;
  height: 36px;
  min-width: 36px;
  border-radius: 50%;
  background: var(--color-btn-bg);
  color: var(--color-btn-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: var(--font-sm);
}

.user-info {
  overflow: hidden;
}

.user-name {
  font-size: var(--font-sm);
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  margin-top: 2px;
}

.role-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}
.role-badge.role-super {
  background: rgba(223, 166, 37, 0.25);
  color: var(--color-btn-bg);
}
.role-badge.role-admin {
  background: rgba(30, 136, 229, 0.2);
  color: #90caf9;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-sm);
  font-weight: 600;
  width: 100%;
  transition: all var(--transition-fast);
  white-space: nowrap;
}
.logout-btn:hover {
  background: rgba(229, 57, 53, 0.2);
  color: #ef9a9a;
}
.logout-btn i {
  font-size: 18px;
  min-width: 20px;
  text-align: center;
}

/* ---- Main content ---- */
.main-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background: var(--color-bg);
}

/* Fullscreen */
.app-layout.is-fullscreen .sidebar {
  display: none;
}

/* Fade logo transition */
.fade-logo-enter-active,
.fade-logo-leave-active {
  transition: opacity 0.15s ease;
}
.fade-logo-enter-from,
.fade-logo-leave-to {
  opacity: 0;
}

/* Tooltip override for sidebar dark bg */
.sidebar [data-tooltip]::after {
  left: calc(100% + 10px);
  bottom: 50%;
  transform: translateY(50%);
  background: #1a1a1a;
  white-space: nowrap;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 4px;
}

/* ============================
   RESPONSIVE
   ============================ */

/* Mobile topbar - escondido em desktop */
.mobile-topbar {
  display: none;
}

/* Tablet: sidebar sempre collapsed */
@media (max-width: 1024px) and (min-width: 769px) {
  .sidebar {
    width: var(--sidebar-collapsed) !important;
    min-width: var(--sidebar-collapsed) !important;
  }
  .sidebar-toggle { display: none; }
}

/* Mobile: sidebar vira drawer overlay */
@media (max-width: 768px) {
  .mobile-topbar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #fff;
    border-bottom: 1px solid var(--color-card-border);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .mobile-logo {
    height: 28px;
    object-fit: contain;
    filter: brightness(0);
  }

  .hamburger-btn {
    width: 38px;
    height: 38px;
    border-radius: var(--radius-md);
    background: var(--color-card-bg);
    border: 1px solid var(--color-card-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    color: var(--color-text);
    flex-shrink: 0;
  }

  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 199;
    backdrop-filter: blur(2px);
  }

  .sidebar {
    position: fixed !important;
    top: 0;
    left: 0;
    height: 100dvh;
    width: var(--sidebar-width) !important;
    min-width: var(--sidebar-width) !important;
    z-index: 200;
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
    box-shadow: 4px 0 32px rgba(0, 0, 0, 0.25);
  }

  .sidebar-open .sidebar {
    transform: translateX(0);
  }

  .sidebar-toggle { display: none; }

  .main-content {
    width: 100%;
  }
}
</style>
