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

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <!-- Dashboards -->
        <div class="nav-section">
          <div class="nav-section-header">
            <p v-if="!sidebarCollapsed" class="nav-section-title">Dashboards</p>
            <button
              v-if="authStore.isSuper"
              class="nav-add-btn"
              @click="showCreateDashModal = true"
              data-tooltip="Novo dashboard"
            ><i class="bi bi-plus-lg"></i></button>
          </div>
          <template v-if="!sidebarCollapsed">
            <div
              v-if="dashboardStore.loading && !dashboardStore.dashboards.length"
              class="nav-skeletons"
            >
              <div class="skeleton nav-skeleton" v-for="i in 3" :key="i"></div>
            </div>
            <router-link
              v-for="dash in visibleDashboards"
              :key="dash.id"
              :to="`/dashboard/${dash.id}`"
              class="nav-item"
              :class="{ active: $route.params.id === dash.id }"
            >
              <span class="nav-label">{{ dash.name }}</span>
            </router-link>

            <button
              v-if="hasMoreDashboards"
              @click="showAllDashboards = !showAllDashboards"
              style="display: flex; align-items: center; gap: 12px; padding: 6px 12px; background: transparent; border: none; color: rgba(255, 255, 255, 0.5); cursor: pointer; font-size: 12px; margin-top: 2px; width: 100%; text-align: left;"
            >
              <i :class="showAllDashboards ? 'bi bi-chevron-up' : 'bi bi-chevron-down'" style="min-width: 20px; text-align: center; font-size: 12px;"></i>
              <span class="nav-label">{{ showAllDashboards ? 'Ver menos' : 'Ver mais' }}</span>
            </button>
  
            <div v-if="!dashboardStore.loading && !dashboardStore.dashboards.length" class="nav-empty">
              <span>Nenhum dashboard</span>
            </div>
          </template>
          <template v-else>
            <div class="nav-item" @click="toggleSidebar" data-tooltip="Dashboards">
              <i class="bi bi-grid-1x2"></i>
            </div>
          </template>
        </div>

        <!-- Novas Dashboards -->
        <div class="nav-section">
          <p v-if="!sidebarCollapsed" class="nav-section-title">Expanda seu negócio</p>
          <button
            class="nav-item explore-btn"
            @click="showExploreModal = true"
            :data-tooltip="sidebarCollapsed ? 'Novas dashboards' : undefined"
          >
            <i class="bi bi-stars" style="color: var(--color-btn-bg)"></i>
            <span v-if="!sidebarCollapsed" class="nav-label">Novas dashboards</span>
          </button>
        </div>

        <!-- Admin section: visível apenas para admin/super -->
        <div v-if="authStore.isSuper" class="nav-section">
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
        <div class="sidebar-actions">
          <button
            class="footer-btn footer-btn-danger"
            @click="showLogoutModal = true"
            :data-tooltip="sidebarCollapsed ? 'Sair' : undefined"
          >
            <i class="bi bi-box-arrow-left"></i>
            <span v-if="!sidebarCollapsed">Sair</span>
          </button>
          
          <button
            class="footer-btn"
            @click="showHelpModal = true"
            :data-tooltip="sidebarCollapsed ? 'Ajuda' : undefined"
          >
            <i class="bi bi-question-circle"></i>
            <span v-if="!sidebarCollapsed">Ajuda</span>
          </button>

          <button
            class="footer-btn icon-only-btn"
            @click="showAboutModal = true"
            data-tooltip="Sobre"
          >
            <i class="bi bi-info-circle"></i>
          </button>
        </div>
      </div>
    </aside>

    <!-- Toggle button (fora da sidebar para não ser cortado pelo overflow:hidden) -->
    <button class="sidebar-toggle" @click="toggleSidebar">
      <i :class="sidebarCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
    </button>

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

  <!-- Modal: Explorar Novas Dashboards -->
  <teleport to="body">
    <div v-if="showExploreModal" class="modal-overlay" @click.self="showExploreModal = false">
      <div class="modal">
        <div class="modal-header">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:34px;height:34px;border-radius:8px;background:rgba(223,166,37,0.12);color:var(--color-btn-bg);display:flex;align-items:center;justify-content:center">
              <i class="bi bi-rocket-takeoff-fill"></i>
            </div>
            <h3 class="modal-title">Explore Novos Setores</h3>
          </div>
          <button class="btn btn-secondary btn-icon" @click="showExploreModal = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body">
          <p style="color: var(--color-text); margin-bottom: 20px; font-size: 15px; line-height: 1.5;">
            Leve o poder dos dados para todos os departamentos da sua empresa. Veja quais outros setores podemos integrar a suas dashboards:
          </p>
          
          <div class="sectors-grid">
            <div class="sector-card">
              <i class="bi bi-people-fill" style="color: #4CAF50"></i>
              <h4>Recursos Humanos</h4>
              <p>Turnover, absenteísmo, folha e produtividade.</p>
            </div>
            <div class="sector-card">
              <i class="bi bi-cash-stack" style="color: #2196F3"></i>
              <h4>Financeiro</h4>
              <p>Fluxo de caixa, DRE em tempo real e inadimplência.</p>
            </div>
            <div class="sector-card">
              <i class="bi bi-box-seam-fill" style="color: #FF9800"></i>
              <h4>Estoque & Logística</h4>
              <p>Giro de estoque, custos de frete e ruptura.</p>
            </div>
            <div class="sector-card">
              <i class="bi bi-headset" style="color: #9C27B0"></i>
              <h4>Suporte / CS</h4>
              <p>NPS, tempo de resposta (SLA) e retenção.</p>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px; align-items: center;">
          <a
            href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20as%20novas%20dashboards%20para%20outros%20setores!"
            target="_blank"
            class="btn btn-primary"
            style="width: 100%; justify-content: center; padding: 12px; font-size: 15px; background: #25D366; color: #fff; border: none; font-weight: bold;"
          >
            <i class="bi bi-whatsapp" style="margin-right: 8px; font-size: 18px;"></i> Falar com Especialista
          </a>
          <button class="btn btn-secondary" @click="showExploreModal = false" style="width: 100%; justify-content: center; border: none; background: transparent;">
            Talvez mais tarde
          </button>
        </div>
      </div>
    </div>
  </teleport>

  <!-- Modal: Ajuda -->
  <teleport to="body">
    <div v-if="showHelpModal" class="modal-overlay" @click.self="showHelpModal = false">
      <div class="modal" style="max-width: 360px; text-align: center;">
        <div class="modal-header" style="justify-content: flex-end; border-bottom: none; padding-bottom: 0;">
          <button class="btn btn-secondary btn-icon" @click="showHelpModal = false" style="background: transparent; border: none; box-shadow: none;">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body" style="padding-top: 0; padding-bottom: 32px;">
          <div style="width: 72px; height: 72px; background: rgba(37, 211, 102, 0.1); color: #25D366; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 16px;">
            <i class="bi bi-headset"></i>
          </div>
          <h3 style="margin-bottom: 4px; font-weight: 800; color: var(--color-text); font-size: 22px;">Como podemos ajudar?</h3>
          <p style="color: var(--color-placeholder); font-size: 13px; margin-bottom: 24px;">Escolha o departamento com o qual deseja falar pelo WhatsApp.</p>
          
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20preciso%20falar%20com%20o%20suporte%20t%C3%A9cnico."
              target="_blank"
              class="btn btn-primary"
              style="width: 100%; justify-content: center; padding: 12px; font-size: 14px; background: #25D366; color: #fff; border: none; font-weight: bold;"
            >
              <i class="bi bi-whatsapp" style="margin-right: 8px; font-size: 18px;"></i> Suporte Técnico
            </a>
            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20preciso%20falar%20com%20o%20suporte%20financeiro."
              target="_blank"
              class="btn btn-primary"
              style="width: 100%; justify-content: center; padding: 12px; font-size: 14px; background: #25D366; color: #fff; border: none; font-weight: bold;"
            >
              <i class="bi bi-whatsapp" style="margin-right: 8px; font-size: 18px;"></i> Suporte Financeiro
            </a>
          </div>
        </div>
      </div>
    </div>
  </teleport>

  <!-- Modal: Sobre / Info -->
  <teleport to="body">
    <div v-if="showAboutModal" class="modal-overlay" @click.self="showAboutModal = false">
      <div class="modal" style="max-width: 360px; text-align: center;">
        <div class="modal-header" style="justify-content: flex-end; border-bottom: none; padding-bottom: 0;">
          <button class="btn btn-secondary btn-icon" @click="showAboutModal = false" style="background: transparent; border: none; box-shadow: none;">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body" style="padding-top: 0; padding-bottom: 32px;">
          <div style="width: 72px; height: 72px; background: rgba(223,166,37,0.1); color: var(--color-btn-bg); border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 16px;">
            <i class="bi bi-braces"></i>
          </div>
          <h3 style="margin-bottom: 4px; font-weight: 800; color: var(--color-text); font-size: 24px;">NexusHub <span style="font-weight: 400; color: var(--color-placeholder);">+</span> AIICO</h3>
          <p style="color: var(--color-placeholder); font-size: 13px; margin-bottom: 24px;">Transformando dados em decisões de sucesso.</p>
          
          <div style="background: var(--color-bg); border: 1px solid var(--color-card-border); border-radius: 12px; padding: 20px;">
            <p style="font-size: 11px; color: var(--color-placeholder); margin-bottom: 6px; text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Desenvolvido por</p>
            <p style="font-size: 18px; color: var(--color-text); font-weight: 700; margin: 0;">AIICO</p>
          </div>
        </div>
      </div>
    </div>
  </teleport>

  <!-- Modal: Sair / Logout -->
  <teleport to="body">
    <div v-if="showLogoutModal" class="modal-overlay" @click.self="showLogoutModal = false">
      <div class="modal" style="max-width: 320px; text-align: center;">
        <div class="modal-header" style="justify-content: flex-end; border-bottom: none; padding-bottom: 0;">
          <button class="btn btn-secondary btn-icon" @click="showLogoutModal = false" style="background: transparent; border: none; box-shadow: none;">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body" style="padding-top: 0; padding-bottom: 24px;">
          <div style="width: 64px; height: 64px; background: rgba(229, 57, 53, 0.1); color: #e53935; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px;">
            <i class="bi bi-box-arrow-right"></i>
          </div>
          <h3 style="margin-bottom: 8px; font-weight: 800; color: var(--color-text); font-size: 20px;">Deseja mesmo sair?</h3>
          <p style="color: var(--color-placeholder); font-size: 13px; margin-bottom: 24px;">Você precisará fazer login novamente para acessar seus dashboards.</p>
          
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="btn btn-secondary" @click="showLogoutModal = false" style="flex: 1;">Cancelar</button>
            <button class="btn btn-primary" @click="confirmLogout" style="flex: 1; background: #e53935; border-color: #e53935; color: white;">Sair</button>
          </div>
        </div>
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

