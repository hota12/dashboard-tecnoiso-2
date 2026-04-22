<template>
  <div class="dashboard-view" :class="{ 'is-fullscreen': dashboardStore.isFullscreen }">
    <!-- Global Filters Bar -->
    <div class="filters-bar" v-if="!dashboardStore.isFullscreen">

      <!-- Linha 1: título + ações (sempre visível) -->
      <div class="filters-toprow">
        <div class="filters-dashboard-title">
          <i class="bi bi-graph-up-arrow"></i>
          <span>{{ dashboardStore.currentDashboard?.name || 'Dashboard' }}</span>
        </div>

        <div class="filters-toprow-right">
          <!-- Toggle filtros (só mobile) -->
          <button
            class="btn btn-secondary btn-icon filters-toggle-btn"
            @click="filtersExpanded = !filtersExpanded"
            :class="{ active: filtersExpanded }"
            data-tooltip="Filtros"
          >
            <i class="bi bi-funnel"></i>
          </button>

          <!-- Actions -->
          <div class="filters-actions">
            <!-- Grupo: Dados -->
            <div class="action-group">
              <button
                class="btn btn-secondary btn-icon"
                @click="refreshData"
                :disabled="isLoadingFonts"
                data-tooltip="Atualizar dados"
              >
                <i class="bi bi-arrow-clockwise" :class="{ spinning: isLoadingFonts }"></i>
              </button>

              <button
                class="btn btn-secondary btn-sm"
                @click="showRefreshModal = true"
                :class="{ 'btn-active-refresh': dashboardStore.autoRefresh.enabled }"
                data-tooltip="Auto-refresh"
              >
                <i class="bi bi-arrow-repeat" :class="{ 'spin-icon': dashboardStore.autoRefresh.enabled }"></i>
                <span v-if="dashboardStore.autoRefresh.enabled">{{ formatInterval(dashboardStore.autoRefresh.interval) }}</span>
                <span v-else class="action-group-label">Auto</span>
              </button>
            </div>

            <!-- Divisor -->
            <div class="action-divider"></div>

            <!-- Grupo: Visualização -->
            <div class="action-group">
              <button
                class="btn btn-secondary btn-icon"
                @click="toggleFullscreen"
                data-tooltip="Tela cheia"
              >
                <i :class="dashboardStore.isFullscreen ? 'bi bi-fullscreen-exit' : 'bi bi-fullscreen'"></i>
              </button>
            </div>

            <!-- Admin dropdown -->
            <template v-if="authStore.isAdmin">
              <div class="action-divider"></div>
              <div class="action-group admin-dropdown-wrapper" ref="adminDropdownRef">
                <button
                  class="btn btn-secondary btn-sm admin-trigger"
                  @click="adminMenuOpen = !adminMenuOpen"
                  :class="{ active: adminMenuOpen }"
                >
                  <i class="bi bi-gear-fill"></i>
                  <span class="action-group-label">Admin</span>
                  <i class="bi bi-chevron-down admin-chevron" :class="{ rotated: adminMenuOpen }"></i>
                </button>
                <transition name="dropdown">
                  <div v-if="adminMenuOpen" class="admin-dropdown-menu" @click="adminMenuOpen = false">
                    <button class="admin-menu-item" @click="openEditDash">
                      <i class="bi bi-pencil-square"></i><span>Editar dashboard</span>
                    </button>
                    <button class="admin-menu-item" @click="showFontsPanel = true">
                      <i class="bi bi-database-gear"></i><span>Gerenciar fontes</span>
                    </button>
                    <button class="admin-menu-item" @click="openPermissions">
                      <i class="bi bi-shield-lock"></i><span>Permissões de acesso</span>
                    </button>
                    <div class="admin-menu-divider"></div>
                    <button class="admin-menu-item danger" @click="showDeleteDash = true">
                      <i class="bi bi-trash3"></i><span>Excluir dashboard</span>
                    </button>
                  </div>
                </transition>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Linha 2: filtros (colapsável no mobile, sempre visível no desktop) -->
      <div class="filters-collapsible" :class="{ expanded: filtersExpanded }">
        <div class="filters-collapsible-inner">
          <!-- Date presets -->
          <div class="date-presets">
            <button
              v-for="preset in datePresets"
              :key="preset.value"
              class="chip"
              :class="{ active: dashboardStore.activeDatePreset === preset.value }"
              @click="applyPreset(preset.value)"
            >
              {{ preset.label }}
            </button>
          </div>

          <!-- Date inputs -->
          <div class="filters-inputs">
            <div class="filter-input-group">
              <label class="filter-label">Início</label>
              <input type="date" v-model="dashboardStore.filters.startDate" class="form-input filter-date" @change="onFilterChange" />
            </div>
            <div class="filter-input-group">
              <label class="filter-label">Fim</label>
              <input type="date" v-model="dashboardStore.filters.endDate" class="form-input filter-date" @change="onFilterChange" />
            </div>
            <div class="filter-separator"><i class="bi bi-arrow-left-right"></i></div>
            <div class="filter-input-group">
              <label class="filter-label">Comp. início</label>
              <input type="date" v-model="dashboardStore.filters.compareStartDate" class="form-input filter-date" @change="onFilterChange" />
            </div>
            <div class="filter-input-group">
              <label class="filter-label">Comp. fim</label>
              <input type="date" v-model="dashboardStore.filters.compareEndDate" class="form-input filter-date" @change="onFilterChange" />
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Fullscreen exit bar -->
    <div v-if="dashboardStore.isFullscreen" class="fullscreen-bar">
      <span>{{ dashboardStore.currentDashboard?.name }}</span>
      <div style="display:flex;gap:8px;align-items:center">
        <span v-if="dashboardStore.autoRefresh.enabled" class="fullscreen-refresh-indicator">
          <i class="bi bi-arrow-repeat spin-icon"></i>
          {{ formatInterval(dashboardStore.autoRefresh.interval) }}
        </span>
        <button class="btn btn-secondary btn-sm" @click="toggleFullscreen">
          <i class="bi bi-fullscreen-exit"></i> Sair
        </button>
      </div>
    </div>

    <!-- Dashboard content -->
    <div class="dashboard-content">
      <!-- Loading state -->
      <div v-if="dashboardStore.loading" class="dashboard-loading">
        <div class="skeleton skeleton-chart"></div>
        <div class="skeleton-row">
          <div class="skeleton skeleton-stat" v-for="i in 4" :key="i"></div>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="dashboardStore.error" class="empty-state">
        <i class="bi bi-exclamation-triangle"></i>
        <p>{{ dashboardStore.error }}</p>
        <button class="btn btn-primary btn-sm" @click="loadDashboard">Tentar novamente</button>
      </div>

      <!-- Dynamic component -->
      <component
        v-else-if="resolvedComponent"
        :is="resolvedComponent"
        :fonts-data="dashboardStore.fontsData"
        :fonts-loading="dashboardStore.fontsLoading"
        :filters="dashboardStore.filters"
      />

      <!-- Component not found -->
      <div v-else-if="dashboardStore.currentDashboard && !resolvedComponent" class="empty-state">
        <i class="bi bi-puzzle"></i>
        <p>Componente <strong>{{ dashboardStore.currentDashboard?.vueComponent }}</strong> não encontrado</p>
        <span class="text-xs text-muted">Crie o componente em src/dashboards/</span>
      </div>
    </div>

    <!-- Modal: Permissões -->
    <teleport to="body">
      <div v-if="permModal.show" class="modal-overlay" @click.self="permModal.show = false">
        <div class="modal modal-perm">
          <div class="modal-header">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:34px;height:34px;border-radius:8px;background:rgba(30,136,229,0.1);color:#1e88e5;display:flex;align-items:center;justify-content:center">
                <i class="bi bi-shield-lock-fill"></i>
              </div>
              <div>
                <h3 class="modal-title">Permissões de Acesso</h3>
                <p class="text-xs text-muted">{{ dashboardStore.currentDashboard?.name }}</p>
              </div>
            </div>
            <button class="btn btn-ghost btn-icon" @click="permModal.show = false"><i class="bi bi-x-lg"></i></button>
          </div>

          <div v-if="permModal.error" class="alert alert-danger" style="margin-bottom:12px">
            <i class="bi bi-exclamation-circle-fill"></i> {{ permModal.error }}
          </div>
          <div v-if="permModal.success" class="alert alert-success" style="margin-bottom:12px">
            <i class="bi bi-check-circle-fill"></i> {{ permModal.success }}
          </div>

          <!-- Busca -->
          <div class="form-input-wrapper" style="margin-bottom:12px">
            <i class="bi bi-search form-input-icon"></i>
            <input v-model="permModal.search" class="form-input has-icon" placeholder="Buscar usuário..." />
          </div>

          <!-- Selecionar todos -->
          <div class="perm-select-all">
            <label class="perm-checkbox-label">
              <input type="checkbox" :checked="allSelected" @change="toggleAll" />
              <span>Selecionar todos</span>
            </label>
            <span class="text-xs text-muted">{{ permModal.selected.length }} selecionado(s)</span>
          </div>

          <!-- Lista de usuários -->
          <div v-if="usersStore.loading" class="perm-user-list">
            <div v-for="i in 4" :key="i" class="skeleton" style="height:44px;border-radius:8px"></div>
          </div>
          <div v-else class="perm-user-list">
            <label
              v-for="user in filteredPermUsers"
              :key="user.id"
              class="perm-user-item"
              :class="{ selected: permModal.selected.includes(user.id) }"
            >
              <input
                type="checkbox"
                :value="user.id"
                v-model="permModal.selected"
                style="display:none"
              />
              <div class="perm-avatar">{{ user.name?.charAt(0)?.toUpperCase() }}</div>
              <div class="perm-user-info">
                <p class="font-semibold" style="font-size:13px">{{ user.name }}</p>
                <p class="text-xs text-muted">@{{ user.userName }} • {{ roleLabel(user.roles) }}</p>
              </div>
              <i v-if="permModal.selected.includes(user.id)" class="bi bi-check-circle-fill perm-check"></i>
              <i v-else class="bi bi-circle perm-check-empty"></i>
            </label>
            <div v-if="!filteredPermUsers.length" class="empty-state" style="padding:20px">
              <i class="bi bi-person-x"></i>
              <p>Nenhum usuário encontrado</p>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" @click="permModal.show = false">Cancelar</button>
            <button class="btn btn-primary" @click="savePermissions" :disabled="permModal.saving">
              <span v-if="permModal.saving" class="spinner"></span>
              <span v-else><i class="bi bi-shield-check"></i> Salvar permissões</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Modal: Confirmar exclusão Dashboard -->
    <teleport to="body">
      <div v-if="showDeleteDash" class="modal-overlay" @click.self="showDeleteDash = false">
        <div class="modal">
          <div class="modal-header">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:34px;height:34px;border-radius:8px;background:rgba(229,57,53,0.1);color:var(--color-danger);display:flex;align-items:center;justify-content:center">
                <i class="bi bi-trash3-fill"></i>
              </div>
              <h3 class="modal-title">Excluir Dashboard</h3>
            </div>
            <button class="btn btn-ghost btn-icon" @click="showDeleteDash = false"><i class="bi bi-x-lg"></i></button>
          </div>
          <div style="background:rgba(229,57,53,0.06);border:1px solid rgba(229,57,53,0.15);border-radius:8px;padding:14px;display:flex;gap:12px;margin-bottom:16px">
            <i class="bi bi-exclamation-triangle-fill" style="color:var(--color-danger);font-size:20px;flex-shrink:0;margin-top:2px"></i>
            <p style="font-size:14px;line-height:1.5">
              Tem certeza que deseja excluir <strong>{{ dashboardStore.currentDashboard?.name }}</strong>?
              Esta ação removerá o dashboard e todas as suas fontes permanentemente.
            </p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="showDeleteDash = false">Cancelar</button>
            <button class="btn btn-danger" @click="deleteCurrentDash" :disabled="deletingDash">
              <span v-if="deletingDash" class="spinner spinner-white"></span>
              <span v-else><i class="bi bi-trash3"></i> Excluir definitivamente</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Modal: Editar Dashboard -->
    <teleport to="body">
      <div v-if="editDashModal.show" class="modal-overlay" @click.self="editDashModal.show = false">
        <div class="modal">
          <div class="modal-header">
            <div style="display:flex;align-items:center;gap:10px">
              <div style="width:34px;height:34px;border-radius:8px;background:rgba(223,166,37,0.12);color:var(--color-btn-bg);display:flex;align-items:center;justify-content:center">
                <i class="bi bi-pencil-square"></i>
              </div>
              <h3 class="modal-title">Editar Dashboard</h3>
            </div>
            <button class="btn btn-ghost btn-icon" @click="editDashModal.show = false"><i class="bi bi-x-lg"></i></button>
          </div>

          <div v-if="editDashModal.error" class="alert alert-danger" style="margin-bottom:16px">
            <i class="bi bi-exclamation-circle-fill"></i> {{ editDashModal.error }}
          </div>

          <form @submit.prevent="submitEditDash" style="display:flex;flex-direction:column;gap:16px">
            <div class="form-group">
              <label class="form-label">Nome *</label>
              <input v-model="editDashModal.name" type="text" class="form-input" placeholder="Nome do dashboard" required />
            </div>
            <div class="form-group">
              <label class="form-label">Componente Vue *</label>
              <input v-model="editDashModal.vueComponent" type="text" class="form-input" placeholder="Ex: VendasDashboard" required />
              <p style="font-size:11px;color:var(--color-placeholder);margin-top:4px">
                <i class="bi bi-info-circle"></i>
                Nome do arquivo em <code>src/dashboards/</code> sem o <code>.vue</code>
              </p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="editDashModal.show = false">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="editDashModal.saving">
                <span v-if="editDashModal.saving" class="spinner"></span>
                <span v-else><i class="bi bi-check-lg"></i> Salvar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>

    <!-- Auto-refresh modal -->
    <teleport to="body">
      <div v-if="showRefreshModal" class="modal-overlay" @click.self="showRefreshModal = false">
        <div class="modal">
          <div class="modal-header">
            <h3 class="modal-title">Auto-refresh</h3>
            <button class="btn btn-ghost btn-icon" @click="showRefreshModal = false">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="form-group">
            <label class="form-label">Intervalo</label>
            <select v-model="refreshInterval" class="form-select">
              <option value="30">30 segundos</option>
              <option value="60">1 minuto</option>
              <option value="120">2 minutos</option>
              <option value="300">5 minutos</option>
              <option value="600">10 minutos</option>
              <option value="1800">30 minutos</option>
            </select>
          </div>
          <div class="modal-footer">
            <button v-if="dashboardStore.autoRefresh.enabled" class="btn btn-danger" @click="stopRefresh">
              <i class="bi bi-stop-circle"></i> Desativar
            </button>
            <button class="btn btn-secondary" @click="showRefreshModal = false">Cancelar</button>
            <button class="btn btn-primary" @click="startRefresh">
              <i class="bi bi-play-circle"></i> Ativar
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Painel de Fontes (admin) -->
    <teleport to="body">
      <div v-if="showFontsPanel" class="modal-overlay" @click.self="showFontsPanel = false">
        <div class="modal modal-fonts">
          <div class="modal-header">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="font-modal-icon"><i class="bi bi-database-gear"></i></div>
              <div>
                <h3 class="modal-title">Fontes de Dados</h3>
                <p class="text-xs text-muted">{{ dashboardStore.currentDashboard?.name }}</p>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:4px">
              <button 
                class="btn btn-secondary btn-sm" 
                @click="copyFontsInfo"
                v-if="dashboardStore.currentDashboard?.fonts?.length"
                data-tooltip="Copiar para IA"
              >
                <i :class="copiedFonts ? 'bi bi-check2' : 'bi bi-clipboard'"></i>
                {{ copiedFonts ? 'Copiado!' : 'Copiar info' }}
              </button>
              <button class="btn btn-ghost btn-icon" @click="showFontsPanel = false"><i class="bi bi-x-lg"></i></button>
            </div>
          </div>

          <!-- Lista de fontes existentes -->
          <div class="fonts-list">
            <p class="fonts-list-title">Fontes associadas ({{ (dashboardStore.currentDashboard?.fonts ?? []).length }})</p>
            <div v-if="!dashboardStore.currentDashboard?.fonts?.length" class="fonts-empty">
              <i class="bi bi-database-x"></i>
              <span>Nenhuma fonte associada</span>
            </div>
            <div v-else class="font-items">
              <div
                v-for="font in dashboardStore.currentDashboard.fonts"
                :key="font.url"
                class="font-item"
                :class="{ 'font-item-selected': fontForm.editingUrl === font.url }"
              >
                <div class="font-item-method" :class="'method-' + font.method?.toLowerCase()">{{ font.method }}</div>
                <div class="font-item-info">
                  <p class="font-item-url">{{ font.url }}</p>
                  <p class="font-item-desc text-xs text-muted">{{ font.description || 'Sem descrição' }}</p>
                </div>
                <button
                  class="btn btn-ghost btn-sm btn-icon"
                  style="flex-shrink:0"
                  @click="editFont(font)"
                  data-tooltip="Editar"
                ><i class="bi bi-pencil"></i></button>
                <button
                  class="btn btn-ghost btn-sm btn-icon"
                  style="color:var(--color-danger);flex-shrink:0"
                  @click="removeFont(font.url)"
                  data-tooltip="Remover"
                ><i class="bi bi-trash3"></i></button>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Formulário nova/editar fonte -->
          <div class="fonts-add-section">
            <div class="fonts-form-header">
              <p class="fonts-list-title" style="margin-bottom:0">
                <span v-if="fontForm.editingUrl"><i class="bi bi-pencil-square"></i> Editando fonte</span>
                <span v-else><i class="bi bi-plus-circle"></i> Nova fonte</span>
              </p>
              <button v-if="fontForm.editingUrl" type="button" class="btn btn-ghost btn-sm" @click="clearFontForm" style="font-size:11px;color:var(--color-placeholder)">
                <i class="bi bi-x"></i> Cancelar edição
              </button>
            </div>
            <div v-if="fontForm.error" class="alert alert-danger" style="margin-bottom:12px">
              <i class="bi bi-exclamation-circle-fill"></i> {{ fontForm.error }}
            </div>
            <div v-if="fontForm.success" class="alert alert-success" style="margin-bottom:12px">
              <i class="bi bi-check-circle-fill"></i> {{ fontForm.success }}
            </div>
            <form @submit.prevent="submitFont" class="font-form">
              <div class="font-form-row">
                <div class="form-group" style="flex:1">
                  <label class="form-label">URL *</label>
                  <input v-model="fontForm.url" type="text" class="form-input" placeholder="https://api.exemplo.com/rota" required />
                </div>
                <div class="form-group" style="width:110px">
                  <label class="form-label">Método *</label>
                  <select v-model="fontForm.method" class="form-select" required>
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>PATCH</option>
                    <option>DELETE</option>
                  </select>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Descrição</label>
                <textarea v-model="fontForm.description" class="form-input" rows="3" placeholder="Ex: Retorna os dados de vendas mensais agrupados por vendedor..." style="resize:vertical"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Response esperada (opcional)</label>
                <textarea v-model="fontForm.response" class="form-input" rows="2" placeholder='Ex: { "total": 0, "items": [] }' style="resize:vertical"></textarea>
              </div>
              <div style="display:flex;justify-content:flex-end">
                <button type="submit" class="btn btn-primary" :disabled="fontForm.saving">
                  <span v-if="fontForm.saving" class="spinner"></span>
                  <span v-else-if="fontForm.editingUrl"><i class="bi bi-check-lg"></i> Salvar alterações</span>
                  <span v-else><i class="bi bi-plus-lg"></i> Adicionar fonte</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, defineAsyncComponent, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import { useAuthStore } from '@/stores/auth'
