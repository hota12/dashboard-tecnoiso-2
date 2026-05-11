<template>
  <div class="users-view">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Gerenciamento de Usuários</h1>
        <p class="page-subtitle">Cadastre e gerencie os acessos do sistema</p>
      </div>
      <button class="btn btn-primary" @click="openCreate">
        <i class="bi bi-person-plus-fill"></i> Novo Usuário
      </button>
    </div>

    <!-- Stats cards -->
    <div class="stats-row">
      <div class="stat-chip" v-for="s in statCards" :key="s.label">
        <div class="stat-chip-icon" :style="{ background: s.bg, color: s.color }">
          <i :class="'bi ' + s.icon"></i>
        </div>
        <div>
          <p class="stat-chip-val">{{ s.value }}</p>
          <p class="stat-chip-label">{{ s.label }}</p>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="form-input-wrapper" style="flex:1;max-width:320px">
        <i class="bi bi-search form-input-icon"></i>
        <input v-model="search" class="form-input has-icon" placeholder="Buscar por nome ou usuário..." />
      </div>
      <div class="role-filters">
        <button
          v-for="f in roleFilters"
          :key="f.value"
          class="chip"
          :class="{ active: roleFilter === f.value }"
          @click="roleFilter = f.value"
        >{{ f.label }}</button>
      </div>
      <button class="btn btn-secondary btn-sm" @click="usersStore.fetchUsers()">
        <i class="bi bi-arrow-clockwise" :class="{ spinning: usersStore.loading }"></i> Atualizar
      </button>
    </div>

    <!-- Alerts -->
    <transition name="fade-slide">
      <div v-if="toast.msg" class="toast-bar" :class="'toast-' + toast.type">
        <i :class="toast.type === 'success' ? 'bi bi-check-circle-fill' : 'bi bi-exclamation-circle-fill'"></i>
        {{ toast.msg }}
      </div>
    </transition>

    <!-- Loading -->
    <div v-if="usersStore.loading && !usersStore.users.length" class="table-wrapper">
      <table class="table">
        <thead><tr><th>Nome</th><th>Usuário</th><th>Perfil</th><th>Ref. ID</th><th>Ações</th></tr></thead>
        <tbody>
          <tr v-for="i in 5" :key="i">
            <td><div style="display:flex;gap:10px;align-items:center"><div class="skeleton" style="width:32px;height:32px;border-radius:50%"></div><div class="skeleton" style="height:14px;width:130px"></div></div></td>
            <td><div class="skeleton" style="height:14px;width:100px"></div></td>
            <td><div class="skeleton" style="height:20px;width:65px;border-radius:99px"></div></td>
            <td><div class="skeleton" style="height:14px;width:80px"></div></td>
            <td><div class="skeleton" style="height:28px;width:90px;border-radius:8px"></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty -->
    <div v-else-if="!filtered.length" class="empty-state">
      <i class="bi bi-people"></i>
      <p>{{ search || roleFilter !== 'all' ? 'Nenhum resultado para os filtros aplicados' : 'Nenhum usuário cadastrado' }}</p>
      <button v-if="search || roleFilter !== 'all'" class="btn btn-secondary btn-sm" @click="clearFilters">Limpar filtros</button>
    </div>

    <!-- Table -->
    <div v-else class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Usuário</th>
            <th>Perfil</th>
            <th>Ref. ID</th>
            <th style="text-align:right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filtered" :key="user.id" class="table-row">
            <td>
              <div class="user-cell">
                <div class="avatar" :style="avatarStyle(user)">{{ initial(user) }}</div>
                <div>
                  <p class="font-semibold">{{ user.name }}</p>
                  <p class="text-xs text-muted">ID: {{ user.id }}</p>
                </div>
              </div>
            </td>
            <td>
              <span class="username-tag"><i class="bi bi-at"></i>{{ user.userName }}</span>
            </td>
            <td>
              <span class="badge" :class="roleBadge(user.roles)">{{ roleLabel(user.roles) }}</span>
            </td>
            <td class="text-sm text-muted">{{ user.referenceId || '—' }}</td>
            <td>
              <div class="row-actions">
                <button class="btn btn-ghost btn-sm btn-icon" @click="openEdit(user)" data-tooltip="Editar"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-ghost btn-sm btn-icon" @click="openPassword(user)" data-tooltip="Senha"><i class="bi bi-key"></i></button>
                <button class="btn btn-ghost btn-sm btn-icon" style="color:var(--color-danger)" @click="openDelete(user)" data-tooltip="Excluir"><i class="bi bi-trash3"></i></button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="table-footer">{{ filtered.length }} de {{ usersStore.users.length }} usuário(s)</div>
    </div>

    <!-- Modal: Criar/Editar -->
    <teleport to="body">
      <div v-if="modal.show" class="modal-overlay" @click.self="closeModal">
        <div class="modal modal-lg">
          <div class="modal-header">
            <div class="modal-title-group">
              <div class="modal-title-icon"><i :class="modal.editing ? 'bi bi-pencil-square' : 'bi bi-person-plus-fill'"></i></div>
              <h3 class="modal-title">{{ modal.editing ? 'Editar Usuário' : 'Novo Usuário' }}</h3>
            </div>
            <button class="btn btn-ghost btn-icon" @click="closeModal"><i class="bi bi-x-lg"></i></button>
          </div>

          <div v-if="modal.error" class="alert alert-danger" style="margin-bottom:16px">
            <i class="bi bi-exclamation-circle-fill"></i> {{ modal.error }}
          </div>

          <form @submit.prevent="saveUser">
            <!-- Toggle Goalfy -->
            <div class="goalfy-toggle-container">
              <div class="goalfy-toggle-info">
                <i class="bi bi-box-arrow-in-down-right" style="color:var(--color-btn-bg);font-size:18px;"></i>
                <div>
                  <p class="font-semibold" style="font-size:13px">Importar dados da Goalfy</p>
                  <p class="text-xs text-muted">Preenche o nome e associa o ID de referência automaticamente</p>
                </div>
              </div>
              <label class="switch">
                <input type="checkbox" v-model="useGoalfy">
                <span class="slider round"></span>
              </label>
            </div>

            <div class="form-grid">
              <div class="form-group" style="position: relative;">
                <label class="form-label">Nome completo *</label>
                <input v-model="form.name" type="text" class="form-input" :placeholder="useGoalfy ? 'Busque um usuário Goalfy...' : 'Nome do usuário'" required @focus="showGoalfyDropdown = true" @blur="hideGoalfyDropdown" />
                
                <div v-if="useGoalfy && showGoalfyDropdown && goalfyUsersFiltered.length" class="autocomplete-dropdown">
                  <div v-for="gu in goalfyUsersFiltered" :key="gu.id" class="autocomplete-item" @mousedown="selectGoalfyUser(gu)">
                    {{ gu.name }}
                  </div>
                </div>
              </div>
              <div class="form-group" v-if="!modal.editing">
                <label class="form-label">Login *</label>
                <input v-model="form.userName" type="text" class="form-input" placeholder="nome.sobrenome" required autocomplete="off" />
              </div>
              <div class="form-group" v-if="!modal.editing">
                <label class="form-label">Senha *</label>
                <div class="form-input-wrapper">
                  <input v-model="form.password" :type="showPwd ? 'text' : 'password'" class="form-input" placeholder="Mínimo 6 caracteres" required autocomplete="new-password" style="padding-right:42px" />
                  <button type="button" class="pwd-toggle" @click="showPwd = !showPwd"><i :class="showPwd ? 'bi bi-eye-slash' : 'bi bi-eye'"></i></button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Perfil *</label>
                <select v-model="form.role" class="form-select" required>
                  <option value="">Selecione...</option>
                  <option value="member">Membro</option>
                  <option value="admin">Administrador</option>
                  <option value="super">Super</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">ID de Referência</label>
                <input v-model="form.referenceId" type="text" class="form-input" placeholder="Opcional — ex: ID do ERP" />
              </div>
            </div>

            <!-- Role preview -->
            <div v-if="form.role" class="role-preview">
              <i class="bi bi-shield-check"></i>
              <div>
                <p class="font-semibold" style="font-size:13px">{{ roleLabel(form.role) }}</p>
                <p class="text-xs text-muted">{{ roleDesc(form.role) }}</p>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="spinner"></span>
                <span v-else><i :class="modal.editing ? 'bi bi-check-lg' : 'bi bi-plus-lg'"></i> {{ modal.editing ? 'Salvar' : 'Criar' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>

    <!-- Modal: Senha -->
    <teleport to="body">
      <div v-if="pwdModal.show" class="modal-overlay" @click.self="pwdModal.show = false">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-title-group">
              <div class="modal-title-icon"><i class="bi bi-key-fill"></i></div>
              <h3 class="modal-title">Alterar Senha</h3>
            </div>
            <button class="btn btn-ghost btn-icon" @click="pwdModal.show = false"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="user-pill">
            <div class="avatar" :style="avatarStyle(pwdModal.user)" style="width:32px;height:32px;font-size:13px">{{ initial(pwdModal.user) }}</div>
            <span class="font-semibold">{{ pwdModal.user?.name }}</span>
            <span class="username-tag text-xs"><i class="bi bi-at"></i>{{ pwdModal.user?.userName }}</span>
          </div>
          <div v-if="pwdModal.error" class="alert alert-danger" style="margin:12px 0 0">
            <i class="bi bi-exclamation-circle-fill"></i> {{ pwdModal.error }}
          </div>
          <div class="form-group" style="margin-top:16px">
            <label class="form-label">Nova senha *</label>
            <div class="form-input-wrapper">
              <input v-model="pwdModal.value" :type="showPwd2 ? 'text' : 'password'" class="form-input" placeholder="Nova senha" style="padding-right:42px" />
              <button type="button" class="pwd-toggle" @click="showPwd2 = !showPwd2"><i :class="showPwd2 ? 'bi bi-eye-slash' : 'bi bi-eye'"></i></button>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="pwdModal.show = false">Cancelar</button>
            <button class="btn btn-primary" @click="savePassword" :disabled="saving">
              <span v-if="saving" class="spinner"></span>
              <span v-else><i class="bi bi-check-lg"></i> Salvar</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Modal: Excluir -->
    <teleport to="body">
      <div v-if="delModal.show" class="modal-overlay" @click.self="delModal.show = false">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-title-group">
              <div class="modal-title-icon danger-icon"><i class="bi bi-trash3-fill"></i></div>
              <h3 class="modal-title">Excluir Usuário</h3>
            </div>
            <button class="btn btn-ghost btn-icon" @click="delModal.show = false"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="del-warning">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <p>Tem certeza que deseja excluir <strong>{{ delModal.user?.name }}</strong>? Esta ação não pode ser desfeita.</p>
          </div>
          <div class="user-pill" style="margin-top:12px">
            <div class="avatar" :style="avatarStyle(delModal.user)" style="width:32px;height:32px;font-size:13px">{{ initial(delModal.user) }}</div>
            <div>
              <p class="font-semibold" style="font-size:13px">{{ delModal.user?.name }}</p>
              <p class="text-xs text-muted">@{{ delModal.user?.userName }}</p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="delModal.show = false">Cancelar</button>
            <button class="btn btn-danger" @click="doDelete" :disabled="saving">
              <span v-if="saving" class="spinner spinner-white"></span>
              <span v-else><i class="bi bi-trash3"></i> Excluir</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useUsersStore } from '@/stores/users'
import api from '@/config/api'

const usersStore = useUsersStore()

// ---- Filters ----
const search = ref('')
const roleFilter = ref('all')
const roleFilters = [
  { label: 'Todos', value: 'all' },
  { label: 'Super', value: 'super' },
  { label: 'Admin', value: 'admin' },
  { label: 'Membro', value: 'member' },
]

const filtered = computed(() => {
  let list = usersStore.users
  if (roleFilter.value !== 'all') list = list.filter(u => u.roles === roleFilter.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(u =>
      u.name?.toLowerCase().includes(q) || u.userName?.toLowerCase().includes(q)
    )
  }
  return list
})

function clearFilters() { search.value = ''; roleFilter.value = 'all' }

// ---- Stats ----
const statCards = computed(() => {
  const users = usersStore.users
  return [
    { label: 'Total', value: users.length, icon: 'bi-people-fill', bg: 'rgba(49,49,49,0.08)', color: '#313131' },
    { label: 'Admins', value: users.filter(u => u.roles === 'admin').length, icon: 'bi-shield-fill', bg: 'rgba(30,136,229,0.1)', color: '#1e88e5' },
    { label: 'Membros', value: users.filter(u => u.roles === 'member').length, icon: 'bi-person-fill', bg: 'rgba(67,160,71,0.1)', color: '#43a047' },
    { label: 'Super', value: users.filter(u => u.roles === 'super').length, icon: 'bi-star-fill', bg: 'rgba(223,166,37,0.1)', color: '#dfa625' },
  ]
})

// ---- Helpers ----
const avatarColors = ['#dfa625', '#1e88e5', '#43a047', '#e53935', '#8e24aa', '#00897b']
function avatarStyle(user) {
  if (!user) return {}
  const i = (user.name?.charCodeAt(0) || 0) % avatarColors.length
  return { background: avatarColors[i] + '22', color: avatarColors[i] }
}
function initial(user) { return user?.name?.charAt(0)?.toUpperCase() || '?' }
function roleBadge(r) { return { super: 'badge-primary', admin: 'badge-info', member: 'badge-dark' }[r] || 'badge-dark' }
function roleLabel(r) { return { super: 'Super', admin: 'Admin', member: 'Membro' }[r] || r }
function roleDesc(r) {
  return {
    super: 'Acesso total ao sistema incluindo configurações avançadas',
    admin: 'Gerencia usuários, dashboards, metas e permissões',
    member: 'Visualiza dashboards e metas conforme permissões atribuídas',
  }[r] || ''
}

// ---- Toast ----
const toast = reactive({ msg: '', type: 'success' })
function showToast(msg, type = 'success') {
  toast.msg = msg; toast.type = type
  setTimeout(() => { toast.msg = '' }, 3000)
}

// ---- Modal Criar/Editar ----
const modal = reactive({ show: false, editing: null, error: '' })
const form = ref({ name: '', userName: '', password: '', role: '', referenceId: '' })
const showPwd = ref(false)
const saving = ref(false)
const useGoalfy = ref(false)

function openCreate() {
  modal.editing = null; modal.error = ''; modal.show = true
  form.value = { name: '', userName: '', password: '', role: '', referenceId: '' }
  showPwd.value = false
  useGoalfy.value = false
}
function openEdit(user) {
  modal.editing = user; modal.error = ''; modal.show = true
  form.value = { name: user.name, userName: user.userName, password: '', role: user.roles, referenceId: user.referenceId || '' }
  useGoalfy.value = false
}
function closeModal() { modal.show = false; modal.editing = null; showGoalfyDropdown.value = false }

// ---- Autocomplete Goalfy Users ----
const goalfyUsers = ref([])
const showGoalfyDropdown = ref(false)

async function fetchGoalfyUsers() {
  try {
    const res = await api.get('/goalfy/users')
    if (Array.isArray(res.data)) {
      goalfyUsers.value = res.data
    } else if (res.data && Array.isArray(res.data.users)) {
      goalfyUsers.value = res.data.users
    }
  } catch (err) {
    console.error('Erro ao buscar usuários do Goalfy', err)
  }
}

const goalfyUsersFiltered = computed(() => {
  if (!form.value.name) return goalfyUsers.value.slice(0, 8)
  const q = form.value.name.toLowerCase()
  return goalfyUsers.value.filter(u => u.name.toLowerCase().includes(q)).slice(0, 8)
})

function hideGoalfyDropdown() {
  setTimeout(() => { showGoalfyDropdown.value = false }, 150)
}

function selectGoalfyUser(u) {
  form.value.name = u.name
  form.value.referenceId = u.id
  showGoalfyDropdown.value = false
}

async function saveUser() {
  saving.value = true; modal.error = ''
  try {
    if (modal.editing) {
      await usersStore.updateUser(modal.editing.id, { name: form.value.name, roles: form.value.role, referenceId: form.value.referenceId })
      showToast('Usuário atualizado com sucesso!')
    } else {
      await usersStore.createUser({ userName: form.value.userName, name: form.value.name, password: form.value.password, role: form.value.role, referenceId: form.value.referenceId || undefined })
      showToast('Usuário criado com sucesso!')
    }
    closeModal()
  } catch {
    modal.error = usersStore.error || 'Erro ao salvar'
  } finally { saving.value = false }
}

// ---- Modal Senha ----
const pwdModal = reactive({ show: false, user: null, value: '', error: '' })
const showPwd2 = ref(false)

function openPassword(user) { pwdModal.user = user; pwdModal.value = ''; pwdModal.error = ''; pwdModal.show = true; showPwd2.value = false }

async function savePassword() {
  if (!pwdModal.value) { pwdModal.error = 'Informe a nova senha'; return }
  saving.value = true; pwdModal.error = ''
  try {
    await usersStore.updatePassword(pwdModal.user.id, pwdModal.value)
    pwdModal.show = false; showToast('Senha alterada com sucesso!')
  } catch { pwdModal.error = usersStore.error || 'Erro ao alterar senha' }
  finally { saving.value = false }
}

// ---- Modal Excluir ----
const delModal = reactive({ show: false, user: null })
function openDelete(user) { delModal.user = user; delModal.show = true }

async function doDelete() {
  saving.value = true
  try {
    await usersStore.deleteUser(delModal.user.userName)
    delModal.show = false; showToast('Usuário excluído com sucesso!')
  } catch { showToast(usersStore.error || 'Erro ao excluir', 'error') }
  finally { saving.value = false }
}

onMounted(() => {
  usersStore.fetchUsers()
  fetchGoalfyUsers()
})
</script>

<style scoped>
.users-view { padding: 32px; animation: slideUp var(--transition-normal); }

/* Stats */
.stats-row { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
.stat-chip { display: flex; align-items: center; gap: 12px; background: var(--color-card-bg); border: 1px solid var(--color-card-border); border-radius: var(--radius-lg); padding: 14px 20px; flex: 1; min-width: 140px; box-shadow: var(--shadow-card); }
.stat-chip-icon { width: 40px; height: 40px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
.stat-chip-val { font-size: var(--font-xl); font-weight: 800; line-height: 1; }
.stat-chip-label { font-size: var(--font-xs); color: var(--color-placeholder); font-weight: 600; margin-top: 2px; }

/* Toolbar */
.toolbar { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.role-filters { display: flex; gap: 6px; }

/* Toast */
.toast-bar { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: var(--radius-md); font-size: var(--font-sm); font-weight: 600; margin-bottom: 16px; }
.toast-success { background: rgba(67,160,71,0.1); color: var(--color-success); border: 1px solid rgba(67,160,71,0.2); }
.toast-error { background: rgba(229,57,53,0.1); color: var(--color-danger); border: 1px solid rgba(229,57,53,0.2); }
.fade-slide-enter-active, .fade-slide-leave-active { transition: all 0.2s ease; }
.fade-slide-enter-from, .fade-slide-leave-to { opacity: 0; transform: translateY(-8px); }

/* Table */
.table-row { transition: background var(--transition-fast); }
.table-row:hover { background: rgba(223,166,37,0.03); }
.user-cell { display: flex; align-items: center; gap: 10px; }
.avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0; }
.username-tag { display: inline-flex; align-items: center; gap: 2px; font-size: var(--font-xs); font-weight: 700; color: var(--color-placeholder); background: rgba(0,0,0,0.04); padding: 3px 8px; border-radius: var(--radius-full); }
.row-actions { display: flex; gap: 4px; justify-content: flex-end; }
.table-footer { padding: 10px 16px; font-size: var(--font-xs); color: var(--color-placeholder); border-top: 1px solid var(--color-card-border); font-weight: 600; }
.spinning { animation: spin 0.6s linear infinite; }

/* Modal */
.modal-lg { max-width: 560px; }
.modal-title-group { display: flex; align-items: center; gap: 12px; }
.modal-title-icon { width: 36px; height: 36px; border-radius: var(--radius-md); background: rgba(223,166,37,0.12); color: var(--color-btn-bg); display: flex; align-items: center; justify-content: center; font-size: 16px; }
.danger-icon { background: rgba(229,57,53,0.1); color: var(--color-danger); }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.form-grid .form-group:first-child { grid-column: 1 / -1; }

.role-preview { display: flex; align-items: center; gap: 10px; background: rgba(223,166,37,0.07); border: 1px solid rgba(223,166,37,0.2); border-radius: var(--radius-md); padding: 10px 14px; margin-bottom: 4px; }
.role-preview > i { color: var(--color-btn-bg); font-size: 18px; flex-shrink: 0; }

.user-pill { display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--color-card-bg); border-radius: var(--radius-md); border: 1px solid var(--color-card-border); }

.del-warning { display: flex; gap: 12px; padding: 14px; background: rgba(229,57,53,0.06); border: 1px solid rgba(229,57,53,0.15); border-radius: var(--radius-md); }
.del-warning > i { color: var(--color-danger); font-size: 20px; flex-shrink: 0; margin-top: 2px; }
.del-warning p { font-size: var(--font-sm); line-height: 1.5; }

.pwd-toggle { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--color-placeholder); display: flex; align-items: center; padding: 4px; border-radius: var(--radius-sm); transition: color var(--transition-fast); }
.pwd-toggle:hover { color: var(--color-text); }

/* Autocomplete Goalfy */
.autocomplete-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0; right: 0;
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-md);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: var(--shadow-modal);
  padding: 4px 0;
}
.autocomplete-item {
  padding: 8px 12px;
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
  transition: background var(--transition-fast);
}
.autocomplete-item:hover {
  background: rgba(216,139,73,0.1);
  color: var(--color-btn-bg);
}

/* Toggle Switch / Goalfy */
.goalfy-toggle-container {
  display: flex; align-items: center; justify-content: space-between;
  background: rgba(216,139,73,0.06);
  border: 1px solid rgba(216,139,73,0.15);
  padding: 12px 16px; border-radius: var(--radius-md);
  margin-bottom: 16px;
}
.goalfy-toggle-info { display: flex; align-items: center; gap: 12px; }

.switch { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
input:checked + .slider { background-color: var(--color-btn-bg); }
input:checked + .slider:before { transform: translateX(20px); }
.slider.round { border-radius: 34px; }
.slider.round:before { border-radius: 50%; }
</style>
