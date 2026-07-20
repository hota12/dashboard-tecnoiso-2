<template>
  <div class="prevendas-dashboard">

    <!-- Loading -->
    <template v-if="loading">
      <div class="kpi-row">
        <div class="skeleton kpi-skeleton" v-for="i in 4" :key="i"></div>
      </div>
      <div class="charts-row">
        <div class="skeleton chart-skeleton"></div>
        <div class="skeleton chart-skeleton"></div>
      </div>
      <div class="origem-row">
        <div class="skeleton origem-skeleton" v-for="i in 3" :key="i"></div>
      </div>
    </template>

    <!-- Error -->
    <div v-else-if="error" class="empty-state">
      <i class="bi bi-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <span class="text-xs text-muted">Use o botão de atualizar no topo para tentar novamente</span>
    </div>

    <!-- Conteúdo -->
    <template v-else-if="raw">

      <!-- KPIs -->
      <div class="kpi-row">

        <!-- Em Aberto -->
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(255,167,38,0.12);color:#ffa726">
            <i class="bi bi-hourglass-split"></i>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Em Aberto</span>
            <span class="kpi-value">{{ data.leadsAndamento.length }}</span>
          </div>
          <button class="kpi-detail-btn" @click="openModal('andamento')" data-tooltip="Ver detalhes">
            <i class="bi bi-table"></i>
          </button>
        </div>

        <!-- Novos Leads -->
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(30,136,229,0.12);color:#42a5f5">
            <i class="bi bi-person-plus-fill"></i>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Novos Leads</span>
            <span class="kpi-value">{{ data.novosLeads.length }}</span>
          </div>
          <button class="kpi-detail-btn" @click="openModal('novos')" data-tooltip="Ver detalhes">
            <i class="bi bi-table"></i>
          </button>
        </div>

        <!-- Leads Ganhos -->
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(67,160,71,0.12);color:#66bb6a">
            <i class="bi bi-trophy-fill"></i>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Leads Ganhos</span>
            <span class="kpi-value">{{ data.leadsGanhos.length }}</span>
          </div>
          <button class="kpi-detail-btn" @click="openModal('ganhos')" data-tooltip="Ver detalhes">
            <i class="bi bi-table"></i>
          </button>
        </div>

        <!-- Leads Perdidos -->
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(229,57,53,0.12);color:#ef5350">
            <i class="bi bi-x-circle-fill"></i>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Leads Perdidos</span>
            <span class="kpi-value">{{ data.leadsDesqualificado.length }}</span>
          </div>
          <button class="kpi-detail-btn" @click="openModal('perdidos')" data-tooltip="Ver detalhes">
            <i class="bi bi-table"></i>
          </button>
        </div>

      </div>

      <!-- Taxa de Conversão -->
      <div class="taxa-row">
        <span class="taxa-label">
          <i class="bi bi-percent"></i>
          Taxa de Conversão
          <span class="tooltip-icon" data-tooltip="Leads Ganhos ÷ (Ganhos + Perdidos) × 100. Em aberto não são contados.">
            <i class="bi bi-info-circle"></i>
          </span>
        </span>
        <span class="taxa-value">{{ taxaConversao }}</span>
      </div>

      <!-- Gráficos de linha -->
      <div class="charts-row">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title"><i class="bi bi-graph-up"></i> Novos Leads — Total Acumulado</span>
          </div>
          <div class="chart-wrapper">
            <Line :data="chartNovos" :options="chartOptions('#42a5f5', Math.ceil(data.novosLeads.length * 1.5))" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title"><i class="bi bi-graph-up-arrow"></i> Leads Ganhos — Total Acumulado</span>
          </div>
          <div class="chart-wrapper">
            <Line :data="chartGanhos" :options="chartOptions('#66bb6a', Math.ceil(data.leadsGanhos.length * 1.5))" />
          </div>
        </div>
      </div>

      <!-- Origem por status -->
      <div class="origem-row">

        <!-- Origem dos Novos -->
        <div class="origem-card">
          <div class="origem-header">
            <span class="origem-title">
              <span class="origem-dot" style="background:#42a5f5"></span>
              Origem dos Novos
            </span>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="badge badge-info">{{ data.novosLeads.length }}</span>
              <div class="micro-toggle">
                <button :class="{ active: !includeMediumNovos }" @click="includeMediumNovos = false">Fonte</button>
                <button :class="{ active: includeMediumNovos }" @click="includeMediumNovos = true">+ Mídia</button>
              </div>
            </div>
          </div>
          <div class="origem-list">
            <div v-if="!origemNovos.length" class="origem-empty">Sem dados</div>
            <div v-for="item in origemNovos" :key="item.label" class="origem-item">
              <div class="origem-item-info">
                <span class="origem-item-label">{{ item.label }}</span>
                <span class="origem-item-count">{{ item.count }}</span>
              </div>
              <div class="origem-bar-track">
                <div class="origem-bar-fill" style="background:#42a5f5" :style="{ width: item.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Origem dos Ganhos -->
        <div class="origem-card">
          <div class="origem-header">
            <span class="origem-title">
              <span class="origem-dot" style="background:#66bb6a"></span>
              Origem dos Ganhos
            </span>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="badge badge-success">{{ data.leadsGanhos.length }}</span>
              <div class="micro-toggle">
                <button :class="{ active: !includeMediumGanhos }" @click="includeMediumGanhos = false">Fonte</button>
                <button :class="{ active: includeMediumGanhos }" @click="includeMediumGanhos = true">+ Mídia</button>
              </div>
            </div>
          </div>
          <div class="origem-list">
            <div v-if="!origemGanhos.length" class="origem-empty">Sem dados</div>
            <div v-for="item in origemGanhos" :key="item.label" class="origem-item">
              <div class="origem-item-info">
                <span class="origem-item-label">{{ item.label }}</span>
                <span class="origem-item-count">{{ item.count }}</span>
              </div>
              <div class="origem-bar-track">
                <div class="origem-bar-fill" style="background:#66bb6a" :style="{ width: item.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Motivo dos Perdidos -->
        <div class="origem-card">
          <div class="origem-header">
            <span class="origem-title">
              <span class="origem-dot" style="background:#ef5350"></span>
              Motivo dos Perdidos
            </span>
            <span class="badge badge-danger">{{ data.leadsDesqualificado.length }}</span>
          </div>
          <div class="origem-list">
            <div v-if="!motivoPerdidos.length" class="origem-empty">Sem dados</div>
            <div v-for="item in motivoPerdidos" :key="item.label" class="origem-item">
              <div class="origem-item-info">
                <span class="origem-item-label">{{ item.label }}</span>
                <span class="origem-item-count">{{ item.count }}</span>
              </div>
              <div class="origem-bar-track">
                <div class="origem-bar-fill" style="background:#ef5350" :style="{ width: item.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Distribuição: Vendedor + Cliente da Casa + Interesse -->
      <div class="dist-row">

        <!-- Vendedor sorteado (ganhos) -->
        <div class="origem-card">
          <div class="origem-header">
            <span class="origem-title">
              <span class="origem-dot" style="background:#ab47bc"></span>
              Leads ganhos por vendedor
            </span>
          </div>
          <div class="origem-list">
            <div v-if="!distVendedor.length" class="origem-empty">Sem dados</div>
            <div v-for="item in distVendedor" :key="item.label" class="origem-item">
              <div class="origem-item-info">
                <span class="origem-item-label">{{ item.label }}</span>
                <span class="origem-item-count">{{ item.count }}</span>
              </div>
              <div class="origem-bar-track">
                <div class="origem-bar-fill" style="background:#ab47bc" :style="{ width: item.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cliente da Casa -->
        <div class="origem-card">
          <div class="origem-header">
            <span class="origem-title">
              <span class="origem-dot" style="background:#8d6e63"></span>
              Cliente da Casa
            </span>
            <div class="micro-toggle">
              <button :class="{ active: filterClienteCasa === 'novos' }" @click="filterClienteCasa = 'novos'">Novos</button>
              <button :class="{ active: filterClienteCasa === 'ganhos' }" @click="filterClienteCasa = 'ganhos'">Ganhos</button>
            </div>
          </div>
          <div class="origem-list">
            <div v-if="!distClienteCasa.length" class="origem-empty">Sem dados</div>
            <div v-for="item in distClienteCasa" :key="item.label" class="origem-item">
              <div class="origem-item-info">
                <span class="origem-item-label">{{ item.label }}</span>
                <span class="origem-item-count">{{ item.count }}</span>
              </div>
              <div class="origem-bar-track">
                <div class="origem-bar-fill" style="background:#8d6e63" :style="{ width: item.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Interesse -->
        <div class="origem-card">
          <div class="origem-header">
            <span class="origem-title">
              <span class="origem-dot" style="background:#26a69a"></span>
              Interesse
            </span>
            <div class="micro-toggle">
              <button :class="{ active: filterInteresse === 'novos' }" @click="filterInteresse = 'novos'">Novos</button>
              <button :class="{ active: filterInteresse === 'ganhos' }" @click="filterInteresse = 'ganhos'">Ganhos</button>
            </div>
          </div>
          <div class="origem-list">
            <div v-if="!distInteresse.length" class="origem-empty">Sem dados</div>
            <div v-for="item in distInteresse" :key="item.label" class="origem-item">
              <div class="origem-item-info">
                <span class="origem-item-label">{{ item.label }}</span>
                <span class="origem-item-count">{{ item.count }}</span>
              </div>
              <div class="origem-bar-track">
                <div class="origem-bar-fill" style="background:#26a69a" :style="{ width: item.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </template>

    <!-- Sem dados -->
    <div v-else class="empty-state">
      <i class="bi bi-bar-chart-line"></i>
      <p>Aguardando dados...</p>
    </div>

    <!-- Modal de Detalhes -->
    <teleport to="body">
      <div v-if="modal.open" class="modal-overlay" @click.self="modal.open = false">
        <div class="modal modal-leads">
          <div class="modal-header">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="modal-icon" :style="modal.iconStyle">
                <i :class="modal.icon"></i>
              </div>
              <div>
                <h3 class="modal-title">{{ modal.title }}</h3>
                <p class="text-xs text-muted">{{ modalFiltered.length }} registro(s)</p>
              </div>
            </div>
            <button class="btn btn-ghost btn-icon" @click="modal.open = false">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="modal-filters">
            <div class="form-input-wrapper" style="flex:1;min-width:160px">
              <i class="bi bi-search form-input-icon"></i>
              <input v-model="modal.search" class="form-input has-icon" placeholder="Buscar..." />
            </div>
            <button class="btn btn-secondary btn-icon" @click="exportToExcel" data-tooltip="Exportar para Excel" style="flex-shrink:0">
              <i class="bi bi-file-earmark-excel" style="color:#2e7d32"></i>
            </button>
          </div>
          <div class="modal-table-wrapper">
            <table class="modal-table">
              <thead>
                <tr>
                  <th
                    v-for="col in modal.columns"
                    :key="col.key"
                    @click="setSort(col.key)"
                    class="sortable-th"
                    :class="{ 'th-active': modal.sortKey === col.key }"
                  >
                    {{ col.label }}
                    <i class="bi sort-icon"
                      :class="modal.sortKey === col.key
                        ? (modal.sortDir === 'asc' ? 'bi-sort-up-alt' : 'bi-sort-down')
                        : 'bi-arrow-down-up'"
                    ></i>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="!modalFiltered.length">
                  <td :colspan="modal.columns.length" class="table-empty">Nenhum registro encontrado</td>
                </tr>
                <tr v-for="lead in modalFiltered" :key="lead.identificador">
                  <td v-for="col in modal.columns" :key="col.key">
                    <template v-if="col.key === 'utmSource'">
                      <span class="source-tag">{{ formatSource(lead.utmSource) }}</span>
                    </template>
                    <template v-else-if="col.key === 'clienteDaCasa'">
                      <span v-if="lead.clienteDaCasa" class="badge badge-dark">{{ lead.clienteDaCasa }}</span>
                      <span v-else class="cell-muted">—</span>
                    </template>
                    <template v-else-if="col.isDate">
                      <span class="cell-muted">{{ formatDate(lead[col.key]) }}</span>
                    </template>
                    <template v-else>
                      {{ lead[col.key] || '—' }}
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </teleport>

  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { Line } from 'vue-chartjs'
