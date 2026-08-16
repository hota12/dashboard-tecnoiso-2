<template>
  <div class="vendedores-dashboard">

    <!-- ── Loading ─────────────────────────────────────────── -->
    <template v-if="loading">
      <div class="skeleton selector-skeleton"></div>
      <div class="kpi-row">
        <div class="skeleton kpi-skeleton" v-for="i in 7" :key="i"></div>
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

      <!-- ── Seletor de Vendedor ─────────────────────────────── -->
      <div class="selector-bar">
        <div class="selector-label">
          <i class="bi bi-person-circle"></i>
          Vendedor
        </div>
        <div class="selector-pills">
          <button
            class="pill"
            :class="{ 'pill-active': selectedVendedor === '' }"
            @click="selectedVendedor = ''"
          >
            <i class="bi bi-people-fill"></i> Todos
          </button>
          <button
            v-for="v in vendedores"
            :key="v"
            class="pill"
            :class="{ 'pill-active': selectedVendedor === v }"
            @click="selectedVendedor = v"
          >
            {{ v }}
          </button>
        </div>
      </div>

      <!-- ── KPIs ─────────────────────────────────────────────── -->
      <div class="kpi-row">

        <!-- Novos Orçamentos -->
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(30,136,229,0.12);color:#42a5f5">
            <i class="bi bi-briefcase-fill"></i>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Novos Orçamentos</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="kpi-value">{{ kpis.novos }}</span>
              <span v-if="kpis.valorNovos > 0" class="badge-pill" style="background:rgba(30,136,229,0.12);color:#42a5f5;font-size:10px;padding:2px 6px;" title="Valor total em novos orçamentos">
                {{ formatCurrency(kpis.valorNovos) }}
              </span>
            </div>
          </div>
          <button class="kpi-detail-btn" @click="openModal('novos')" data-tooltip="Ver detalhes">
            <i class="bi bi-table"></i>
          </button>
        </div>

        <!-- Em Contato -->
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(38,198,218,0.12);color:#26c6da">
            <i class="bi bi-chat-dots-fill"></i>
          </div>
          <div class="kpi-body">
            <span class="kpi-label kpi-label-flex">
              Em Contato
              <span class="tooltip-icon" data-tooltip="Orçamentos que entraram na fase de contato pela primeira vez dentro do período">
                <i class="bi bi-info-circle"></i>
              </span>
            </span>
            <span class="kpi-value">{{ kpis.contatos }}</span>
          </div>
          <button class="kpi-detail-btn" @click="openModal('contatos')" data-tooltip="Ver detalhes">
            <i class="bi bi-table"></i>
          </button>
        </div>

        <!-- Orçamentos Aprovados -->
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(38,166,154,0.12);color:#26a69a">
            <i class="bi bi-check2-circle"></i>
          </div>
          <div class="kpi-body">
            <span class="kpi-label kpi-label-flex">
              Orçamentos Aprovados
              <span class="tooltip-icon" data-tooltip="Orçamentos que entraram na fase de orçamento aprovado pela primeira vez dentro do período">
                <i class="bi bi-info-circle"></i>
              </span>
            </span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="kpi-value">{{ kpis.aprovados }}</span>
              <span v-if="kpis.valorAprovados > 0" class="badge-pill" style="background:rgba(38,166,154,0.12);color:#26a69a;font-size:10px;padding:2px 6px;" title="Valor total em orçamentos aprovados">
                {{ formatCurrency(kpis.valorAprovados) }}
              </span>
            </div>
          </div>
          <button class="kpi-detail-btn" @click="openModal('aprovados')" data-tooltip="Ver detalhes">
            <i class="bi bi-table"></i>
          </button>
        </div>

        <!-- Faturados -->
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(67,160,71,0.12);color:#66bb6a">
            <i class="bi bi-trophy-fill"></i>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Orçamentos Faturados</span>
            <span class="kpi-value">{{ kpis.ganhos }}</span>
          </div>
          <button class="kpi-detail-btn" @click="openModal('ganhos')" data-tooltip="Ver detalhes">
            <i class="bi bi-table"></i>
          </button>
        </div>

        <!-- Reprovados -->
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(229,57,53,0.12);color:#ef5350">
            <i class="bi bi-x-circle-fill"></i>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Orçamentos Reprovados</span>
            <span class="kpi-value">{{ kpis.perdidos }}</span>
          </div>
          <button class="kpi-detail-btn" @click="openModal('perdidos')" data-tooltip="Ver detalhes">
            <i class="bi bi-table"></i>
          </button>
        </div>

        <!-- Em Aberto -->
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(255,167,38,0.12);color:#ffa726">
            <i class="bi bi-hourglass-split"></i>
          </div>
          <div class="kpi-body">
            <span class="kpi-label">Orçamentos em Aberto</span>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="kpi-value">{{ kpis.andamento }}</span>
              <span v-if="kpis.valorAndamento > 0" class="badge-pill" style="background:rgba(255,167,38,0.12);color:#ffa726;font-size:10px;padding:2px 6px;" title="Valor total em orçamentos abertos">
                {{ formatCurrency(kpis.valorAndamento) }}
              </span>
              <span v-if="kpis.andamentoAtrasados > 0" class="badge-pill" style="background:rgba(229,57,53,0.12);color:#ef5350;font-size:10px;padding:2px 6px;" title="Sem próximo contato ou vencido">
                {{ kpis.andamentoAtrasados }} sem ação agendada
              </span>
            </div>
          </div>
          <button class="kpi-detail-btn" @click="openModal('andamento')" data-tooltip="Ver detalhes">
            <i class="bi bi-table"></i>
          </button>
        </div>

        <!-- Tempo Médio de Aprovação -->
        <div class="kpi-card">
          <div class="kpi-icon" style="background:rgba(126,87,194,0.12);color:#7e57c2">
            <i class="bi bi-stopwatch-fill"></i>
          </div>
          <div class="kpi-body">
            <span class="kpi-label kpi-label-flex">
              Tempo Médio de Aprovação
              <span class="tooltip-icon" data-tooltip="Média de dias entre a criação do orçamento e a entrada na fase de orçamento aprovado">
                <i class="bi bi-info-circle"></i>
              </span>
            </span>
            <span class="kpi-value">{{ kpis.tempoMedioAprovacao }}</span>
          </div>
        </div>

      </div>

      <!-- ── Seção 1 e 2: Valor, Meta e Evolução Acumulada ───────────────────────── -->
      <div style="display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; align-items: stretch;">
        
        <!-- Velocímetro e KPIs (Esquerda) -->
        <!-- Sem min-width fixo de propósito: o velocímetro tem largura fixa e o
             valor faturado não quebra linha, então o conteúdo precisa de ~460px.
             Um min-width menor que isso vira piso para o flex e faz a coluna da
             meta vazar para fora do card. Com min-width automático o piso é o
             próprio min-content, e a linha quebra quando não couber. -->
        <div class="value-card speedometer-card" style="flex: 1; display: flex; flex-direction: row; gap: 16px; padding: 24px; justify-content: space-between; align-items: center; margin: 0;">
          
          <!-- Lado Esquerdo: Resultados Realizados -->
          <div style="display: flex; flex-direction: column; justify-content: center; flex: 1;">
            <div style="margin-bottom: 24px;">
              <span class="value-label" style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--color-placeholder); display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                <i class="bi bi-currency-dollar" style="font-size: 13px;"></i> Valor Total Faturado
              </span>
              <span class="value-amount" style="font-size: 32px; font-weight: 700; color: var(--color-heading); line-height: 1;">
                {{ formatCurrency(kpis.valorTotal) }}
              </span>
            </div>
            
            <div>
              <span class="value-label" style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--color-placeholder); display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                <i class="bi bi-calculator" style="font-size: 13px;"></i> Ticket Médio
              </span>
              <span class="value-amount" style="font-size: 20px; font-weight: 600; color: var(--color-text); line-height: 1;">
                {{ formatCurrency(kpis.ticketMedio) }}
              </span>
            </div>
          </div>

          <!-- Divisor Vertical -->
          <div style="width: 1px; background: var(--color-border, rgba(128,128,128,0.2)); align-self: stretch; margin: 0 8px;"></div>

          <!-- Lado Direito: Acompanhamento da Meta -->
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; flex: 1;">
            
            <div class="speedometer-chart">
              <div class="speedometer-canvas">
                <Doughnut v-if="metaPeriodo > 0" :data="chartSpeedometerData" :options="speedometerOptions" />
                <div v-else class="speedometer-empty">Sem meta</div>
              </div>

              <!-- Percentual, encaixado na abertura do anel -->
              <div v-if="metaPeriodo > 0" class="speedometer-value">{{ percentualMeta }}%</div>
            </div>
            
            <div v-if="metaPeriodo > 0" style="display: flex; flex-direction: column; gap: 6px; align-items: center; text-align: center;">
              <span class="badge-pill" :class="percentualMeta >= 100 ? 'badge-green' : 'badge-orange'" style="font-size: 11px; padding: 4px 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                {{ percentualMeta >= 100 ? 'Meta Atingida!' : 'Em Andamento' }}
              </span>
              <span style="font-size: 11px; color: var(--color-placeholder); margin-top: 4px;">
                Alvo ({{ daysInPeriod }} d): <strong style="color: var(--color-heading); font-weight: 600;">{{ formatCurrency(metaPeriodo) }}</strong>
              </span>
            </div>
            <div v-else style="font-size: 11px; color: var(--color-placeholder); text-align: center;">
              Nenhuma meta proporcional estabelecida<br>para o período.
            </div>
          </div>

        </div>

        <!-- Gráfico Acumulado (Direita) -->
        <div class="chart-card" style="flex: 2; min-width: 400px; margin: 0; display: flex; flex-direction: column;">
          <div class="chart-header">
            <span class="chart-title">
              <i class="bi bi-currency-dollar"></i>
              Valor Faturado — Acumulado
            </span>
            <span class="badge-pill badge-accent">{{ formatCurrency(kpis.valorTotal) }}</span>
          </div>
          <div class="chart-wrapper" style="flex: 1;">
            <Line :data="chartValor" :options="chartOptionsValor('#D88B49', Math.max(kpis.valorTotal, metaPeriodo) * 1.2)" />
          </div>
        </div>

      </div>

      <!-- ── Análises Inferiores (Grid) ────────────────────── -->
      <div class="bottom-analytics-grid">

        <!-- ── Detalhamento Em Aberto ─────────────────────────dd─ -->
        <div class="andamento-detalhe-card">
          <div class="section-header" style="margin-bottom:4px;">
            <span class="section-title">
              <i class="bi bi-hourglass-split"></i>
              Orçamentos em Aberto — Detalhamento
            </span>
            <span class="badge-pill badge-orange">{{ kpis.andamento }} em aberto</span>
          </div>
          <p class="section-sub">
            Pipeline aberto hoje — inclui orçamentos criados antes do período filtrado.
          </p>
          <div v-if="!andamentoDetalhe.length" class="funil-empty">
            Nenhum orçamento em aberto{{ selectedVendedor ? ' para este vendedor' : '' }}.
          </div>

          <div v-else class="andamento-detalhe-grid">
            <div
              v-for="item in andamentoDetalhe"
              :key="item.fase"
              class="andamento-detalhe-item"
              :style="{ borderColor: faseTint(item.stage.color, 0.35) }"
            >
              <div
                class="andamento-detalhe-icon"
                :style="{ background: faseTint(item.stage.color, 0.12), color: item.stage.color }"
              >
                <i class="bi" :class="item.stage.icon"></i>
              </div>
              <div class="andamento-detalhe-body">
                <span class="andamento-detalhe-label">{{ item.fase }}</span>
                <span class="andamento-detalhe-value">{{ item.count }}</span>
                <span class="andamento-detalhe-sub">{{ formatCurrency(item.valor) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Ranking de Vendedores (apenas em Todos) ──────── -->
        <div v-if="!selectedVendedor && vendedores.length > 1" class="canais-card">
          <div class="section-header">
            <span class="section-title">
              <i class="bi bi-bar-chart-steps"></i>
              Ranking de Vendedores (Faturados)
            </span>
            <span class="badge-pill badge-accent">{{ kpis.ganhos }} faturado(s)</span>
          </div>
          <div v-if="!rankingVendedores.length" class="funil-empty">Sem dados de vendas para rankear.</div>
          <div v-else class="funil-list">
            <div v-for="(v, idx) in rankingVendedores" :key="v.nome" class="funil-item">
              <div class="funil-item-header">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span class="rank-badge">{{ idx + 1 }}</span>
                  <span class="funil-label">{{ v.nome }}</span>
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;">
                  <span style="font-size:13px;font-weight:700;color:var(--color-heading);">{{ formatCurrency(v.valor) }}</span>
                  <span style="font-size:11px;color:var(--color-placeholder);">{{ v.ganhos }} venda(s)</span>
                </div>
              </div>
              <div class="funil-track">
                <div class="funil-fill" style="background:linear-gradient(90deg,#D88B49,#f0b57a)" :style="{ width: v.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Seção 3: Funil por Fase ────────────────────── -->
        <div class="funnel-card">
          <div class="section-header">
            <span class="section-title">
              <i class="bi bi-filter-circle-fill"></i>
              Novos Orçamentos — Funil por Fase
            </span>
            <span class="badge-pill badge-accent">{{ kpis.novos }} orçamento(s)</span>
          </div>
          <p class="section-sub">
            Orçamentos criados no período, na fase em que estão hoje.
          </p>

          <div v-if="!chartFunnelData.labels.length" class="funil-empty">
            Nenhum orçamento registrado{{ selectedVendedor ? ' para este vendedor' : '' }}.
          </div>

          <div v-else class="funnel-chart-wrapper">
            <Chart type="funnel" :data="chartFunnelData" :options="funnelChartOptions" :plugins="[ChartDataLabels]" />
          </div>
        </div>

        <!-- Oportunidades por Origem (faturadas / perdidas) -->
        <div class="canais-card">
          <div class="section-header">
            <span class="section-title">
              <i class="bi bi-megaphone-fill"></i>
              Oportunidades por Origem
            </span>
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end;">
              <div class="micro-toggle">
                <button :class="{ active: modoOportunidades === 'faturadas' }" @click="modoOportunidades = 'faturadas'">Faturadas</button>
                <button :class="{ active: modoOportunidades === 'perdidas' }" @click="modoOportunidades = 'perdidas'">Reprovadas</button>
              </div>
              <div class="micro-toggle">
                <button :class="{ active: !canaisIncludeMedium }" @click="canaisIncludeMedium = false">Fonte</button>
                <button :class="{ active: canaisIncludeMedium }" @click="canaisIncludeMedium = true">+ Mídia</button>
              </div>
            </div>
          </div>
          <p class="section-sub">
            {{ isFaturadas ? 'Orçamentos faturados no período, rankeados por valor.' : 'Orçamentos reprovados no período, rankeados por volume.' }}
          </p>

          <div v-if="!oportunidadesPorOrigem.length" class="funil-empty">
            Nenhuma oportunidade {{ isFaturadas ? 'faturada' : 'reprovada' }}{{ selectedVendedor ? ' para este vendedor' : '' }}.
          </div>

          <div v-else class="funil-list">
            <div v-for="c in oportunidadesPorOrigem" :key="c.label" class="funil-item">
              <div class="funil-item-header">
                <span class="funil-label">{{ c.label }}</span>
                <span class="funil-count" style="color:var(--color-text);">
                  {{ c.count }} oportunidade(s)<template v-if="isFaturadas"> — <strong>{{ formatCurrency(c.value) }}</strong></template>
                </span>
              </div>
              <div class="funil-track">
                <div class="funil-fill" :style="{ width: c.pct + '%', background: isFaturadas ? '#43a047' : '#ef5350' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Motivos de Perda (Direita) -->
        <div class="motivos-card">
          <div class="section-header">
            <span class="section-title">
              <i class="bi bi-emoji-frown"></i>
              Motivos de Reprovação
            </span>
            <span class="badge-pill" style="background:rgba(229,57,53,0.12);color:#c62828">{{ kpis.perdidos }} reprovado(s)</span>
          </div>

          <div v-if="!motivosPerdidos.length" class="funil-empty">
            Nenhum orçamento reprovado{{ selectedVendedor ? ' para este vendedor' : '' }}.
          </div>

          <div v-else class="funil-list">
            <div v-for="m in motivosPerdidos" :key="m.label" class="funil-item">
              <div class="funil-item-header">
                <span class="funil-label">{{ m.label }}</span>
                <span class="funil-count">{{ m.count }}</span>
              </div>
              <div class="funil-track">
                <div class="funil-fill motivo-fill" :style="{ width: m.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Novos Orçamentos por Origem ────────────────────────── -->
        <div class="canais-card">
          <div class="section-header">
            <span class="section-title">
              <i class="bi bi-radar"></i>
              Novos Orçamentos por Origem
            </span>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="badge-pill badge-accent">{{ kpis.novos }} orçamento(s)</span>
              <div class="micro-toggle">
                <button :class="{ active: !origemIncludeMedium }" @click="origemIncludeMedium = false">Fonte</button>
                <button :class="{ active: origemIncludeMedium }" @click="origemIncludeMedium = true">+ Mídia</button>
              </div>
            </div>
          </div>

          <div v-if="!origemNovosNegocios.length" class="funil-empty">
            Nenhum orçamento com origem registrada{{ selectedVendedor ? ' para este vendedor' : '' }}.
          </div>

          <div v-else class="funil-list">
            <div v-for="item in origemNovosNegocios" :key="item.label" class="funil-item">
              <div class="funil-item-header">
                <span class="funil-label">{{ item.label }}</span>
                <span class="funil-count" style="color:var(--color-text);">{{ item.count }}</span>
              </div>
              <div class="funil-track">
                <div class="funil-fill" style="background:#42a5f5" :style="{ width: item.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>



        <!-- Cliente da Casa -->
        <div class="canais-card">
          <div class="section-header">
            <span class="section-title">
              <i class="bi bi-house-heart-fill"></i>
              Cliente da Casa
            </span>
            <div class="micro-toggle">
              <button :class="{ active: filterClienteDaCasa === 'novos' }" @click="filterClienteDaCasa = 'novos'">Novos</button>
              <button :class="{ active: filterClienteDaCasa === 'ganhos' }" @click="filterClienteDaCasa = 'ganhos'">Faturados</button>
            </div>
          </div>
          <div v-if="!distClienteDaCasa.length" class="funil-empty">Sem dados.</div>
          <div v-else class="funil-list">
            <div v-for="item in distClienteDaCasa" :key="item.label" class="funil-item">
              <div class="funil-item-header">
                <span class="funil-label">{{ item.label }}</span>
                <span class="funil-count" style="color:var(--color-text);">{{ item.count }}</span>
              </div>
              <div class="funil-track">
                <div class="funil-fill" style="background:#8d6e63" :style="{ width: item.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Orçamentos por Interesse ───────────────────────── -->
        <div class="canais-card">
          <div class="section-header">
            <span class="section-title">
              <i class="bi bi-tags-fill"></i>
              Orçamentos por Interesse
            </span>
            <div class="micro-toggle">
              <button :class="{ active: filterInteresse === 'novos' }" @click="filterInteresse = 'novos'">Novos</button>
              <button :class="{ active: filterInteresse === 'ganhos' }" @click="filterInteresse = 'ganhos'">Faturados</button>
            </div>
          </div>
          <div v-if="!negociosPorCategoria.length" class="funil-empty">
            Sem interesses registrados nos orçamentos {{ filterInteresse === 'novos' ? 'novos' : 'faturados' }}{{ selectedVendedor ? ' para este vendedor' : '' }}.
          </div>
          <div v-else class="funil-list">
            <div v-for="item in negociosPorCategoria" :key="item.label" class="funil-item">
              <div class="funil-item-header">
                <span class="funil-label">{{ item.label }}</span>
                <span class="funil-count" style="color:var(--color-text);">{{ item.count }}</span>
              </div>
              <div class="funil-track">
                <div class="funil-fill" style="background:#5c6bc0" :style="{ width: item.pct + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ── Taxas de Conversão por Safra ─────────────────────── -->
      <div class="conversao-section">
        <div class="section-header">
          <span class="section-title">
            <i class="bi bi-funnel-fill"></i>
            Taxas de Conversão por Safra
          </span>
          <span class="badge-pill badge-accent">{{ periodoSafra }}</span>
        </div>
        <p class="section-sub">
          A safra é o próprio período filtrado: o denominador são os orçamentos que
          entraram na etapa dentro do período, e o desfecho conta mesmo que tenha
          acontecido depois. Por isso estes números não batem com os KPIs do topo.
        </p>

        <div class="conversao-grid">
          <div
            v-for="t in taxasConversao"
            :key="t.key"
            class="conversao-card"
            :class="{ 'conversao-card--destaque': t.destaque }"
          >
            <div class="conversao-head">
              <span class="conversao-titulo">{{ t.titulo }}</span>
              <i v-if="t.destaque" class="bi bi-star-fill conversao-star" title="Indicador crítico"></i>
            </div>

            <span class="conversao-pct" :style="{ color: t.total ? t.cor : 'var(--color-placeholder)' }">
              {{ formatPct(t.pct) }}
            </span>

            <div class="funil-track">
              <div class="funil-fill" :style="{ width: (t.pct ?? 0) + '%', background: t.cor }"></div>
            </div>

            <span class="conversao-detalhe">
              <template v-if="t.total">
                <strong>{{ t.parte }}</strong> {{ t.rotulo }} de <strong>{{ t.total }}</strong> na safra
              </template>
              <template v-else>
                Sem orçamentos na safra{{ selectedVendedor ? ' para este vendedor' : '' }}
              </template>
            </span>

            <span class="conversao-sub">{{ t.sub }}</span>
          </div>
        </div>
      </div>

    </template>

    <!-- Sem dados -->
    <div v-else class="empty-state">
      <i class="bi bi-bar-chart-line"></i>
      <p>Aguardando dados...</p>
    </div>

    <!-- ── Modal de Detalhes ──────────────────────────────────── -->
    <teleport to="body">
      <div v-if="modal.open" class="modal-overlay" @click.self="modal.open = false">
        <div class="modal modal-negocios">
          <!-- Header -->
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

          <!-- Filtros -->
          <div class="modal-filters">
            <div class="form-input-wrapper" style="flex:1;min-width:160px">
              <i class="bi bi-search form-input-icon"></i>
              <input v-model="modal.search" class="form-input has-icon" placeholder="Buscar..." />
            </div>
            <select v-model="modal.filterResp" class="form-select filter-select">
              <option value="">Todos os vendedores</option>
              <option v-for="v in vendedores" :key="v" :value="v">{{ v }}</option>
            </select>
            <button class="btn btn-secondary btn-icon" @click="exportToExcel" style="flex-shrink:0">
              <i class="bi bi-file-earmark-excel" style="color:#2e7d32"></i>
            </button>
          </div>

          <!-- Tabela -->
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
                <tr v-for="row in modalFiltered" :key="row.identificador">
                  <td v-for="col in modal.columns" :key="col.key">
                    <template v-if="col.key === 'utmSource'">
                      <span class="source-tag">{{ formatSource(row.utmSource) }}</span>
                    </template>
                    <template v-else-if="col.key === 'proximoContato'">
                      <div style="display:flex;align-items:center;gap:6px">
                        <span class="cell-muted">{{ formatDate(row[col.key]) }}</span>
                        <span v-if="isFaseAberta(row.faseAtual) && (!row[col.key] || row[col.key] === 'null' || new Date(row[col.key]).getTime() < Date.now())" class="badge-pill" style="background:rgba(229,57,53,0.12);color:#ef5350;font-size:10px;padding:2px 6px;" title="Sem próximo contato ou vencido">
                          Sem ação agendada
                        </span>
                      </div>
                    </template>
                    <template v-else-if="col.isDate">
                      <span class="cell-muted">{{ formatDate(row[col.key]) }}</span>
                    </template>
                    <template v-else-if="col.isCurrency">
                      {{ formatCurrency(Number(row[col.key]) || 0) }}
                    </template>
                    <template v-else-if="col.isNumber">
                      <span :class="{ 'cell-muted': row[col.key] === null || row[col.key] === undefined }">
                        {{ row[col.key] ?? '—' }}
                      </span>
                    </template>
                    <template v-else>
                      {{ row[col.key] || '—' }}
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
import { computed, ref, reactive, onMounted } from 'vue'
import { Line, Doughnut, Chart } from 'vue-chartjs'
import * as XLSX from 'xlsx'
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
import { FunnelController, TrapezoidElement } from 'chartjs-chart-funnel'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { agruparPorFase, isFaseAberta, isFasePerdida, faseTint, FASE_DESCONHECIDA } from '@/config/fases'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Filler, Tooltip, Legend, FunnelController, TrapezoidElement)

const FONT_KEY = 'https://domador-n8n-tecnoiso.2wdiso.easypanel.host/webhook/1705acd3-9821-4f2d-b524-c9024ab35cc6'

const props = defineProps({
  fontsData:    { type: Object, default: () => ({}) },
  fontsLoading: { type: Object, default: () => ({}) },
  filters:      { type: Object, default: () => ({}) },
})

// ─── Estado ────────────────────────────────────────────────────
const selectedVendedor    = ref('')
const filterClienteDaCasa = ref('novos')
const filterInteresse     = ref('ganhos')
const origemIncludeMedium = ref(false)
const canaisIncludeMedium = ref(false)
const modoOportunidades   = ref('faturadas')

import { useGoalsStore } from '@/stores/goals'
import { useUsersStore } from '@/stores/users'

const goalsStore = useGoalsStore()
const usersStore = useUsersStore()

onMounted(() => {
  usersStore.fetchUsers()
  goalsStore.fetchGoals()
})

// ─── Dados brutos ──────────────────────────────────────────────
const loading = computed(() => !!props.fontsLoading[FONT_KEY])

const error = computed(() => {
  if (props.fontsData[FONT_KEY] === null) return 'Erro ao carregar dados de vendedores'
  return null
})

const raw = computed(() => {
  const payload = props.fontsData[FONT_KEY]
  if (!payload) return null
  return Array.isArray(payload) ? payload[0] : payload
})

// `novosContatos` e `novosOrcamentosAprovados` são eventos de entrada em fase:
// cada item é a PRIMEIRA vez que o negócio entrou naquela fase dentro do
// período. A data do evento chega no mesmo campo `dataVenda` usado pelas
// outras listas, e o valor pode vir com nomes diferentes conforme a fase —
// por isso a normalização em `_dataFase` / `_valor` / `_diasAteFase`.
const DATA_FASE_FIELDS = ['dataFase', 'dataAprovacao', 'dataVenda', 'criadoEm']
const VALOR_FIELDS     = ['valorOrcamento', 'valorPedido', 'valor']

function pickDate(l) {
  for (const f of DATA_FASE_FIELDS) {
    if (l[f] && l[f] !== 'null') return l[f]
  }
  return null
}

function pickValor(l) {
  for (const f of VALOR_FIELDS) {
    if (l[f] !== undefined && l[f] !== null && l[f] !== 'null') return Number(l[f]) || 0
  }
  return 0
}

// Dias entre a criação do negócio e a entrada na fase. `null` quando falta uma
// das datas ou quando o evento é anterior à criação (inconsistência do CRM).
function diasAteFase(criadoEm, dataFase) {
  if (!criadoEm || criadoEm === 'null' || !dataFase) return null
  const ini = new Date(criadoEm).getTime()
  const fim = new Date(dataFase).getTime()
  if (!Number.isFinite(ini) || !Number.isFinite(fim) || fim < ini) return null
  return Math.round(((fim - ini) / 86400000) * 10) / 10
}

function normalizeEventoFase(list) {
  return list.map(l => {
    const _dataFase = pickDate(l)
    return {
      ...l,
      _dataFase,
      _valor: pickValor(l),
      _diasAteFase: diasAteFase(l.criadoEm, _dataFase),
    }
  })
}

const allData = computed(() => ({
  novosNegocios:     raw.value?.novosNegocios     ?? [],
  negociosGanhos:    raw.value?.negociosGanhos    ?? [],
  negociosPerdidos:  raw.value?.negociosPerdidos  ?? [],
  negociosAndamento: raw.value?.negociosAndamento ?? [],
  // `novasPropostas` não alimenta mais nenhum bloco visual — fica só na união
  // abaixo para que um vendedor que apareça apenas nela não suma dos filtros
  novasPropostas:    raw.value?.novasPropostas    ?? [],
  novosContatos:            normalizeEventoFase(raw.value?.novosContatos            ?? []),
  novosOrcamentosAprovados: normalizeEventoFase(raw.value?.novosOrcamentosAprovados ?? []),

  // Safras das taxas de conversão. O backend já recorta cada uma pelo período
  // filtrado, então aqui elas entram cruas — o único filtro aplicado depois é
  // o do vendedor.
  txNovosFaturados:              raw.value?.txNovosFaturados              ?? [],
  txNovosOrcamentoAprovado:      raw.value?.txNovosOrcamentoAprovado      ?? [],
  txOrcamentoAprovadoFaturados:  raw.value?.txOrcamentoAprovadoFaturados  ?? [],
  txOrcamentoAprovadoReprovados: raw.value?.txOrcamentoAprovadoReprovados ?? [],
}))

// ─── Lista de vendedores únicos ────────────────────────────────
const vendedores = computed(() => {
  const all = [
    ...allData.value.novosNegocios,
    ...allData.value.negociosGanhos,
    ...allData.value.negociosPerdidos,
    ...allData.value.negociosAndamento,
    ...allData.value.novasPropostas,
    ...allData.value.novosContatos,
    ...allData.value.novosOrcamentosAprovados,
  ]
  const set = new Set(all.map(l => l.responsavel).filter(Boolean))
  return [...set].sort()
})

// ─── Dados filtrados pelo vendedor selecionado ─────────────────
const filtered = computed(() => {
  const v = selectedVendedor.value
  if (!v) return allData.value
  return {
    novosNegocios:     allData.value.novosNegocios.filter(l => l.responsavel === v),
    negociosGanhos:    allData.value.negociosGanhos.filter(l => l.responsavel === v),
    negociosPerdidos:  allData.value.negociosPerdidos.filter(l => l.responsavel === v),
    negociosAndamento: allData.value.negociosAndamento.filter(l => l.responsavel === v),
    novosContatos:            allData.value.novosContatos.filter(l => l.responsavel === v),
    novosOrcamentosAprovados: allData.value.novosOrcamentosAprovados.filter(l => l.responsavel === v),

    // As safras vêm de outra query e o CRM entrega nomes com espaço sobrando
    // ("Luiz Gustavo "), então aqui o casamento é normalizado — uma diferença
    // de espaço zeraria a taxa do vendedor sem nenhum aviso.
    txNovosFaturados:              porVendedor(allData.value.txNovosFaturados, v),
    txNovosOrcamentoAprovado:      porVendedor(allData.value.txNovosOrcamentoAprovado, v),
    txOrcamentoAprovadoFaturados:  porVendedor(allData.value.txOrcamentoAprovadoFaturados, v),
    txOrcamentoAprovadoReprovados: porVendedor(allData.value.txOrcamentoAprovadoReprovados, v),
  }
})

function porVendedor(list, vendedor) {
  const alvo = normalizeName(vendedor)
  return list.filter(l => normalizeName(l.responsavel) === alvo)
}

// ─── KPIs derivados ────────────────────────────────────────────
const kpis = computed(() => {
  const {
    novosNegocios, negociosGanhos, negociosPerdidos, negociosAndamento,
    novosContatos, novosOrcamentosAprovados,
  } = filtered.value

  const ganhos   = negociosGanhos.length
  const perdidos = negociosPerdidos.length
  const novos    = novosNegocios.length

  const valorTotal  = negociosGanhos.reduce((s, l) => s + (Number(l.valorPedido) || 0), 0)
  const ticketMedio = ganhos > 0 ? valorTotal / ganhos : 0

  const now = new Date().getTime()
  const andamentoAtrasados = negociosAndamento.filter(l => {
    if (!isFaseAberta(l.faseAtual)) return false
    if (!l.proximoContato || l.proximoContato === 'null') return true
    return new Date(l.proximoContato).getTime() < now
  }).length

  const valorNovos     = novosNegocios.reduce((s, l) => s + pickValor(l), 0)
  const valorAndamento = negociosAndamento.reduce((s, l) => s + pickValor(l), 0)
  const valorAprovados = novosOrcamentosAprovados.reduce((s, l) => s + l._valor, 0)

  // Só entram na média os negócios com as duas datas coerentes
  const diasAprovacao = novosOrcamentosAprovados
    .map(l => l._diasAteFase)
    .filter(d => d !== null)

  return {
    novos,
    ganhos,
    perdidos,
    andamento:  negociosAndamento.length,
    andamentoAtrasados,
    valorAndamento,
    valorTotal,
    ticketMedio,
    valorNovos,
    contatos:  novosContatos.length,
    aprovados: novosOrcamentosAprovados.length,
    valorAprovados,
    tempoMedioAprovacao: formatDias(
      diasAprovacao.length
        ? diasAprovacao.reduce((s, d) => s + d, 0) / diasAprovacao.length
        : null
    ),
  }
})

// Detalhamento dos negócios em aberto por fase — monta um card por fase que
// realmente aparece nos dados, na ordem do funil
const andamentoDetalhe = computed(() =>
  agruparPorFase(filtered.value.negociosAndamento, { valorDe: l => l.valorOrcamento })
)

// ─── Taxas de conversão por safra ──────────────────────────────
// Cada array é uma safra: o backend recorta o denominador pelo período
// filtrado (data de criação nas duas primeiras, data da primeira aprovação nas
// duas últimas) e traz o desfecho junto, mesmo que ele tenha acontecido depois
// do fim do período. Por isso a conta é feita dentro da própria lista e não
// cruzando com os outros KPIs da tela.

// Regra do negócio: se não está reprovado, conta como faturado. Uso o helper de
// fases em vez de comparar com a string 'REPROVADO' para que variações do CRM
// ("DESQUALIFICADO", "PERDIDO") também caiam no lado da perda.
const foiFaturado = l => !isFasePerdida(l.faseAtual)

function montaTaxa(total, parte) {
  return { total, parte, pct: total > 0 ? (parte / total) * 100 : null }
}

const taxasConversao = computed(() => {
  const f = filtered.value
  const novosFat   = f.txNovosFaturados
  const novosAprov = f.txNovosOrcamentoAprovado
  const aprovFat   = f.txOrcamentoAprovadoFaturados
  const aprovRep   = f.txOrcamentoAprovadoReprovados

  return [
    {
      key: 'novos-faturados',
      titulo: 'Novos Orçamentos → Faturados',
      sub: 'Da safra criada no período, quanto virou faturamento.',
      rotulo: 'faturados',
      cor: '#43a047',
      destaque: true,
      ...montaTaxa(novosFat.length, novosFat.filter(foiFaturado).length),
    },
    {
      key: 'novos-aprovados',
      titulo: 'Novos Orçamentos → Aprovados',
      sub: 'Da safra criada no período, quanto chegou a ser aprovado ao menos uma vez.',
      rotulo: 'aprovados',
      cor: '#26a69a',
      destaque: false,
      ...montaTaxa(
        novosAprov.length,
        novosAprov.filter(l => !!l.primeiraVezOrcamentoAprovado).length
      ),
    },
    {
      key: 'aprovados-faturados',
      titulo: 'Aprovados → Faturados',
      sub: 'Da safra aprovada no período, quanto fechou de fato.',
      rotulo: 'faturados',
      cor: '#66bb6a',
      destaque: true,
      ...montaTaxa(aprovFat.length, aprovFat.filter(foiFaturado).length),
    },
    {
      key: 'aprovados-reprovados',
      titulo: 'Aprovados → Reprovados',
      sub: 'Da safra aprovada no período, quanto se perdeu depois do aceite. Aqui, quanto menor melhor.',
      rotulo: 'reprovados',
      cor: '#ef5350',
      destaque: true,
      ...montaTaxa(aprovRep.length, aprovRep.filter(l => isFasePerdida(l.faseAtual)).length),
    },
  ]
})

const periodoSafra = computed(() => {
  const { startDate, endDate } = props.filters
  if (!startDate || !endDate) return 'período completo'
  const fmt = iso => parseLocalDate(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
  return `${fmt(startDate)} — ${fmt(endDate)}`
})

// ─── Ranking de Vendedores ──────────────────────────────────
const rankingVendedores = computed(() => {
  const map = {}
  allData.value.negociosGanhos.forEach(l => {
    const nome = l.responsavel || 'Sem responsavel'
    if (!map[nome]) map[nome] = { ganhos: 0, valor: 0 }
    map[nome].ganhos++
    map[nome].valor += Number(l.valorPedido) || 0
  })
  const entries = Object.entries(map).sort((a, b) => b[1].valor - a[1].valor)
  const max = entries[0]?.[1].valor ?? 1
  return entries.map(([nome, data]) => ({
    nome,
    ganhos: data.ganhos,
    valor:  data.valor,
    pct:    Math.round((data.valor / max) * 100),
  }))
})

// ─── Utilitário: parseia 'YYYY-MM-DD' sem problema de timezone ─
function parseLocalDate(str) {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// ─── Meta do Período Proporcional ──────────────────────────────
const daysInPeriod = computed(() => {
  if (!props.filters.startDate || !props.filters.endDate) return 0
  const start = parseLocalDate(props.filters.startDate)
  const end = parseLocalDate(props.filters.endDate)
  if (isNaN(start) || isNaN(end)) return 0
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1
})

// Normaliza nome para casar vendedor do CRM com usuário do sistema
function normalizeName(str) {
  return String(str ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

// Usuários do sistema correspondentes a um vendedor.
// O casamento é feito pelo nome: o referenceId do lead não é confiável para
// isso — em novasPropostas ele não acompanha o responsável (um mesmo vendedor
// aparece com o referenceId de todos os outros), o que fazia a meta somar
// todos os usuários independente do filtro.
function usersForVendedor(vendedor) {
  const alvo = normalizeName(vendedor)
  if (!alvo) return []
  return usersStore.users.filter(u => normalizeName(u.name) === alvo)
}

const metaDataSeries = computed(() => {
  if (!props.filters.startDate || !props.filters.endDate) return []

  const start = parseLocalDate(props.filters.startDate)
  const end = parseLocalDate(props.filters.endDate)

  if (isNaN(start) || isNaN(end)) return []

  let userIds = []

  if (!selectedVendedor.value) {
    // Na visão "Todos", soma a meta de absolutamente todos os usuários do banco de dados
    userIds = usersStore.users.map(u => String(u.id))
  } else {
    // Com vendedor filtrado, soma apenas a meta do usuário correspondente
    userIds = usersForVendedor(selectedVendedor.value).map(u => String(u.id))
  }

  if (!userIds.length) return []

  let accArray = []
  let totalMeta = 0
  let current = new Date(start)
  
  // Cache para não buscar e calcular a meta do mês várias vezes
  const monthGoalCache = {}

  while (current <= end) {
    const year = current.getFullYear().toString()
    const month = current.getMonth() + 1
    const monthStr = String(month).padStart(2, '0')
    const key = `${year}-${monthStr}`
    
    if (monthGoalCache[key] === undefined) {
      const monthGoals = goalsStore.goals.filter(
        g => userIds.includes(String(g.userId)) && g.year === year && g.month === monthStr
      )
      const sumMonth = monthGoals.reduce((acc, g) => acc + (parseFloat(g.value) || 0), 0)
      const daysInThisMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate()
      monthGoalCache[key] = sumMonth / daysInThisMonth // Meta por dia
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
  return Math.round((kpis.value.valorTotal / metaPeriodo.value) * 100)
})

// ─── Chart Velocímetro ─────────────────────────────────────────
const chartSpeedometerData = computed(() => {
  const meta = metaPeriodo.value
  const ganho = kpis.value.valorTotal
  
  let realized = ganho
  let missing = Math.max(0, meta - ganho)
  
  // Se bateu a meta, o "missing" é 0, o anel fica 100% preenchido.
  // Limitar realized ao valor da meta para a proporção ficar exata (100%), 
  // se ultrapassar, a cor inteira fica verde.
  if (ganho > meta) {
    realized = meta
    missing = 0
  }

  return {
    labels: ['Realizado', 'Faltante'],
    datasets: [{
      data: [realized, missing],
      backgroundColor: ['#66bb6a', 'rgba(255, 255, 255, 0.05)'],
      borderWidth: 0,
      circumference: 180,
      rotation: 270,
      cutout: '80%'
    }]
  }
})

const speedometerOptions = {
  responsive: true,
  maintainAspectRatio: false,
  // Sem padding o Chart.js usa a altura inteira da caixa como raio, e o arco
  // encosta na borda de cima. O padding é o que define a folga do velocímetro.
  layout: { padding: { top: 6, left: 6, right: 6, bottom: 8 } },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function(context) {
          const raw = context.raw
          return ` ${context.label}: ` + raw.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        }
      }
    }
  }
}

// ─── Helpers ───────────────────────────────────────────────────
function formatCurrency(value) {
  if (!value) return 'R$ —'
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatPct(pct) {
  if (pct === null || !Number.isFinite(pct)) return '—'
  return pct.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
}

function formatDias(dias) {
  if (dias === null || !Number.isFinite(dias)) return '—'
  if (dias < 1) return 'menos de 1 dia'
  return `${dias.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} dias`
}


function formatDateLabel(iso) {
  if (!iso) return '?'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function allDaysInRange(startIso, endIso) {
  const days = []
  const cursor = parseLocalDate(startIso)
  const end = parseLocalDate(endIso)
  while (cursor <= end) {
    days.push(cursor.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

function buildAccSeries(leads, dateField, valueField = null) {
  const { startDate, endDate } = props.filters

  let labels = []
  if (startDate && endDate) {
    labels = allDaysInRange(startDate, endDate)
  } else if (leads.length) {
    const sorted = leads
      .map(l => ({ label: formatDateLabel(l[dateField]), ts: new Date(l[dateField]).getTime() }))
      .sort((a, b) => a.ts - b.ts)
      .filter((v, i, arr) => arr.findIndex(x => x.label === v.label) === i)
    labels = sorted.map(s => s.label)
  }

  let baseAcc = 0
  const byDay = {}
  const startTs = startDate ? parseLocalDate(startDate).getTime() : 0

  leads.forEach(l => {
    const label = formatDateLabel(l[dateField])
    const inc = valueField ? (Number(l[valueField]) || 0) : 1
    
    if (labels.includes(label)) {
      byDay[label] = (byDay[label] ?? 0) + inc
    } else {
      const ts = new Date(l[dateField]).getTime()
      // Se a data for anterior ao início do filtro, acumula como saldo base
      if (ts < startTs) {
        baseAcc += inc
      }
    }
  })

  let acc = baseAcc
  const values = labels.map(lbl => { acc += (byDay[lbl] ?? 0); return acc })
  
  return { labels, values }
}

// ─── Gráficos ──────────────────────────────────────────────────
const chartValor = computed(() => {
  const withDate = filtered.value.negociosGanhos.map(l => ({
    ...l,
    _dataParaGrafico: (l.dataVenda && l.dataVenda !== 'null') ? l.dataVenda : (l.criadoEm || new Date().toISOString())
  }))
  const { labels, values } = buildAccSeries(withDate, '_dataParaGrafico', 'valorPedido')
  const metaData = metaDataSeries.value.length > 0 ? metaDataSeries.value : labels.map(() => metaPeriodo.value)

  return {
    labels,
    datasets: [
      {
        label: 'Valor acumulado',
        data: values,
        borderColor: '#D88B49',
        backgroundColor: 'rgba(216,139,73,0.12)',
        fill: true, tension: 0.4, pointRadius: 4, pointHoverRadius: 6,
      },
      {
        label: 'Meta Acumulada',
        data: metaData,
        borderColor: '#42a5f5',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        borderWidth: 2,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 0,
      }
    ],
  }
})

function chartOptionsValor(color, suggestedMax = 1000) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top', labels: { color: '#ccc', font: { size: 12 } } },
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
      x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#9e9e9e', font: { size: 11 } } },
      y: {
        beginAtZero: true,
        suggestedMax,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          color: '#9e9e9e',
          font: { size: 11 },
          callback: val => 'R$ ' + (val >= 1000 ? (val/1000).toFixed(0) + 'k' : val),
        },
      },
    },
  }
}

// ─── Seção 3: Funil por Fase ───────────────────────────────────
// A ordem, a cor e o grupo de cada fase vêm de @/config/fases — o rótulo
// exibido é o nome exato cadastrado no CRM (ex.: "FOLLOW-UP - 30 DIAS")
const fasesFunil = computed(() => {
  const grupos = agruparPorFase(filtered.value.novosNegocios)
  const max = Math.max(...grupos.map(g => g.count), 1)

  return grupos.map(g => ({
    label:   g.fase,
    count:   g.count,
    pct:     Math.round((g.count / max) * 100),
    color:   g.stage.color,
    unknown: g.stage.id === FASE_DESCONHECIDA.id,
  }))
})

// Dados para o gráfico de funil (chartjs-chart-funnel)
const chartFunnelData = computed(() => {
  const fases = fasesFunil.value
  return {
    labels: fases.map(f => f.label),
    datasets: [{
      data: fases.map(f => f.count),
      backgroundColor: fases.map(f => f.color),
      borderWidth: 0,
    }]
  }
})

const funnelChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1a1a1a',
      titleColor: '#fff',
      bodyColor: '#ccc',
      padding: 10,
      callbacks: {
        label: ctx => ` ${ctx.raw} orçamento(s)`,
      }
    },
    datalabels: {
      display: true,
      color: '#fff',
      font: { weight: 'bold', size: 14 },
      textAlign: 'center',
      formatter: (value, ctx) => {
        const label = ctx.chart.data.labels[ctx.dataIndex] ?? ''
        return `${label}\n${value}`
      },
    }
  }
}

// ─── Seção 4: Oportunidades por Origem ───────────────────────────
const isFaturadas = computed(() => modoOportunidades.value === 'faturadas')

const oportunidadesPorOrigem = computed(() => {
  const lista = isFaturadas.value
    ? filtered.value.negociosGanhos
    : filtered.value.negociosPerdidos

  const map = {}
  lista.forEach(l => {
    const canal = buildOrigemKey(l, canaisIncludeMedium.value)
    if (!map[canal]) map[canal] = { count: 0, value: 0 }
    map[canal].count += 1
    map[canal].value += (Number(l.valorPedido) || 0)
  })

  // Faturadas rankeiam por valor (é o que importa na venda fechada); perdidas
  // não carregam valor de pedido, então rankeiam por volume
  const peso = isFaturadas.value ? (d => d.value) : (d => d.count)

  const entries = Object.entries(map).sort((a, b) => peso(b[1]) - peso(a[1]))
  const max = entries.length ? peso(entries[0][1]) : 0
  return entries.map(([label, data]) => ({
    label,
    count: data.count,
    value: data.value,
    pct: max > 0 ? Math.round((peso(data) / max) * 100) : 0
  }))
})

// Novos Orçamentos por Origem (utmSource / utmMedium opcional)
function buildOrigemKey(l, includeMedium) {
  const src = formatSource(l.utmSource)
  if (!includeMedium) return src
  const medium = l.utmMedium && l.utmMedium !== 'null' ? l.utmMedium : ''
  return medium ? `${src} / ${medium}` : src
}

const origemNovosNegocios = computed(() => {
  const map = {}
  filtered.value.novosNegocios.forEach(l => {
    const key = buildOrigemKey(l, origemIncludeMedium.value)
    map[key] = (map[key] ?? 0) + 1
  })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
  const max = entries[0]?.[1] ?? 1
  return entries.map(([label, count]) => ({
    label,
    count,
    pct: Math.round((count / max) * 100),
  }))
})



// Cliente da Casa
function normalizeClienteDaCasa(val) {
  if (!val || val === 'null' || val === 'false' || val === false) return 'Não informado'
  if (val === true || val === 'true') return 'Sim'
  return String(val)
}
const leadsParaClienteDaCasa = computed(() =>
  filterClienteDaCasa.value === 'novos' ? filtered.value.novosNegocios : filtered.value.negociosGanhos
)
const distClienteDaCasa = computed(() => {
  const map = {}
  leadsParaClienteDaCasa.value.forEach(l => {
    const val = normalizeClienteDaCasa(l.clienteDaCasa)
    map[val] = (map[val] ?? 0) + 1
  })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
  const max = entries[0]?.[1] ?? 1
  return entries.map(([label, count]) => ({ label, count, pct: Math.round((count / max) * 100) }))
})

// Ganhos por Interesse
function parseInteresse(intStr) {
  if (!intStr || intStr === 'null') return []
  return intStr
    .replace(/^\[/, '').replace(/\]$/, '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
}

const leadsParaInteresse = computed(() =>
  filterInteresse.value === 'novos' ? filtered.value.novosNegocios : filtered.value.negociosGanhos
)

const negociosPorCategoria = computed(() => {
  const map = {}
  leadsParaInteresse.value.forEach(l => {
    parseInteresse(l.interesse).forEach(cat => {
      map[cat] = (map[cat] ?? 0) + 1
    })
  })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
  const max = entries[0]?.[1] ?? 1
  return entries.map(([label, count]) => ({ label, count, pct: Math.round((count / max) * 100) }))
})

// ─── Seção 5: Motivos de Perda ────────────────────────────────
const motivosPerdidos = computed(() => {
  const map = {}
  filtered.value.negociosPerdidos.forEach(l => {
    const motivo = l.motivoPerdido || 'Sem motivo informado'
    map[motivo] = (map[motivo] ?? 0) + 1
  })
  const entries = Object.entries(map).sort((a, b) => b[1] - a[1])
  const max = entries[0]?.[1] ?? 1
  return entries.map(([label, count]) => ({
    label,
    count,
    pct: Math.round((count / max) * 100),
  }))
})

// ─── Seção 5: Modal de Detalhes ───────────────────────────────────
const COLS = {
  novos: [
    { key: 'responsavel',  label: 'Vendedor' },
    { key: 'utmSource',    label: 'Fonte' },
    { key: 'utmCampaing',  label: 'Campanha' },
    { key: 'faseAtual',    label: 'Fase' },
    { key: 'valorOrcamento', label: 'Valor Orç.', isCurrency: true },
    { key: 'dataProposta', label: 'Data Proposta', isDate: true },
    { key: 'criadoEm',    label: 'Criado em', isDate: true },
  ],
  ganhos: [
    { key: 'responsavel',  label: 'Vendedor' },
    { key: 'nomeLead',     label: 'Lead' },
    { key: 'utmSource',    label: 'Fonte' },
    { key: 'numeroPedido', label: 'Nº Pedido' },
    { key: 'valorPedido',  label: 'Valor', isCurrency: true },
    { key: 'dataVenda',   label: 'Data Venda', isDate: true },
  ],
  perdidos: [
    { key: 'responsavel',  label: 'Vendedor' },
    { key: 'utmSource',    label: 'Fonte' },
    { key: 'motivoPerdido', label: 'Motivo' },
    { key: 'cidade',       label: 'Cidade' },
    { key: 'criadoEm',    label: 'Criado em', isDate: true },
    { key: 'finalizadoEm', label: 'Finalizado em', isDate: true },
  ],
  andamento: [
    { key: 'responsavel',       label: 'Vendedor' },
    { key: 'utmSource',         label: 'Fonte' },
    { key: 'faseAtual',         label: 'Fase' },
    { key: 'tentativasContato', label: 'Tentativas' },
    { key: 'valorOrcamento',    label: 'Valor Orç.', isCurrency: true },
    { key: 'proximoContato',    label: 'Próximo Contato', isDate: true },
    { key: 'criadoEm',         label: 'Criado em', isDate: true },
  ],
  contatos: [
    { key: 'responsavel',   label: 'Vendedor' },
    { key: 'nomeLead',      label: 'Lead' },
    { key: 'utmSource',     label: 'Fonte' },
    { key: 'utmCampaing',   label: 'Campanha' },
    { key: 'clienteDaCasa', label: 'Cliente da Casa' },
    { key: 'criadoEm',      label: 'Criado em', isDate: true },
    { key: '_dataFase',     label: 'Entrou em contato', isDate: true },
  ],
  aprovados: [
    { key: 'responsavel',   label: 'Vendedor' },
    { key: 'nomeLead',      label: 'Lead' },
    { key: 'utmSource',     label: 'Fonte' },
    { key: 'utmCampaing',   label: 'Campanha' },
    { key: '_valor',        label: 'Valor Orç.', isCurrency: true },
    { key: 'criadoEm',      label: 'Criado em', isDate: true },
    { key: '_dataFase',     label: 'Aprovado em', isDate: true },
    { key: '_diasAteFase',  label: 'Dias até aprovar', isNumber: true },
  ],
}

const META = {
  novos:     { title: 'Novos Orçamentos',      icon: 'bi bi-briefcase-fill', iconStyle: 'background:rgba(30,136,229,0.12);color:#42a5f5' },
  ganhos:    { title: 'Orçamentos Faturados',  icon: 'bi bi-trophy-fill',    iconStyle: 'background:rgba(67,160,71,0.12);color:#66bb6a' },
  perdidos:  { title: 'Orçamentos Reprovados', icon: 'bi bi-x-circle-fill', iconStyle: 'background:rgba(229,57,53,0.12);color:#ef5350' },
  andamento: { title: 'Orçamentos em Aberto', icon: 'bi bi-hourglass-split', iconStyle: 'background:rgba(255,167,38,0.12);color:#ffa726' },
  contatos:  { title: 'Em Contato',          icon: 'bi bi-chat-dots-fill', iconStyle: 'background:rgba(38,198,218,0.12);color:#26c6da' },
  aprovados: { title: 'Orçamentos Aprovados', icon: 'bi bi-check2-circle', iconStyle: 'background:rgba(38,166,154,0.12);color:#26a69a' },
}

const SOURCE_MAP = {
  novos:     'novosNegocios',
  ganhos:    'negociosGanhos',
  perdidos:  'negociosPerdidos',
  andamento: 'negociosAndamento',
  contatos:  'novosContatos',
  aprovados: 'novosOrcamentosAprovados',
}

const modal = reactive({
  open: false, type: '', title: '', icon: '', iconStyle: '',
  columns: [], leads: [],
  search: '', filterResp: '',
  sortKey: '', sortDir: 'asc',
})

function openModal(type) {
  const meta = META[type]
  modal.type      = type
  modal.title     = meta.title
  modal.icon      = meta.icon
  modal.iconStyle = meta.iconStyle
  modal.columns   = COLS[type]
  modal.leads     = filtered.value[SOURCE_MAP[type]] ?? []
  modal.search    = ''
  modal.filterResp = selectedVendedor.value
  modal.sortKey   = ''
  modal.sortDir   = 'asc'
  modal.open      = true
}

function setSort(key) {
  modal.sortKey === key
    ? (modal.sortDir = modal.sortDir === 'asc' ? 'desc' : 'asc')
    : ((modal.sortKey = key), (modal.sortDir = 'asc'))
}

const modalFiltered = computed(() => {
  let list = [...modal.leads]
  if (modal.search.trim()) {
    const q = modal.search.toLowerCase()
    list = list.filter(r => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(q)))
  }
  if (modal.filterResp) list = list.filter(r => r.responsavel === modal.filterResp)
  if (modal.sortKey) {
    const col = modal.columns.find(c => c.key === modal.sortKey)
    list.sort((a, b) => {
      let va = a[modal.sortKey] ?? ''
      let vb = b[modal.sortKey] ?? ''
      if (col?.isDate) { va = Number(new Date(va)) || 0; vb = Number(new Date(vb)) || 0 }
      else if (col?.isCurrency || col?.isNumber) { va = Number(va) || 0; vb = Number(vb) || 0 }
      else { va = String(va).toLowerCase(); vb = String(vb).toLowerCase() }
      return modal.sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })
  }
  return list
})

function formatSource(src) {
  if (!src || src === 'null') return 'Direto'
  if (src.startsWith('http')) {
    try { return new URL(src).hostname.replace('www.', '') } catch {}
  }
  return src
}

function formatDate(iso) {
  if (!iso || iso === 'null') return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function exportToExcel() {
  if (!modalFiltered.value.length) return
  const rows = modalFiltered.value.map(row => {
    const obj = {}
    modal.columns.forEach(col => {
      let val = row[col.key]
      if (col.key === 'utmSource') val = formatSource(val)
      else if (col.isDate) val = formatDate(val)
      else if (col.isCurrency) val = Number(val) || 0
      obj[col.label] = val ?? '—'
    })
    return obj
  })
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Negócios')
  XLSX.writeFile(wb, `${modal.title.replace(/\s+/g, '_')}_${Date.now()}.xlsx`)
}
</script>

<style scoped>
.vendedores-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px 0;
}

/* ── Seletor ──────────────────────────────────────────────── */
.selector-bar {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: 14px 18px;
  flex-wrap: wrap;
}
.selector-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-top: 4px;
  white-space: nowrap;
  flex-shrink: 0;
}
.selector-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 14px;
  border-radius: 99px;
  border: 1.5px solid var(--color-card-border);
  background: transparent;
  color: var(--color-placeholder);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}
