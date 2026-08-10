// ─── Fases do funil de vendas (CRM) ──────────────────────────────────────────
// A fonte de dados envia `faseAtual` com o nome exato cadastrado no CRM
// (ex.: "FOLLOW-UP - 30 DIAS", "ORÇAMENTO APROVADO", "ORÇAMENTO FATURADO!").
// Esses nomes mudam com o tempo, então o reconhecimento é feito por padrão e
// não por igualdade: o rótulo original continua aparecendo na tela, mas ganha
// ordem no funil, cor, ícone e grupo (aberto / ganho / perdido).

// Estágios canônicos, na ordem em que aparecem no funil
export const FASE_STAGES = [
  { id: 'fila',           order: 1, label: 'Fila',               grupo: 'aberto',  color: '#90caf9', icon: 'bi-person-lines-fill' },
  { id: 'contato',        order: 2, label: 'Em Contato',         grupo: 'aberto',  color: '#42a5f5', icon: 'bi-chat-dots' },
  { id: 'reativacao',     order: 3, label: 'Reativação',         grupo: 'aberto',  color: '#ce93d8', icon: 'bi-arrow-repeat' },
  { id: 'orcamento',      order: 4, label: 'Orçamento',          grupo: 'aberto',  color: '#ffa726', icon: 'bi-file-earmark-text' },
  { id: 'followup',       order: 5, label: 'Follow-up',          grupo: 'aberto',  color: '#fb8c00', icon: 'bi-telephone-outbound' },
  { id: 'aprovado',       order: 6, label: 'Orçamento Aprovado', grupo: 'aberto',  color: '#26a69a', icon: 'bi-check2-circle' },
  { id: 'faturado',       order: 7, label: 'Orçamento Faturado', grupo: 'ganho',   color: '#43a047', icon: 'bi-receipt' },
  { id: 'reprovado',      order: 8, label: 'Reprovado',          grupo: 'perdido', color: '#ef5350', icon: 'bi-x-circle' },
  { id: 'desqualificado', order: 9, label: 'Desqualificado',     grupo: 'perdido', color: '#78909c', icon: 'bi-slash-circle' },
]

// Fase que o CRM criou e ainda não conhecemos: entra no fim do funil, em cinza
export const FASE_DESCONHECIDA = {
  id: 'desconhecida', order: 99, label: 'Outra fase',
  grupo: 'desconhecido', color: '#b0bec5', icon: 'bi-question-circle',
}

const byId = Object.fromEntries(FASE_STAGES.map(s => [s.id, s]))

// Regras avaliadas em ordem de prioridade — do mais específico para o mais
// genérico, porque "ORÇAMENTO APROVADO" e "ORÇAMENTO FATURADO!" contêm
// "ORÇAMENTO" e não podem cair no estágio de orçamento.
const RULES = [
  [/DESQUALIFIC/,                                     'desqualificado'],
  [/REPROVAD|PERDID|RECUSAD|CANCELAD|SEM INTERESSE/,  'reprovado'],
  [/FATURAD|VENDA|VENDIDO|GANH|FECHAD/,               'faturado'],
  [/APROVAD/,                                         'aprovado'],
  [/FOLLOW ?UP/,                                      'followup'],
  [/REATIVAC/,                                        'reativacao'],
  [/ORCAMENTO|PROPOSTA|NEGOCIAC/,                     'orcamento'],
  [/CONTATO|INICIO|ATENDIMENTO/,                      'contato'],
  [/FILA|AGUARDANDO|NOVO/,                            'fila'],
]

// "FOLLOW-UP - 30 DIAS" → "FOLLOW UP 30 DIAS" / "ORÇAMENTO FATURADO!" → "ORCAMENTO FATURADO"
export function normalizeFase(nome) {
  return String(nome ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
}

const cache = new Map()

// Devolve o estágio canônico de um nome de fase vindo do CRM
export function resolveFase(nome) {
  const key = normalizeFase(nome)
  if (cache.has(key)) return cache.get(key)

  const rule  = RULES.find(([re]) => re.test(key))
  const stage = rule ? byId[rule[1]] : FASE_DESCONHECIDA
  cache.set(key, stage)
  return stage
}

export const isFaseAberta  = nome => resolveFase(nome).grupo === 'aberto'
export const isFaseGanha   = nome => resolveFase(nome).grupo === 'ganho'
export const isFasePerdida = nome => resolveFase(nome).grupo === 'perdido'

// Agrupa uma lista de negócios pelo nome real da fase, já ordenada pelo funil.
// `valorDe` é opcional e soma um valor monetário por fase.
export function agruparPorFase(items, { faseKey = 'faseAtual', valorDe = null } = {}) {
  const map = new Map()

  items.forEach(item => {
    const fase = item[faseKey] || 'Sem fase'
    if (!map.has(fase)) map.set(fase, { fase, stage: resolveFase(fase), count: 0, valor: 0 })
    const entry = map.get(fase)
    entry.count += 1
    if (valorDe) entry.valor += Number(valorDe(item)) || 0
  })

  // Ordem do funil; fases distintas dentro do mesmo estágio (ex.: follow-up de
  // 30 e de 60 dias) ficam lado a lado, da maior para a menor
  return [...map.values()].sort(
    (a, b) => a.stage.order - b.stage.order || b.count - a.count
  )
}

// '#ffa726' + 0.12 → 'rgba(255,167,38,0.12)'
export function faseTint(hex, alpha) {
  const h = String(hex).replace('#', '')
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h
  const n = parseInt(full, 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`
}