import * as XLSX from 'xlsx'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  Filler, Tooltip, Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

// ── URL da fonte (deve ser idêntica ao cadastro no sistema) ──────
const FONT_KEY = 'https://domador-n8n-tecnoiso.2wdiso.easypanel.host/webhook/19a5da67-0255-403a-b148-73a971670ade'

const props = defineProps({
  fontsData:    { type: Object, default: () => ({}) },
  fontsLoading: { type: Object, default: () => ({}) },
  filters:      { type: Object, default: () => ({}) },
})

// ── Estado derivado das props ────────────────────────────────────
const loading = computed(() => !!props.fontsLoading[FONT_KEY])

const error = computed(() => {
  if (props.fontsData[FONT_KEY] === null) return 'Erro ao carregar dados de pré-vendas'
  return null
})

const raw = computed(() => {
  const payload = props.fontsData[FONT_KEY]
  if (!payload) return null
  return Array.isArray(payload) ? payload[0] : payload
})

const data = computed(() => ({
  novosLeads:          raw.value?.novosLeads          ?? [],
  leadsGanhos:         raw.value?.leadsGanhos          ?? [],
  leadsDesqualificado: raw.value?.leadsDesqualificado ?? [],
  leadsAndamento:      raw.value?.leadsAndamento       ?? [],
}))

