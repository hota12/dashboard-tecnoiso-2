<template>
  <div class="geral-dashboard">

    <!-- ── Loading ─────────────────────────────────────────── -->
    <template v-if="loading">
      <div class="kpi-grid">
        <div class="skeleton kpi-skeleton" v-for="i in 8" :key="i"></div>
      </div>
    </template>

    <!-- ── Error ────────────────────────────────────────────── -->
    <div v-else-if="error" class="empty-state">
      <i class="bi bi-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <span class="text-xs text-muted">Use o botão de atualizar no topo para tentar novamente</span>
    </div>

    <!-- ── Conteúdo ─────────────────────────────────────────── -->
    <template v-else-if="raw">

      <!-- ── Header da TV ──────────────────────────────────── -->
      <div class="tv-header">
        <div class="tv-header-left">
          <i class="bi bi-bar-chart-fill tv-header-icon"></i>
          <div>
            <h1 class="tv-title">Painel de Vendas</h1>
            <p class="tv-subtitle">Visão geral · {{ periodoLabel }}</p>
          </div>
        </div>
        <div class="tv-header-right">
          <div v-if="metaPeriodo > 0" class="meta-badge" :class="percentualMeta >= 100 ? 'meta-badge--hit' : 'meta-badge--going'">
            <i class="bi bi-bullseye"></i>
            <span>{{ percentualMeta }}% da meta</span>
          </div>
          <div class="tv-clock">{{ currentTime }}</div>
        </div>
      </div>

      <!-- ── KPIs — Linha 1: Funil Completo ─────────────────── -->
      <div class="kpi-grid">

        <!-- Novos Leads -->
        <div class="kpi-card kpi-blue">
          <div class="kpi-icon-wrap">
            <i class="bi bi-person-plus-fill"></i>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Novos Leads</span>
            <span class="kpi-value">{{ d.novosLeads.length }}</span>
            <span class="kpi-sub">Oportunidades recebidas</span>
          </div>
        </div>

        <!-- Leads Ganhos -->
        <div class="kpi-card kpi-teal">
          <div class="kpi-icon-wrap">
            <i class="bi bi-arrow-right-circle-fill"></i>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Leads Ganhos</span>
            <span class="kpi-value">{{ d.leadsGanhos.length }}</span>
            <span class="kpi-sub">Convertidos em negócios</span>
          </div>
        </div>

        <!-- Novos Negócios -->
        <div class="kpi-card kpi-indigo">
          <div class="kpi-icon-wrap">
            <i class="bi bi-briefcase-fill"></i>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Novos Negócios</span>
            <span class="kpi-value">{{ d.novosNegocios.length }}</span>
            <span class="kpi-sub">Negócios iniciados</span>
          </div>
        </div>

        <!-- Negócios Ganhos -->
        <div class="kpi-card kpi-green">
          <div class="kpi-icon-wrap">
            <i class="bi bi-trophy-fill"></i>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Negócios Ganhos</span>
            <span class="kpi-value">{{ d.negociosGanhos.length }}</span>
            <span class="kpi-sub">Vendas fechadas</span>
          </div>
        </div>

        <!-- Em Andamento -->
        <div class="kpi-card kpi-orange">
          <div class="kpi-icon-wrap">
            <i class="bi bi-hourglass-split"></i>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Em Andamento</span>
            <span class="kpi-value">{{ d.negociosAndamento.length }}</span>
            <span class="kpi-sub">Negócios em aberto</span>
          </div>
        </div>

        <!-- Negócios Perdidos -->
        <div class="kpi-card kpi-red">
          <div class="kpi-icon-wrap">
            <i class="bi bi-x-circle-fill"></i>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Negócios Perdidos</span>
            <span class="kpi-value">{{ d.negociosPerdidos.length }}</span>
            <span class="kpi-sub">Não convertidos</span>
          </div>
        </div>

        <!-- Valor Total + Meta (card largo) -->
        <div class="kpi-card kpi-meta kpi-span-6">

          <!-- Bloco: Valor e Ticket -->
          <div class="meta-block">
            <div class="kpi-icon-wrap" style="background:rgba(216,139,73,0.14);color:#D88B49">
              <i class="bi bi-currency-dollar"></i>
            </div>
            <div class="kpi-body">
              <span class="kpi-label">Valor Total Ganho</span>
              <span class="kpi-value kpi-value--lg" style="color:var(--color-text)">{{ formatCurrency(valorTotal) }}</span>
              <span class="kpi-sub">Ticket médio: {{ formatCurrency(ticketMedio) }}</span>
            </div>
          </div>

          <!-- Divisor -->
          <div class="meta-divider"></div>

          <!-- Bloco: Velocímetro de Meta -->
          <div class="meta-speedo-block">
            <div v-if="metaPeriodo > 0" class="speedo-wrap">
              <Doughnut :data="chartSpeedometerData" :options="speedometerOptions" />
              <div class="speedo-pct">{{ percentualMeta }}%</div>
            </div>
            <div v-else class="speedo-empty"><i class="bi bi-bullseye"></i><br>Sem meta definida</div>
            <div v-if="metaPeriodo > 0" class="speedo-info">
              <span class="badge-tv" :class="percentualMeta >= 100 ? 'badge-green' : 'badge-orange'">
                {{ percentualMeta >= 100 ? 'Meta Atingida!' : 'Em Andamento' }}
              </span>
              <span class="speedo-alvo">Alvo: <strong>{{ formatCurrency(metaPeriodo) }}</strong></span>
            </div>
          </div>

          <!-- Divisor -->
          <div class="meta-divider"></div>

          <!-- Bloco: Taxa de Conversão -->
          <div class="meta-block">
            <div class="kpi-icon-wrap" style="background:rgba(171,71,188,0.12);color:#ab47bc">
              <i class="bi bi-percent"></i>
            </div>
            <div class="kpi-body">
              <span class="kpi-label">Taxa de Conversão</span>
              <span class="kpi-value kpi-value--lg" style="color:var(--color-text)">{{ taxaConversao }}</span>
              <span class="kpi-sub">Ganhos ÷ (Ganhos + Perdidos)</span>
            </div>
          </div>

        </div>

      </div>
      <!-- FIM PARTE 1 -->

      <!-- ── PARTE 2: Gráficos ──────────────────────────────── -->
      <div class="charts-row">

        <!-- Gráfico: Valor Ganho Acumulado -->
        <div class="chart-card chart-card--wide">
          <div class="chart-card-header">
            <span class="chart-card-title">
              <i class="bi bi-currency-dollar"></i>
              Valor Ganho — Acumulado
            </span>
            <span class="badge-tv badge-gold">{{ formatCurrency(valorTotal) }}</span>
          </div>
          <div class="chart-wrapper">
            <Line :data="chartValor" :options="chartOptsValor" />
          </div>
        </div>

        <!-- Gráfico: Leads Novos vs Ganhos Acumulado -->
        <div class="chart-card">
          <div class="chart-card-header">
            <span class="chart-card-title">
              <i class="bi bi-people-fill"></i>
              Leads — Acumulado
            </span>
            <span class="badge-tv badge-blue">{{ d.novosLeads.length }} novos</span>
          </div>
          <div class="chart-wrapper">
            <Line :data="chartLeads" :options="chartOptsLeads" />
          </div>
        </div>

      </div>

      <!-- ── PARTE 2: Rankings ───────────────────────────────── -->
      <div class="rankings-row">

        <!-- Funil por Fase -->
        <div class="rank-card">
          <div class="rank-header">
            <span class="rank-title">
              <i class="bi bi-filter-circle-fill" style="color:#ffa726"></i>
              Funil por Fase
            </span>
            <span class="badge-tv badge-orange">{{ d.negociosAndamento.length }} em aberto</span>
          </div>
          <div v-if="!fasesFunil.length" class="rank-empty">Nenhum negócio em andamento</div>
          <div v-else class="rank-list">
            <div v-for="fase in fasesFunil" :key="fase.label" class="rank-item">
              <div class="rank-item-top">
                <span class="rank-item-label">{{ fase.label }}</span>
                <span class="rank-item-count">{{ fase.count }}</span>
              </div>
              <div class="rank-track">
                <div class="rank-fill rank-fill--orange" :style="{ width: fase.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Canais de Venda -->
        <div class="rank-card">
          <div class="rank-header">
            <span class="rank-title">
              <i class="bi bi-megaphone-fill" style="color:#43a047"></i>
              Canais de Venda
            </span>
            <span v-if="topCanal" class="badge-tv badge-green">Líder: {{ topCanal.label }}</span>
          </div>
          <div v-if="!canaisVenda.length" class="rank-empty">Nenhuma venda no período</div>
          <div v-else class="rank-list">
            <div v-for="c in canaisVenda" :key="c.label" class="rank-item">
              <div class="rank-item-top">
                <span class="rank-item-label">{{ c.label }}</span>
                <span class="rank-item-count">{{ c.count }}× — <strong>{{ formatCurrency(c.value) }}</strong></span>
              </div>
              <div class="rank-track">
                <div class="rank-fill rank-fill--green" :style="{ width: c.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Motivos de Perda -->
        <div class="rank-card">
          <div class="rank-header">
            <span class="rank-title">
              <i class="bi bi-emoji-frown" style="color:#ef5350"></i>
              Motivos de Perda
            </span>
            <span class="badge-tv badge-red">{{ d.negociosPerdidos.length }} perdidos</span>
          </div>
          <div v-if="!motivosPerdidos.length" class="rank-empty">Nenhum negócio perdido</div>
          <div v-else class="rank-list">
            <div v-for="m in motivosPerdidos" :key="m.label" class="rank-item">
              <div class="rank-item-top">
                <span class="rank-item-label">{{ m.label }}</span>
                <span class="rank-item-count">{{ m.count }}</span>
              </div>
              <div class="rank-track">
                <div class="rank-fill rank-fill--red" :style="{ width: m.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
      <!-- FIM PARTE 2 -->

    </template>

    <!-- Sem dados -->
    <div v-else class="empty-state">
      <i class="bi bi-bar-chart-line"></i>
      <p>Aguardando dados...</p>
    </div>

  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { Line, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { useGoalsStore } from '@/stores/goals'
import { useUsersStore } from '@/stores/users'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend)