.pill:hover {
  border-color: var(--color-btn-bg);
  color: var(--color-text);
}
.pill-active {
  background: var(--color-btn-bg);
  border-color: var(--color-btn-bg);
  color: #fff !important;
  font-weight: 600;
}

/* ── KPIs ─────────────────────────────────────────────────── */
.kpi-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 1100px) { .kpi-row { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 700px)  { .kpi-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 400px)  { .kpi-row { grid-template-columns: 1fr; } }

.kpi-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: box-shadow var(--transition-fast);
  min-width: 0;
}
.kpi-card:hover { box-shadow: var(--shadow-card); }
.kpi-card--highlight {
  border-color: rgba(216,139,73,0.35);
}

.kpi-icon {
  width: 44px; height: 44px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.kpi-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; }

.kpi-label {
  font-size: 12px;
  color: var(--color-placeholder);
  font-weight: 500;
  white-space: nowrap;
}
.kpi-label-flex {
  display: flex;
  align-items: center;
  gap: 4px;
}

.kpi-value {
  font-size: 26px;
  font-weight: 800;
  color: var(--color-text);
  line-height: 1.1;
}
.kpi-value--accent { color: var(--color-btn-bg); }

/* ── Tooltip ──────────────────────────────────────────────── */
.tooltip-icon {
  position: relative;
  cursor: help;
  color: var(--color-placeholder);
  font-size: 11px;
}
.tooltip-icon::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: #1a1a1a;
  color: #fff;
  padding: 5px 9px;
  border-radius: 4px;
  font-size: 11px;
  width: max-content;
  max-width: 220px;
  text-align: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-fast);
  z-index: 10;
  white-space: normal;
  line-height: 1.4;
}
.tooltip-icon:hover::after { opacity: 1; }