import { useUsersStore } from '@/stores/users'

const route = useRoute()
const router = useRouter()
const dashboardStore = useDashboardStore()
const authStore = useAuthStore()
const usersStore = useUsersStore()

function roleLabel(r) { return { super: 'Super', admin: 'Admin', member: 'Membro' }[r] || r }

const showRefreshModal = ref(false)
const showFontsPanel = ref(false)
const showDeleteDash = ref(false)
const deletingDash = ref(false)
const refreshInterval = ref(60)
const adminMenuOpen = ref(false)
const adminDropdownRef = ref(null)
const filtersExpanded = ref(false)

function handleClickOutside(e) {
  if (adminDropdownRef.value && !adminDropdownRef.value.contains(e.target)) {
    adminMenuOpen.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside))

// ---- Permissions Modal ----
const permModal = reactive({ show: false, selected: [], search: '', error: '', success: '', saving: false })

const filteredPermUsers = computed(() => {
  if (!permModal.search.trim()) return usersStore.users
  const q = permModal.search.toLowerCase()
  return usersStore.users.filter(u =>
    u.name?.toLowerCase().includes(q) || u.userName?.toLowerCase().includes(q)
  )
})

const allSelected = computed(() =>
  usersStore.users.length > 0 && usersStore.users.every(u => permModal.selected.includes(u.id))
)

