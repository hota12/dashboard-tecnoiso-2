# Como Criar um Componente de Dashboard

## Visão Geral

Os dashboards no NexusHub são **componentes Vue 3 dinâmicos** localizados em `src/dashboards/`. Cada dashboard é carregado automaticamente pelo sistema com base no campo `vueComponent` cadastrado no banco de dados. O sistema injeta dados de filtros e das fontes (APIs externas) via props.

---

## 1. Criando o Componente

Crie um arquivo `.vue` em `src/dashboards/` com o **mesmo nome** registrado no campo `vueComponent` da tabela `dashboards`.

**Exemplo:** se `vueComponent = "VendasDashboard"`, crie:
```
src/dashboards/VendasDashboard.vue
```

---

## 2. Props recebidas

O sistema injeta automaticamente 3 props no seu componente:

```vue
<script setup>
const props = defineProps({
  // Dados das fontes já carregados
  // Chave = URL da fonte, Valor = response da API
  fontsData: {
    type: Object,
    default: () => ({})
  },

  // Estado de loading de cada fonte
  // Chave = URL da fonte, Valor = boolean
  fontsLoading: {
    type: Object,
    default: () => ({})
  },

  // Filtros globais selecionados pelo usuário
  filters: {
    type: Object,
    default: () => ({
      startDate: '',       // 'YYYY-MM-DD'
      endDate: '',         // 'YYYY-MM-DD'
      compareStartDate: '', // 'YYYY-MM-DD'
      compareEndDate: '',  // 'YYYY-MM-DD'
    })
  },
})
</script>
```

---

## 3. Estrutura mínima de um dashboard

```vue
<template>
  <div class="meu-dashboard">
    <!-- Loading state usando skeleton global -->
    <div v-if="isLoading" class="skeleton" style="height: 300px; border-radius: 12px;"></div>

    <!-- Conteúdo quando carregado -->
    <div v-else>
      <!-- Seus gráficos e cards aqui -->
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line, Bar, Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, /* registre os módulos necessários */ } from 'chart.js'

const props = defineProps({
  fontsData:    { type: Object, default: () => ({}) },
  fontsLoading: { type: Object, default: () => ({}) },
  filters:      { type: Object, default: () => ({}) },
})

// Detectar se alguma fonte ainda está carregando
const isLoading = computed(() =>
  Object.values(props.fontsLoading).some(Boolean)
)

// Acessar dados de uma fonte pelo URL exato cadastrado
const minhaFonte = computed(() =>
  props.fontsData['https://minha-api.com/vendas'] ?? null
)
</script>
```

---

## 4. Acessando dados de fontes

As fontes (APIs externas) são cadastradas na tabela `fonts` com um `url`. O sistema busca cada fonte passando os parâmetros `startDate` e `endDate` dos filtros globais.

Para acessar os dados de uma fonte no componente, use a **URL exata** como chave de `fontsData`:

```js
// URL cadastrada na fonte: "https://api.exemplo.com/faturamento"
const faturamentoData = computed(() =>
  props.fontsData['https://api.exemplo.com/faturamento']
)

// Verificar loading desta fonte específica
const faturamentoLoading = computed(() =>
  props.fontsLoading['https://api.exemplo.com/faturamento'] ?? false
)
```

---

## 5. Usando vue-chartjs

O NexusHub já inclui `vue-chartjs` e `chart.js`. Registre apenas os módulos que utilizar:

```js
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  BarElement, ArcElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'vue-chartjs'

ChartJS.register(
  CategoryScale, LinearScale,
  PointElement, LineElement,
  BarElement, ArcElement,
  Title, Tooltip, Legend, Filler
)
```

**Opções padrão recomendadas para manter consistência visual:**
```js
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
    y: { grid: { color: 'rgba(0,0,0,0.05)' } },
  },
}
```

---

## 6. Classes CSS globais disponíveis

O sistema expõe todas as classes do design system via `src/style.css`. Use-as livremente:

| Classe | Uso |
|---|---|
| `.card` | Card com fundo, borda e sombra |
| `.card-header` | Cabeçalho do card (flex, com borda inferior) |
| `.card-title` | Título do card |
| `.skeleton` | Skeleton animado para loading |
| `.spinner` | Spinner circular |
| `.badge`, `.badge-primary`, `.badge-success`, etc. | Etiquetas coloridas |
| `.btn`, `.btn-primary`, `.btn-secondary` | Botões do design system |
| `.form-input`, `.form-select` | Inputs padronizados |
| `.empty-state` | Estado vazio centralizado |
| `.table`, `.table-wrapper` | Tabela padronizada |
| `.alert-danger`, `.alert-success` | Alertas |