// ─── URLs das fontes ────────────────────────────────────────────
const FONT_GERAL = 'https://domador-n8n.2wdiso.easypanel.host/webhook/dbb08f48-3f6a-4759-9e15-e637061c151c'

const props = defineProps({
  fontsData:    { type: Object, default: () => ({}) },
  fontsLoading: { type: Object, default: () => ({}) },
  filters:      { type: Object, default: () => ({}) },
})

// ─── Stores de metas ─────────────────────────────────────────
const goalsStore = useGoalsStore()
const usersStore = useUsersStore()

onMounted(() => {
  usersStore.fetchUsers()
  goalsStore.fetchGoals()
})

// ─── Estado derivado ───────────────────────────────────────────
const loading = computed(() => !!props.fontsLoading[FONT_GERAL])

const error = computed(() => {
  if (props.fontsData[FONT_GERAL] === null) return 'Erro ao carregar dados'
  return null
})

const raw = computed(() => {
  const payload = props.fontsData[FONT_GERAL]
  if (!payload) return null
  return Array.isArray(payload) ? payload[0] : payload
})

// ─── Dados agrupados ───────────────────────────────────────────
const d = computed(() => ({
  novosLeads:        raw.value?.novosLeads        ?? [],
  leadsGanhos:       raw.value?.leadsGanhos       ?? [],
  novosNegocios:     raw.value?.novosNegocios     ?? [],
  negociosGanhos:    raw.value?.negociosGanhos    ?? [],
  negociosPerdidos:  raw.value?.negociosPerdidos  ?? [],
  negociosAndamento: raw.value?.negociosAndamento ?? [],
  novasPropostas:    raw.value?.NovasPropostas    ?? [],
}))