// ── KPI: Taxa de Conversão ───────────────────────────────────────
const taxaConversao = computed(() => {
  const ganhos  = data.value.leadsGanhos.length
  const perdidos = data.value.leadsDesqualificado.length
  const total = ganhos + perdidos
  if (total === 0) return '—'
  return ((ganhos / total) * 100).toFixed(1) + '%'
})

// ── Helpers ──────────────────────────────────────────────────────
function formatSource(src) {
  if (!src) return 'Direto / Desconhecido'
  if (src.startsWith('http')) {
    try { return new URL(src).hostname.replace('www.', '') } catch { /* fall through */ }
  }
  return src
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
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

function buildAccumulatedSeries(leads, dateField = 'criadoEm') {
  const { startDate, endDate } = props.filters
  const byDay = {}
  leads.forEach(l => {
    const label = formatDateLabel(l[dateField])
    byDay[label] = (byDay[label] ?? 0) + 1
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

// ── Gráficos de linha ────────────────────────────────────────────
const chartNovos = computed(() => {
  const { labels, values } = buildAccumulatedSeries(data.value.novosLeads, 'criadoEm')
  return {
    labels,
    datasets: [{ label: 'Acumulado', data: values, borderColor: '#42a5f5', backgroundColor: 'rgba(66,165,245,0.12)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 }],
  }
})

const chartGanhos = computed(() => {
  const { labels, values } = buildAccumulatedSeries(data.value.leadsGanhos, 'finalizadoEm')
  return {
    labels,
    datasets: [{ label: 'Acumulado', data: values, borderColor: '#66bb6a', backgroundColor: 'rgba(102,187,106,0.12)', fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6 }],
  }
})

function chartOptions(color, suggestedMax = 5) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: '#1a1a1a', titleColor: '#fff', bodyColor: '#ccc', padding: 10, callbacks: { label: ctx => ` ${ctx.parsed.y} leads` } },
    },
    scales: {
      x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#9e9e9e', font: { size: 11 } } },
      y: { beginAtZero: true, suggestedMax, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#9e9e9e', font: { size: 11 }, stepSize: 1, precision: 0 } },
    },
  }
}

// ── Origem e distribuições ───────────────────────────────────────
const includeMediumNovos  = ref(false)
const includeMediumGanhos = ref(false)
const filterClienteCasa   = ref('novos')
const filterInteresse     = ref('novos')

function buildOrigem(leads, includeMedium = false) {
  const map = {}
  leads.forEach(l => {
    const src    = formatSource(l.utmSource)
    const medium = l.utmMedium?.trim() || ''
    const key    = includeMedium && medium ? `${src} / ${medium}` : src
    map[key] = (map[key] ?? 0) + 1
  })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
  const max = entries[0]?.[1] ?? 1
  return entries.map(([label, count]) => ({ label, count, pct: Math.round((count / max) * 100) }))
}

function buildMotivo(leads) {
  const map = {}
  leads.forEach(l => {
    const motivo = l.motivoDesqualificacao || 'Sem motivo informado'
    map[motivo] = (map[motivo] ?? 0) + 1
  })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
  const max = entries[0]?.[1] ?? 1
  return entries.map(([label, count]) => ({ label, count, pct: Math.round((count / max) * 100) }))
}

function buildFrequency(leads, field, defaultVal = 'Não informado') {
  const map = {}
  leads.forEach(l => {
    let val = l[field]
    if (field === 'utmSource') val = formatSource(val)
    if (!val || String(val).trim() === '') val = defaultVal
    map[val] = (map[val] ?? 0) + 1
  })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
  const max = entries[0]?.[1] ?? 1
  return entries.map(([label, count]) => ({ label, count, pct: Math.round((count / max) * 100) }))
}

const origemNovos    = computed(() => buildOrigem(data.value.novosLeads,  includeMediumNovos.value))
const origemGanhos   = computed(() => buildOrigem(data.value.leadsGanhos, includeMediumGanhos.value))
const motivoPerdidos = computed(() => buildMotivo(data.value.leadsDesqualificado))
const distVendedor   = computed(() => buildFrequency(data.value.leadsGanhos, 'vendedorSorteado', 'Sem Vendedor'))
const distClienteCasa = computed(() => buildFrequency(
  filterClienteCasa.value === 'novos' ? data.value.novosLeads : data.value.leadsGanhos,
  'clienteDaCasa', 'Não Informado'
))
const distInteresse = computed(() => buildFrequency(
  filterInteresse.value === 'novos' ? data.value.novosLeads : data.value.leadsGanhos,
  'interesse', 'Não informado'
))

// ── Modal ────────────────────────────────────────────────────────
const COLS = {
  andamento: [
    { key: 'utmSource',      label: 'Fonte' },
    { key: 'utmMedium',      label: 'Mídia' },
    { key: 'utmCampaing',    label: 'Campanha' },
    { key: 'interesse',      label: 'Interesse' },
    { key: 'clienteDaCasa',  label: 'Cliente da Casa' },
    { key: 'criadoEm',       label: 'Criado em',       isDate: true },
    { key: 'proximoContato', label: 'Próximo Contato', isDate: true },
  ],
  novos: [
    { key: 'utmSource',     label: 'Fonte' },
    { key: 'utmMedium',     label: 'Mídia' },
    { key: 'utmCampaing',   label: 'Campanha' },
    { key: 'interesse',     label: 'Interesse' },
    { key: 'clienteDaCasa', label: 'Cliente da Casa' },
    { key: 'criadoEm',      label: 'Criado em', isDate: true },
  ],
  ganhos: [
    { key: 'utmSource',         label: 'Fonte' },
    { key: 'utmCampaing',       label: 'Campanha' },
    { key: 'interesse',         label: 'Interesse' },
    { key: 'clienteDaCasa',     label: 'Cliente da Casa' },
    { key: 'vendedorSorteado',  label: 'Vendedor' },
    { key: 'criadoEm',          label: 'Criado em',    isDate: true },
    { key: 'finalizadoEm',      label: 'Finalizado em', isDate: true },
  ],
  perdidos: [
    { key: 'utmSource',              label: 'Fonte' },
    { key: 'utmCampaing',            label: 'Campanha' },
    { key: 'clienteDaCasa',          label: 'Cliente da Casa' },
    { key: 'motivoDesqualificacao',  label: 'Motivo' },
    { key: 'criadoEm',               label: 'Criado em',    isDate: true },
    { key: 'finalizadoEm',           label: 'Finalizado em', isDate: true },
  ],
}

const META = {
  andamento: { title: 'Leads em Aberto',  icon: 'bi bi-hourglass-split', iconStyle: 'background:rgba(255,167,38,0.12);color:#ffa726' },
  novos:     { title: 'Novos Leads',       icon: 'bi bi-person-plus-fill', iconStyle: 'background:rgba(30,136,229,0.12);color:#42a5f5' },
  ganhos:    { title: 'Leads Ganhos',      icon: 'bi bi-trophy-fill',      iconStyle: 'background:rgba(67,160,71,0.12);color:#66bb6a' },
  perdidos:  { title: 'Leads Perdidos',    icon: 'bi bi-x-circle-fill',    iconStyle: 'background:rgba(229,57,53,0.12);color:#ef5350' },
}

const SOURCE_MAP = { andamento: 'leadsAndamento', novos: 'novosLeads', ganhos: 'leadsGanhos', perdidos: 'leadsDesqualificado' }

const modal = reactive({
  open: false, type: '', title: '', icon: '', iconStyle: '',
  columns: [], leads: [], search: '', sortKey: '', sortDir: 'asc',
})

function openModal(type) {
  const meta = META[type]
  modal.type      = type
  modal.title     = meta.title
  modal.icon      = meta.icon
  modal.iconStyle = meta.iconStyle
  modal.columns   = COLS[type]
  modal.leads     = data.value[SOURCE_MAP[type]] ?? []
  modal.search    = ''
  modal.sortKey   = ''
  modal.sortDir   = 'asc'
  modal.open      = true
}

function setSort(key) {
  if (modal.sortKey === key) {
    modal.sortDir = modal.sortDir === 'asc' ? 'desc' : 'asc'
  } else {
    modal.sortKey = key
    modal.sortDir = 'asc'
  }
}

const modalFiltered = computed(() => {
  let list = [...modal.leads]
  if (modal.search.trim()) {
    const q = modal.search.toLowerCase()
    list = list.filter(l => Object.values(l).some(v => String(v ?? '').toLowerCase().includes(q)))
  }
  if (modal.sortKey) {
    const col = modal.columns.find(c => c.key === modal.sortKey)
    list.sort((a, b) => {
      let va = a[modal.sortKey] ?? ''
      let vb = b[modal.sortKey] ?? ''
      if (col?.isDate) { va = new Date(va).getTime() || 0; vb = new Date(vb).getTime() || 0 }
      else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase() }
      return modal.sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })
  }
  return list
})

function exportToExcel() {
  if (!modalFiltered.value.length) return
  const dataToExport = modalFiltered.value.map(lead => {
    const row = {}
    modal.columns.forEach(col => {
      let val = lead[col.key]
      if (col.key === 'utmSource') val = formatSource(val)
      else if (col.isDate) val = formatDate(val)
      row[col.label] = val || '—'
    })
    return row
  })
  const ws = XLSX.utils.json_to_sheet(dataToExport)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Leads')
  XLSX.writeFile(wb, `${modal.title.replace(/\s+/g, '_')}_${Date.now()}.xlsx`)
}
</script>

<style scoped>
/* ── Layout ──────────────────────────────────────────────────── */
.prevendas-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px 0;
}

/* ── KPIs ────────────────────────────────────────────────────── */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 900px) { .kpi-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .kpi-row { grid-template-columns: 1fr; } }

