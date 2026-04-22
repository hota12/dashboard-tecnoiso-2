<template>
  <div class="goals-view">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Metas de Faturamento</h1>
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

    <!-- Alerts -->
    <div v-if="successMessage" class="alert alert-success mb-4">
      <i class="bi bi-check-circle-fill"></i> {{ successMessage }}
    </div>
    <div v-if="goalsStore.error" class="alert alert-danger mb-4">
      <i class="bi bi-exclamation-circle-fill"></i> {{ goalsStore.error }}
    </div>

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
              {{ formatCurrency(userAnnualTotal(user.id)) }}
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
                placeholder="0,00"
                :disabled="!authStore.isAdmin"
                min="0"
                step="0.01"
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

const goalsStore = useGoalsStore()
const usersStore = useUsersStore()
const authStore = useAuthStore()

const loading = ref(false)
const successMessage = ref('')
const savingMap = ref({})

const users = computed(() => usersStore.users)

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

function userAnnualTotal(userId) {
  return goalsStore.goals
    .filter((g) => String(g.userId) === String(userId) && g.year === goalsStore.selectedYear)
    .reduce((sum, g) => sum + (parseFloat(g.value) || 0), 0)
}

function isSaving(userId, month) {
  return !!savingMap.value[`${userId}-${month}`]
}

async function saveGoal(userId, month, value) {
  if (!authStore.isAdmin) return
  const existing = goalsStore.getGoalByUserMonthYear(userId, month, goalsStore.selectedYear)
  const numValue = parseFloat(value) || 0
  const key = `${userId}-${month}`
  savingMap.value[key] = true

  try {
    if (existing) {
      await goalsStore.updateGoal({
        id: existing.id,
        userId: userId,
        year: goalsStore.selectedYear,
        month,
        value: numValue,
        type: 'faturamento',
      })
    } else if (numValue > 0) {
      await goalsStore.createGoal({
        userId,
        year: goalsStore.selectedYear,
        month,
        value: numValue,
        type: 'faturamento',
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

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  }).format(value)
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
