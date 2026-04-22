<template>
  <div class="mads-dashboard">

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

    <!-- Tabela: Meta Ads Campanhas -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          <i class="bi bi-meta" style="color: var(--color-btn-bg); margin-right: 8px;"></i>
          Meta Ads — Campanhas
        </h3>
        <span class="badge badge-primary">{{ campaignRows.length }} campanhas</span>
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
              <th class="text-right">Custo</th>
              <th class="text-right">Link Clicks</th>
              <th class="text-right">CPC</th>
              <th class="text-right">CTR</th>
              <th class="text-right">Impressões</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in campaignRows" :key="i">
              <td class="campaign-name">{{ row.campaign }}</td>
              <td class="text-right">
                <span class="badge badge-success">{{ row.resultado }}</span>
              </td>
              <td class="text-right">{{ row.costPerResult }}</td>
              <td class="text-right font-semibold">{{ row.cost }}</td>
              <td class="text-right">{{ row.linkClicks }}</td>
              <td class="text-right">{{ row.cpc }}</td>
              <td class="text-right">
                <span :class="['pct-chip', row.ctrRaw >= 2 ? 'pct-good' : row.ctrRaw >= 1 ? 'pct-mid' : 'pct-low']">
                  {{ row.ctr }}
                </span>
              </td>
              <td class="text-right">{{ row.impressions }}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="table-total">
              <td class="font-bold">Total</td>
              <td class="text-right font-bold">{{ campaignTotals.resultado }}</td>
              <td class="text-right font-bold">{{ campaignTotals.costPerResult }}</td>
              <td class="text-right font-bold">{{ campaignTotals.cost }}</td>
              <td class="text-right font-bold">{{ campaignTotals.linkClicks }}</td>
              <td class="text-right font-bold">{{ campaignTotals.cpc }}</td>
              <td class="text-right font-bold">{{ campaignTotals.ctr }}</td>
              <td class="text-right font-bold">{{ campaignTotals.impressions }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Tabela: TOP 5 Grupos de Anúncio -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          <i class="bi bi-collection-fill" style="color: var(--color-info); margin-right: 8px;"></i>
          TOP 5 — Grupos de Anúncio
        </h3>
        <span class="badge badge-info">Top 5</span>
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
              <th>#</th>
              <th>Campanha</th>
              <th>Grp de Anú</th>
              <th class="text-right">Resultado</th>
              <th class="text-right">C. Resultado</th>
              <th class="text-right">Custo</th>
              <th class="text-right">Link Clicks</th>
              <th class="text-right">CPC</th>
              <th class="text-right">CTR</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in adSetRows" :key="i">
              <td class="rank-cell">{{ i + 1 }}</td>
              <td class="campaign-name">{{ row.campaign }}</td>
              <td class="campaign-name">{{ row.adSet }}</td>
              <td class="text-right">
                <span class="badge badge-success">{{ row.resultado }}</span>
              </td>
              <td class="text-right">{{ row.costPerResult }}</td>
              <td class="text-right font-semibold">{{ row.cost }}</td>
              <td class="text-right">{{ row.linkClicks }}</td>
              <td class="text-right">{{ row.cpc }}</td>
              <td class="text-right">
                <span :class="['pct-chip', row.ctrRaw >= 2 ? 'pct-good' : row.ctrRaw >= 1 ? 'pct-mid' : 'pct-low']">
                  {{ row.ctr }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tabela: TOP 5 Anúncios -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">
          <i class="bi bi-image-fill" style="color: var(--color-success); margin-right: 8px;"></i>
          TOP 5 — Anúncios
        </h3>
        <span class="badge badge-success">Top 5</span>
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
              <th>#</th>
              <th>Criativo</th>
              <th>Nome</th>
              <th class="text-right">Tipo</th>
              <th class="text-right">Resultado</th>
              <th class="text-right">C. Resultado</th>
              <th class="text-right">Custo</th>
              <th class="text-right">Link Clicks</th>
              <th class="text-right">CTR</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, i) in adRows" :key="i">
              <td class="rank-cell">{{ i + 1 }}</td>
              <td class="creative-cell">
                <button
                  v-if="row.imageUrl"
                  class="creative-thumb-btn"
                  @click="openLightbox(row.imageUrl, row.adName)"
                  :title="'Ver: ' + row.adName"
                >
                  <img
                    v-if="getResolvedUrl(row.imageUrl)"
                    :src="getResolvedUrl(row.imageUrl)"
                    :alt="row.adName"
                    class="creative-thumb"
                  />
                  <div v-else class="creative-thumb creative-thumb-loading">
                    <i class="bi bi-hourglass-split"></i>
                  </div>
                  <span class="thumb-overlay"><i class="bi bi-zoom-in"></i></span>
                </button>
                <div v-else class="creative-placeholder">
                  <i class="bi bi-image"></i>
                </div>
              </td>
              <td class="campaign-name">{{ row.adName }}</td>
              <td class="text-right">
                <span class="type-chip">{{ row.type }}</span>
              </td>
              <td class="text-right">
                <span class="badge badge-success">{{ row.resultado }}</span>
              </td>
              <td class="text-right">{{ row.costPerResult }}</td>
              <td class="text-right font-semibold">{{ row.cost }}</td>
              <td class="text-right">{{ row.linkClicks }}</td>
              <td class="text-right">
                <span :class="['pct-chip', row.ctrRaw >= 2 ? 'pct-good' : row.ctrRaw >= 1 ? 'pct-mid' : 'pct-low']">
                  {{ row.ctr }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <div v-if="lightbox.open" class="lb-overlay" @click.self="closeLightbox">
        <div class="lb-box">
          <button class="lb-close" @click="closeLightbox" title="Fechar">
            <i class="bi bi-x-lg"></i>
          </button>
          <img :src="lightbox.url" :alt="lightbox.alt" class="lb-image" />
          <p class="lb-caption">{{ lightbox.alt }}</p>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue'

// ── Props injetadas pelo sistema NexusHub ─────────────────────────────────────
const props = defineProps({
  fontsData:    { type: Object, default: () => ({}) },
  fontsLoading: { type: Object, default: () => ({}) },
  filters:      { type: Object, default: () => ({}) },
})

// ── URLs das fontes / serviços ───────────────────────────────────────────────
const FONTE_URL          = 'https://nexus-n8n.2wdiso.easypanel.host/a/d6c68dfd-48db-48f6-8751-19epanzer'
const IMAGE_RESOLVER_URL = 'https://nexus-n8n.2wdiso.easypanel.host/a/imageFace'

const isLoading = computed(() => props.fontsLoading[FONTE_URL] ?? false)

const rawData = computed(() => {
  const d = props.fontsData[FONTE_URL]
  return Array.isArray(d) ? d : []
})

// ── Helpers de formatação ─────────────────────────────────────────────────────
const fmtBRL = (v) => {
  if (v === '' || v === null || v === undefined || isNaN(Number(v))) return '—'
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v))
}
const fmtPct = (v) => {
  if (v === '' || v === null || v === undefined || isNaN(Number(v))) return '—'
  return Number(v).toFixed(2) + '%'
}
const fmtNum = (v) => {
  if (v === '' || v === null || v === undefined || isNaN(Number(v))) return '—'
  return Number(v).toLocaleString('pt-BR')
}