function toggleAll() {
  if (allSelected.value) {
    permModal.selected = []
  } else {
    permModal.selected = usersStore.users.map(u => u.id)
  }
}

async function openPermissions() {
  permModal.error = ''; permModal.success = ''; permModal.search = ''

  // Pré-seleciona usuários que já têm acesso (vêm no array users do GET dashboard)
  const alreadyAllowed = dashboardStore.currentDashboard?.users ?? []
  permModal.selected = alreadyAllowed.map(u => Number(u.userId))

  permModal.show = true
  if (!usersStore.users.length) await usersStore.fetchUsers()
}

async function savePermissions() {
  permModal.saving = true; permModal.error = ''; permModal.success = ''
  try {
    await dashboardStore.updatePermissions(dashboardStore.currentDashboard.id, permModal.selected)
    permModal.success = 'Permissões salvas com sucesso!'
    setTimeout(() => { permModal.success = '' }, 3000)
  } catch (err) {
    permModal.error = err.message
  } finally {
    permModal.saving = false
  }
}

async function deleteCurrentDash() {
  deletingDash.value = true
  try {
    await dashboardStore.deleteDashboard(dashboardStore.currentDashboard.id)
    showDeleteDash.value = false
    dashboardStore.clearCurrentDashboard()
    router.push('/')
  } catch (err) {
    showDeleteDash.value = false
  } finally {
    deletingDash.value = false
  }
}