// ─── KPIs de valor ────────────────────────────────────────────
const valorTotal = computed(() =>
  d.value.negociosGanhos.reduce((s, l) => s + (Number(l.valorPedido) || 0), 0)
)

const ticketMedio = computed(() => {
  const ganhos = d.value.negociosGanhos.length
  return ganhos > 0 ? valorTotal.value / ganhos : 0
})

const taxaConversao = computed(() => {
  const ganhos  = d.value.negociosGanhos.length
  const perdidos = d.value.negociosPerdidos.length
  const total   = ganhos + perdidos
  if (total === 0) return '—'
  return ((ganhos / total) * 100).toFixed(1) + '%'
})

// ─── Helpers ──────────────────────────────────────────────────
function formatCurrency(value) {
  if (!value) return 'R$ —'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatSource(src) {
  if (!src || src === 'null') return 'Direto'
  if (src.startsWith('http')) {
    try { return new URL(src).hostname.replace('www.', '') } catch {}
  }
  return src
}

function formatDateLabel(iso) {
  if (!iso) return '?'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function allDaysInRange(startIso, endIso) {
  const days = []
  const cursor = new Date(startIso)
  cursor.setHours(0, 0, 0, 0)
  const end = new Date(endIso)
  end.setHours(23, 59, 59, 999)
  while (cursor <= end) {
    days.push(cursor.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

function buildAccSeries(leads, dateField, valueField = null) {
  const { startDate, endDate } = props.filters
  const byDay = {}
  leads.forEach(l => {
    const label = formatDateLabel(l[dateField])
    const inc = valueField ? (Number(l[valueField]) || 0) : 1
    byDay[label] = (byDay[label] ?? 0) + inc
  })
  let labels
  if (startDate && endDate) {
    labels = allDaysInRange(startDate, endDate)
  } else if (leads.length) {
    const sorted = leads
      .map(l => ({ label: formatDateLabel(l[dateField]), ts: new Date(l[dateField]).getTime() }))
      .sort((a, b) => a.ts - b.ts)
      .filter((v, i, arr) => arr.findIndex(x => x.label === v.label) === i)
    labels = sorted.map(s => s.label)
  } else {
    return { labels: [], values: [] }
  }
  let acc = 0
  const values = labels.map(lbl => { acc += (byDay[lbl] ?? 0); return acc })
  return { labels, values }
}

// ─── Metas Proporcional ────────────────────────────────────────
const metaDataSeries = computed(() => {
  if (!props.filters.startDate || !props.filters.endDate) return []
  const start = new Date(props.filters.startDate)
  const end   = new Date(props.filters.endDate)
  if (isNaN(start) || isNaN(end)) return []

  // Pega todos os referenceIds do período
  const allLeads = [
    ...d.value.novosNegocios,
    ...d.value.negociosGanhos,
    ...d.value.negociosPerdidos,
    ...d.value.negociosAndamento,
  ]
  const refIds = [...new Set(allLeads.map(l => l.referenceId).filter(Boolean))]
  if (!refIds.length) return []

  const userIds = usersStore.users
    .filter(u => refIds.includes(u.referenceId))
    .map(u => String(u.id))
  if (!userIds.length) return []

  const monthGoalCache = {}
  let accArray = []
  let totalMeta = 0
  start.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  let current = new Date(start)

  while (current <= end) {
    const year     = current.getFullYear().toString()
    const monthStr = String(current.getMonth() + 1).padStart(2, '0')
    const key      = `${year}-${monthStr}`
    if (monthGoalCache[key] === undefined) {
      const monthGoals = goalsStore.goals.filter(
        g => userIds.includes(String(g.userId)) && g.year === year && g.month === monthStr
      )
      const sumMonth       = monthGoals.reduce((acc, g) => acc + (parseFloat(g.value) || 0), 0)
      const daysInThisMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate()
      monthGoalCache[key]  = sumMonth / daysInThisMonth
    }
    totalMeta += monthGoalCache[key]
    accArray.push(totalMeta)
    current.setDate(current.getDate() + 1)
  }
  return accArray
})

const metaPeriodo = computed(() => {
  const arr = metaDataSeries.value
  return arr.length ? arr[arr.length - 1] : 0
})

const percentualMeta = computed(() => {
  if (metaPeriodo.value === 0) return 0
  return Math.round((valorTotal.value / metaPeriodo.value) * 100)
})

// ─── Velocímetro ───────────────────────────────────────────────
const chartSpeedometerData = computed(() => {
  const meta  = metaPeriodo.value
  const ganho = valorTotal.value
  const realized = ganho > meta ? meta : ganho
  const missing  = Math.max(0, meta - ganho)
  return {
    labels: ['Realizado', 'Faltante'],
    datasets: [{
      data: [realized, missing],
      backgroundColor: [
        percentualMeta.value >= 100 ? '#66bb6a' : '#D88B49',
        'rgba(128,128,128,0.08)',
      ],
      borderWidth: 0,
      circumference: 180,
      rotation: 270,
      cutout: '78%',
    }],
  }
})

const speedometerOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx => ` ${ctx.label}: ${Number(ctx.raw).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      },
    },
  },
}

// ─── Chart: Valor Ganho Acumulado (com linha de meta) ──────────
const chartValor = computed(() => {
  const { labels, values } = buildAccSeries(d.value.negociosGanhos, 'dataVenda', 'valorPedido')
  const metaData = metaDataSeries.value.length > 0
    ? metaDataSeries.value
    : labels.map(() => metaPeriodo.value)
  const datasets = [
    {
      label: 'Valor acumulado',
      data: values,
      borderColor: '#D88B49',
      backgroundColor: 'rgba(216,139,73,0.12)',
      fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 6,
    },
  ]
  if (metaPeriodo.value > 0) {
    datasets.push({
      label: 'Meta acumulada',
      data: metaData,
      borderColor: '#42a5f5',
      backgroundColor: 'transparent',
      borderDash: [6, 4],
      borderWidth: 2,
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 0,
    })
  }
  return { labels, datasets }
})

const chartOptsValor = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'top', labels: { color: '#9e9e9e', font: { size: 11 }, boxWidth: 12, padding: 12 } },
    tooltip: {
      backgroundColor: '#1a1a1a',
      titleColor: '#fff',
      bodyColor: '#ccc',
      padding: 10,
      callbacks: {
        label: ctx => ` ${Number(ctx.parsed.y).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
      },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#9e9e9e', font: { size: 11 } } },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(128,128,128,0.08)' },
      ticks: {
        color: '#9e9e9e',
        font: { size: 11 },
        callback: val => 'R$ ' + (val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val),
      },
    },
  },
}

// ─── Chart: Leads Novos vs Ganhos ─────────────────────────────
const chartLeads = computed(() => {
  const novos  = buildAccSeries(d.value.novosLeads, 'criadoEm')
  const ganhos = buildAccSeries(d.value.leadsGanhos, 'finalizadoEm')
  const labels = novos.labels.length >= ganhos.labels.length ? novos.labels : ganhos.labels
  return {
    labels,
    datasets: [
      {
        label: 'Novos Leads',
        data: novos.values,
        borderColor: '#42a5f5',
        backgroundColor: 'rgba(66,165,245,0.10)',
        fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 6,
      },
      {
        label: 'Leads Ganhos',
        data: ganhos.values,
        borderColor: '#26c6da',
        backgroundColor: 'rgba(38,198,218,0.10)',
        fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 6,
      },
    ],
  }
})

const chartOptsLeads = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: { color: '#9e9e9e', font: { size: 11 }, boxWidth: 12, padding: 12 },
    },
    tooltip: {
      backgroundColor: '#1a1a1a',
      titleColor: '#fff',
      bodyColor: '#ccc',
      padding: 10,
      callbacks: { label: ctx => ` ${ctx.parsed.y} leads` },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: '#9e9e9e', font: { size: 11 } } },
    y: {
      beginAtZero: true,
      grid: { color: 'rgba(128,128,128,0.08)' },
      ticks: { color: '#9e9e9e', font: { size: 11 }, stepSize: 1, precision: 0 },
    },
  },
}

