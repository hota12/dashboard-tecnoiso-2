<template>
  <div class="goals-view">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Metas</h1>
        <p class="page-subtitle">Gerencie as metas mensais por vendedor</p>
      </div>

      <!-- Year navigator -->
      <div class="year-navigator">
        <button class="btn btn-secondary btn-icon" @click="changeYear(-1)">
          <i class="bi bi-chevron-left"></i>
        </button>
        <span class="year-display">{{ goalsStore.selectedYear }}</span>
        <button class="btn btn-secondary btn-icon" @click="changeYear(1)">
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>

    <!-- Type selector -->
    <div class="type-selector">
      <button
        v-for="t in goalTypes"
        :key="t.value"
        class="type-pill"
        :class="{ active: currentTypeConfig.value === t.value }"
        @click="selectType(t.value)"
      >
        <i class="bi" :class="t.icon"></i>
        <span>{{ t.label }}</span>
      </button>
    </div>

    <!-- Level selector (tipos com mais de um nível de meta) -->
    <div v-if="currentTypeConfig.levels" class="level-selector">
      <span class="level-caption">Nível:</span>
      <div class="level-toggle">
        <button
          v-for="l in currentTypeConfig.levels"
          :key="l.value"
          :class="{ active: goalsStore.selectedType === l.value }"
          @click="selectType(l.value)"
        >
          {{ l.label }}
        </button>
      </div>
    </div>

    <!-- Alerts -->
    <transition name="toast-slide">
      <div v-if="successMessage" class="fixed-toast alert alert-success">
        <i class="bi bi-check-circle-fill"></i> {{ successMessage }}
      </div>
    </transition>
    <transition name="toast-slide">
      <div v-if="goalsStore.error" class="fixed-toast alert alert-danger">
        <i class="bi bi-exclamation-circle-fill"></i> {{ goalsStore.error }}
      </div>
    </transition>

    <!-- Loading -->
    <div v-if="loading" class="users-skeletons">
      <div class="skeleton skeleton-user-row" v-for="i in 4" :key="i"></div>
    </div>

    <!-- Empty -->
    <div v-else-if="!users.length" class="empty-state">
      <i class="bi bi-bullseye"></i>
      <p>Nenhum usuário disponível para definir metas</p>
    </div>

    <!-- Users & Goals grid -->
    <div v-else class="users-goals">
      <div
        v-for="user in users"
        :key="user.id"
        class="user-goals-card"
      >
        <!-- User header -->
        <div class="user-goals-header">
          <div class="user-cell">
            <div class="user-avatar-sm">{{ user.name?.charAt(0).toUpperCase() }}</div>
            <div>
              <p class="font-semibold">{{ user.name }}</p>
              <p class="text-xs text-muted">@{{ user.userName }}</p>
            </div>
          </div>
          <div class="user-goals-total">
            <span class="text-xs text-muted">Total anual:</span>
            <span class="font-bold" style="color:var(--color-btn-bg)">
              {{ formatGoalValue(userAnnualTotal(user.id), currentTypeConfig.format) }}
            </span>
          </div>
        </div>

        <!-- Months grid -->
        <div class="months-grid">
          <div
            v-for="month in months"
            :key="month.value"
            class="month-cell"
          >
            <label class="month-label">{{ month.label }}</label>
            <div class="month-input-wrapper">
              <input
                :value="getGoalValue(user.id, month.value)"
                @blur="(e) => saveGoal(user.id, month.value, e.target.value)"
                @keydown.enter="(e) => { e.target.blur() }"
                type="number"
                class="form-input month-input"
                :placeholder="currentTypeConfig.placeholder"
                :disabled="!authStore.isAdmin"
                min="0"
                :step="currentTypeConfig.step"
              />
              <div
                v-if="isSaving(user.id, month.value)"
                class="month-saving"
              >
                <span class="spinner" style="width:14px;height:14px;border-width:2px"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGoalsStore } from '@/stores/goals'
import { useUsersStore } from '@/stores/users'
import { useAuthStore } from '@/stores/auth'
import { GOAL_TYPES, getGoalTypeConfig, formatGoalValue } from '@/constants/goalTypes'

const goalsStore = useGoalsStore()
const usersStore = useUsersStore()
const authStore = useAuthStore()

const loading = ref(false)
const successMessage = ref('')
const savingMap = ref({})

const users = computed(() => usersStore.users)

const goalTypes = GOAL_TYPES
const currentTypeConfig = computed(() => getGoalTypeConfig(goalsStore.selectedType))