// ---- Edit Dashboard Modal ----
const editDashModal = reactive({ show: false, name: '', vueComponent: '', error: '', saving: false })

function openEditDash() {
  const d = dashboardStore.currentDashboard
  if (!d) return
  editDashModal.name = d.name
  editDashModal.vueComponent = d.vueComponent
  editDashModal.error = ''
  editDashModal.show = true
}

async function submitEditDash() {
  editDashModal.saving = true; editDashModal.error = ''
  try {
    await dashboardStore.updateDashboard(dashboardStore.currentDashboard.id, {
      name: editDashModal.name,
      vueComponent: editDashModal.vueComponent,
    })
    editDashModal.show = false
  } catch (err) {
    editDashModal.error = err.message
  } finally {
    editDashModal.saving = false
  }
}

// ---- Font management ----
const fontForm = reactive({ url: '', method: 'GET', description: '', response: '', error: '', success: '', saving: false, editingUrl: null })
const copiedFonts = ref(false)

function copyFontsInfo() {
  const fonts = dashboardStore.currentDashboard?.fonts || []
  if (!fonts.length) return

  let text = `Preciso criar o componente Vue para o dashboard "${dashboardStore.currentDashboard.name}".\n\n`
  text += `Aqui estão as fontes de dados disponíveis:\n\n`

  fonts.forEach((f, i) => {
    text += `${i + 1}. [${f.method}] ${f.url}\n`
    if (f.description) text += `   Descrição: ${f.description}\n`
    if (f.response) text += `   Response esperada:\n   ${f.response}\n`
    text += `\n`
  })

  navigator.clipboard.writeText(text).then(() => {
    copiedFonts.value = true
    setTimeout(() => { copiedFonts.value = false }, 2000)
  })
}