// ── Lógica de "resultado": Leads > Contacts > Messaging Conversations ─────────
const getResultado = (r) => {
  const leads  = Number(r['Leads']) || 0
  const contacts = Number(r['Contacts']) || 0
  const msgs   = Number(r['Messaging Conversations Started']) || 0
  return leads || contacts || msgs
}

// ── KPIs globais ──────────────────────────────────────────────────────────────
const kpiStats = computed(() => {
  const rows = rawData.value
  const totalCost        = rows.reduce((s, r) => s + (Number(r['Amount Spent (BRL)']) || 0), 0)
  const totalImpressions = rows.reduce((s, r) => s + (Number(r['Impressions'])        || 0), 0)
  const totalLinkClicks  = rows.reduce((s, r) => s + (Number(r['Link Clicks'])        || 0), 0)
  const totalContacts    = rows.reduce((s, r) => s + (Number(r['Contacts'])           || 0), 0)
  const totalMsgs        = rows.reduce((s, r) => s + (Number(r['Messaging Conversations Started']) || 0), 0)
  const totalResultado   = rows.reduce((s, r) => s + getResultado(r), 0)

  const cpc         = totalLinkClicks > 0 ? totalCost / totalLinkClicks : 0
  const ctrRaw      = totalImpressions > 0 ? (totalLinkClicks / totalImpressions) * 100 : 0
  const costPerResult = totalResultado > 0 ? totalCost / totalResultado : 0

  return [
    {
      label:     'Investimento Total',
      value:     fmtBRL(totalCost),
      icon:      'bi-currency-dollar',
      iconBg:    'rgba(223,166,37,0.12)',
      iconColor: '#dfa625',
    },
    {
      label:     'Impressões',
      value:     fmtNum(totalImpressions),
      icon:      'bi-eye',
      iconBg:    'rgba(0,150,136,0.10)',
      iconColor: '#00897b',
    },
    {
      label:     'Cliques no Link',
      value:     fmtNum(totalLinkClicks),
      icon:      'bi-cursor-fill',
      iconBg:    'rgba(30,136,229,0.10)',
      iconColor: '#1e88e5',
    },
    {
      label:     'Custo por Clique',
      value:     cpc > 0 ? fmtBRL(cpc) : '—',
      icon:      'bi-mouse2',
      iconBg:    'rgba(229,57,53,0.10)',
      iconColor: '#e53935',
    },
    {
      label:     'Resultado',
      value:     fmtNum(totalResultado),
      icon:      'bi-check2-circle',
      iconBg:    'rgba(67,160,71,0.12)',
      iconColor: '#43a047',
    },
    {
      label:     'Msg Conversations',
      value:     fmtNum(totalMsgs),
      icon:      'bi-chat-dots-fill',
      iconBg:    'rgba(103,58,183,0.12)',
      iconColor: '#7c4dff',
    },
    {
      label:     'Contacts',
      value:     fmtNum(totalContacts),
      icon:      'bi-person-check-fill',
      iconBg:    'rgba(30,136,229,0.12)',
      iconColor: '#1976d2',
    },
    {
      label:     'Custo por Resultado',
      value:     costPerResult > 0 ? fmtBRL(costPerResult) : '—',
      icon:      'bi-bullseye',
      iconBg:    'rgba(223,166,37,0.10)',
      iconColor: '#b8860b',
    },
  ]
})

