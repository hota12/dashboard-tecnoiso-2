<template>
  <div style="padding: 40px; max-width: 600px; margin: auto;">
    <h2>Gerar Usuários e Planilha</h2>
    <p>Esta página vai criar os usuários informados e baixar uma planilha XLSX com as senhas.</p>
    
    <div v-if="loading" style="margin-bottom: 20px;">
      <p>Gerando... ({{ progress }} / {{ names.length }})</p>
      <div class="spinner"></div>
    </div>
    <div v-if="error" style="color: red; margin-bottom: 20px;">
      Erro: {{ error }}
    </div>
    
    <button class="btn btn-primary" @click="generateUsers" :disabled="loading">
      Gerar Usuários
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUsersStore } from '@/stores/users'
import * as XLSX from 'xlsx'

const usersStore = useUsersStore()

const names = [
  'Brayan Rocha',
  'Daiane Alves',
  'Daiane Avila',
  'Douglas Foss',
  'Eduardo',
  'Eduardo Dias',
  'Henrique Lorenzo',
  'Janaina Rodrigues',
  'Naira Canuto',
  'Rafael Ferreira',
  'Thierry'
]

const loading = ref(false)
const progress = ref(0)
const error = ref('')

function generateUserName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '.')
}

function generatePassword() {
  // Senha alfanumérica simples de 6 caracteres
  return Math.random().toString(36).slice(-6)
}

async function generateUsers() {
  loading.value = true
  progress.value = 0
  error.value = ''
  
  const createdData = []
  
  try {
    for (const name of names) {
      const userName = generateUserName(name)
      const password = generatePassword()
      
      await usersStore.createUser({
        name,
        userName,
        password,
        role: 'member' // vendedor
      })
      
      createdData.push({
        Nome: name,
        Login: userName,
        Senha: password
      })
      
      progress.value++
    }
    
    // Gerar e baixar a planilha xlsx
    const ws = XLSX.utils.json_to_sheet(createdData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Usuários')
    XLSX.writeFile(wb, 'novos_usuarios_domador.xlsx')
    
    alert('Processo finalizado e planilha baixada!')
  } catch (err) {
    console.error(err)
    error.value = err.message || 'Erro durante a geração'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid #ccc;
  border-top-color: #1e88e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