/* ── Valor Total / Ticket ─────────────────────────────────── */
.value-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 600px) { .value-row { grid-template-columns: 1fr; } }

.value-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: 16px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.value-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-placeholder);
}
/* ── Velocímetro da meta ──────────────────────────────────── */
/* A caixa tem tamanho fixo e o canvas fica absoluto dentro dela: assim o
   redimensionamento responsivo do Chart.js nunca realimenta a altura do card.
   A folga do arco vem do layout.padding em speedometerOptions. */
.speedometer-chart {
  position: relative;
  width: 176px;
  height: 92px;
  margin-bottom: 16px;
  flex-shrink: 0;
}
.speedometer-canvas { position: absolute; inset: 0; }
.speedometer-value {
  position: absolute;
  left: 0; right: 0; bottom: 8px;
  text-align: center;
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  color: var(--color-heading);
  pointer-events: none;
}
.speedometer-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 12px;
  text-align: center;
  color: var(--color-placeholder);
}

.value-amount {
  font-size: 22px;
  font-weight: 800;
  color: var(--color-btn-bg);
}

/* Skeletons */
.selector-skeleton { height: 56px; border-radius: var(--radius-lg); }
.kpi-skeleton      { height: 82px; border-radius: var(--radius-lg); }

/* ── Gráficos ─────────────────────────────────────────────── */
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
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  width: 100%;
}
.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.chart-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 6px;
}
.chart-title i { color: var(--color-placeholder); }
.chart-wrapper { position: relative; height: 210px; width: 100%; }