// ── Helpers de cálculo de CTR ─────────────────────────────────────────────────
const calcCtr = (linkClicks, impressions) => {
  if (!impressions || !linkClicks) return 0
  return (linkClicks / impressions) * 100
}

// ── Agregação por Campanha ────────────────────────────────────────────────────
const campaignRows = computed(() => {
  const map = {}
  for (const r of rawData.value) {
    const key = r['Campaign Name'] || 'Sem campanha'
    if (!map[key]) map[key] = { campaign: key, cost: 0, resultado: 0, linkClicks: 0, impressions: 0 }
    map[key].cost        += Number(r['Amount Spent (BRL)']) || 0
    map[key].resultado   += getResultado(r)
    map[key].linkClicks  += Number(r['Link Clicks'])        || 0
    map[key].impressions += Number(r['Impressions'])        || 0
  }

  return Object.values(map).sort((a, b) => b.cost - a.cost).map(row => {
    const cpc           = row.linkClicks  > 0 ? row.cost / row.linkClicks  : 0
    const ctrRaw        = calcCtr(row.linkClicks, row.impressions)
    const costPerResult = row.resultado   > 0 ? row.cost / row.resultado   : 0
    return {
      campaign:      row.campaign,
      resultado:     fmtNum(row.resultado),
      costPerResult: costPerResult > 0 ? fmtBRL(costPerResult) : '—',
      cost:          fmtBRL(row.cost),
      linkClicks:    fmtNum(row.linkClicks),
      cpc:           cpc > 0 ? fmtBRL(cpc) : '—',
      ctr:           ctrRaw > 0 ? fmtPct(ctrRaw) : '—',
      ctrRaw,
      impressions:   fmtNum(row.impressions),
    }
  })
})