// ─── Rankings ─────────────────────────────────────────────────
const fasesFunil = computed(() => {
  const map = {}
  d.value.negociosAndamento.forEach(l => {
    const fase = l.faseAtual || 'Sem fase'
    map[fase] = (map[fase] ?? 0) + 1
  })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
  const max = entries[0]?.[1] ?? 1
  return entries.map(([label, count]) => ({ label, count, pct: Math.round((count / max) * 100) }))
})

const canaisVenda = computed(() => {
  const map = {}
  d.value.negociosGanhos.forEach(l => {
    const canal = formatSource(l.utmSource)
    if (!map[canal]) map[canal] = { count: 0, value: 0 }
    map[canal].count += 1
    map[canal].value += (Number(l.valorPedido) || 0)
  })
  const entries = Object.entries(map).sort((a, b) => b[1].value - a[1].value)
  const max = entries[0]?.[1].value ?? 1
  return entries.map(([label, data]) => ({
    label,
    count: data.count,
    value: data.value,
    pct: max > 0 ? Math.round((data.value / max) * 100) : 0,
  }))
})

const topCanal = computed(() => canaisVenda.value[0] ?? null)

const motivosPerdidos = computed(() => {
  const map = {}
  d.value.negociosPerdidos.forEach(l => {
    const motivo = l.motivoPerdido || 'Sem motivo informado'
    map[motivo] = (map[motivo] ?? 0) + 1
  })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
  const max = entries[0]?.[1] ?? 1
  return entries.map(([label, count]) => ({ label, count, pct: Math.round((count / max) * 100) }))
})