function editFont(font) {
  fontForm.editingUrl = font.url
  fontForm.url = font.url
  fontForm.method = font.method || 'GET'
  fontForm.description = font.description || ''
  fontForm.response = font.response || ''
  fontForm.error = ''
  fontForm.success = ''
  // Scroll para o formulário
  setTimeout(() => document.querySelector('.fonts-add-section')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
}

function clearFontForm() {
  fontForm.editingUrl = null
  fontForm.url = ''; fontForm.method = 'GET'; fontForm.description = ''; fontForm.response = ''
  fontForm.error = ''; fontForm.success = ''
}

async function submitFont() {
  fontForm.saving = true; fontForm.error = ''; fontForm.success = ''
  try {
    await dashboardStore.addFont({
      url: fontForm.url,
      description: fontForm.description,
      response: fontForm.response,
      method: fontForm.method,
      dashboardId: dashboardStore.currentDashboard.id,
    })
    fontForm.success = 'Fonte salva com sucesso!'
    fontForm.url = ''; fontForm.description = ''; fontForm.response = ''; fontForm.method = 'GET'; fontForm.editingUrl = null
    setTimeout(() => { fontForm.success = '' }, 3000)
  } catch (err) {
    fontForm.error = err.message
  } finally {
    fontForm.saving = false
  }
}

async function removeFont(url) {
  try {
    await dashboardStore.removeFont(dashboardStore.currentDashboard.id, url)
    if (fontForm.editingUrl === url) clearFontForm()
  } catch (err) {
    fontForm.error = err.message
  }
}

const datePresets = [
  { label: 'Hoje', value: 'today' },
  { label: 'Últ. 7 dias', value: 'last7' },
  { label: 'Últ. 30 dias', value: 'last30' },
  { label: 'Mês atual', value: 'currentMonth' },
  { label: 'Mês passado', value: 'lastMonth' },
  { label: 'Ano atual', value: 'currentYear' },
]

// Dynamic component resolution
const resolvedComponent = computed(() => {
  const componentName = dashboardStore.currentDashboard?.vueComponent
  if (!componentName) return null
  try {
    return defineAsyncComponent(() =>
      import(`../dashboards/${componentName}.vue`).catch(() => null)
    )
  } catch {
    return null
  }
})

const isLoadingFonts = computed(() => {
  return Object.values(dashboardStore.fontsLoading).some(Boolean)
})

async function loadDashboard() {
  const id = route.params.id
  await dashboardStore.fetchDashboard(id)
  // Apply URL params
  applyUrlParams()
  await dashboardStore.fetchAllFonts()
}

function applyUrlParams() {
  const q = route.query
  if (q.startDate) dashboardStore.filters.startDate = q.startDate
  if (q.endDate) dashboardStore.filters.endDate = q.endDate
  if (q.compareStartDate) dashboardStore.filters.compareStartDate = q.compareStartDate
  if (q.compareEndDate) dashboardStore.filters.compareEndDate = q.compareEndDate
  if (q.preset) dashboardStore.setDatePreset(q.preset)
  if (q.refresh) dashboardStore.startAutoRefresh(parseInt(q.refresh))
  if (q.fullscreen === 'true') dashboardStore.isFullscreen = true
}

function onFilterChange() {
  dashboardStore.activeDatePreset = null
  updateUrl()
  dashboardStore.fetchAllFonts()
}

function applyPreset(preset) {
  dashboardStore.setDatePreset(preset)
  updateUrl()
  dashboardStore.fetchAllFonts()
}

function updateUrl() {
  const f = dashboardStore.filters
  router.replace({
    query: {
      startDate: f.startDate || undefined,
      endDate: f.endDate || undefined,
      compareStartDate: f.compareStartDate || undefined,
      compareEndDate: f.compareEndDate || undefined,
      preset: dashboardStore.activeDatePreset || undefined,
      refresh: dashboardStore.autoRefresh.enabled
        ? dashboardStore.autoRefresh.interval
        : undefined,
      fullscreen: dashboardStore.isFullscreen ? 'true' : undefined,
    },
  })
}

async function refreshData() {
  await dashboardStore.fetchAllFonts()
}

function startRefresh() {
  dashboardStore.startAutoRefresh(parseInt(refreshInterval.value))
  showRefreshModal.value = false
  updateUrl()
}

function stopRefresh() {
  dashboardStore.stopAutoRefresh()
  showRefreshModal.value = false
  updateUrl()
}

function toggleFullscreen() {
  dashboardStore.toggleFullscreen()
  updateUrl()
}

function formatInterval(seconds) {
  if (seconds < 60) return `${seconds}s`
  return `${Math.floor(seconds / 60)}m`
}

// Watch route change for different dashboards
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      dashboardStore.clearCurrentDashboard()
      await loadDashboard()
    }
  }
)