const campaignTotals = computed(() => {
  const rows = rawData.value
  const cost        = rows.reduce((s, r) => s + (Number(r['Amount Spent (BRL)']) || 0), 0)
  const resultado   = rows.reduce((s, r) => s + getResultado(r), 0)
  const linkClicks  = rows.reduce((s, r) => s + (Number(r['Link Clicks'])        || 0), 0)
  const impressions = rows.reduce((s, r) => s + (Number(r['Impressions'])        || 0), 0)
  const cpc           = linkClicks  > 0 ? cost / linkClicks  : 0
  const ctrRaw        = calcCtr(linkClicks, impressions)
  const costPerResult = resultado   > 0 ? cost / resultado   : 0
  return {
    resultado:     fmtNum(resultado),
    costPerResult: costPerResult > 0 ? fmtBRL(costPerResult) : '—',
    cost:          fmtBRL(cost),
    linkClicks:    fmtNum(linkClicks),
    cpc:           cpc > 0 ? fmtBRL(cpc) : '—',
    ctr:           ctrRaw > 0 ? fmtPct(ctrRaw) : '—',
    impressions:   fmtNum(impressions),
  }
})

// ── TOP 5 Grupos de Anúncio ───────────────────────────────────────────────────
const adSetRows = computed(() => {
  const map = {}
  for (const r of rawData.value) {
    const key = r['Ad Set ID'] || 'sem-id'
    if (!map[key]) map[key] = {
      campaign:    r['Campaign Name']  || 'Sem campanha',
      adSet:       r['Ad Set Name']    || 'Sem grupo',
      cost: 0, resultado: 0, linkClicks: 0, impressions: 0,
    }
    map[key].cost        += Number(r['Amount Spent (BRL)']) || 0
    map[key].resultado   += getResultado(r)
    map[key].linkClicks  += Number(r['Link Clicks'])        || 0
    map[key].impressions += Number(r['Impressions'])        || 0
  }

  return Object.values(map)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5)
    .map(row => {
      const cpc           = row.linkClicks > 0 ? row.cost / row.linkClicks : 0
      const ctrRaw        = calcCtr(row.linkClicks, row.impressions)
      const costPerResult = row.resultado  > 0 ? row.cost / row.resultado  : 0
      return {
        campaign:      row.campaign,
        adSet:         row.adSet,
        resultado:     fmtNum(row.resultado),
        costPerResult: costPerResult > 0 ? fmtBRL(costPerResult) : '—',
        cost:          fmtBRL(row.cost),
        linkClicks:    fmtNum(row.linkClicks),
        cpc:           cpc > 0 ? fmtBRL(cpc) : '—',
        ctr:           ctrRaw > 0 ? fmtPct(ctrRaw) : '—',
        ctrRaw,
      }
    })
})

// ── TOP 5 Anúncios ────────────────────────────────────────────────────────────
const adRows = computed(() => {
  const map = {}
  for (const r of rawData.value) {
    const key = r['Ad ID'] || 'sem-id'
    if (!map[key]) map[key] = {
      adName:   r['Ad Name']  || 'Sem nome',
      imageUrl: r['Ad Creative Image Permalink URL'] || '',
      type:     r['Creative Object Type'] || '—',
      cost: 0, resultado: 0, linkClicks: 0, impressions: 0,
    }
    // Atualiza imageUrl se ainda estiver vazia e a linha atual tiver uma
    if (!map[key].imageUrl && r['Ad Creative Image Permalink URL']) {
      map[key].imageUrl = r['Ad Creative Image Permalink URL']
    }
    map[key].cost        += Number(r['Amount Spent (BRL)']) || 0
    map[key].resultado   += getResultado(r)
    map[key].linkClicks  += Number(r['Link Clicks'])        || 0
    map[key].impressions += Number(r['Impressions'])        || 0
  }

  return Object.values(map)
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5)
    .map(row => {
      const ctrRaw        = calcCtr(row.linkClicks, row.impressions)
      const costPerResult = row.resultado > 0 ? row.cost / row.resultado : 0
      return {
        adName:        row.adName,
        imageUrl:      row.imageUrl,
        type:          row.type,
        resultado:     fmtNum(row.resultado),
        costPerResult: costPerResult > 0 ? fmtBRL(costPerResult) : '—',
        cost:          fmtBRL(row.cost),
        linkClicks:    fmtNum(row.linkClicks),
        ctr:           ctrRaw > 0 ? fmtPct(ctrRaw) : '—',
        ctrRaw,
      }
    })
})

