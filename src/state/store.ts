import { computed, effect, signal } from '@preact/signals'
import { createStore, del, get, set } from 'idb-keyval'
import { hoje, mesDe } from '../domain/dates'
import { estadoInicial } from '../domain/defaults'
import { estadoDemo } from '../domain/demo'
import { lerBackup } from '../domain/backup'
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

export interface Prefs {
  letraGrande: boolean
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

export const mesAtual = computed(() => mesDe(hoje()))
export const temDadosReais = signal(false)

export async function iniciar() {
  try {
    const m = (localStorage.getItem(CHAVE_MODO) as Modo | null) ?? 'real'
    modo.value = m === 'demo' ? 'demo' : 'real'
  } catch {
    modo.value = 'real'
  }
  try {
    const salvo = await get<Estado>(CHAVE[modo.value], db)
    if (salvo) estado.value = migrar(salvo)
    else if (modo.value === 'demo') estado.value = novoDemo()
    temDadosReais.value = Boolean(await get(CHAVE.real, db))
  } catch {
    erroArmazenamento.value = 'Não consegui abrir a memória do celular. Seus dados podem não ser salvos nesta janela (ex.: navegação anônima).'
  }
  carregado.value = true
  pedirPersistencia()
}

function migrar(e: Estado): Estado {
  const base = estadoInicial()
  return {
    config: { ...base.config, ...e.config },
    servicos: e.servicos?.length ? e.servicos : base.servicos,
    categorias: e.categorias?.length ? e.categorias : base.categorias,
    lancamentos: e.lancamentos ?? [],
    fornecedores: e.fornecedores ?? [],
  }
}

function novoDemo(): Estado {
  const d = hoje()
  return estadoDemo(mesDe(d), Number(d.slice(8, 10)))
}

async function pedirPersistencia() {
  try {
    if (navigator.storage?.persist) {
      const ja = await navigator.storage.persisted()
      armazenamentoPersistente.value = ja || (await navigator.storage.persist())
    }
  } catch {
    armazenamentoPersistente.value = null
  }
}

// salva sozinho a cada mudança (com um pequeno atraso para juntar várias mudanças seguidas)
let timer: ReturnType<typeof setTimeout> | undefined
effect(() => {
  const e = estado.value
  const m = modo.value
  if (!carregado.peek()) return
  clearTimeout(timer)
  timer = setTimeout(() => {
    set(CHAVE[m], e, db)
      .then(() => {
        if (m === 'real') temDadosReais.value = true
        erroArmazenamento.value = null
      })
      .catch(() => {
        erroArmazenamento.value = 'Não consegui salvar no celular. Faça um backup agora para não perder nada.'
      })
  }, 150)
})

function mudar(fn: (e: Estado) => Estado) {
  estado.value = fn(estado.value)
}

export function novoId(): string {
  return crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

// ---------- ações ----------

export function adicionarLancamento(l: Omit<Lancamento, 'id' | 'criadoEm'>): Lancamento {
  const novo: Lancamento = { ...l, id: novoId(), criadoEm: Date.now() }
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
  mudar((e) => ({ ...e, lancamentos: [...e.lancamentos, l] }))
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
  clearTimeout(timer)
  await set(CHAVE[modo.value], estado.value, db).catch(() => undefined)
  carregado.value = false
  modo.value = m
  try {
    localStorage.setItem(CHAVE_MODO, m)
  } catch {
    /* ignora */
  }
  const salvo = await get<Estado>(CHAVE[m], db).catch(() => undefined)
  estado.value = salvo ? migrar(salvo) : m === 'demo' ? novoDemo() : estadoInicial()
  carregado.value = true
}

export async function recomecarDemo() {
  estado.value = novoDemo()
}

export async function apagarTudoReal() {
  clearTimeout(timer)
  await del(CHAVE.real, db)
  temDadosReais.value = false
  if (modo.value === 'real') estado.value = estadoInicial()
}

export function importarBackup(texto: string): string | null {
  const r = lerBackup(texto)
  if (!r.ok) return r.erro
  estado.value = { ...r.estado, config: { ...r.estado.config, onboardingFeito: true } }
  return null
}

export function registrarBackupFeito() {
  atualizarConfig({ ultimoBackup: Date.now() })
}