.kpi-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  transition: box-shadow var(--transition-fast);
}
.kpi-card:hover { box-shadow: var(--shadow-card); }

.kpi-icon {
  width: 44px; height: 44px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; flex-shrink: 0;
}

.kpi-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

.kpi-label {
  font-size: 12px;
  color: var(--color-placeholder);
  font-weight: 500;
  white-space: nowrap;
}

.kpi-value {
  font-size: 26px;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.1;
}

/* ── Skeletons ────────────────────────────────────────────────── */
.kpi-skeleton    { height: 82px;  border-radius: var(--radius-lg); }
.chart-skeleton  { height: 240px; border-radius: var(--radius-lg); flex: 1; }
.origem-skeleton { height: 200px; border-radius: var(--radius-lg); flex: 1; }

/* ── Botão detalhar KPI ───────────────────────────────────────── */
.kpi-detail-btn {
  margin-left: auto; flex-shrink: 0;
  width: 30px; height: 30px;
  border-radius: 8px;
  border: 1.5px solid var(--color-card-border);
  background: transparent;
  color: var(--color-placeholder);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 13px; position: relative;
}
.kpi-detail-btn:hover {
  border-color: var(--color-btn-bg);
  color: var(--color-btn-bg);
  background: rgba(216,139,73,0.08);
}
.kpi-detail-btn::after {
  content: attr(data-tooltip);
  position: absolute; bottom: calc(100% + 6px); right: 0;
  background: #1a1a1a; color: #fff;
  padding: 4px 8px; border-radius: 4px;
  font-size: 11px; white-space: nowrap; width: max-content;
  opacity: 0; pointer-events: none;
  transition: opacity var(--transition-fast); z-index: 10;
}
.kpi-detail-btn:hover::after { opacity: 1; }