**Variáveis CSS disponíveis:**
```css
var(--color-btn-bg)         
var(--color-text)           
var(--color-sidebar-bg)     
var(--color-card-bg)        
var(--color-card-border)    
var(--radius-md)            
var(--radius-lg)            
var(--font-family)          
var(--shadow-card)          
var(--transition-fast)      
```

---

## 7. Registrando o dashboard no sistema

1. No painel de administração (ou via API diretamente), crie um registro na tabela `dashboards`:
   ```json
   {
     "name": "Meu Dashboard de Vendas",
     "vueComponent": "VendasDashboard",
     "fontsId": ["id-da-fonte-1", "id-da-fonte-2"]
   }
   ```
2. O campo `vueComponent` **deve ser idêntico** ao nome do arquivo em `src/dashboards/` (sem o `.vue`).
3. Associe as permissões de usuários ao dashboard via `PUT /dashboard/permission?id=...`.

---

## 8. Funcionalidades automáticas do contexto

Seu componente se beneficia automaticamente de:

- **Filtros globais**: `startDate`, `endDate`, `compareStartDate`, `compareEndDate` — passados via props
- **Auto-refresh**: O sistema re-busca todas as fontes no intervalo configurado. Seu componente recebe os novos dados via `fontsData` (reactivo via Pinia)
- **Tela cheia**: O layout se adapta automaticamente, não é necessário tratar no componente
- **Sincronização de URL**: Os filtros e configurações são mantidos na URL, permitindo bookmarks e compartilhamento
- **Presets de data**: Mês atual, mês passado, últimos 7/30 dias, ano atual — aplicados globalmente antes de chegar no componente

---

## 9. Exemplo completo: componente de vendas

```vue
<template>
  <div class="vendas-dashboard">
    <!-- Stat cards -->
    <div class="stats-grid">
      <div class="card stat-card" v-for="stat in stats" :key="stat.label">
        <div v-if="isLoading" class="skeleton" style="height:80px"></div>
        <template v-else>
          <p class="stat-label">{{ stat.label }}</p>
          <p class="stat-value">{{ stat.value }}</p>
        </template>
      </div>
    </div>

    <!-- Gráfico principal -->
    <div class="card" style="margin-top:20px">
      <div class="card-header">
        <h3 class="card-title">Faturamento</h3>
        <span class="badge badge-primary">
          {{ filters.startDate }} — {{ filters.endDate }}
        </span>
      </div>
      <div v-if="isLoading" class="skeleton" style="height:300px;border-radius:8px"></div>
      <Line v-else :data="chartData" :options="chartOptions" style="height:300px" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const props = defineProps({
  fontsData:    { type: Object, default: () => ({}) },
  fontsLoading: { type: Object, default: () => ({}) },
  filters:      { type: Object, default: () => ({}) },
})

const FONTE_URL = 'https://minha-api.com/faturamento'

const isLoading = computed(() => props.fontsLoading[FONTE_URL] ?? false)
const rawData   = computed(() => props.fontsData[FONTE_URL] ?? [])

const stats = computed(() => [
  { label: 'Total', value: rawData.value?.total ?? 'R$ 0' },
  { label: 'Pedidos', value: rawData.value?.count ?? 0 },
])

const chartData = computed(() => ({
  labels: rawData.value?.labels ?? [],
  datasets: [{
    label: 'Faturamento',
    data: rawData.value?.values ?? [],
    borderColor: '#dfa625',
    backgroundColor: 'rgba(223,166,37,0.1)',
    fill: true,
    tension: 0.4,
  }],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { font: { family: 'Nunito' } } } },
  scales: { x: { grid: { display: false } } },
}
</script>
```

---

## 10. Boas práticas

- ✅ Sempre mostre skeletons enquanto `isLoading` for `true`
- ✅ Use as classes e variáveis CSS do design system para consistência visual
- ✅ Trate o caso de `fontsData` vazio ou `null` (API pode falhar)
- ✅ Use `computed` para derivar dados dos `fontsData`, nunca modifique-os diretamente
- ✅ Registre apenas os módulos do Chart.js que realmente usar
- ❌ Não faça chamadas de API diretamente no componente — use o sistema de fontes
- ❌ Não gerencie estado global no componente — use props reativos
- ❌ Não use bibliotecas de CSS externas como TailwindCSS — use o design system do projeto