// ── Resolução de imagens via n8n (cache local, sem requisições duplicadas) ────
// resolvedImages: { [permalinkUrl]: cdnUrl | 'loading' | 'error' }
const resolvedImages = reactive({})
const pendingSet     = new Set()

const resolveImage = async (permalinkUrl) => {
  if (!permalinkUrl)                         return
  if (resolvedImages[permalinkUrl])          return  // já resolvida ou em voo
  if (pendingSet.has(permalinkUrl))          return  // requisição já em andamento

  pendingSet.add(permalinkUrl)
  resolvedImages[permalinkUrl] = 'loading'

  try {
    const res  = await fetch(IMAGE_RESOLVER_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ url: permalinkUrl }),
    })
    const data = await res.json()
    // Aceita { url: '...' } ou string direta
    const cdnUrl = typeof data === 'string' ? data : (data?.url || data?.imageUrl || '')
    resolvedImages[permalinkUrl] = cdnUrl || 'error'
  } catch {
    resolvedImages[permalinkUrl] = 'error'
  } finally {
    pendingSet.delete(permalinkUrl)
  }
}

// Dispara a resolução sempre que os adRows mudarem
watch(
  adRows,
  (rows) => {
    for (const row of rows) {
      if (row.imageUrl) resolveImage(row.imageUrl)
    }
  },
  { immediate: true }
)

// Helper para o template
const getResolvedUrl = (permalinkUrl) => {
  const v = resolvedImages[permalinkUrl]
  if (!v || v === 'loading' || v === 'error') return ''
  return v
}

// ── Lightbox ─────────────────────────────────────────────────────────────────
const lightbox = reactive({ open: false, url: '', alt: '' })

const openLightbox = (permalinkUrl, alt) => {
  const resolved = getResolvedUrl(permalinkUrl)
  lightbox.url  = resolved || permalinkUrl   // fallback para o permalink original
  lightbox.alt  = alt || ''
  lightbox.open = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  lightbox.open = false
  lightbox.url  = ''
  document.body.style.overflow = ''
}
</script>

<style scoped>
/* ── Layout geral ── */
.mads-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── KPI Grid ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
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
  max-width: 280px;
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

/* ── CTR colorido ── */
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

.creative-cell {
  width: 64px;
  text-align: center;
}

.creative-thumb-btn {
  position: relative;
  display: inline-block;
  border: none;
  padding: 0;
  background: none;
  cursor: pointer;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-card-border);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}
.creative-thumb-btn:hover {
  transform: scale(1.06);
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
}
.creative-thumb-btn:hover .thumb-overlay {
  opacity: 1;
}

.thumb-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  opacity: 0;
  transition: opacity var(--transition-fast);
  border-radius: var(--radius-md);
}

.creative-thumb {
  width: 52px;
  height: 52px;
  object-fit: cover;
  display: block;
}

.creative-thumb-loading {
  width: 52px;
  height: 52px;
  background: linear-gradient(90deg,
    var(--color-card-border) 25%,
    rgba(223,166,37,0.08) 50%,
    var(--color-card-border) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-placeholder);
  font-size: 14px;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.lb-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.88);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: lbFadeIn 0.18s ease;
  backdrop-filter: blur(4px);
}
@keyframes lbFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.lb-box {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: lbScaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes lbScaleIn {
  from { transform: scale(0.85); opacity: 0; }
  to   { transform: scale(1);    opacity: 1; }
}

.lb-image {
  max-width: 90vw;
  max-height: 82vh;
  object-fit: contain;
  border-radius: var(--radius-lg);
  box-shadow: 0 24px 80px rgba(0,0,0,0.6);
  display: block;
}

.lb-caption {
  color: rgba(255,255,255,0.75);
  font-size: var(--font-sm);
  text-align: center;
  max-width: 600px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lb-close {
  position: absolute;
  top: -44px;
  right: 0;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  color: #fff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: background var(--transition-fast);
}
.lb-close:hover {
  background: rgba(255,255,255,0.25);
}

.creative-placeholder {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-card-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-placeholder);
  font-size: 18px;
  margin: 0 auto;
}

/* ── Tipo do criativo ── */
.type-chip {
  display: inline-block;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-xs);
  font-weight: 700;
  background: rgba(30, 136, 229, 0.12);
  color: #1565c0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