// ─── Período label ─────────────────────────────────────────────
const periodoLabel = computed(() => {
  const { startDate, endDate } = props.filters
  if (!startDate || !endDate) return 'Período completo'
  const fmt = (d) => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  return `${fmt(startDate)} — ${fmt(endDate)}`
})

// ─── Relógio em tempo real ─────────────────────────────────────
const currentTime = ref('')
let clockInterval = null

function updateClock() {
  currentTime.value = new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
})
</script>

<style scoped>
/* ── Layout geral ─────────────────────────────────────────── */
.geral-dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 4px 0;
  min-height: 100%;
}

/* ── Header da TV ─────────────────────────────────────────── */
.tv-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: 16px 24px;
}

.tv-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.tv-header-icon {
  font-size: 28px;
  color: var(--color-btn-bg);
}

.tv-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
  line-height: 1.2;
}

.tv-subtitle {
  font-size: 13px;
  color: var(--color-placeholder);
  margin: 2px 0 0;
}

.tv-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.tv-clock {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-btn-bg);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

/* Badge de meta no header */
.meta-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 99px;
  font-size: 13px;
  font-weight: 700;
  border: 1.5px solid;
}
.meta-badge--hit   { background: rgba(102,187,106,0.12); color: #2e7d32; border-color: rgba(102,187,106,0.3); }
.meta-badge--going { background: rgba(216,139,73,0.12);  color: #D88B49; border-color: rgba(216,139,73,0.3); }

/* ── KPI Grid ─────────────────────────────────────────────── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

/* Card que ocupa todas as 6 colunas */
.kpi-span-6 {
  grid-column: span 6;
}

@media (max-width: 1400px) {
  .kpi-grid { grid-template-columns: repeat(3, 1fr); }
  .kpi-span-6 { grid-column: span 3; }
}
@media (max-width: 900px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .kpi-span-6 { grid-column: span 2; }
}

/* ── Card de Meta (horizontal com 3 blocos) ───────────────── */
.kpi-meta {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 20px 28px;
  overflow: visible;
}

.meta-block {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.meta-divider {
  width: 1px;
  height: 80px;
  background: var(--color-card-border);
  margin: 0 28px;
  flex-shrink: 0;
}

/* ── Velocímetro ──────────────────────────────────────────── */
.meta-speedo-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 160px;
}

.speedo-wrap {
  position: relative;
  width: 160px;
  height: 80px;
}

.speedo-pct {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 22px;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1;
}

.speedo-empty {
  font-size: 12px;
  color: var(--color-placeholder);
  text-align: center;
  line-height: 1.6;
}

.speedo-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.speedo-alvo {
  font-size: 11px;
  color: var(--color-placeholder);
}
.speedo-alvo strong {
  color: var(--color-text);
  font-weight: 600;
}

/* ── KPI Card base ────────────────────────────────────────── */
.kpi-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: 22px 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

/* ── Ícone ────────────────────────────────────────────────── */
.kpi-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

/* ── Corpo do KPI ─────────────────────────────────────────── */
.kpi-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.kpi-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-placeholder);
  white-space: nowrap;
}

