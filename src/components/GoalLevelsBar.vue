<template>
  <div class="levels-bar">
    <div class="levels-track">
      <div
        class="levels-fill"
        :style="{ width: progress.fillPct + '%', background: progress.current?.color }"
      ></div>
      <span
        v-for="l in progress.levels"
        :key="l.value"
        class="levels-mark"
        :style="{ left: l.pos + '%' }"
      ></span>
    </div>

    <div class="levels-foot">
      <span class="levels-list">
        <span
          v-for="l in progress.levels"
          :key="l.value"
          class="levels-item"
          :class="{ reached: l.reached }"
        >
          <span class="levels-dot" :style="{ background: l.color }"></span>
          {{ l.label }} {{ l.target.toLocaleString('pt-BR') }}
        </span>
      </span>
      <span class="levels-next">
        <template v-if="progress.next">
          Faltam {{ progress.faltam.toLocaleString('pt-BR') }} para a {{ progress.next.label }}
        </template>
        <template v-else>Todos os níveis batidos</template>
      </span>
    </div>
  </div>
</template>

<script setup>
/**
 * Barra de progresso de uma meta com níveis (ex.: Meta / Mega Meta / Ultra Meta).
 *
 * `progress`: { fillPct, levels: [{ value, label, color, target, pos, reached }],
 *               current, next, faltam }
 */
defineProps({
  progress: { type: Object, required: true },
})
</script>

<style scoped>
.levels-bar { display: flex; flex-direction: column; gap: 6px; min-width: 0; }

.levels-track {
  position: relative; height: 6px;
  background: rgba(0,0,0,0.07); border-radius: 99px;
}
.levels-fill {
  height: 100%; border-radius: 99px;
  background: var(--color-placeholder);
  transition: width 0.5s ease;
}
.levels-mark {
  position: absolute; top: -3px; bottom: -3px;
  width: 2px; margin-left: -2px;
  background: var(--color-text); opacity: 0.35; border-radius: 1px;
}

.levels-foot {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 2px 10px;
  font-size: 11px; color: var(--color-placeholder);
}
.levels-list { display: flex; flex-wrap: wrap; gap: 2px 10px; }
.levels-item { display: inline-flex; align-items: center; gap: 4px; font-weight: 500; white-space: nowrap; }
.levels-item.reached { color: var(--color-text); font-weight: 700; }
.levels-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.levels-next { font-weight: 600; }
</style>
