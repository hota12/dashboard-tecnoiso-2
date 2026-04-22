<template>
  <div class="demo-dashboard">
    <!-- Stats row -->
    <div class="stats-grid">
      <div
        v-for="(stat, i) in stats"
        :key="i"
        class="stat-card"
      >
        <div v-if="isLoading" class="skeleton stat-skeleton"></div>
        <template v-else>
          <div class="stat-icon" :style="{ background: stat.iconBg, color: stat.iconColor }">
            <i :class="'bi ' + stat.icon"></i>
          </div>
          <div class="stat-content">
            <p class="stat-label">{{ stat.label }}</p>
            <p class="stat-value">{{ stat.value }}</p>
            <p class="stat-change" :class="stat.positive ? 'positive' : 'negative'">
              <i :class="stat.positive ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
              {{ stat.change }}
            </p>
          </div>
        </template>
      </div>
    </div>

    <!-- Charts row -->
    <div class="charts-row">
      <!-- Line chart -->
      <div class="card chart-card">
        <div class="card-header">
          <h3 class="card-title">Faturamento Mensal</h3>
          <span class="badge badge-primary">{{ filters.startDate }} — {{ filters.endDate }}</span>
        </div>
        <div v-if="isLoading" class="skeleton" style="height:260px;border-radius:8px"></div>
        <Line v-else :data="lineData" :options="chartOptions" style="height:260px" />
      </div>

      <!-- Doughnut chart -->
      <div class="card chart-card chart-card-sm">
        <div class="card-header">
          <h3 class="card-title">Distribuição</h3>
        </div>
        <div v-if="isLoading" class="skeleton" style="height:260px;border-radius:8px"></div>
        <Doughnut v-else :data="doughnutData" :options="doughnutOptions" style="height:260px" />
      </div>
    </div>

    <!-- Bottom row -->
    <div class="charts-row">
      <div class="card chart-card">
        <div class="card-header">
          <h3 class="card-title">Vendas por Vendedor</h3>
        </div>
        <div v-if="isLoading" class="skeleton" style="height:220px;border-radius:8px"></div>
        <Bar v-else :data="barData" :options="chartOptions" style="height:220px" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  fontsData: { type: Object, default: () => ({}) },
  fontsLoading: { type: Object, default: () => ({}) },
  filters: { type: Object, default: () => ({}) },
})

const isLoading = computed(() => Object.values(props.fontsLoading).some(Boolean))

// Mock/demo stats — em produção viriam de fontsData
const stats = computed(() => [
  {
    label: 'Faturamento',
    value: 'R$ 284.500',
    change: '+12,3% vs período anterior',
    positive: true,
    icon: 'bi-currency-dollar',
    iconBg: 'rgba(223,166,37,0.12)',
    iconColor: '#dfa625',
  },
  {
    label: 'Pedidos',
    value: '1.847',
    change: '+8,1% vs período anterior',
    positive: true,
    icon: 'bi-bag-check',
    iconBg: 'rgba(30,136,229,0.12)',
    iconColor: '#1e88e5',
  },
  {
    label: 'Ticket Médio',
    value: 'R$ 154,00',
    change: '+3,9% vs período anterior',
    positive: true,
    icon: 'bi-receipt',
    iconBg: 'rgba(67,160,71,0.12)',
    iconColor: '#43a047',
  },
  {
    label: 'Cancelamentos',
    value: '43',
    change: '+5,2% vs período anterior',
    positive: false,
    icon: 'bi-x-circle',
    iconBg: 'rgba(229,57,53,0.12)',
    iconColor: '#e53935',
  },
])

const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const lineData = computed(() => ({
  labels,
  datasets: [
    {
      label: 'Faturamento',
      data: [42000, 55000, 38000, 71000, 63000, 88000, 75000, 92000, 84000, 97000, 110000, 103000],
      borderColor: '#dfa625',
      backgroundColor: 'rgba(223,166,37,0.1)',
      borderWidth: 2.5,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#dfa625',
      pointRadius: 4,
    },
    {
      label: 'Meta',
      data: [50000, 60000, 50000, 70000, 70000, 80000, 80000, 90000, 90000, 100000, 100000, 110000],
      borderColor: '#313131',
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderDash: [5, 5],
      fill: false,
      tension: 0.4,
      pointRadius: 0,
    },
  ],
}))

const barData = computed(() => ({
  labels: ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Lima', 'Carlos Souza'],
  datasets: [
    {
      label: 'Vendas',
      data: [68000, 52000, 44000, 71000, 39000],
      backgroundColor: [
        'rgba(223,166,37,0.85)',
        'rgba(223,166,37,0.65)',
        'rgba(223,166,37,0.5)',
        'rgba(223,166,37,0.75)',
        'rgba(223,166,37,0.4)',
      ],
      borderRadius: 6,
    },
  ],
}))

const doughnutData = computed(() => ({
  labels: ['Produto A', 'Produto B', 'Produto C', 'Outros'],
  datasets: [
    {
      data: [38, 27, 22, 13],
      backgroundColor: ['#dfa625', '#313131', '#888888', '#e0e0e0'],
      borderWidth: 0,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { font: { family: 'Nunito', size: 12 } },
    },
  },
  scales: {
    x: { grid: { display: false } },
    y: {
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: { callback: (v) => 'R$' + (v / 1000).toFixed(0) + 'k' },
    },
  },
}

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { family: 'Nunito', size: 12 }, padding: 16 },
    },
  },
}
</script>

<style scoped>
.demo-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
}

.stat-skeleton {
  width: 100%;
  height: 80px;
  border-radius: var(--radius-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: var(--font-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-placeholder);
  margin-bottom: 4px;
}

.stat-value {
  font-size: var(--font-xl);
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.2;
}

.stat-change {
  font-size: var(--font-xs);
  font-weight: 600;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 3px;
}
.stat-change.positive {
  color: var(--color-success);
}
.stat-change.negative {
  color: var(--color-danger);
}

/* Charts */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
}

@media (max-width: 1100px) {
  .charts-row {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  /* inherits .card */
}

.chart-card-sm {
  /* smaller side card */
}
</style>
