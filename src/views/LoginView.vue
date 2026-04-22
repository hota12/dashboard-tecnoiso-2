<template>
  <div class="login-page">
    <!-- Background decoration -->
    <div class="login-bg-decoration"></div>
    <div class="login-bg-decoration2"></div>

    <div class="login-container">
      <!-- Logo area -->
      <div class="login-logo-area">
        <img src="/logo.png" alt="NexusHub" class="login-logo" />
      </div>

      <!-- Card -->
      <div class="login-card">
        <h1 class="login-title">Bem-vindo de volta</h1>
        <p class="login-subtitle">Entre com suas credenciais para acessar</p>

        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Error -->
          <div v-if="error" class="alert alert-danger">
            <i class="bi bi-exclamation-circle-fill"></i>
            {{ error }}
          </div>

          <!-- Usuário -->
          <div class="form-group">
            <label class="form-label" for="userName">Usuário</label>
            <div class="form-input-wrapper">
              <i class="bi bi-person form-input-icon"></i>
              <input
                id="userName"
                v-model="form.userName"
                type="text"
                class="form-input has-icon"
                placeholder="Digite seu usuário"
                autocomplete="username"
                required
                :disabled="loading"
              />
            </div>
          </div>

          <!-- Senha -->
          <div class="form-group">
            <label class="form-label" for="password">Senha</label>
            <div class="form-input-wrapper">
              <i class="bi bi-lock form-input-icon"></i>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input has-icon"
                style="padding-right: 42px"
                placeholder="Digite sua senha"
                autocomplete="current-password"
                required
                :disabled="loading"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :disabled="loading"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <!-- Botão -->
          <button
            type="submit"
            class="btn btn-primary w-full login-btn"
            :disabled="loading"
          >
            <span v-if="loading" class="spinner spinner-white"></span>
            <span v-else>Entrar</span>
          </button>
        </form>
      </div>

      <p class="login-footer">NexusHub &copy; {{ currentYear }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({ userName: '', password: '' })
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const currentYear = computed(() => new Date().getFullYear())

async function handleLogin() {
  loading.value = true
  error.value = ''
  const success = await authStore.login(form.value.userName, form.value.password)
  loading.value = false
  if (success) {
    router.push('/')
  } else {
    error.value = authStore.error || 'Credenciais inválidas'
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: var(--color-sidebar-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.login-bg-decoration {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: rgba(223, 166, 37, 0.06);
  top: -150px;
  right: -150px;
  pointer-events: none;
}

.login-bg-decoration2 {
  position: absolute;
  width: 350px;
  height: 350px;
  border-radius: 50%;
  background: rgba(223, 166, 37, 0.04);
  bottom: -100px;
  left: -100px;
  pointer-events: none;
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  position: relative;
  z-index: 1;
  animation: slideUp var(--transition-slow);
}

.login-logo-area {
  display: flex;
  justify-content: center;
}

.login-logo {
  height: 56px;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.login-card {
  background: var(--color-bg);
  border-radius: var(--radius-xl);
  padding: 36px 32px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
}

.login-title {
  font-size: var(--font-xl);
  font-weight: 800;
  color: var(--color-text);
  text-align: center;
  margin-bottom: 6px;
}

.login-subtitle {
  font-size: var(--font-sm);
  color: var(--color-placeholder);
  text-align: center;
  margin-bottom: 28px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.login-btn {
  width: 100%;
  justify-content: center;
  padding: 13px;
  font-size: var(--font-md);
  margin-top: 4px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-placeholder);
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: color var(--transition-fast);
  display: flex;
  align-items: center;
}
.password-toggle:hover {
  color: var(--color-text);
}

.login-footer {
  color: rgba(255, 255, 255, 0.4);
  font-size: var(--font-xs);
  text-align: center;
}
</style>
