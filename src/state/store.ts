import { computed, effect, signal } from '@preact/signals'
import { createStore, del, get, set } from 'idb-keyval'
import { hoje, mesDe } from '../domain/dates'
import { estadoInicial } from '../domain/defaults'
import { estadoDemo } from '../domain/demo'
import { FORMATO_BACKUP, lerBackup } from '../domain/backup'
import { saldoReserva } from '../domain/calc'
import type { Config, Estado, Fornecedor, Lancamento, Servico } from '../domain/types'

/**
 * Tudo fica no próprio aparelho (IndexedDB). Não existe servidor, conta ou envio de dados.
 * O modo demonstração usa outra "gaveta", então nunca mistura com os dados reais.
 */
export type Modo = 'real' | 'demo'

const db = createStore('folego', 'dados')
const CHAVE: Record<Modo, string> = { real: 'estado-real-v1', demo: 'estado-demo-v1' }
const CHAVE_MODO = 'folego:modo'
const CHAVE_PREFS = 'folego:prefs'

export const carregado = signal(false)
export const modo = signal<Modo>('real')
export const estado = signal<Estado>(estadoInicial())
export const armazenamentoPersistente = signal<boolean | null>(null)
export const erroArmazenamento = signal<string | null>(null)
/**
 * A leitura da memória falhou (ou os dados guardados estão com defeito). Enquanto isso, NADA é gravado:
 * gravar por cima seria apagar os dados reais que podem estar lá.
 */
export const leituraFalhou = signal(false)
/** Dados guardados que não passaram na conferência, para ela poder baixar como estão. */
export const dadosComDefeito = signal<unknown>(null)

export interface Prefs {
  letraGrande: boolean
  ocultarInstalar?: boolean
}
export const prefs = signal<Prefs>(lerPrefs())

function lerPrefs(): Prefs {
  try {
    return { letraGrande: false, ...JSON.parse(localStorage.getItem(CHAVE_PREFS) ?? '{}') }
  } catch {
    return { letraGrande: false }
  }
}
effect(() => {
  try {
    localStorage.setItem(CHAVE_PREFS, JSON.stringify(prefs.value))
  } catch {
    /* sem localStorage: preferências só valem nesta sessão */
  }
  document.documentElement.classList.toggle('letra-grande', prefs.value.letraGrande)
})

// O dia de hoje acompanha o relógio: com o app aberto na virada do mês, a tela passa para o mês novo.
export const dataHoje = signal(hoje())
function atualizarDia() {
  const d = hoje()
  if (d !== dataHoje.peek()) dataHoje.value = d
}
setInterval(atualizarDia, 60_000)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') atualizarDia()
})
export const mesAtual = computed(() => mesDe(dataHoje.value))
export const temDadosReais = signal(false)

/** Confere o que estava guardado com as mesmas regras da cópia de segurança. */
function conferir(salvo: unknown): Estado | null {
  const r = lerBackup(JSON.stringify({ formato: FORMATO_BACKUP, versao: 1, estado: salvo }))
  return r.ok ? r.estado : null
}

export async function iniciar() {
  try {
    const m = (localStorage.getItem(CHAVE_MODO) as Modo | null) ?? 'real'
    modo.value = m === 'demo' ? 'demo' : 'real'
  } catch {
    modo.value = 'real'
  }
  // link de demonstração para a banca e para prints: .../folego/?demo
  if (new URLSearchParams(location.search).has('demo')) {
    modo.value = 'demo'
    try {
      localStorage.setItem(CHAVE_MODO, 'demo')
    } catch {
      /* ignora */
    }
  }
  await carregarGaveta(modo.value)
  try {
    temDadosReais.value = Boolean(await get(CHAVE.real, db))
  } catch {
    /* sem importância */
  }
  carregado.value = true
  pedirPersistencia(false)
}

async function carregarGaveta(m: Modo) {
  leituraFalhou.value = false
  dadosComDefeito.value = null
  let salvo: unknown
  try {
    salvo = await get(CHAVE[m], db)
  } catch {
    leituraFalhou.value = true
    erroArmazenamento.value = 'Não consegui abrir a memória do celular. Para não estragar nada, o app não vai salvar até você tentar de novo.'
    estado.value = estadoInicial()
    return
  }
  if (salvo === undefined) {
    estado.value = m === 'demo' ? novoDemo() : estadoInicial()
    return
  }
  const ok = conferir(salvo)
  if (ok) {
    estado.value = ok
    erroArmazenamento.value = null
  } else {
    leituraFalhou.value = true
    dadosComDefeito.value = salvo
    erroArmazenamento.value = 'Os dados guardados parecem com defeito. Nada foi apagado. Baixe os dados como estão e peça ajuda à equipe.'
    estado.value = estadoInicial()
  }
}

export function tentarDeNovo() {
  location.reload()
}

function novoDemo(): Estado {
  const d = hoje()
  return estadoDemo(mesDe(d), Number(d.slice(8, 10)))
}

/** Só consulta ao abrir; o pedido de verdade acontece no primeiro salvamento (gesto da pessoa). */
async function pedirPersistencia(pedir: boolean) {
  try {
    if (navigator.storage?.persist) {
      const ja = await navigator.storage.persisted()
      armazenamentoPersistente.value = ja || (pedir ? await navigator.storage.persist() : false)
    }
  } catch {
    armazenamentoPersistente.value = null
  }
}