onMounted(async () => {
  // Default to current month if no dates set
  if (!dashboardStore.filters.startDate) {
    dashboardStore.setDatePreset('currentMonth')
  }
  await loadDashboard()
})

onBeforeUnmount(() => {
  dashboardStore.stopAutoRefresh()
})
</script>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ---- Filters bar ---- */
.filters-bar {
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-card-border);
  padding: 10px 24px;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

/* Desktop: toprow é uma linha flex normal */
.filters-toprow {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filters-toprow-right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

/* Filtros colapsáveis: sempre visíveis no desktop */
.filters-collapsible {
  display: contents; /* no desktop funde com toprow */
}

.filters-collapsible-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
}

/* Botão funnel: escondido no desktop */
.filters-toggle-btn { display: none; }

.filters-dashboard-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--font-md);
  font-weight: 800;
  color: var(--color-text);
  white-space: nowrap;
  min-width: fit-content;
}
.filters-dashboard-title i {
  color: var(--color-btn-bg);
  font-size: 20px;
}

.date-presets {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.filters-inputs {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-input-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.filter-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-placeholder);
}

.filter-date {
  width: 140px;
  padding: 7px 10px;
  font-size: var(--font-xs);
}

.filter-separator {
  color: var(--color-placeholder);
  font-size: 16px;
  padding-bottom: 8px;
}

