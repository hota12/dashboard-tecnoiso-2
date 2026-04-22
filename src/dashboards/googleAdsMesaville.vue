<template>
  <div class="gads-dashboard">

    <!-- KPI Stats Row -->
    <div class="stats-grid">
      <div v-for="(stat, i) in kpiStats" :key="i" class="stat-card">
        <div v-if="isLoading" class="skeleton stat-skeleton"></div>
        <template v-else>
          <div class="stat-icon" :style="{ background: stat.iconBg, color: stat.iconColor }">
            <i :class="'bi ' + stat.icon"></i>
          </div>
          <div class="stat-content">
            <p class="stat-label">{{ stat.label }}</p>
            <p class="stat-value">{{ stat.value }}</p>
          </div>
        </template>
      </div>
    </div>

    <!-- Tabela: Campanhas -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          <i class="bi bi-megaphone-fill" style="color: var(--color-btn-bg); margin-right: 8px;"></i>
          Google Ads — Campanhas
        </h3>
        <span class="badge badge-primary">{{ rawData.length }} registros</span>
      </div>

      <div v-if="isLoading" class="skeleton" style="height: 280px; border-radius: 8px;"></div>

      <div v-else-if="rawData.length === 0" class="empty-state">
        <i class="bi bi-inbox"></i>
        <p>Nenhum dado disponível para o período selecionado.</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Campanha</th>
              <th class="text-right">Resultado</th>
              <th class="text-right">C. Resultado</th>
              <th class="text-right">Tx Conversão</th>
              <th class="text-right">Custo</th>
              <th class="text-right">Cliques</th>
              <th class="text-right">CPC</th>
              <th class="text-right">CTR</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in campaignRows" :key="i">
              <td class="campaign-name">{{ row.campaign }}</td>
              <td class="text-right">
                <span class="badge badge-success">{{ row.conversions }}</span>
              </td>
              <td class="text-right">{{ row.costPerConv }}</td>
              <td class="text-right">
                <span :class="['pct-chip', row.convRateRaw >= 10 ? 'pct-good' : row.convRateRaw >= 5 ? 'pct-mid' : 'pct-low']">
                  {{ row.convRate }}
                </span>
              </td>
              <td class="text-right font-semibold">{{ row.cost }}</td>
              <td class="text-right">{{ row.clicks }}</td>
              <td class="text-right">{{ row.cpc }}</td>
              <td class="text-right">{{ row.ctr }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="table-total">
              <td class="font-bold">Total</td>
              <td class="text-right font-bold">{{ campaignTotals.conversions }}</td>
              <td class="text-right font-bold">{{ campaignTotals.costPerConv }}</td>
              <td class="text-right font-bold">{{ campaignTotals.convRate }}</td>
              <td class="text-right font-bold">{{ campaignTotals.cost }}</td>
              <td class="text-right font-bold">{{ campaignTotals.clicks }}</td>
              <td class="text-right font-bold">{{ campaignTotals.cpc }}</td>
              <td class="text-right font-bold">{{ campaignTotals.ctr }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Tabela: Grupos de Anúncio -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          <i class="bi bi-collection-fill" style="color: var(--color-info); margin-right: 8px;"></i>
          Google Ads — Grupos de Anúncio
        </h3>
        <span class="badge badge-info">{{ adGroupRows.length }} grupos</span>
      </div>

      <div v-if="isLoading" class="skeleton" style="height: 280px; border-radius: 8px;"></div>

      <div v-else-if="rawData.length === 0" class="empty-state">
        <i class="bi bi-inbox"></i>
        <p>Nenhum dado disponível para o período selecionado.</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Grupo de Anúncio</th>
              <th class="text-right">Resultado</th>
              <th class="text-right">C. Resultado</th>
              <th class="text-right">Tx Conversão</th>
              <th class="text-right">Custo</th>
              <th class="text-right">Cliques</th>
              <th class="text-right">CPC</th>
              <th class="text-right">CTR</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in adGroupRows" :key="i">
              <td class="campaign-name">{{ row.adGroup }}</td>
              <td class="text-right">
                <span class="badge badge-success">{{ row.conversions }}</span>
              </td>
              <td class="text-right">{{ row.costPerConv }}</td>
              <td class="text-right">
                <span :class="['pct-chip', row.convRateRaw >= 10 ? 'pct-good' : row.convRateRaw >= 5 ? 'pct-mid' : 'pct-low']">
                  {{ row.convRate }}
                </span>
              </td>
              <td class="text-right font-semibold">{{ row.cost }}</td>
              <td class="text-right">{{ row.clicks }}</td>
              <td class="text-right">{{ row.cpc }}</td>
              <td class="text-right">{{ row.ctr }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="table-total">
              <td class="font-bold">Total</td>
              <td class="text-right font-bold">{{ adGroupTotals.conversions }}</td>
              <td class="text-right font-bold">{{ adGroupTotals.costPerConv }}</td>
              <td class="text-right font-bold">{{ adGroupTotals.convRate }}</td>
              <td class="text-right font-bold">{{ adGroupTotals.cost }}</td>
              <td class="text-right font-bold">{{ adGroupTotals.clicks }}</td>
              <td class="text-right font-bold">{{ adGroupTotals.cpc }}</td>
              <td class="text-right font-bold">{{ adGroupTotals.ctr }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Tabela: TOP 20 Palavras-Chave -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          <i class="bi bi-key-fill" style="color: var(--color-success); margin-right: 8px;"></i>
          TOP 20 Palavras-Chave
        </h3>
        <span class="badge badge-success">{{ keywordRows.length }} palavras</span>
      </div>

      <div v-if="isKeywordsLoading" class="skeleton" style="height: 280px; border-radius: 8px;"></div>

      <div v-else-if="rawKeywords.length === 0" class="empty-state">
        <i class="bi bi-inbox"></i>
        <p>Nenhuma palavra-chave disponível para o período selecionado.</p>
      </div>

      <div v-else class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Palavra-Chave</th>
              <th class="text-right">Resultado</th>
              <th class="text-right">C. Resultado</th>
              <th class="text-right">Tx Conversão</th>
              <th class="text-right">Custo</th>
              <th class="text-right">Cliques</th>
              <th class="text-right">CPC</th>
              <th class="text-right">CTR</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in keywordRows" :key="i">
              <td class="rank-cell">{{ i + 1 }}</td>
              <td class="campaign-name">{{ row.keyword }}</td>
              <td class="text-right">
                <span class="badge badge-success">{{ row.conversions }}</span>
              </td>
              <td class="text-right">{{ row.costPerConv }}</td>
              <td class="text-right">
                <span :class="['pct-chip', row.convRateRaw >= 10 ? 'pct-good' : row.convRateRaw >= 5 ? 'pct-mid' : 'pct-low']">
                  {{ row.convRate }}
                </span>
              </td>
              <td class="text-right font-semibold">{{ row.cost }}</td>
              <td class="text-right">{{ row.clicks }}</td>
              <td class="text-right">{{ row.cpc }}</td>
              <td class="text-right">{{ row.ctr }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

// ── Props injetadas pelo sistema NexusHub ─────────────────────────────────────
const props = defineProps({
  fontsData:    { type: Object, default: () => ({}) },
  fontsLoading: { type: Object, default: () => ({}) },
  filters:      { type: Object, default: () => ({}) },
})

// ── URLs das fontes cadastradas no banco ─────────────────────────────────────
const FONTE_ADS_URL      = 'https://nexus-n8n.2wdiso.easypanel.host/a/07f9f673-d4bf-40cf-9428-a822674bfd5c'
const FONTE_KEYWORDS_URL = 'https://nexus-n8n.2wdiso.easypanel.host/a/07f9fdwdwwww-9421312213123c'

const isLoading         = computed(() => props.fontsLoading[FONTE_ADS_URL] ?? false)
const isKeywordsLoading = computed(() => props.fontsLoading[FONTE_KEYWORDS_URL] ?? false)

const rawData = computed(() => {
  const d = props.fontsData[FONTE_ADS_URL]
  return Array.isArray(d) ? d : []
})
const rawKeywords = computed(() => {
  const d = props.fontsData[FONTE_KEYWORDS_URL]
  return Array.isArray(d) ? d : []
})

// ── Helpers de formatação ─────────────────────────────────────────────────────
const fmtBRL = (v) => {
  if (v === '' || v === null || v === undefined || isNaN(Number(v))) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v))
}
const fmtPct = (v) => {
  if (v === '' || v === null || v === undefined || isNaN(Number(v))) return '—'
  return (Number(v) * 100).toFixed(2) + '%'
}
const fmtNum = (v) => {
  if (v === '' || v === null || v === undefined || isNaN(Number(v))) return '—'
  return Number(v).toLocaleString('pt-BR')
}

// ── KPIs globais (agregação de todos os registros) ────────────────────────────
const kpiStats = computed(() => {
  const rows = rawData.value
  const totalCost        = rows.reduce((s, r) => s + (Number(r['Cost (BRL)'])   || 0), 0)
  const totalConversions = rows.reduce((s, r) => s + (Number(r['Conversions'])  || 0), 0)
  const totalClicks      = rows.reduce((s, r) => s + (Number(r['Clicks'])       || 0), 0)
  const totalImpressions = rows.reduce((s, r) => s + (Number(r['Impressions'])  || 0), 0)
  const totalAllConv     = rows.reduce((s, r) => s + (Number(r['All Conv.'])    || 0), 0)

  const cpr   = totalConversions > 0 ? totalCost / totalConversions : 0
  const cpc   = totalClicks > 0      ? totalCost / totalClicks      : 0
  const txConv = totalClicks > 0     ? (totalConversions / totalClicks) * 100 : 0

  return [
    {
      label: 'Investimento Total',
      value: fmtBRL(totalCost),
      icon: 'bi-currency-dollar',
      iconBg: 'rgba(223,166,37,0.12)',
      iconColor: '#dfa625',
    },
    {
      label: 'Resultados (Conv.)',
      value: fmtNum(totalConversions),
      icon: 'bi-check2-circle',
      iconBg: 'rgba(67,160,71,0.12)',
      iconColor: '#43a047',
    },
    {
      label: 'Custo por Resultado',
      value: cpr > 0 ? fmtBRL(cpr) : '—',
      icon: 'bi-bullseye',
      iconBg: 'rgba(30,136,229,0.12)',
      iconColor: '#1e88e5',
    },
    {
      label: 'Tx Conversão',
      value: txConv > 0 ? txConv.toFixed(2) + '%' : '—',
      icon: 'bi-arrow-up-right-circle',
      iconBg: 'rgba(103,58,183,0.12)',
      iconColor: '#7c4dff',
    },
    {
      label: 'Cliques',
      value: fmtNum(totalClicks),
      icon: 'bi-mouse2',
      iconBg: 'rgba(30,136,229,0.10)',
      iconColor: '#1e88e5',
    },
    {
      label: 'Custo por Clique',
      value: cpc > 0 ? fmtBRL(cpc) : '—',
      icon: 'bi-cursor',
      iconBg: 'rgba(229,57,53,0.10)',
      iconColor: '#e53935',
    },
    {
      label: 'Impressões',
      value: fmtNum(totalImpressions),
      icon: 'bi-eye',
      iconBg: 'rgba(0,150,136,0.10)',
      iconColor: '#00897b',
    },
  ]
})

// ── Agregação por Campanha ────────────────────────────────────────────────────
const campaignRows = computed(() => {
  const map = {}
  for (const r of rawData.value) {
    const key = r['Campaign'] || 'Sem campanha'
    if (!map[key]) map[key] = { campaign: key, cost: 0, conversions: 0, allConv: 0, clicks: 0, impressions: 0 }
    map[key].cost        += Number(r['Cost (BRL)'])  || 0
    map[key].conversions += Number(r['Conversions']) || 0
    map[key].allConv     += Number(r['All Conv.'])   || 0
    map[key].clicks      += Number(r['Clicks'])      || 0
    map[key].impressions += Number(r['Impressions']) || 0
  }

  return Object.values(map).sort((a, b) => b.cost - a.cost).map(row => {
    const cpc      = row.clicks > 0 ? row.cost / row.clicks : 0
    const ctr      = row.impressions > 0 ? row.clicks / row.impressions : 0
    const convRate = row.clicks > 0 ? (row.conversions / row.clicks) * 100 : 0
    const costPerConv = row.conversions > 0 ? row.cost / row.conversions : 0
    return {
      campaign:     row.campaign,
      conversions:  fmtNum(row.conversions),
      costPerConv:  costPerConv > 0 ? fmtBRL(costPerConv) : '—',
      convRate:     convRate > 0 ? convRate.toFixed(2) + '%' : '—',
      convRateRaw:  convRate,
      cost:         fmtBRL(row.cost),
      clicks:       fmtNum(row.clicks),
      cpc:          cpc > 0 ? fmtBRL(cpc) : '—',
      ctr:          ctr > 0 ? fmtPct(ctr) : '—',
      _raw: row,
    }
  })
})

const campaignTotals = computed(() => {
  const rows = rawData.value
  const cost        = rows.reduce((s, r) => s + (Number(r['Cost (BRL)'])  || 0), 0)
  const conversions = rows.reduce((s, r) => s + (Number(r['Conversions']) || 0), 0)
  const clicks      = rows.reduce((s, r) => s + (Number(r['Clicks'])      || 0), 0)
  const impressions = rows.reduce((s, r) => s + (Number(r['Impressions']) || 0), 0)
  const cpc         = clicks > 0      ? cost / clicks      : 0
  const ctr         = impressions > 0 ? clicks / impressions : 0
  const convRate    = clicks > 0      ? (conversions / clicks) * 100 : 0
  const costPerConv = conversions > 0 ? cost / conversions : 0
  return {
    conversions:  fmtNum(conversions),
    costPerConv:  costPerConv > 0 ? fmtBRL(costPerConv) : '—',
    convRate:     convRate > 0 ? convRate.toFixed(2) + '%' : '—',
    cost:         fmtBRL(cost),
    clicks:       fmtNum(clicks),
    cpc:          cpc > 0 ? fmtBRL(cpc) : '—',
    ctr:          ctr > 0 ? fmtPct(ctr) : '—',
  }
})

// ── Agregação por Grupo de Anúncio ────────────────────────────────────────────
const adGroupRows = computed(() => {
  const map = {}
  for (const r of rawData.value) {
    const key = r['Ad Group Name'] || 'Sem grupo'
    if (!map[key]) map[key] = { adGroup: key, cost: 0, conversions: 0, allConv: 0, clicks: 0, impressions: 0 }
    map[key].cost        += Number(r['Cost (BRL)'])  || 0
    map[key].conversions += Number(r['Conversions']) || 0
    map[key].allConv     += Number(r['All Conv.'])   || 0
    map[key].clicks      += Number(r['Clicks'])      || 0
    map[key].impressions += Number(r['Impressions']) || 0
  }

  return Object.values(map).sort((a, b) => b.cost - a.cost).map(row => {
    const cpc      = row.clicks > 0 ? row.cost / row.clicks : 0
    const ctr      = row.impressions > 0 ? row.clicks / row.impressions : 0
    const convRate = row.clicks > 0 ? (row.conversions / row.clicks) * 100 : 0
    const costPerConv = row.conversions > 0 ? row.cost / row.conversions : 0
    return {
      adGroup:      row.adGroup,
      conversions:  fmtNum(row.conversions),
      costPerConv:  costPerConv > 0 ? fmtBRL(costPerConv) : '—',
      convRate:     convRate > 0 ? convRate.toFixed(2) + '%' : '—',
      convRateRaw:  convRate,
      cost:         fmtBRL(row.cost),
      clicks:       fmtNum(row.clicks),
      cpc:          cpc > 0 ? fmtBRL(cpc) : '—',
      ctr:          ctr > 0 ? fmtPct(ctr) : '—',
    }
  })
})

const adGroupTotals = computed(() => {
  const rows = rawData.value
  const cost        = rows.reduce((s, r) => s + (Number(r['Cost (BRL)'])  || 0), 0)
  const conversions = rows.reduce((s, r) => s + (Number(r['Conversions']) || 0), 0)
  const clicks      = rows.reduce((s, r) => s + (Number(r['Clicks'])      || 0), 0)
  const impressions = rows.reduce((s, r) => s + (Number(r['Impressions']) || 0), 0)
  const cpc         = clicks > 0      ? cost / clicks      : 0
  const ctr         = impressions > 0 ? clicks / impressions : 0
  const convRate    = clicks > 0      ? (conversions / clicks) * 100 : 0
  const costPerConv = conversions > 0 ? cost / conversions : 0
  return {
    conversions:  fmtNum(conversions),
    costPerConv:  costPerConv > 0 ? fmtBRL(costPerConv) : '—',
    convRate:     convRate > 0 ? convRate.toFixed(2) + '%' : '—',
    cost:         fmtBRL(cost),
    clicks:       fmtNum(clicks),
    cpc:          cpc > 0 ? fmtBRL(cpc) : '—',
    ctr:          ctr > 0 ? fmtPct(ctr) : '—',
  }
})

// ── TOP 20 Palavras-Chave ─────────────────────────────────────────────────────
const keywordRows = computed(() => {
  const map = {}
  for (const r of rawKeywords.value) {
    const key = r['Keyword'] || 'Sem keyword'
    if (!map[key]) map[key] = { keyword: key, cost: 0, conversions: 0, clicks: 0, impressions: 0 }
    map[key].cost        += Number(r['Cost (BRL)'])  || 0
    map[key].conversions += Number(r['Conversions']) || 0
    map[key].clicks      += Number(r['Clicks'])      || 0
    map[key].impressions += Number(r['Impressions']) || 0
  }

  return Object.values(map)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 20)
    .map(row => {
      const cpc         = row.clicks > 0      ? row.cost / row.clicks      : 0
      const ctr         = row.impressions > 0 ? row.clicks / row.impressions : 0
      const convRate    = row.clicks > 0      ? (row.conversions / row.clicks) * 100 : 0
      const costPerConv = row.conversions > 0 ? row.cost / row.conversions  : 0
      return {
        keyword:      row.keyword,
        conversions:  fmtNum(row.conversions),
        costPerConv:  costPerConv > 0 ? fmtBRL(costPerConv) : '—',
        convRate:     convRate > 0 ? convRate.toFixed(2) + '%' : '—',
        convRateRaw:  convRate,
        cost:         fmtBRL(row.cost),
        clicks:       fmtNum(row.clicks),
        cpc:          cpc > 0 ? fmtBRL(cpc) : '—',
        ctr:          ctr > 0 ? fmtPct(ctr) : '—',
      }
    })
})
</script>

<style scoped>
/* ── Layout geral ── */
.gads-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── KPI Grid ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 14px;
}

@media (max-width: 1400px) {
  .stats-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (max-width: 900px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

.stat-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: 18px 16px;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: flex-start;
  gap: 14px;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
}

.stat-skeleton {
  width: 100%;
  height: 72px;
  border-radius: var(--radius-md);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.stat-content { flex: 1; min-width: 0; }

.stat-label {
  font-size: var(--font-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-placeholder);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value {
  font-size: var(--font-lg);
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.2;
  white-space: nowrap;
}

/* ── Tabela ── */
.text-right { text-align: right; }

.rank-cell {
  width: 36px;
  font-size: var(--font-xs);
  font-weight: 800;
  color: var(--color-placeholder);
  text-align: center;
}

.campaign-name {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}

.table-total td {
  background: rgba(223, 166, 37, 0.07);
  font-weight: 700;
  border-top: 2px solid var(--color-card-border);
}

/* ── Taxa de conversão colorida ── */
.pct-chip {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-xs);
  font-weight: 700;
}
.pct-good {
  background: rgba(67, 160, 71, 0.15);
  color: #2e7d32;
}
.pct-mid {
  background: rgba(223, 166, 37, 0.15);
  color: #a07218;
}
.pct-low {
  background: rgba(229, 57, 53, 0.12);
  color: #c62828;
}
</style>