const showAllDashboards = ref(false)
const visibleDashboards = computed(() => {
  if (showAllDashboards.value) {
    return dashboardStore.sortedDashboards
  }
  return dashboardStore.sortedDashboards.slice(0, 8)
})
const hasMoreDashboards = computed(() => dashboardStore.sortedDashboards.length > 8)

// Fecha sidebar mobile ao navegar
watch(() => route.path, () => { sidebarOpen.value = false })

// ---- Create Dashboard Modal ----
const showCreateDashModal = ref(false)
const showExploreModal = ref(false)
const showAboutModal = ref(false)
const showHelpModal = ref(false)
const showLogoutModal = ref(false)
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

async function confirmLogout() {
  showLogoutModal.value = false
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
  position: relative;
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
  animation: fadeIn var(--transition-normal);
}

.logo-symbol {
  height: 36px;
  width: 36px;
  object-fit: contain;
  animation: fadeIn var(--transition-normal);
}

/* Toggle — posicionado em relação ao .app-layout, fora do overflow:hidden da sidebar */
.sidebar-toggle {
  position: absolute;
  top: 24px;
  left: calc(var(--sidebar-width) - 14px);
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
  transition: left var(--transition-normal), opacity var(--transition-fast), background var(--transition-fast), transform var(--transition-fast);
  z-index: 101;
  /* oculto por padrão */
  opacity: 0;
  pointer-events: none;
}
.sidebar-collapsed .sidebar-toggle {
  left: calc(var(--sidebar-collapsed) - 14px);
}
/* aparece quando o mouse está sobre a sidebar OU sobre o próprio botão */
.sidebar:hover ~ .sidebar-toggle,
.sidebar-toggle:hover {
  opacity: 1;
  pointer-events: auto;
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

.nav-initial {
  font-size: 14px;
  font-weight: 800;
  min-width: 20px;
  text-align: center;
  flex-shrink: 0;
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

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}
.sidebar.collapsed .nav-item.active {
  padding-right: 3px; /* Compensates for the 3px left border to keep the icon optically centered */
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

.sidebar-actions {
  display: flex;
  flex-direction: row;
  gap: 4px;
  width: 100%;
}
.sidebar.collapsed .sidebar-actions {
  flex-direction: column;
}

.footer-btn {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-sm);
  font-weight: 600;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.footer-btn.icon-only-btn {
  flex: 0 0 auto;
}

.sidebar.collapsed .footer-btn {
  justify-content: center;
  padding: 10px;
  width: 100%;
}

.footer-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.footer-btn.footer-btn-danger:hover {
  background: rgba(229, 57, 53, 0.2);
  color: #ef9a9a;
}

.footer-btn i {
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

/* When expanded, tooltip for footer buttons should be above to avoid clipping */
.sidebar:not(.collapsed) .footer-btn[data-tooltip]::after {
  left: 50%;
  bottom: calc(100% + 10px);
  transform: translateX(-50%);
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
    background: var(--color-sidebar-bg);
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .mobile-logo {
    height: 28px;
    object-fit: contain;
    margin-left: auto;
  }

  .hamburger-btn {
    width: 38px;
    height: 38px;
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    cursor: pointer;
    color: var(--color-sidebar-text);
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

/* ---- Explore CSS ---- */
.explore-btn {
  width: 100%;
  text-align: left;
  border: 1px solid rgba(223, 166, 37, 0.2);
  background: rgba(223, 166, 37, 0.05);
  box-shadow: 0 4px 12px rgba(223, 166, 37, 0.1);
}
.explore-btn:hover {
  background: rgba(223, 166, 37, 0.12) !important;
  border-color: rgba(223, 166, 37, 0.4);
}

.sidebar.collapsed .explore-btn {
  border-color: transparent;
  background: transparent;
  box-shadow: none;
}
.sidebar.collapsed .explore-btn:hover {
  background: var(--color-sidebar-hover) !important;
  border-color: transparent;
}
.explore-badge {
  margin-left: auto;
  font-size: 10px;
  background: linear-gradient(135deg, #dfa625, #f3c35b);
  color: #1a1a1a;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 800;
  animation: pulseBadge 2s infinite;
}
@keyframes pulseBadge {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.sectors-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.sector-card {
  background: var(--color-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-md);
  padding: 16px;
  text-align: center;
  transition: transform 0.2s, border-color 0.2s;
}
.sector-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-btn-bg);
}
.sector-card i {
  font-size: 24px;
  margin-bottom: 12px;
  display: inline-block;
}
.sector-card h4 {
  font-size: 14px;
  color: var(--color-text);
  margin: 0 0 8px 0;
  font-weight: 700;
}
.sector-card p {
  font-size: 12px;
  color: var(--color-placeholder);
  margin: 0;
  line-height: 1.4;
}
@media (max-width: 600px) {
  .sectors-grid { grid-template-columns: 1fr; }
}
</style>
