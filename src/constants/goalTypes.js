/**
 * Tipos de meta disponíveis no sistema.
 *
 * Para adicionar um novo tipo de meta, basta incluir um objeto neste array:
 *   - value:       identificador salvo no backend (campo `type` da meta). NÃO repita valores.
 *   - label:       nome exibido na interface.
 *   - icon:        classe do Bootstrap Icons (ex: 'bi-cash-coin').
 *   - format:      'currency' (R$) | 'number' (quantidade) | 'percent' (%). Controla
 *                  formatação do total e o comportamento do input.
 *   - placeholder: texto exibido no input vazio.
 *   - step:        incremento do input numérico ('0.01' para moeda, '1' para quantidade).
 *   - levels:      (opcional) degraus da mesma meta, do menor para o maior. Cada nível é
 *                  salvo no backend como um `type` próprio (`value`); o primeiro nível
 *                  usa o mesmo `value` do tipo. `color` é a cor do nível nos dashboards.
 */
export const GOAL_TYPES = [
  {
    value: 'faturamento',
    label: 'Faturamento',
    icon: 'bi-cash-coin',
    format: 'currency',
    placeholder: '0,00',
    step: '0.01',
  },
  {
    value: 'leads',
    label: 'Leads',
    icon: 'bi-people',
    format: 'number',
    placeholder: '0',
    step: '1',
  },
  {
    value: 'oportunidades',
    label: 'Oportunidades',
    icon: 'bi-binoculars',
    format: 'number',
    placeholder: '0',
    step: '1',
  },
  {
    value: 'qualificacoes',
    label: 'Qualificações',
    icon: 'bi-patch-check',
    format: 'number',
    placeholder: '0',
    step: '1',
    levels: [
      { value: 'qualificacoes', label: 'Meta', color: '#66bb6a' },
      { value: 'qualificacoes_mega', label: 'Mega Meta', color: '#42a5f5' },
      { value: 'qualificacoes_ultra', label: 'Ultra Meta', color: '#ab47bc' },
    ],
  },
]

/** Tipo padrão — usado como fallback para metas legadas sem o campo `type`. */
export const DEFAULT_GOAL_TYPE = 'faturamento'

/**
 * Retorna a configuração de um tipo de meta (ou o tipo padrão, se não encontrado).
 * Aceita também o `value` de um nível, devolvendo o tipo ao qual ele pertence.
 */
export function getGoalTypeConfig(value) {
  return (
    GOAL_TYPES.find((t) => t.value === value || t.levels?.some((l) => l.value === value)) ||
    GOAL_TYPES[0]
  )
}

/** Formata um valor de acordo com o formato do tipo de meta. */
export function formatGoalValue(value, format) {
  const num = parseFloat(value) || 0

  if (format === 'currency') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(num)
  }

  if (format === 'percent') {
    return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(num)}%`
  }

  // number
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(num)
}
