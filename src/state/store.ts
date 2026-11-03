import { computed, effect, signal } from '@preact/signals'
import { createStore, del, get, set } from 'idb-keyval'
import { hoje, mesDe } from '../domain/dates'
import { estadoInicial } from '../domain/defaults'
import { estadoDemo, VERSAO_DEMO } from '../domain/demo'
import { conferirEstado, LIMITES, lerBackup } from '../domain/backup'
import { reservaFicaNegativa, saldoReserva } from '../domain/calc'
import { cortarTexto } from '../domain/texto'
import type { Config, Estado, Fornecedor, Lancamento, Servico } from '../domain/types'

/**
 * Tudo fica no próprio aparelho (IndexedDB). Não existe servidor, conta ou envio de dados.
 * O modo demonstração usa outra "gaveta", então nunca mistura com os dados reais.
 */
export type Modo = 'real' | 'demo'

const db = createStore('folego', 'dados')
const CHAVE: Record<Modo, string> = { real: 'estado-real-v1', demo: 'estado-demo-v1' }
/** Cópia de como os dados estavam antes de um conserto na leitura (nada some de vez). */
const CHAVE_COMO_ESTAVA = `${CHAVE.real}:como-estava`
/** Leitura do IndexedDB que não responde nesse tempo conta como falha (às vezes trava sem dar erro). */
export const PRAZO_LEITURA_MS = 5_000
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
/** A leitura achou defeito pequeno e consertou (anotações separadas, ajustes que voltaram ao padrão). */
export const dadosConsertados = signal<{ separadas: number; ajustes: number } | null>(null)

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

class PrazoEsgotado extends Error {}

/** Promessa com tempo-limite: se o IndexedDB não responder, vira erro em vez de deixar o app preso em "Abrindo…". */
function comPrazo<T>(p: Promise<T>, ms = PRAZO_LEITURA_MS): Promise<T> {
  return new Promise<T>((ok, falha) => {
    const t = setTimeout(() => falha(new PrazoEsgotado()), ms)
    p.then(
      (v) => { clearTimeout(t); ok(v) },
      (err) => { clearTimeout(t); falha(err) },
    )
  })
}

// A demonstração é guardada com um carimbo (dia + versão): de outro dia ou de outra versão, é refeita.
const carimboDemo = () => `${hoje()}|${__APP_VERSION__}|${VERSAO_DEMO}`
let carimboDaDemo = ''
const registro = (m: Modo, e: Estado): unknown => (m === 'demo' ? { carimbo: carimboDaDemo, estado: e } : e)

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
  if (modo.value === 'demo') {
    try {
      temDadosReais.value = Boolean(await comPrazo(get(CHAVE.real, db)))
    } catch {
      /* sem importância */
    }
  }
  carregado.value = true
  pedirPersistencia(false)
}

async function carregarGaveta(m: Modo) {
  leituraFalhou.value = false
  dadosComDefeito.value = null
  dadosConsertados.value = null
  let salvo: unknown
  try {
    salvo = await comPrazo(get(CHAVE[m], db))
  } catch (err) {
    leituraFalhou.value = true
    erroArmazenamento.value = err instanceof PrazoEsgotado
      ? 'A memória do celular demorou demais para abrir. Para não estragar nada, o app não vai salvar até você tentar de novo.'
      : 'Não consegui abrir a memória do celular. Para não estragar nada, o app não vai salvar até você tentar de novo.'
    estado.value = m === 'demo' ? novoDemo() : estadoInicial()
    return
  }
  erroArmazenamento.value = null
  if (m === 'demo') {
    // dados fictícios: se a gaveta é de outro dia, de outra versão ou está com defeito, é só montar de novo
    const g = salvo as { carimbo?: unknown; estado?: unknown } | undefined
    const r = g?.carimbo === carimboDemo() ? conferirEstado(g.estado, true) : null
    if (r?.ok) carimboDaDemo = carimboDemo()
    estado.value = r?.ok ? r.estado : novoDemo()
    return
  }
  temDadosReais.value = salvo !== undefined
  if (salvo === undefined) {
    estado.value = estadoInicial()
    return
  }
  // nos próprios dados, um detalhe com defeito não pode travar tudo: conserta campo a campo
  const r = conferirEstado(salvo, true)
  if (r.ok && r.descartados + r.consertados + r.cortados > 0) {
    try {
      // antes de qualquer gravação por cima, guarda à parte como estava
      await comPrazo(set(CHAVE_COMO_ESTAVA, salvo, db))
    } catch {
      return falhaDeConferencia(salvo)
    }
    if (r.descartados + r.consertados > 0) {
      dadosComDefeito.value = salvo
      dadosConsertados.value = { separadas: r.descartados, ajustes: r.consertados }
    }
  }
  if (!r.ok) return falhaDeConferencia(salvo)
  estado.value = r.estado
}

function falhaDeConferencia(salvo: unknown) {
  leituraFalhou.value = true
  dadosComDefeito.value = salvo
  erroArmazenamento.value = 'Os dados guardados parecem com defeito. Nada foi apagado. Baixe os dados como estão e peça ajuda à equipe.'
  estado.value = estadoInicial()
}