.badge-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 99px;
  white-space: nowrap;
}
.badge-green  { background: rgba(67,160,71,0.12);  color: #2e7d32; }
.badge-orange { background: rgba(255,167,38,0.12); color: #f57c00; }
.badge-accent { background: rgba(216,139,73,0.12); color: #D88B49; }

/* ── Coming soon ──────────────────────────────────────────── */
.coming-soon-card {
  background: var(--color-card-bg);
  border: 1px dashed var(--color-card-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 50px 24px;
  text-align: center;
}
.coming-soon-card i {
  font-size: 36px;
  color: var(--color-placeholder);
  opacity: 0.45;
}
.coming-soon-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}
.coming-soon-sub {
  font-size: 13px;
  color: var(--color-placeholder);
  margin: 0;
  max-width: 360px;
}

/* ── Seção 3: Funil ───────────────────────────────────────── */
.funnel-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Funil visual */
.funnel-chart-wrapper {
  position: relative;
  height: 340px;
  width: 100%;
}

.funnel-step {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.funnel-step-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.funnel-step-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.funnel-step-index {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(128,128,128,0.12);
  color: var(--color-placeholder);
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.funnel-step-name {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text);
}

.funnel-step-count {
  font-size: 18px;
  font-weight: 800;
  color: var(--color-heading, var(--color-text));
  flex-shrink: 0;
  line-height: 1;
}

.funnel-step-track {
  height: 30px;
  background: rgba(0,0,0,0.06);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.funnel-step-bar {
  height: 100%;
  border-radius: 6px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  min-width: 4px;
}

.funnel-step-pct {
  font-size: 11px;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
  white-space: nowrap;
}

.badge-unknown {
  background: rgba(120,144,156,0.15);
  color: #78909c;
  font-size: 10px;
  padding: 2px 7px;
  font-weight: 600;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}
.section-title i { color: var(--color-placeholder); }

/* Legenda do card: os containers medem recortes diferentes (pipeline atual x
   negócios criados no período), então cada um diz o que está contando */
.section-sub {
  font-size: 11px;
  color: var(--color-placeholder);
  margin: 2px 0 10px;
}

.badge-orange { background: rgba(255,167,38,0.15); color: #e65100; }

.funil-empty {
  font-size: 13px;
  color: var(--color-placeholder);
  font-style: italic;
  text-align: center;
  padding: 12px 0;
}

.funil-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.funil-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.funil-item-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.funil-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.funil-count {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-placeholder);
}

.funil-track {
  height: 8px;
  background: rgba(0,0,0,0.07);
  border-radius: 99px;
  overflow: hidden;
}

.funil-fill {
  height: 100%;
  border-radius: 99px;
  background: linear-gradient(90deg, var(--color-btn-bg), #f0a855);
  transition: width 0.5s ease;
}

/* ── Seção 4: Motivos de Perda ────────────────────────────── */
.motivos-card, .canais-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.motivo-fill {
  background: linear-gradient(90deg, #ef5350, #ff8a80) !important;
}

/* ── Micro Toggle ──────────────────────────────────────── */
.micro-toggle {
  display: flex;
  border: 1px solid var(--color-card-border);
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}
.micro-toggle button {
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 600;
  border: none;
  background: transparent;
  color: var(--color-placeholder);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}
.micro-toggle button.active {
  background: var(--color-btn-bg);
  color: #fff;
}
.micro-toggle button:not(:last-child) {
  border-right: 1px solid var(--color-card-border);
}

/* ── Andamento Detalhe ─────────────────────────────── */
.andamento-detalhe-card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: 18px 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.andamento-detalhe-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.andamento-detalhe-item {
  flex: 1;
  min-width: 180px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: 10px;
  border: 1px solid;
  background: var(--color-card-bg);
}
.andamento-detalhe-icon {
  width: 42px; height: 42px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 19px;
  flex-shrink: 0;
}
.andamento-detalhe-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.andamento-detalhe-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-placeholder);
}
.andamento-detalhe-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--color-heading);
  line-height: 1.1;
}
.andamento-detalhe-sub {
  font-size: 17px;
  color: var(--color-text);
  font-weight: 700;
  letter-spacing: -0.3px;
}

/* ── Rank Badge ──────────────────────────────────── */
.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-btn-bg);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

/* ── Botão detalhar KPI ───────────────────────────────────── */
.kpi-detail-btn {
  margin-left: auto;
  flex-shrink: 0;
  width: 30px; height: 30px;
  border-radius: 8px;
  border: 1.5px solid var(--color-card-border);
  background: transparent;
  color: var(--color-placeholder);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 13px;
  position: relative;
}
.kpi-detail-btn:hover {
  border-color: var(--color-btn-bg);
  color: var(--color-btn-bg);
  background: rgba(216,139,73,0.08);
}
.kpi-detail-btn::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 6px);
  right: 0;
  background: #1a1a1a;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  width: max-content;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transition-fast);
  z-index: 10;
}
.kpi-detail-btn:hover::after { opacity: 1; }