/* ── Taxa de Conversão ────────────────────────────────────────── */
.taxa-row {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-md);
  padding: 10px 16px; margin-top: -8px;
}
.taxa-label {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 500; color: var(--color-placeholder);
}
.taxa-value { font-size: 18px; font-weight: 800; color: var(--color-btn-bg); }

/* ── Tooltip ──────────────────────────────────────────────────── */
.tooltip-icon {
  position: relative; cursor: help;
  color: var(--color-placeholder); font-size: 11px; line-height: 1;
}
.tooltip-icon::after {
  content: attr(data-tooltip);
  position: absolute; bottom: calc(100% + 6px); left: 50%;
  transform: translateX(-50%);
  background: #1a1a1a; color: #fff;
  padding: 6px 10px; border-radius: var(--radius-sm);
  font-size: 11px; white-space: normal; width: 220px;
  text-align: center; opacity: 0; pointer-events: none;
  transition: opacity var(--transition-fast); z-index: 99; line-height: 1.4;
}
.tooltip-icon:hover::after { opacity: 1; }

/* ── Gráficos ─────────────────────────────────────────────────── */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 800px) { .charts-row { grid-template-columns: 1fr; } }

.chart-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: 16px 20px 20px;
  display: flex; flex-direction: column; gap: 12px;
  min-width: 0; width: 100%;
}
.chart-header { display: flex; align-items: center; justify-content: space-between; }
.chart-title {
  font-size: 13px; font-weight: 600; color: var(--color-text);
  display: flex; align-items: center; gap: 6px;
}
.chart-title i { color: var(--color-placeholder); }
.chart-wrapper { position: relative; height: 200px; width: 100%; }