// ---------- gravação ----------
// Cada mudança é gravada na hora (no fim da tarefa atual, juntando mudanças feitas no mesmo toque).
// Ao ir para o fundo ou fechar, grava de novo por garantia.
let pendente: { m: Modo; e: Estado } | null = null
let agendado = false
let ignorarProximo = false

function gravar() {
  agendado = false
  if (!pendente || leituraFalhou.peek()) return
  const { m, e } = pendente
  pendente = null
  set(CHAVE[m], e, db)
    .then(() => {
      if (m === 'real') temDadosReais.value = true
      if (!leituraFalhou.peek()) erroArmazenamento.value = null
    })
    .catch(() => {
      erroArmazenamento.value = 'Não consegui salvar no celular. Faça uma cópia de segurança agora para não perder nada.'
    })
}

effect(() => {
  const e = estado.value
  const m = modo.value
  if (!carregado.peek() || leituraFalhou.peek()) return
  if (ignorarProximo) {
    ignorarProximo = false
    return
  }
  pendente = { m, e }
  if (!agendado) {
    agendado = true
    queueMicrotask(gravar)
  }
})
const gravarJa = () => {
  if (pendente) gravar()
}
window.addEventListener('pagehide', gravarJa)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') gravarJa()
})

function mudar(fn: (e: Estado) => Estado) {
  atualizarDia()
  estado.value = fn(estado.value)
}

export function novoId(): string {
  return crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

// ---------- ações ----------

export function adicionarLancamento(l: Omit<Lancamento, 'id' | 'criadoEm'>): Lancamento {
  if (armazenamentoPersistente.value !== true && modo.value === 'real') pedirPersistencia(true)
  // não dá para tirar da reserva mais do que tem (a tela já avisa; aqui é a última proteção)
  const valor = l.tipo === 'resgate' ? Math.min(l.valor, Math.max(0, saldoReserva(estado.value.lancamentos))) : l.valor
  const novo: Lancamento = { ...l, valor, id: novoId(), criadoEm: Date.now() }
  mudar((e) => ({ ...e, lancamentos: [...e.lancamentos, novo] }))
  return novo
}

export function atualizarLancamento(id: string, patch: Partial<Lancamento>) {
  mudar((e) => ({ ...e, lancamentos: e.lancamentos.map((l) => (l.id === id ? { ...l, ...patch } : l)) }))
}

export function removerLancamento(id: string): Lancamento | undefined {
  const l = estado.value.lancamentos.find((x) => x.id === id)
  mudar((e) => ({ ...e, lancamentos: e.lancamentos.filter((x) => x.id !== id) }))
  return l
}

export function restaurarLancamento(l: Lancamento) {
  mudar((e) => ({ ...e, lancamentos: e.lancamentos.some((x) => x.id === l.id) ? e.lancamentos : [...e.lancamentos, l] }))
}

export function marcarRecebido(id: string, data: string = hoje()) {
  atualizarLancamento(id, { recebido: true, recebidoEm: data })
}

export function atualizarConfig(patch: Partial<Config>) {
  mudar((e) => ({ ...e, config: { ...e.config, ...patch } }))
}

export function salvarServico(s: Servico) {
  mudar((e) => {
    const existe = e.servicos.some((x) => x.id === s.id)
    return { ...e, servicos: existe ? e.servicos.map((x) => (x.id === s.id ? s : x)) : [...e.servicos, s] }
  })
}

export function salvarFornecedor(f: Fornecedor) {
  mudar((e) => {
    const existe = e.fornecedores.some((x) => x.id === f.id)
    return { ...e, fornecedores: existe ? e.fornecedores.map((x) => (x.id === f.id ? f : x)) : [...e.fornecedores, f] }
  })
}

export function removerFornecedor(id: string) {
  mudar((e) => ({ ...e, fornecedores: e.fornecedores.filter((x) => x.id !== id) }))
}

export function alternarDAS(competencia: string) {
  const pagos = new Set(estado.value.config.dasPagos)
  if (pagos.has(competencia)) pagos.delete(competencia)
  else pagos.add(competencia)
  atualizarConfig({ dasPagos: [...pagos].sort() })
}

export async function trocarModo(m: Modo) {
  if (m === modo.value) return
  if (leituraFalhou.value) return // não grava nada por cima enquanto a memória está com problema
  gravarJa()
  try {
    await set(CHAVE[modo.value], estado.value, db)
  } catch {
    erroArmazenamento.value = 'Não consegui salvar antes de trocar. Tente de novo.'
    return
  }
  carregado.value = false
  modo.value = m
  try {
    localStorage.setItem(CHAVE_MODO, m)
  } catch {
    /* ignora */
  }
  await carregarGaveta(m)
  carregado.value = true
}

export function recomecarDemo() {
  if (modo.value === 'demo') estado.value = novoDemo()
}

export async function apagarTudoReal() {
  pendente = null
  await del(CHAVE.real, db)
  temDadosReais.value = false
  if (modo.value === 'real') {
    // volta ao começo sem gravar um estado vazio por cima (nada fica guardado)
    ignorarProximo = true
    estado.value = estadoInicial()
  }
}

export function importarBackup(texto: string): string | null {
  if (modo.value === 'demo') return 'Saia da demonstração antes de voltar uma cópia dos seus dados.'
  if (leituraFalhou.value) return 'A memória do celular está com problema. Toque em “Tentar de novo” primeiro.'
  const r = lerBackup(texto)
  if (!r.ok) return r.erro
  estado.value = { ...r.estado, config: { ...r.estado.config, onboardingFeito: true } }
  return null
}

export function registrarBackupFeito() {
  atualizarConfig({ ultimoBackup: Date.now() })
}