const months = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Fev' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Abr' },
  { value: '05', label: 'Mai' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Ago' },
  { value: '09', label: 'Set' },
  { value: '10', label: 'Out' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dez' },
]

function getGoalValue(userId, month) {
  const goal = goalsStore.getGoalByUserMonthYear(userId, month, goalsStore.selectedYear)
  return goal?.value || ''
}

/** Total anual do usuário no tipo selecionado: soma os valores exibidos nos inputs. */
function userAnnualTotal(userId) {
  return months.reduce(
    (sum, month) => sum + (parseFloat(getGoalValue(userId, month.value)) || 0),
    0
  )
}

function selectType(type) {
  goalsStore.setType(type)
}

// A chave inclui o tipo: trocar de aba durante um salvamento não pode travar
// nem mostrar o spinner no mesmo mês de outro tipo de meta.
function savingKey(userId, month) {
  return `${goalsStore.selectedType}-${userId}-${month}`
}

function isSaving(userId, month) {
  return !!savingMap.value[savingKey(userId, month)]
}

async function saveGoal(userId, month, value) {
  if (!authStore.isAdmin) return
  if (isSaving(userId, month)) return
  const type = goalsStore.selectedType
  const key = savingKey(userId, month)
  const existing = goalsStore.getGoalByUserMonthYear(userId, month, goalsStore.selectedYear, type)
  const numValue = parseFloat(value) || 0
  savingMap.value[key] = true

  try {
    if (existing) {
      await goalsStore.updateGoal({
        id: existing.id,
        userId: userId,
        year: goalsStore.selectedYear,
        month,
        value: numValue,
        type,
      })
    } else if (numValue > 0) {
      await goalsStore.createGoal({
        userId,
        year: goalsStore.selectedYear,
        month,
        value: numValue,
        type,
      })
    }
    showSuccess('Meta salva!')
  } catch {
    // error handled in store
  } finally {
    savingMap.value[key] = false
  }
}

function changeYear(delta) {
  const newYear = parseInt(goalsStore.selectedYear) + delta
  goalsStore.setYear(newYear)
}

function showSuccess(msg) {
  successMessage.value = msg
  setTimeout(() => (successMessage.value = ''), 2000)
}

onMounted(async () => {
  loading.value = true
  await Promise.all([usersStore.fetchUsers(), goalsStore.fetchGoals()])
  loading.value = false
})
</script>

<style scoped>
.goals-view {
  padding: 32px;
  animation: slideUp var(--transition-normal);
}

.mb-4 {
  margin-bottom: 16px;
}

/* Toast fixed */
.fixed-toast {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 9999;
  min-width: 250px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  margin-bottom: 0;
}
.toast-slide-enter-active, .toast-slide-leave-active { 
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); 
}
.toast-slide-enter-from { opacity: 0; transform: translateX(50px); }
.toast-slide-leave-to { opacity: 0; transform: translateX(50px); }

/* Year navigator */
.year-navigator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.year-display {
  font-size: var(--font-xl);
  font-weight: 800;
  min-width: 70px;
  text-align: center;
}

/* Type selector */
.type-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.type-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-full);
  background: var(--color-card-bg);
  color: var(--color-text);
  font-family: var(--font-family);
  font-size: var(--font-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.type-pill:hover {
  border-color: var(--color-btn-bg);
}

.type-pill.active {
  background: var(--color-btn-bg);
  border-color: var(--color-btn-bg);
  color: #fff;
  box-shadow: var(--shadow-btn);
}

/* Level selector */
.level-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: -8px 0 24px;
}

.level-caption {
  font-size: var(--font-xs);
  font-weight: 600;
  color: var(--color-placeholder);
}

.level-toggle {
  display: flex;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-full);
  background: var(--color-card-bg);
}

.level-toggle button {
  padding: 5px 14px;
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--color-placeholder);
  font-family: var(--font-family);
  font-size: var(--font-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.level-toggle button:hover {
  color: var(--color-text);
}

.level-toggle button.active {
  background: var(--color-text);
  color: var(--color-bg);
}

/* Skeletons */
.users-skeletons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-user-row {
  height: 180px;
  border-radius: var(--radius-lg);
}

/* User goals card */
.users-goals {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-goals-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.user-goals-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-card-border);
  background: var(--color-bg);
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(223, 166, 37, 0.15);
  color: #a07218;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: var(--font-sm);
  flex-shrink: 0;
}

.user-goals-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

/* Months grid */
.months-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0;
  padding: 16px 20px;
  gap: 12px;
}

@media (max-width: 1200px) {
  .months-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}

@media (max-width: 768px) {
  .months-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.month-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.month-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-placeholder);
}

.month-input-wrapper {
  position: relative;
}

.month-input {
  padding: 7px 8px;
  font-size: var(--font-xs);
  text-align: right;
}

.month-saving {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
}
</style>