.filters-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.btn-active-refresh {
  border-color: var(--color-btn-bg);
  color: #a07218;
  background: rgba(223, 166, 37, 0.08);
}

.spin-icon {
  animation: spin 1.5s linear infinite;
}

.spinning {
  animation: spin 0.6s linear infinite;
}

/* ---- Fullscreen bar ---- */
.fullscreen-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  background: var(--color-sidebar-bg);
  color: #fff;
  font-size: var(--font-sm);
  font-weight: 700;
}

.fullscreen-refresh-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-xs);
  color: var(--color-btn-bg);
}

/* ---- Content ---- */
.dashboard-content {
  flex: 1;
  padding: 24px;
}

/* Loading skeletons */
.dashboard-loading {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-chart {
  height: 320px;
  border-radius: var(--radius-lg);
}

.skeleton-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.skeleton-stat {
  height: 100px;
  border-radius: var(--radius-lg);
}

/* ---- Fonts panel ---- */
.modal-fonts {
  max-width: 580px;
  max-height: 90vh;
  overflow-y: auto;
}

.font-modal-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: rgba(223, 166, 37, 0.12);
  color: var(--color-btn-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.fonts-list-title {
  font-size: var(--font-xs);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-placeholder);
  margin-bottom: 10px;
}

.fonts-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-placeholder);
  font-size: var(--font-sm);
  padding: 12px 0;
}
.fonts-empty i { font-size: 20px; }

.font-items { display: flex; flex-direction: column; gap: 8px; }

.font-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-md);
}