/* ── Modal Negócios ───────────────────────────────────────── */
.modal-negocios {
  max-width: 950px;
  width: 95vw;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  gap: 0;
}
.modal-negocios .modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-card-border);
  margin: 0;
}
.modal-icon {
  width: 36px; height: 36px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 17px; flex-shrink: 0;
}
.modal-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  border-bottom: 1px solid var(--color-card-border);
  flex-wrap: wrap;
  background: var(--color-bg);
}
.filter-select { width: 160px; }
@media (max-width: 600px) { .filter-select { flex: 1 1 45%; width: auto; } }

.modal-table-wrapper { overflow: auto; max-height: 55vh; }
.modal-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.modal-table thead { position: sticky; top: 0; z-index: 1; }
.sortable-th {
  padding: 10px 14px;
  text-align: left;
  font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--color-placeholder);
  background: var(--color-card-bg);
  border-bottom: 1px solid var(--color-card-border);
  white-space: nowrap;
  cursor: pointer; user-select: none;
  transition: color var(--transition-fast);
}
.sortable-th:hover { color: var(--color-text); }
.th-active { color: var(--color-btn-bg) !important; }
.sort-icon { margin-left: 4px; font-size: 11px; }
.modal-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-card-border);
  vertical-align: middle;
  color: var(--color-text);
}
.modal-table tr:last-child td { border-bottom: none; }
.modal-table tbody tr:hover td { background: var(--color-bg); }
.table-empty {
  text-align: center; padding: 32px !important;
  color: var(--color-placeholder); font-style: italic;
}
.cell-muted { color: var(--color-placeholder); }
.source-tag {
  display: inline-block;
  padding: 2px 8px; border-radius: 6px;
  font-size: 11px; font-weight: 500;
  background: var(--color-bg);
  border: 1px solid var(--color-card-border);
}