.kpi-value {
  font-size: 38px;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.kpi-value--lg {
  font-size: 30px;
}

.kpi-sub {
  font-size: 12px;
  color: var(--color-placeholder);
  margin-top: 2px;
}

/* ── Skeleton ─────────────────────────────────────────────── */
.kpi-skeleton {
  height: 110px;
  border-radius: var(--radius-lg);
}

/* ── Cores por card ───────────────────────────────────────── */

/* Azul — Novos Leads */
.kpi-blue::before           { background: #42a5f5; }
.kpi-blue .kpi-icon-wrap    { background: rgba(66,165,245,0.12); color: #42a5f5; }
.kpi-blue .kpi-value        { color: #42a5f5; }

/* Teal — Leads Ganhos */
.kpi-teal::before           { background: #26c6da; }
.kpi-teal .kpi-icon-wrap    { background: rgba(38,198,218,0.12); color: #26c6da; }
.kpi-teal .kpi-value        { color: #26c6da; }

/* Indigo — Novos Negócios */
.kpi-indigo::before         { background: #7986cb; }
.kpi-indigo .kpi-icon-wrap  { background: rgba(121,134,203,0.12); color: #7986cb; }
.kpi-indigo .kpi-value      { color: #7986cb; }

/* Verde — Negócios Ganhos */
.kpi-green::before          { background: #66bb6a; }
.kpi-green .kpi-icon-wrap   { background: rgba(102,187,106,0.12); color: #66bb6a; }
.kpi-green .kpi-value       { color: #66bb6a; }

/* Laranja — Em Andamento */
.kpi-orange::before         { background: #ffa726; }
.kpi-orange .kpi-icon-wrap  { background: rgba(255,167,38,0.12); color: #ffa726; }
.kpi-orange .kpi-value      { color: #ffa726; }

/* Vermelho — Perdidos */
.kpi-red::before            { background: #ef5350; }
.kpi-red .kpi-icon-wrap     { background: rgba(239,83,80,0.12); color: #ef5350; }
.kpi-red .kpi-value         { color: #ef5350; }

/* Dourado — Valor Total */
.kpi-gold::before           { background: #D88B49; }
.kpi-gold .kpi-icon-wrap    { background: rgba(216,139,73,0.14); color: #D88B49; }
.kpi-gold .kpi-value        { color: var(--color-text); }

/* Roxo — Taxa Conversão */
.kpi-purple::before         { background: #ab47bc; }
.kpi-purple .kpi-icon-wrap  { background: rgba(171,71,188,0.12); color: #ab47bc; }
.kpi-purple .kpi-value      { color: var(--color-text); }

/* ── Charts Row ───────────────────────────────────────────── */
.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  align-items: stretch;
}
@media (max-width: 1100px) { .charts-row { grid-template-columns: 1fr; } }

.chart-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.chart-card--wide { /* já é o grande via grid */ }

.chart-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.chart-card-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 7px;
}
.chart-card-title i { color: var(--color-placeholder); }

.chart-wrapper {
  position: relative;
  height: 220px;
  width: 100%;
}

/* ── Badges TV ─────────────────────────────────────────────── */
.badge-tv {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}
.badge-gold   { background: rgba(216,139,73,0.14); color: #D88B49; }
.badge-blue   { background: rgba(66,165,245,0.12); color: #42a5f5; }
.badge-green  { background: rgba(67,160,71,0.12);  color: #2e7d32; }
.badge-orange { background: rgba(255,167,38,0.14); color: #e65100; }
.badge-red    { background: rgba(229,57,53,0.12);  color: #c62828; }

/* ── Rankings Row ──────────────────────────────────────────── */
.rankings-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 1100px) { .rankings-row { grid-template-columns: 1fr; } }

.rank-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.rank-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.rank-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 7px;
}

.rank-empty {
  font-size: 12px;
  color: var(--color-placeholder);
  font-style: italic;
  text-align: center;
  padding: 20px 0;
}

.rank-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rank-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.rank-item-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}

.rank-item-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60%;
}

.rank-item-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-placeholder);
  white-space: nowrap;
  flex-shrink: 0;
}

.rank-track {
  height: 6px;
  background: rgba(128,128,128,0.1);
  border-radius: 99px;
  overflow: hidden;
}

.rank-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.6s ease;
}
.rank-fill--orange { background: #ffa726; }
.rank-fill--green  { background: #43a047; }
.rank-fill--red    { background: #ef5350; }
</style>