export function tentarDeNovo() {
  location.reload()
}

function novoDemo(): Estado {
  const d = hoje()
  carimboDaDemo = carimboDemo()
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
/** A última gravação deu erro: o que está na tela ainda não está guardado. */
let gravacaoFalhou = false

function gravar(): Promise<boolean> {
  agendado = false
  if (!pendente || leituraFalhou.peek()) return Promise.resolve(true)
  const { m, e } = pendente
  pendente = null
  return set(CHAVE[m], registro(m, e), db).then(
    () => {
      gravacaoFalhou = false
      if (m === 'real') temDadosReais.value = true
      if (!leituraFalhou.peek()) erroArmazenamento.value = null
      return true
    },
    () => {
      gravacaoFalhou = true
      erroArmazenamento.value = 'Não consegui salvar no celular. Faça uma cópia de segurança agora para não perder nada.'
      return false
    },
  )
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

/** Corta os textos nos mesmos limites da conferência: o que se grava sempre volta sem defeito. */
function limitarTextos<T extends Partial<Lancamento>>(l: T): T {
  return {
    ...l,
    ...(typeof l.descricao === 'string' ? { descricao: cortarTexto(l.descricao, LIMITES.descricao) } : {}),
    ...(typeof l.cliente === 'string' ? { cliente: cortarTexto(l.cliente, LIMITES.cliente) } : {}),
  }
}

/** Anota. Devolve null quando não há o que anotar (valor zerado, ou resgate com a reserva vazia). */
export function adicionarLancamento(l: Omit<Lancamento, 'id' | 'criadoEm'>): Lancamento | null {
  // não dá para tirar da reserva mais do que tem (a tela já avisa; aqui é a última proteção)
  const valor = l.tipo === 'resgate' ? Math.min(l.valor, Math.max(0, saldoReserva(estado.value.lancamentos))) : l.valor
  if (!(valor > 0)) return null
  if (armazenamentoPersistente.value !== true && modo.value === 'real') pedirPersistencia(true)
  const novo: Lancamento = limitarTextos({ ...l, valor, id: novoId(), criadoEm: Date.now() })
  mudar((e) => ({ ...e, lancamentos: [...e.lancamentos, novo] }))
  return novo
}

/** Muda uma anotação. Devolve false (e não muda nada) se a reserva ficaria negativa. */
export function atualizarLancamento(id: string, patch: Partial<Lancamento>): boolean {
  const antes = estado.value.lancamentos
  const depois = antes.map((l) => (l.id === id ? limitarTextos({ ...l, ...patch }) : l))
  if (reservaFicaNegativa(antes, depois)) return false
  mudar((e) => ({ ...e, lancamentos: depois }))
  return true
}

/** Apaga. Devolve undefined (e não apaga) se não existe ou se a reserva ficaria negativa. */
export function removerLancamento(id: string): Lancamento | undefined {
  const antes = estado.value.lancamentos
  const l = antes.find((x) => x.id === id)
  if (!l) return undefined
  const depois = antes.filter((x) => x.id !== id)
  if (reservaFicaNegativa(antes, depois)) return undefined
  mudar((e) => ({ ...e, lancamentos: depois }))
  return l
}

export function restaurarLancamento(l: Lancamento): boolean {
  const antes = estado.value.lancamentos
  if (antes.some((x) => x.id === l.id)) return true
  const depois = [...antes, l]
  if (reservaFicaNegativa(antes, depois)) return false
  mudar((e) => ({ ...e, lancamentos: depois }))
  return true
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
  const saindoDaDemo = modo.value === 'demo'
  // com a memória com problema, nada é gravado; só dá para sair da demonstração (ler a gaveta real não estraga nada)
  if (leituraFalhou.value && !saindoDaDemo) return
  // grava antes de trocar só se há algo novo: só abrir a demonstração não cria a gaveta dos dados reais
  if (!leituraFalhou.value && (pendente || gravacaoFalhou)) {
    pendente = null
    try {
      await set(CHAVE[modo.value], registro(modo.value, estado.value), db)
      gravacaoFalhou = false
      if (modo.value === 'real') temDadosReais.value = true
    } catch {
      erroArmazenamento.value = 'Não consegui salvar antes de trocar. Tente de novo.'
      return
    }
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

/** Apaga os dados reais. Bloqueado enquanto a leitura falhou: o app nem sabe o que está guardado. */
export async function apagarTudoReal(): Promise<boolean> {
  if (leituraFalhou.value) return false
  pendente = null
  await del(CHAVE.real, db)
  await del(CHAVE_COMO_ESTAVA, db)
  temDadosReais.value = false
  dadosComDefeito.value = null
  dadosConsertados.value = null
  if (modo.value === 'real') {
    // volta ao começo sem gravar um estado vazio por cima (nada fica guardado)
    ignorarProximo = true
    estado.value = estadoInicial()
  }
  return true
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
