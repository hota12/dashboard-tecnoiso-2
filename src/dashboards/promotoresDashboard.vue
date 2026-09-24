<template>
  <div class="promotores-dashboard">

    <!-- ── Loading ─────────────────────────────────────────── -->
    <template v-if="loading && !raw">
      <div class="kpi-row">
        <div class="skeleton kpi-skeleton" v-for="i in 5" :key="i"></div>
      </div>
      <div class="main-grid">
        <div class="skeleton panel-skeleton"></div>
        <div class="skeleton panel-skeleton"></div>
      </div>
    </template>

    <!-- ── Error ────────────────────────────────────────────── -->
    <div v-else-if="error" class="empty-state">
      <i class="bi bi-exclamation-triangle"></i>
      <p>{{ error }}</p>
      <span class="text-xs text-muted">Use o botão de atualizar no topo para tentar novamente</span>
    </div>

    <div v-else-if="!raw" class="empty-state">
      <i class="bi bi-inbox"></i>
      <p>Nenhum dado recebido da fonte</p>
    </div>

    <!-- ── Conteúdo ─────────────────────────────────────────── -->
    <template v-else>

      <!-- ── KPIs ─────────────────────────────────────────────── -->
      <div class="kpi-row">
        <div v-for="k in kpiCards" :key="k.key" class="kpi-card">
          <div class="kpi-badge" :class="`kpi-badge--${k.key}`">{{ k.sigla }}</div>
          <div class="kpi-body">
            <span class="kpi-label">{{ k.label }}</span>
            <span class="kpi-value">{{ fmtInt(k.value) }}</span>
            <span class="kpi-sub">{{ k.sub }}</span>
          </div>
        </div>
      </div>

      <div class="main-grid">

        <!-- ── Ranking ────────────────────────────────────────── -->
        <section class="panel">
          <header class="panel-head">
            <div class="panel-head-left">
              <h3 class="panel-title"><span class="title-dot"></span> Ranking — Acumulado do programa</h3>
              <div class="legend">
                <span v-for="s in SEGMENTOS" :key="s.key" class="legend-item">
                  <i :style="{ background: s.cor }"></i>{{ s.legenda }}
                </span>
              </div>
            </div>
            <div class="panel-head-right">
              <span class="muted">
                {{ ranking.length }} técnicos · ordenado por pontos
                <template v-if="modelo.semTecnico"> · {{ modelo.semTecnico }} sem técnico ignorada(s)</template>
              </span>
              <button class="btn-regras" @click="showRegras = true">
                <i class="bi bi-info-circle"></i> Regras do programa
              </button>
            </div>
          </header>

          <div v-if="!ranking.length" class="empty-state">
            <i class="bi bi-trophy"></i>
            <p>Nenhuma indicação no período</p>
          </div>

          <ol v-else class="rank-list">
            <li
              v-for="(t, i) in ranking"
              :key="t.key"
              class="rank-row"
              :class="{ 'rank-row--active': t.key === selected?.key }"
              @click="selecionar(t.key)"
            >
              <span class="rank-pos">{{ i + 1 }}</span>
              <span class="avatar" :class="avatarClass(i)">{{ t.iniciais }}</span>

              <div class="rank-main">
                <div class="rank-top">
                  <span class="rank-nome">{{ t.nome }}</span>
                  <span class="mes-chips">
                    <span
                      v-for="m in t.meses"
                      :key="m.key"
                      class="mes-chip"
                      :class="`mes-chip--${m.status}`"
                      :title="m.titulo"
                    >{{ m.label }}</span>
                  </span>
                </div>

                <div class="bar">
                  <span
                    v-for="s in SEGMENTOS"
                    :key="s.key"
                    class="bar-seg"
                    :style="{ width: barPct(t.comp[s.key].pts), background: s.cor }"
                  ></span>
                </div>

                <div class="rank-counts">
                  <span><b class="c-e1">{{ t.comp.e1.n }}</b> indic.</span>
                  <span><b class="c-e2">{{ t.comp.e2.n }}</b> qualif.</span>
                  <span><b class="c-e3">{{ t.comp.e3.n }}</b> orçam.</span>
                  <span><b class="c-e4">{{ t.comp.e4.n }}</b> vendas</span>
                </div>
              </div>

              <div class="rank-pts">
                <span class="rank-pts-valor">{{ fmtInt(t.pontos) }}</span>
                <span class="rank-pts-un">pts</span>
              </div>
            </li>
          </ol>
        </section>

        <!-- ── Detalhe do técnico ─────────────────────────────── -->
        <section v-if="selected" ref="detailRef" class="panel detail">
          <header class="detail-head">
            <span class="avatar avatar-lg" :class="avatarClass(selectedPos - 1)">{{ selected.iniciais }}</span>
            <div>
              <h3 class="detail-nome">{{ selected.nome }}</h3>
              <p class="muted">{{ selectedPos }}º no ranking · {{ selected.comp.e1.n }} indicações no programa</p>
            </div>
          </header>

          <div class="detail-pts">
            <span class="section-label">Pontos</span>
            <span class="detail-pts-valor">{{ fmtInt(selected.pontos) }}</span>
          </div>

          <div class="detail-section">
            <span class="section-label">Composição — acumulado do programa</span>
            <div class="comp-list">
              <div v-for="c in COMPOSICAO" :key="c.key" class="comp-row">
                <i class="comp-dot" :style="{ background: corDe(c.key) }"></i>
                <span class="comp-label">{{ c.label }}</span>
                <span class="comp-calc">
                  {{ c.key === 'bonus' ? 'faixa do valor fechado' : `${selected.comp[c.key].n} × ${fmtInt(PONTOS[c.key])}` }}
                </span>
                <span class="comp-valor">{{ fmtInt(selected.comp[c.key].pts) }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <span class="section-label">Meta mínima · {{ META_MINIMA }} indicações / mês</span>
            <div class="meta-chips">
              <span
                v-for="m in selected.meses"
                :key="m.key"
                class="meta-chip"
                :class="`meta-chip--${m.status}`"
                :title="m.titulo"
              >
                <b>{{ m.label }}</b> {{ m.ind }} ind.
                <i :class="m.status === 'ok' ? 'bi bi-check-lg' : 'bi bi-x-lg'"></i>
              </span>
            </div>
          </div>

          <div class="detail-section">
            <div class="section-label-row">
              <span class="section-label">Indicações</span>
              <span class="muted text-xs">pontos totais por indicação</span>
            </div>

            <div class="ind-list">
              <div v-for="ind in selected.indicacoes" :key="ind.id" class="ind-item">
                <div class="ind-top">
                  <div class="ind-info">
                    <span class="ind-empresa">{{ ind.empresa }}</span>
                    <span class="ind-sub">{{ ind.subtitulo }}</span>
                  </div>
                  <div class="ind-pts">
                    <span class="ind-pts-valor">{{ fmtInt(ind.pontos) }}</span>
                    <span class="ind-pts-un">pts</span>
                  </div>
                </div>

                <div class="ind-bottom">
                  <div class="stepper">
                    <template v-for="(s, idx) in ind.steps" :key="s.n">
                      <span
                        v-if="idx > 0"
                        class="step-line"
                        :style="s.on ? { background: s.cor } : {}"
                      ></span>
                      <span
                        class="step"
                        :class="{ 'step--on': s.on, 'step--anulado': s.anulado }"
                        :style="s.on ? { background: s.cor, borderColor: s.cor } : {}"
                      >{{ s.n }}</span>
                    </template>
                  </div>
                  <span class="status" :class="`status--${ind.status.tipo}`">{{ ind.status.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </template>

    <!-- ── Modal: regras do programa ──────────────────────────── -->
    <teleport to="body">
      <div v-if="showRegras" class="modal-overlay" @click.self="showRegras = false">
        <div class="modal modal-regras">
          <div class="regras-head">
            <span class="regras-kicker">— Sistema de pontos</span>
            <button class="btn-fechar" @click="showRegras = false">Fechar</button>
          </div>
          <h2 class="regras-titulo">Quanto mais longe a indicação chega, mais você pontua.</h2>

          <div class="etapas-grid">
            <div class="etapa-card etapa-card--e1">
              <span class="etapa-kicker">Etapa 1</span>
              <span class="etapa-pts">150 <small>pts</small></span>
              <span class="etapa-desc">Indicação realizada</span>
            </div>
            <div class="etapa-card etapa-card--e2">
              <span class="etapa-kicker">Etapa 2</span>
              <span class="etapa-pts">300 <small>pts</small></span>
              <span class="etapa-desc">Indicação qualificada</span>
            </div>
            <div class="etapa-card etapa-card--e3">
              <span class="etapa-kicker">Etapa 3</span>
              <span class="etapa-pts">500 <small>pts</small></span>
              <span class="etapa-desc">Virou orçamento</span>
            </div>
            <div class="etapa-card etapa-card--e4">
              <span class="etapa-kicker">Etapa 4 · Topo</span>
              <span class="etapa-pts">1.000 <small>+ faixa</small></span>
              <span class="etapa-desc">Virou venda</span>
            </div>
          </div>

          <p class="regras-texto">
            Os pontos são <b>cumulativos</b>: uma indicação que vira venda soma as quatro etapas
            (mínimo 1.950 pts) mais o bônus pela faixa de valor fechado.
          </p>

          <span class="section-label">Bônus por faixa de valor (R$)</span>
          <div class="faixas">
            <div
              v-for="(f, i) in FAIXAS"
              :key="i"
              class="faixa-row"
              :class="{ 'faixa-row--topo': i === FAIXAS.length - 1 }"
            >
              <span>{{ faixaLabel(i) }}</span>
              <b>{{ fmtInt(f.bonus) }}</b>
            </div>
          </div>

          <div class="regras-condicao">
            <b>Meta mínima:</b> {{ META_MINIMA }} indicações por mês. O painel mostra mês a mês quem
            bateu a meta, mas ela não bloqueia pontos — toda etapa alcançada conta no ranking.
          </div>

          <span class="section-label">Como este painel aplica as regras</span>
          <ul class="regras-lista">
            <li><b class="c-e1">E1</b> <span>Card criado no Board (fase Indicação). Indicação desqualificada: pontua os 150 pts, pois foi registrada.</span></li>
            <li><b class="c-e2">E2</b> <span>Card entrou em "Qualificado" no Board (ou já existe no Funil de Vendas).</span></li>
            <li><b class="c-e3">E3</b> <span>Card criado no Funil de Vendas (fase Orçamento), mesmo que depois seja reprovado.</span></li>
            <li><b class="c-e4">E4</b> <span>Conta em: <b>Orçamento aprovado (ou faturado)</b>. Um "Reprovado" posterior à aprovação anula a venda.</span></li>
            <li><b>R$</b> <span>Bônus pela faixa do "Valor Fechado". Venda sem valor informado: bônus fica pendente (0 pts até preencher).</span></li>
            <li><b class="c-muted">M</b> <span>Cada etapa conta no mês em que aconteceu. A meta mensal é acompanhada por mês (verde = cumprida, vermelho = abaixo), sem bloquear pontos.</span></li>
            <li><b class="c-muted">ID</b> <span>Board e Funil são ligados pelo nome da empresa + técnico. O nome do técnico precisa ser o mesmo nos dois quadros — grafias diferentes aparecem como técnicos separados.</span></li>
          </ul>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const FONT_KEY = 'https://domador-n8n-tecnoiso.2wdiso.easypanel.host/webhook/75a2d39c-fe4e-4a3c-980b-0b654bfdb7b7'

const props = defineProps({
  fontsData:    { type: Object, default: () => ({}) },
  fontsLoading: { type: Object, default: () => ({}) },
  filters:      { type: Object, default: () => ({}) },
})

// ─── Regras do programa ────────────────────────────────────────
const PONTOS = { e1: 150, e2: 300, e3: 500, e4: 1000 }
const META_MINIMA = 3

// Faixa escolhida pelo primeiro limite que o valor não ultrapassa (valor <= limite)
const FAIXAS = [
  { limite: 200,      bonus: 100 },
  { limite: 500,      bonus: 250 },
  { limite: 1000,     bonus: 750 },
  { limite: 2000,     bonus: 1500 },
  { limite: 5000,     bonus: 3500 },
  { limite: 10000,    bonus: 7500 },
  { limite: 20000,    bonus: 15000 },
  { limite: 50000,    bonus: 35000 },
  { limite: Infinity, bonus: 50000 },
]

const CORES = {
  e1:    '#f5a623',
  e2:    '#4a90e2',
  e3:    '#3cb371',
  e4:    '#e53935',
  bonus: '#111111',
}

const SEGMENTOS = [
  { key: 'e1',    legenda: 'E1 Indicação',   cor: CORES.e1 },
  { key: 'e2',    legenda: 'E2 Qualificada', cor: CORES.e2 },
  { key: 'e3',    legenda: 'E3 Orçamento',   cor: CORES.e3 },
  { key: 'e4',    legenda: 'E4 Venda',       cor: CORES.e4 },
  { key: 'bonus', legenda: 'Bônus de faixa', cor: CORES.bonus },
]

const COMPOSICAO = [
  { key: 'e1',    label: 'Etapa 1 · Indicação realizada' },
  { key: 'e2',    label: 'Etapa 2 · Indicação qualificada' },
  { key: 'e3',    label: 'Etapa 3 · Virou orçamento' },
  { key: 'e4',    label: 'Etapa 4 · Virou venda' },
  { key: 'bonus', label: 'Bônus de faixa' },
]

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// ─── Estado ────────────────────────────────────────────────────
const showRegras  = ref(false)
const selectedKey = ref(null)
const detailRef   = ref(null)

// ─── Dados brutos ──────────────────────────────────────────────
const loading = computed(() => !!props.fontsLoading[FONT_KEY])

const error = computed(() => {
  if (props.fontsData[FONT_KEY] === null) return 'Erro ao carregar dados do programa de indicações'
  return null
})

const raw = computed(() => {
  const payload = props.fontsData[FONT_KEY]
  if (!payload) return null
  return Array.isArray(payload) ? payload[0] ?? null : payload
})

// ─── Utilitários ───────────────────────────────────────────────
// "SPAL IND. BRA. DE BEBIDAS, UNID." → "spal ind bra de bebidas unid"
function normalize(str) {
  return String(str ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function toDate(v) {
  if (!v || v === 'null') return null
  const d = new Date(v)
  return Number.isFinite(d.getTime()) ? d : null
}

const minDate = (a, b) => (!a ? b : !b ? a : (a < b ? a : b))
const maxDate = (a, b) => (!a ? b : !b ? a : (a > b ? a : b))

// Aceita "970.06" e também "1.108,86"
function parseValor(v) {
  if (v === null || v === undefined || v === '' || v === 'null') return 0
  if (typeof v === 'number') return v
  const s = String(v).replace(/[^\d.,-]/g, '')
  const n = s.includes(',') ? Number(s.replace(/\./g, '').replace(',', '.')) : Number(s)
  return Number.isFinite(n) ? n : 0
}

function bonusFaixa(valor) {
  if (!(valor > 0)) return 0
  return FAIXAS.find(f => valor <= f.limite).bonus
}

const mesKey  = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
const mesNome = key => MESES[Number(key.slice(5, 7)) - 1]
const fmtDia  = d => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

const fmtInt = n => Math.round(Number(n) || 0).toLocaleString('pt-BR')
const fmtBRL = n => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function iniciais(nome) {
  const partes = String(nome).trim().split(/\s+/)
  const first = partes[0]?.[0] ?? ''
  const last  = partes.length > 1 ? partes[partes.length - 1][0] : ''
  return (first + last).toUpperCase()
}

// O técnico é identificado pelo nome exato; só caixa, acento e espaços sobrando
// são ignorados ("Luiz Gustavo " = "luiz gustavo"). Grafias diferentes do mesmo
// nome ficam como técnicos separados de propósito.
function criaResolverNomes(nomesBrutos) {
  const exibicao = new Map() // chave normalizada → primeira grafia vista
  nomesBrutos.forEach(nome => {
    const t = String(nome ?? '').trim().replace(/\s+/g, ' ')
    const k = normalize(t)
    if (k && !exibicao.has(k)) exibicao.set(k, t)
  })

  return nome => {
    const chave = normalize(nome)
    if (!chave) return null
    return { chave, nome: exibicao.get(chave) ?? String(nome).trim() }
  }
}

// ─── Montagem das indicações ───────────────────────────────────
// Board (etapa1/etapa2) e Funil (etapa3/etapa4/reprovados) têm IDs de card
// diferentes. Dentro de cada quadro o cardId une as fases; entre os quadros o
// vínculo é empresa + técnico, escolhendo o card do Board cuja data mais se
// aproxima da criação do orçamento e sem reutilizar um card já vinculado.
function montaModelo(p) {
  const e1  = p.etapa1 ?? []
  const e2  = p.etapa2 ?? []
  const e3  = p.etapa3 ?? []
  const e4  = p.etapa4 ?? []
  const rep = p.retprovados ?? p.reprovados ?? []

  const resolveNome = criaResolverNomes(
    [...e1, ...e2, ...e3, ...e4, ...rep].map(r => r.indicador)
  )

  const upsert = (map, r, i, prefixo) => {
    const id = r.cardId || `${prefixo}-${i}`
    if (!map.has(id)) map.set(id, { id, empresa: r.empresa, indicador: r.indicador })
    const card = map.get(id)
    if (!card.empresa) card.empresa = r.empresa
    if (!card.indicador) card.indicador = r.indicador
    return card
  }

  // Board
  const board = new Map()
  e1.forEach((r, i) => { const c = upsert(board, r, i, 'e1'); c.d1 = minDate(c.d1, toDate(r.etapa1)) })
  e2.forEach((r, i) => { const c = upsert(board, r, i, 'e2'); c.d2 = minDate(c.d2, toDate(r.etapa2)) })

  // Funil — um card com várias vendas usa a de maior valor fechado
  const funil = new Map()
  e3.forEach((r, i) => { const c = upsert(funil, r, i, 'e3'); c.d3 = minDate(c.d3, toDate(r.etapa3)) })
  e4.forEach((r, i) => {
    const c = upsert(funil, r, i, 'e4')
    const valor = parseValor(r.valorFechado)
    const data  = toDate(r.etapa4)
    if (!c.d4 || valor > c.valor) { c.d4 = data; c.valor = valor }
  })
  rep.forEach((r, i) => { const c = upsert(funil, r, i, 'rep'); c.dRep = maxDate(c.dRep, toDate(r.reprovadoEm)) })

  const chaveVinculo = c => `${normalize(c.empresa)}|${resolveNome(c.indicador)?.chave ?? ''}`
  const refBoard = c => c.d2 ?? c.d1
  const refFunil = c => c.d3 ?? minDate(c.d4, c.dRep)

  const boardPorChave = new Map()
  board.forEach(c => {
    const k = chaveVinculo(c)
    if (!boardPorChave.has(k)) boardPorChave.set(k, [])
    boardPorChave.get(k).push(c)
  })

  const vinculados = new Set()
  const pares = new Map() // id do board → card do funil
  const funilSolto = []

  // Uma indicação criada depois do orçamento é outra indicação da mesma empresa
  const TOLERANCIA = 86400000

  ;[...funil.values()]
    .sort((a, b) => (refFunil(a)?.getTime() ?? 0) - (refFunil(b)?.getTime() ?? 0))
    .forEach(f => {
      const alvo = refFunil(f)?.getTime() ?? 0
      const candidatos = (boardPorChave.get(chaveVinculo(f)) ?? []).filter(b =>
        !vinculados.has(b.id) &&
        (!alvo || ((b.d1 ?? b.d2)?.getTime() ?? 0) <= alvo + TOLERANCIA)
      )
      if (!candidatos.length) return funilSolto.push(f)
      const escolhido = candidatos.reduce((best, b) => {
        const dist = Math.abs((refBoard(b)?.getTime() ?? 0) - alvo)
        return dist < best.dist ? { b, dist } : best
      }, { b: null, dist: Infinity }).b
      vinculados.add(escolhido.id)
      pares.set(escolhido.id, f)
    })

  const brutas = [
    ...[...board.values()].map(b => ({ board: b, funil: pares.get(b.id) ?? null })),
    ...funilSolto.map(f => ({ board: null, funil: f })),
  ]

  let semTecnico = 0
  const indicacoes = []
  brutas.forEach(par => {
    const tecnico = resolveNome(par.board?.indicador || par.funil?.indicador)
    if (!tecnico) { semTecnico++; return }
    indicacoes.push(montaIndicacao(par, tecnico))
  })

  return { indicacoes, semTecnico }
}

// Aplica a pontuação cumulativa: chegar numa etapa implica as anteriores
function montaIndicacao({ board, funil }, tecnico) {
  const d3 = funil ? (funil.d3 ?? minDate(funil.d4, funil.dRep)) : null
  const d2 = board?.d2 ?? d3
  const d1 = board?.d1 ?? d2

  const temVenda     = !!funil?.d4
  const vendaAnulada = temVenda && !!funil.dRep && funil.dRep > funil.d4
  const vendaValida  = temVenda && !vendaAnulada
  const valor        = vendaValida ? funil.valor || 0 : 0
  const bonus        = vendaValida ? bonusFaixa(valor) : 0

  const eventos = [
    d1          && { etapa: 'e1',    data: d1,       pts: PONTOS.e1 },
    d2          && { etapa: 'e2',    data: d2,       pts: PONTOS.e2 },
    d3          && { etapa: 'e3',    data: d3,       pts: PONTOS.e3 },
    vendaValida && { etapa: 'e4',    data: funil.d4, pts: PONTOS.e4 },
    bonus > 0   && { etapa: 'bonus', data: funil.d4, pts: bonus },
  ].filter(Boolean)

  let status
  if (vendaValida) {
    status = valor > 0
      ? { tipo: 'venda', label: `Venda ${fmtBRL(valor)} · +${fmtInt(bonus)}` }
      : { tipo: 'pendente', label: 'Venda · valor pendente' }
  } else if (vendaAnulada)  status = { tipo: 'anulada',     label: 'Venda anulada · reprovado' }
  else if (funil?.dRep)     status = { tipo: 'reprovado',   label: 'Orçamento reprovado' }
  else if (d3)              status = { tipo: 'orcamento',   label: 'Em orçamento' }
  else if (d2)              status = { tipo: 'qualificada', label: 'Qualificada' }
  else                      status = { tipo: 'indicada',    label: 'Indicada' }

  const partesSub = []
  if (d1) partesSub.push(`Indicada em ${fmtDia(d1)}`)
  if (vendaValida)       partesSub.push(`venda em ${fmtDia(funil.d4)}`)
  else if (funil?.dRep)  partesSub.push(`reprovada em ${fmtDia(funil.dRep)}`)
  else if (funil?.d3)    partesSub.push(`orçamento em ${fmtDia(funil.d3)}`)

  return {
    id: `${board?.id ?? ''}|${funil?.id ?? ''}`,
    tecnico,
    empresa: board?.empresa || funil?.empresa || 'Empresa não informada',
    d1, d2, d3,
    vendaValida,
    semValor: vendaValida && !(valor > 0),
    valor,
    eventos,
    pontos: eventos.reduce((s, e) => s + e.pts, 0),
    status,
    subtitulo: partesSub.join(' · '),
    steps: [
      { n: 1, on: !!d1,        cor: CORES.e1 },
      { n: 2, on: !!d2,        cor: CORES.e2 },
      { n: 3, on: !!d3,        cor: CORES.e3 },
      { n: 4, on: vendaValida, cor: CORES.e4, anulado: vendaAnulada },
    ],
  }
}

const modelo = computed(() =>
  raw.value ? montaModelo(raw.value) : { indicacoes: [], semTecnico: 0 }
)

// ─── Meses do programa ─────────────────────────────────────────
// Do primeiro mês com evento até o mês atual (ou o fim do filtro, se anterior)
const mesesPrograma = computed(() => {
  const chaves = modelo.value.indicacoes.flatMap(i => i.eventos.map(e => mesKey(e.data))).sort()
  if (!chaves.length) return []

  let fim = mesKey(new Date())
  if (props.filters?.endDate) {
    const fimFiltro = props.filters.endDate.slice(0, 7)
    if (fimFiltro < fim) fim = fimFiltro
  }
  if (chaves[chaves.length - 1] > fim) fim = chaves[chaves.length - 1]

  const meses = []
  let [y, m] = chaves[0].split('-').map(Number)
  for (;;) {
    const k = `${y}-${String(m).padStart(2, '0')}`
    meses.push(k)
    if (k >= fim || meses.length > 36) break
    m++
    if (m > 12) { m = 1; y++ }
  }
  return meses
})

// ─── Ranking ───────────────────────────────────────────────────
const ranking = computed(() => {
  const mapa = new Map()

  modelo.value.indicacoes.forEach(ind => {
    const { chave, nome } = ind.tecnico
    if (!mapa.has(chave)) mapa.set(chave, { key: chave, nome, indicacoes: [], porMes: {} })
    const t = mapa.get(chave)
    t.indicacoes.push(ind)
    ind.eventos.forEach(e => {
      const mk = mesKey(e.data)
      if (!t.porMes[mk]) t.porMes[mk] = { ind: 0, pts: 0 }
      t.porMes[mk].pts += e.pts
      if (e.etapa === 'e1') t.porMes[mk].ind++
    })
  })

  const mesAtual = mesKey(new Date())

  const lista = [...mapa.values()].map(t => {
    const comp = Object.fromEntries(SEGMENTOS.map(s => [s.key, { n: 0, pts: 0 }]))
    let pontos = 0

    t.indicacoes.forEach(ind => {
      ind.eventos.forEach(e => {
        comp[e.etapa].n++
        comp[e.etapa].pts += e.pts
        pontos += e.pts
      })
    })

    const indicacoes = [...t.indicacoes].sort((a, b) =>
      b.pontos - a.pontos || (b.d1?.getTime() ?? 0) - (a.d1?.getTime() ?? 0)
    )

    // A meta mensal é só acompanhamento — não bloqueia pontos
    const meses = mesesPrograma.value.map(mk => {
      const { ind = 0, pts = 0 } = t.porMes[mk] ?? {}
      const ok = ind >= META_MINIMA
      const status = ok ? 'ok' : (ind === 0 && pts === 0 ? 'vazio' : 'abaixo')
      const label = mesNome(mk)
      let titulo = `${label}: ${ind} indicação(ões) — meta ${ok ? 'cumprida' : 'não cumprida'}`
      if (mk === mesAtual && !ok) titulo += ' (mês em andamento)'
      return { key: mk, label, ind, pts, status, titulo }
    })

    return {
      key: t.key,
      nome: t.nome,
      iniciais: iniciais(t.nome),
      comp,
      pontos,
      meses,
      indicacoes,
    }
  })

  return lista.sort((a, b) => b.pontos - a.pontos || a.nome.localeCompare(b.nome, 'pt-BR'))
})

const maxPontos = computed(() => Math.max(1, ...ranking.value.map(t => t.pontos)))
const barPct = pts => `${(pts / maxPontos.value) * 100}%`

const selected = computed(() =>
  ranking.value.find(t => t.key === selectedKey.value) ?? ranking.value[0] ?? null
)
const selectedPos = computed(() => ranking.value.indexOf(selected.value) + 1)

async function selecionar(key) {
  selectedKey.value = key
  // Em uma coluna só o detalhe fica abaixo da lista — leva o usuário até ele
  if (window.innerWidth < 1100) {
    await nextTick()
    detailRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

function avatarClass(i) {
  if (i === 0) return 'avatar--ouro'
  if (i === 1 || i === 2) return 'avatar--top'
  return ''
}

const corDe = key => CORES[key]

// ─── KPIs ──────────────────────────────────────────────────────
const kpiCards = computed(() => {
  const inds = ranking.value.flatMap(t => t.indicacoes)
  const vendas   = inds.filter(i => i.vendaValida)
  const semValor = vendas.filter(i => i.semValor).length
  const valorVendas = vendas.reduce((s, i) => s + i.valor, 0)
  const pontos = ranking.value.reduce((s, t) => s + t.pontos, 0)

  return [
    { key: 'e1', sigla: 'E1', label: 'Indicações',  value: inds.filter(i => i.d1).length, sub: `${fmtInt(PONTOS.e1)} pts cada` },
    { key: 'e2', sigla: 'E2', label: 'Qualificadas', value: inds.filter(i => i.d2).length, sub: `${fmtInt(PONTOS.e2)} pts cada` },
    { key: 'e3', sigla: 'E3', label: 'Orçamentos',  value: inds.filter(i => i.d3).length, sub: `${fmtInt(PONTOS.e3)} pts cada` },
    {
      key: 'e4', sigla: 'E4', label: 'Vendas', value: vendas.length,
      sub: semValor > 0 ? `${semValor} sem valor informado` : `${fmtBRL(valorVendas)} fechados`,
    },
    {
      key: 'pts', sigla: 'PTS', label: 'Pontos', value: pontos,
      sub: `${ranking.value.length} técnicos pontuando`,
    },
  ]
})

// ─── Modal de regras ───────────────────────────────────────────
function faixaLabel(i) {
  const f = FAIXAS[i]
  const fmt = v => `R$ ${fmtInt(v)}`
  if (i === 0) return `Até ${fmt(f.limite)}`
  if (f.limite === Infinity) return `Acima de ${fmt(FAIXAS[i - 1].limite)}`
  return `${fmt(FAIXAS[i - 1].limite)} – ${fmt(f.limite)}`
}
</script>

<style scoped>
.promotores-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.muted {
  color: #8a8f98;
  font-size: 13px;
}

.c-e1 { color: #e0900f; }
.c-e2 { color: #3b7bd6; }
.c-e3 { color: #2e9a5b; }
.c-e4 { color: #e53935; }
.c-muted { color: #9aa0a8; }

/* ── KPIs ─────────────────────────────────────────────────────── */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
}

.kpi-skeleton { height: 104px; border-radius: 14px; }
.panel-skeleton { height: 560px; border-radius: 14px; }

.kpi-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 14px;
  padding: 20px 22px;
}

.kpi-badge {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  flex-shrink: 0;
}
.kpi-badge--e1  { background: #fdf1e0; color: #e0900f; }
.kpi-badge--e2  { background: #e8f0fc; color: #3b7bd6; }
.kpi-badge--e3  { background: #e6f5ec; color: #2e9a5b; }
.kpi-badge--e4  { background: #fde8e8; color: #e53935; }
.kpi-badge--pts { background: #111; color: #fff; }

.kpi-body {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.kpi-label { font-size: 13px; color: #6b7079; }
.kpi-value { font-size: 30px; font-weight: 800; line-height: 1.1; color: #111; }
.kpi-sub {
  font-size: 12px;
  color: #9aa0a8;
}

/* ── Layout ───────────────────────────────────────────────────── */
.main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.panel {
  background: #fff;
  border: 1px solid #ececec;
  border-radius: 14px;
  padding: 22px;
  min-width: 0;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.panel-head-left { display: flex; flex-direction: column; gap: 10px; }
.panel-head-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 700;
  color: #111;
}
.title-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e53935;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 12px;
  color: #555;
}
.legend-item { display: inline-flex; align-items: center; gap: 6px; }
.legend-item i { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }

.btn-regras {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #e3e3e3;
  background: #fff;
  color: #111;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 999px;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.btn-regras:hover { background: #f6f6f6; border-color: #d5d5d5; }
.btn-regras i { color: #e53935; }

/* ── Ranking ──────────────────────────────────────────────────── */
.rank-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rank-row {
  display: grid;
  grid-template-columns: 24px 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  padding: 14px 14px;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}
.rank-row:hover { background: #fafafa; }
.rank-row--active {
  background: #f6f6f7;
  border-color: #e2e2e4;
}

.rank-pos { color: #9aa0a8; font-size: 14px; text-align: center; }

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  background: #f0f1f3;
  color: #333;
  flex-shrink: 0;
}
.avatar--ouro { background: #e53935; color: #fff; }
.avatar--top  { background: #111; color: #fff; }
.avatar-lg { width: 48px; height: 48px; font-size: 15px; }

.rank-main { display: flex; flex-direction: column; gap: 7px; min-width: 0; }

.rank-top {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.rank-nome { font-size: 15px; font-weight: 600; color: #111; }

.mes-chips { display: inline-flex; gap: 4px; }
.mes-chip {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 5px;
}
.mes-chip--ok    { background: #e6f5ec; color: #2e9a5b; }
.mes-chip--abaixo  { background: #fde8e8; color: #e53935; }
.mes-chip--vazio { background: #f2f3f5; color: #a3a8b0; }

.bar {
  display: flex;
  height: 5px;
  border-radius: 999px;
  background: #eeeff1;
  overflow: hidden;
}
.bar-seg { height: 100%; transition: width 0.5s ease; }

.rank-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12.5px;
  color: #6b7079;
}
.rank-counts b { font-weight: 600; }

.rank-pts {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 78px;
}
.rank-pts-valor { font-size: 22px; font-weight: 800; color: #111; line-height: 1.1; }
.rank-pts-un { font-size: 12px; color: #a3a8b0; }

/* ── Detalhe ──────────────────────────────────────────────────── */
.detail {
  position: sticky;
  top: 16px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  max-height: calc(100dvh - 32px);
  overflow-y: auto;
  scroll-margin-top: 16px;
}

.detail-head { display: flex; align-items: center; gap: 14px; }
.detail-nome { font-size: 17px; font-weight: 700; color: #111; }

.detail-pts {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 18px;
  border-bottom: 1px solid #efefef;
}
.detail-pts-valor { font-size: 44px; font-weight: 800; color: #111; line-height: 1; }

.section-label {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9aa0a8;
}
.section-label-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 8px;
}

.detail-section { display: flex; flex-direction: column; gap: 10px; }

.comp-list { display: flex; flex-direction: column; }
.comp-row {
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto 70px;
  align-items: center;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid #f1f1f1;
  font-size: 14px;
}
.comp-row:last-child { border-bottom: none; }
.comp-dot { width: 10px; height: 10px; border-radius: 3px; }
.comp-label { color: #333; }
.comp-calc { color: #a3a8b0; font-size: 13px; text-align: right; }
.comp-valor { text-align: right; font-weight: 700; color: #111; }

.meta-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 8px;
}
.meta-chip b { font-weight: 700; }
.meta-chip--ok    { background: #e6f5ec; color: #2e9a5b; }
.meta-chip--abaixo  { background: #fde8e8; color: #e53935; }
.meta-chip--vazio { background: #f2f3f5; color: #9aa0a8; }

.ind-list { display: flex; flex-direction: column; }
.ind-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 0;
  border-bottom: 1px solid #f1f1f1;
}
.ind-item:last-child { border-bottom: none; }

.ind-top { display: flex; justify-content: space-between; gap: 12px; }
.ind-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ind-empresa {
  font-size: 13.5px;
  font-weight: 600;
  color: #111;
  text-transform: uppercase;
  overflow-wrap: anywhere;
}
.ind-sub { font-size: 12px; color: #9aa0a8; }

.ind-pts { display: flex; flex-direction: column; align-items: flex-end; flex-shrink: 0; }
.ind-pts-valor { font-size: 15px; font-weight: 800; color: #111; }
.ind-pts-un { font-size: 11px; color: #a3a8b0; white-space: nowrap; }

.ind-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.stepper { display: flex; align-items: center; flex: 1; max-width: 250px; min-width: 180px; }
.step {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid #dcdee2;
  background: #fff;
  color: #b3b7bd;
  font-size: 9.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.step--on { color: #fff; }
.step--anulado {
  border-color: #e53935;
  border-style: dashed;
  color: #e53935;
  text-decoration: line-through;
}
.step-line { flex: 1; height: 2px; background: #e6e7ea; }

.status {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
.status--venda       { background: #111; color: #fff; }
.status--pendente    { background: #111; color: #f5c46b; }
.status--anulada     { background: #fde8e8; color: #e53935; }
.status--reprovado   { background: #f2f3f5; color: #6b7079; }
.status--orcamento   { background: #e6f5ec; color: #2e9a5b; }
.status--qualificada { background: #e8f0fc; color: #3b7bd6; }
.status--indicada    { background: #fdf1e0; color: #e0900f; }

/* ── Modal de regras ──────────────────────────────────────────── */
.modal-regras {
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.modal-regras > * { flex-shrink: 0; }

.regras-head { display: flex; justify-content: space-between; align-items: center; }
.regras-kicker {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #e53935;
}
.btn-fechar {
  border: 1px solid #e3e3e3;
  background: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  padding: 7px 14px;
  border-radius: 8px;
  cursor: pointer;
}
.btn-fechar:hover { background: #f6f6f6; }

.regras-titulo { font-size: 24px; font-weight: 800; line-height: 1.2; color: #111; }

.etapas-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.etapa-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  border: 1px solid #ececec;
  border-radius: 12px;
  border-bottom-width: 3px;
}
.etapa-card--e1 { border-bottom-color: #f5a623; }
.etapa-card--e2 { border-bottom-color: #4a90e2; }
.etapa-card--e3 { border-bottom-color: #3cb371; }
.etapa-card--e4 { background: #111; border-color: #111; color: #fff; }

.etapa-kicker {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9aa0a8;
}
.etapa-card--e4 .etapa-kicker { color: #e53935; }
.etapa-pts { font-size: 28px; font-weight: 800; line-height: 1.1; }
.etapa-pts small { font-size: 14px; font-weight: 500; color: #9aa0a8; }
.etapa-desc { font-size: 14px; font-weight: 500; }

.regras-texto { font-size: 14px; color: #555; line-height: 1.55; }
.regras-texto b { color: #111; }

.faixas {
  border: 1px solid #ececec;
  border-radius: 12px;
  overflow: hidden;
  margin-top: -6px;
}
.faixa-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f1f1f1;
}
.faixa-row:nth-child(even) { background: #fafafa; }
.faixa-row:last-child { border-bottom: none; }
.faixa-row b { color: #111; }
.faixa-row--topo,
.faixa-row--topo:nth-child(even) { background: #111; color: #fff; }
.faixa-row--topo b { color: #ff4d4f; }

.regras-condicao {
  background: #fbefe2;
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 14px;
  line-height: 1.55;
  color: #6b5a44;
}
.regras-condicao b { color: #4a3b27; }

.regras-lista {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: -6px;
}
.regras-lista li {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  font-size: 14px;
  line-height: 1.5;
  color: #444;
}
.regras-lista li > b:first-child { font-weight: 800; }

/* ── Responsivo ───────────────────────────────────────────────── */
@media (max-width: 1100px) {
  .main-grid { grid-template-columns: minmax(0, 1fr); }
  .detail { position: static; max-height: none; overflow: visible; }
}

@media (max-width: 640px) {
  .kpi-row { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .kpi-card { padding: 14px; gap: 10px; }
  .kpi-card:last-child { grid-column: 1 / -1; }
  .kpi-badge { width: 36px; height: 36px; font-size: 11px; border-radius: 10px; }
  .kpi-value { font-size: 24px; }
  .panel { padding: 16px; }
  .panel-head-right { align-items: flex-start; }
  .rank-row {
    grid-template-columns: 32px minmax(0, 1fr) auto;
    gap: 10px;
    padding: 12px 8px;
  }
  .rank-pos { display: none; }
  .avatar { width: 32px; height: 32px; font-size: 11px; }
  .rank-pts-valor { font-size: 18px; }
  .rank-pts { min-width: 60px; }
  .detail-pts-valor { font-size: 36px; }
  .comp-row { grid-template-columns: 10px minmax(0, 1fr) 60px; }
  .comp-calc { display: none; }
  .etapas-grid { grid-template-columns: minmax(0, 1fr); }
  .modal-regras { margin: 16px; padding: 20px; }
}
</style>