.font-item-method {
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: var(--radius-full);
  background: rgba(49, 49, 49, 0.08);
  color: var(--color-text);
  flex-shrink: 0;
}
.method-get    { background: rgba(67,160,71,0.12);  color: #2e7d32; }
.method-post   { background: rgba(30,136,229,0.12); color: #1565c0; }
.method-put    { background: rgba(223,166,37,0.12); color: #a07218; }
.method-patch  { background: rgba(142,36,170,0.12); color: #6a1b9a; }
.method-delete { background: rgba(229,57,53,0.12);  color: #c62828; }

.font-item-info { flex: 1; min-width: 0; }
.font-item-url  { font-size: var(--font-xs); font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.font-item-desc { margin-top: 2px; }

.fonts-add-section { padding-top: 4px; }

.font-form { display: flex; flex-direction: column; gap: 14px; }

.font-form-row { display: flex; gap: 12px; align-items: flex-end; }

.font-item-selected {
  border-color: var(--color-btn-bg) !important;
  background: rgba(223, 166, 37, 0.06) !important;
}

.fonts-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

/* ---- Permissions Modal ---- */
.modal-perm {
  max-width: 480px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.perm-select-all {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
}

.perm-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: var(--font-sm);
  font-weight: 600;
}

.perm-user-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 320px;
  overflow-y: auto;
  margin-bottom: 4px;
}

.perm-user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-card-border);
  background: var(--color-card-bg);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.perm-user-item:hover {
  border-color: rgba(223, 166, 37, 0.3);
  background: rgba(223, 166, 37, 0.03);
}

.perm-user-item.selected {
  border-color: var(--color-btn-bg);
  background: rgba(223, 166, 37, 0.07);
}

.perm-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: rgba(223, 166, 37, 0.12);
  color: var(--color-btn-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 13px;
  flex-shrink: 0;
}

.perm-user-info { flex: 1; min-width: 0; }

.perm-check { color: var(--color-btn-bg); font-size: 18px; flex-shrink: 0; }
.perm-check-empty { color: var(--color-card-border); font-size: 18px; flex-shrink: 0; }

/* ---- Action groups ---- */
.action-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-group .btn {
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding-top: 0;
  padding-bottom: 0;
}

.action-group .btn-icon {
  width: 32px;
  padding: 0;
}

.action-group-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.action-divider {
  width: 1px;
  height: 22px;
  background: var(--color-card-border);
  margin: 0 4px;
  border-radius: 1px;
}

/* ---- Admin dropdown ---- */
.admin-dropdown-wrapper {
  position: relative;
}

.admin-trigger {
  gap: 5px;
}

.admin-trigger.active {
  background: rgba(223, 166, 37, 0.08);
  border-color: rgba(223, 166, 37, 0.3);
}

.admin-chevron {
  font-size: 10px;
  transition: transform var(--transition-fast);
}
.admin-chevron.rotated { transform: rotate(180deg); }

.admin-dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 210px;
  background: #ffffff;
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 6px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.admin-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-sm);
  font-weight: 600;
  color: var(--color-text);
  text-align: left;
  transition: background var(--transition-fast);
}

.admin-menu-item i { font-size: 15px; color: var(--color-placeholder); }

.admin-menu-item:hover {
  background: var(--color-card-bg);
}
.admin-menu-item:hover i { color: var(--color-text); }

.admin-menu-item.danger { color: var(--color-danger); }
.admin-menu-item.danger i { color: var(--color-danger); }
.admin-menu-item.danger:hover { background: rgba(229, 57, 53, 0.06); }

.admin-menu-divider {
  height: 1px;
  background: var(--color-card-border);
  margin: 4px 0;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ============================
   RESPONSIVE
   ============================ */

@media (max-width: 768px) {
  /* Filters bar: só uma linha no mobile */
  .filters-bar {
    padding: 8px 14px;
    top: 62px;
  }

  /* Toprow: título + botão filtro + ações */
  .filters-toprow {
    flex-wrap: nowrap;
    gap: 8px;
  }

  .filters-dashboard-title {
    font-size: var(--font-sm);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
  }

  /* Botão funnel aparece no mobile */
  .filters-toggle-btn { display: flex; }

  /* Filtros: colapsados por padrão no mobile */
  .filters-collapsible {
    display: block;
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.25s ease;
  }

  .filters-collapsible.expanded {
    max-height: 300px;
  }

  .filters-collapsible-inner {
    padding-top: 10px;
    border-top: 1px solid var(--color-card-border);
    margin-top: 8px;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* Presets scroll horizontal */
  .date-presets {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .date-presets::-webkit-scrollbar { display: none; }

  .filter-date { width: 120px; }

  .action-group-label { display: none; }

  /* Content padding reduzido */
  .dashboard-content { padding: 14px; }

  /* Modals full width */
  .modal {
    width: calc(100vw - 24px) !important;
    max-width: none !important;
    margin: 12px;
  }

  .modal-fonts, .modal-perm { max-height: 85dvh; }

  .font-form-row { flex-direction: column; }
  .font-form-row > * { width: 100% !important; }
}

@media (max-width: 480px) {
  .filters-toprow-right { gap: 6px; }

  .admin-dropdown-menu {
    right: auto;
    left: 0;
  }
}
</style>