/* ── Taxas de Conversão por Safra ────────────────────────── */
.conversao-section {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 24px;
}
.conversao-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-top: 14px;
}
@media (max-width: 1100px) { .conversao-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px)  { .conversao-grid { grid-template-columns: 1fr; } }

.conversao-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
}
.conversao-card--destaque { border-color: rgba(216,139,73,0.45); }

.conversao-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 6px;
}
.conversao-titulo {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text);
}
.conversao-star { font-size: 10px; color: #D88B49; flex-shrink: 0; margin-top: 2px; }

.conversao-pct { font-size: 28px; font-weight: 800; line-height: 1; }
.conversao-detalhe { font-size: 11px; color: var(--color-text); }
.conversao-detalhe strong { font-weight: 700; color: var(--color-heading); }
.conversao-sub { font-size: 11px; line-height: 1.4; color: var(--color-placeholder); }

/* ── Grid Análises Inferiores ────────────────────────────── */
.bottom-analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  align-items: stretch;
  margin-bottom: 24px;
}
.bottom-analytics-grid > * {
  min-width: 0;
  margin: 0 !important; /* override old inline margins */
}
.bottom-analytics-grid > :nth-child(odd):last-child {
  grid-column: 1 / -1;
}
@media (max-width: 900px) {
  .bottom-analytics-grid {
    grid-template-columns: 1fr;
  }
  .bottom-analytics-grid > :nth-child(odd):last-child {
    grid-column: auto;
  }
}
</style>