/* ── Origem ───────────────────────────────────────────────────── */
.origem-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 900px) { .origem-row { grid-template-columns: 1fr; } }

/* ── Distribuição ─────────────────────────────────────────────── */
.dist-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 900px) { .dist-row { grid-template-columns: 1fr; } }

/* ── Origem card ──────────────────────────────────────────────── */
.origem-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: 16px 18px;
  display: flex; flex-direction: column; gap: 12px;
}
.origem-header { display: flex; align-items: center; justify-content: space-between; }
.origem-title {
  font-size: 13px; font-weight: 600; color: var(--color-text);
  display: flex; align-items: center; gap: 6px;
}
.origem-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.origem-list { display: flex; flex-direction: column; gap: 10px; }
.origem-empty {
  font-size: 12px; color: var(--color-placeholder);
  text-align: center; padding: 16px 0; font-style: italic;
}
.origem-item { display: flex; flex-direction: column; gap: 4px; }
.origem-item-info { display: flex; justify-content: space-between; align-items: baseline; }
.origem-item-label {
  font-size: 12px; font-weight: 500; color: var(--color-text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80%;
}
.origem-item-count { font-size: 12px; font-weight: 700; color: var(--color-placeholder); flex-shrink: 0; }
.origem-bar-track { height: 5px; background: rgba(0,0,0,0.07); border-radius: 99px; overflow: hidden; }
.origem-bar-fill  { height: 100%; border-radius: 99px; transition: width 0.5s ease; }

/* ── Micro toggle ─────────────────────────────────────────────── */
.micro-toggle {
  display: flex;
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: 99px; padding: 2px; gap: 2px;
}
.micro-toggle button {
  background: transparent; border: none;
  font-size: 10px; font-weight: 600;
  color: var(--color-placeholder);
  padding: 2px 8px; border-radius: 99px;
  cursor: pointer; transition: all 0.2s;
}
.micro-toggle button.active { background: #42a5f5; color: #fff; }

/* ── Badges locais ────────────────────────────────────────────── */
.badge-info    { background: rgba(30,136,229,0.12);  color: #1e88e5; }
.badge-success { background: rgba(67,160,71,0.12);   color: #2e7d32; }
.badge-danger  { background: rgba(229,57,53,0.12);   color: #c62828; }
.badge-dark    { background: rgba(0,0,0,0.08);        color: var(--color-text); }

/* ── Modal ────────────────────────────────────────────────────── */
.modal-leads {
  max-width: 900px; width: 95vw;
  display: flex; flex-direction: column;
  gap: 0; padding: 0; overflow: hidden;
}
.modal-leads .modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-card-border);
  margin: 0;
}
.modal-icon {
  width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; flex-shrink: 0;
}
.modal-filters {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 24px;
  border-bottom: 1px solid var(--color-card-border);
  flex-wrap: wrap; background: var(--color-bg);
}
.modal-table-wrapper { overflow: auto; max-height: 55vh; }
.modal-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.modal-table thead { position: sticky; top: 0; z-index: 1; }
.sortable-th {
  padding: 10px 14px; text-align: left;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--color-placeholder);
  background: var(--color-card-bg);
  border-bottom: 1px solid var(--color-card-border);
  white-space: nowrap; cursor: pointer; user-select: none;
  transition: color var(--transition-fast);
}
.sortable-th:hover { color: var(--color-text); }
.th-active { color: var(--color-btn-bg) !important; }
.sort-icon { margin-left: 4px; font-size: 11px; }
.modal-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-card-border);
  vertical-align: middle; color: var(--color-text);
}
.modal-table tr:last-child td { border-bottom: none; }
.modal-table tbody tr:hover td { background: var(--color-bg); }
.table-empty { text-align: center; padding: 32px !important; color: var(--color-placeholder); font-style: italic; }
.cell-muted { color: var(--color-placeholder); }
.source-tag {
  display: inline-block; padding: 2px 8px; border-radius: 6px;
  font-size: 11px; font-weight: 500;
  background: var(--color-bg); border: 1px solid var(--color-card-border);
}
</style>
