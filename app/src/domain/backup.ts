import { competenciaDAS } from './calc'
import { CATEGORIAS_GASTO, CONFIG_PADRAO, SERVICOS_PADRAO } from './defaults'
import { dataValida, hoje, mesValido, nomeMes } from './dates'
import { cortarTexto } from './texto'
import type { Categoria, Config, Estado, Fornecedor, Lancamento, Servico } from './types'

export const FORMATO_BACKUP = 'folego-backup'

export interface ArquivoBackup {
  formato: typeof FORMATO_BACKUP
  versao: 1
  geradoEm: string
  /** true = cópia da demonstração (dados fictícios): nunca entra nos dados reais. */
  demonstracao?: boolean
  estado: Estado
}

export function gerarBackup(estado: Estado, agora: Date = new Date(), demonstracao = false): ArquivoBackup {
  return { formato: FORMATO_BACKUP, versao: 1, geradoEm: agora.toISOString(), ...(demonstracao ? { demonstracao: true } : {}), estado }
}

export type ResultadoImportacao = { ok: true; estado: Estado } | { ok: false; erro: string }

/**
 * Tamanho máximo de cada texto. Os campos da tela e a gravação usam os mesmos limites:
 * o que o app grava sempre passa na conferência quando volta.
 */
export const LIMITES = { id: 80, categoria: 80, descricao: 500, cliente: 60, nome: 60, icone: 16, nomeReserva: 60, diferencial: 200 } as const

const TIPOS = new Set(['entrada', 'saida', 'retirada', 'reserva', 'resgate'])
const FORMAS = new Set(['pix', 'dinheiro', 'debito', 'credito'])
const ehCentavos = (v: unknown, max = 1_000_000_000) => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= max
const ehTexto = (v: unknown, max = 200) => typeof v === 'string' && v.length <= max
const ehPct = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100
const ehData = (v: unknown) => typeof v === 'string' && dataValida(v)
const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Confere o arquivo antes de trocar os dados do aparelho. Nunca confia no conteúdo. */
export function lerBackup(texto: string): ResultadoImportacao {
  let json: unknown
  try {
    json = JSON.parse(texto)
  } catch {
    return { ok: false, erro: 'O arquivo não é uma cópia de segurança do Fôlego.' }
  }
  const b = json as Partial<ArquivoBackup>
  if (!b || b.formato !== FORMATO_BACKUP || !b.estado) return { ok: false, erro: 'O arquivo não é uma cópia de segurança do Fôlego.' }
  if (b.versao !== 1) return { ok: false, erro: 'Esta cópia é de uma versão mais nova do app. Atualize o app e tente de novo.' }
  if (b.demonstracao === true) return { ok: false, erro: 'Este arquivo é da demonstração (dados fictícios) e não pode entrar nos seus dados.' }
  const r = conferirEstado(b.estado, false)
  return r.ok ? { ok: true, estado: r.estado } : r
}

export type ResultadoConferencia =
  | {
      ok: true
      estado: Estado
      /** Anotações, serviços ou fornecedores estragados que ficaram de fora (só no modo tolerante). */
      descartados: number
      /** Ajustes com defeito que voltaram ao padrão (só no modo tolerante). */
      consertados: number
      /** Textos compridos demais que foram cortados. */
      cortados: number
    }
  | { ok: false; erro: string }

/**
 * Confere um estado campo por campo.
 * - Cópia de segurança (tolerante = false): qualquer defeito de estrutura recusa a cópia inteira.
 * - Os próprios dados do aparelho (tolerante = true): separa só o item estragado e volta ao padrão o ajuste
 *   com defeito, para um detalhe não travar o app inteiro. Só a estrutura quebrada (sem lista de anotações) recusa.
 * Nos dois casos, texto comprido demais é cortado, não recusado.
 */
export function conferirEstado(bruto: unknown, tolerante = false): ResultadoConferencia {
  if (!ehObjeto(bruto) || !Array.isArray(bruto.lancamentos)) return { ok: false, erro: 'A cópia está incompleta.' }
  const e = bruto as Partial<Record<keyof Estado, unknown>>
  const defeito = (o: string): ResultadoConferencia => ({ ok: false, erro: `A cópia tem ${o} com defeito e não foi carregada. Seus dados atuais continuam como estavam.` })
  const lista = e.lancamentos as unknown[]
  if (lista.length > 200_000) return defeito('anotações demais')
  let descartados = 0
  let consertados = 0
  let cortados = 0
  const cortar = (v: string, max: number) => {
    if (v.length <= max) return v
    cortados++
    return cortarTexto(v, max)
  }
  const textoOpcional = (v: unknown, max: number): string | undefined | null =>
    v === undefined ? undefined : typeof v === 'string' ? cortar(v, max) : null

  const ids = new Set<string>()
  const lancamentos: Lancamento[] = []
  for (const bruta of lista) {
    const l = (ehObjeto(bruta) ? bruta : {}) as Partial<Record<keyof Lancamento, unknown>>
    const descricao = textoOpcional(l.descricao, LIMITES.descricao)
    const cliente = textoOpcional(l.cliente, LIMITES.cliente)
    const competenciaOk = l.competencia === undefined || (typeof l.competencia === 'string' && mesValido(l.competencia))
    if (
      !ehObjeto(bruta) ||
      !ehTexto(l.id, LIMITES.id) || ids.has(l.id as string) ||
      !ehData(l.data) ||
      !TIPOS.has(l.tipo as string) ||
      !ehCentavos(l.valor) ||
      !(l.taxa === undefined || (ehCentavos(l.taxa) && (l.taxa as number) <= (l.valor as number))) ||
      !(l.forma === undefined || FORMAS.has(l.forma as string)) ||
      !(l.recebido === undefined || typeof l.recebido === 'boolean') ||
      !(l.recebidoEm === undefined || ehData(l.recebidoEm)) ||
      !ehTexto(l.categoria, LIMITES.categoria) ||
      descricao === null || cliente === null ||
      (!competenciaOk && !tolerante)
    ) {
      if (!tolerante) return defeito('uma anotação')
      descartados++
      continue
    }
    if (!competenciaOk) consertados++
    ids.add(l.id as string)
    lancamentos.push({
      id: l.id as string, data: l.data as string, criadoEm: Number.isFinite(l.criadoEm) ? (l.criadoEm as number) : 0,
      tipo: l.tipo as Lancamento['tipo'], valor: l.valor as number, taxa: (l.taxa as number | undefined) ?? 0,
      forma: l.forma as Lancamento['forma'], categoria: l.categoria as string, descricao, cliente,
      recebido: (l.recebido as boolean | undefined) ?? true, recebidoEm: l.recebidoEm as string | undefined,
      ...(competenciaOk && l.competencia !== undefined ? { competencia: l.competencia as string } : {}),
    })
  }

  // listas menores: item estragado ou com id repetido recusa a cópia (ou fica de fora, nos próprios dados)
  function conferirLista<T extends { id: string }>(v: unknown, nome: string, item: (x: Record<string, unknown>) => T | null): T[] | ResultadoConferencia | undefined {
    if (v === undefined) return undefined
    if (!Array.isArray(v)) {
      if (!tolerante) return defeito(nome)
      consertados++
      return undefined
    }
    const vistos = new Set<string>()
    const ok: T[] = []
    for (const x of v) {
      const it = ehObjeto(x) ? item(x) : null
      if (!it || vistos.has(it.id)) {
        if (!tolerante) return defeito(nome)
        descartados++
        continue
      }
      vistos.add(it.id)
      ok.push(it)
    }
    return ok
  }
  const nomeOk = (v: unknown) => (typeof v === 'string' && v.trim() ? cortar(v, LIMITES.nome) : null)

  const servicosLidos = conferirLista<Servico>(e.servicos, 'a lista de serviços', (s) => {
    const nome = nomeOk(s.nome)
    if (!ehTexto(s.id, LIMITES.id) || nome === null || !ehCentavos(s.preco) || !ehCentavos(s.custoProduto) ||
      !(Number.isInteger(s.minutos) && (s.minutos as number) >= 0 && (s.minutos as number) <= 1440) || typeof s.ativo !== 'boolean') return null
    return { id: s.id as string, nome, preco: s.preco as number, custoProduto: s.custoProduto as number, minutos: s.minutos as number, ativo: s.ativo }
  })
  if (servicosLidos && !Array.isArray(servicosLidos)) return servicosLidos
  const servicos: Servico[] = servicosLidos?.length ? servicosLidos : structuredClone(SERVICOS_PADRAO)

  const categoriasLidas = conferirLista<Categoria>(e.categorias, 'a lista de gastos', (c) => {
    const nome = nomeOk(c.nome)
    if (!ehTexto(c.id, LIMITES.id) || nome === null || !ehTexto(c.icone, LIMITES.icone)) return null
    return { id: c.id as string, nome, icone: c.icone as string }
  })
  if (categoriasLidas && !Array.isArray(categoriasLidas)) return categoriasLidas
  const categorias: Categoria[] = categoriasLidas?.length ? categoriasLidas : structuredClone(CATEGORIAS_GASTO)

  const fornecedoresLidos = conferirLista<Fornecedor>(e.fornecedores, 'a lista de fornecedores', (f) => {
    const produto = nomeOk(f.produto)
    const nome = nomeOk(f.nome)
    if (!ehTexto(f.id, LIMITES.id) || produto === null || nome === null || !ehCentavos(f.preco) || !ehData(f.data)) return null
    return { id: f.id as string, produto, nome, preco: f.preco as number, data: f.data as string }
  })
  if (fornecedoresLidos && !Array.isArray(fornecedoresLidos)) return fornecedoresLidos
  const fornecedores: Fornecedor[] = fornecedoresLidos ?? []

  const c = (ehObjeto(e.config) ? e.config : {}) as Partial<Record<keyof Config, unknown>>
  const config: Config = { ...structuredClone(CONFIG_PADRAO), versao: 1 }
  // ajuste com defeito: na cópia recusa; nos próprios dados volta ao padrão
  const ajusteRuim = (o: string): ResultadoConferencia | null => {
    if (!tolerante) return defeito(o)
    consertados++
    return null
  }
  if (typeof c.onboardingFeito === 'boolean') config.onboardingFeito = c.onboardingFeito
  else if (c.onboardingFeito !== undefined && tolerante) config.onboardingFeito = lancamentos.length > 0
  for (const k of ['salarioMensal', 'metaReserva', 'reservaPorAtendimento', 'gastoMensalEstimado', 'valorDAS'] as const) {
    if (c[k] === undefined) continue
    if (ehCentavos(c[k])) config[k] = c[k] as number
    else {
      const r = ajusteRuim('um ajuste')
      if (r) return r
    }
  }
  if (c.taxas !== undefined) {
    const t = (ehObjeto(c.taxas) ? c.taxas : {}) as Partial<Record<keyof Config['taxas'], unknown>>
    if (ehPct(t.debito) && ehPct(t.credito) && (t.pix === undefined || ehPct(t.pix))) {
      config.taxas = { debito: t.debito as number, credito: t.credito as number, pix: (t.pix as number | undefined) ?? 0 }
    } else {
      const r = ajusteRuim('a taxa da maquininha')
      if (r) return r
    }
  }
  if (c.dasPagos !== undefined) {
    const ok = Array.isArray(c.dasPagos) && c.dasPagos.every((x) => typeof x === 'string' && mesValido(x))
    if (ok) config.dasPagos = [...new Set(c.dasPagos as string[])].sort()
    else {
      const r = ajusteRuim('a lista do DAS')
      if (r) return r
      config.dasPagos = Array.isArray(c.dasPagos) ? [...new Set((c.dasPagos as unknown[]).filter((x): x is string => typeof x === 'string' && mesValido(x)))].sort() : []
    }
  }
  if (c.ehMei !== undefined) {
    if (typeof c.ehMei === 'boolean') config.ehMei = c.ehMei
    else {
      const r = ajusteRuim('um ajuste')
      if (r) return r
    }
  }
  if (typeof c.nomeReserva === 'string') config.nomeReserva = cortar(c.nomeReserva, LIMITES.nomeReserva)
  if (typeof c.diferencial === 'string') config.diferencial = cortar(c.diferencial, LIMITES.diferencial)
  if (Array.isArray(c.plano30) && c.plano30.length === 4 && c.plano30.every((x) => typeof x === 'boolean')) config.plano30 = c.plano30 as boolean[]
  if (c.ultimoBackup !== undefined && Number.isFinite(c.ultimoBackup)) config.ultimoBackup = c.ultimoBackup as number

  return { ok: true, estado: { config, servicos, categorias, lancamentos, fornecedores }, descartados, consertados, cortados }
}

export function nomeArquivoBackup(agora: Date = new Date(), demonstracao = false): string {
  return demonstracao ? `folego-DEMONSTRACAO-ficticio-${hoje(agora)}.json` : `folego-copia-${hoje(agora)}.json`
}

/** Planilha simples (abre no Excel/Google Planilhas) com todos os lançamentos. */
export function paraCSV(estado: Estado, demonstracao = false): string {
  const nomes = new Map<string, string>([
    ...estado.servicos.map((s) => [s.id, s.nome] as [string, string]),
    ...estado.categorias.map((c) => [c.id, c.nome] as [string, string]),
    ['outro-servico', 'Outro serviço'],
    ['retirada', 'Pra casa'],
    ['reserva', 'Reserva'],
    ['resgate', 'Resgate da reserva'],
  ])
  const tipo: Record<string, string> = { entrada: 'Entrou', saida: 'Saiu', retirada: 'Pra casa', reserva: 'Guardei na reserva', resgate: 'Tirei da reserva' }
  const forma: Record<string, string> = { pix: 'Pix', dinheiro: 'Dinheiro', debito: 'Débito', credito: 'Crédito' }
  const linhas = [['Data', 'Tipo', 'O quê', 'Valor', 'Taxa da maquininha', 'Ficou para o salão', 'Como pagou', 'Já pago', 'Pago em', 'Anotação']]
  const num = (c: number) => (c / 100).toFixed(2).replace('.', ',')
  for (const l of [...estado.lancamentos].sort((a, b) => a.data.localeCompare(b.data))) {
    linhas.push([
      l.data,
      tipo[l.tipo],
      (nomes.get(l.categoria) ?? l.categoria) + (l.tipo === 'saida' && l.categoria === 'das' ? ` (${nomeMes(competenciaDAS(l))})` : ''),
      num(l.valor),
      num(l.taxa),
      num(l.valor - l.taxa),
      l.forma ? forma[l.forma] : '',
      l.recebido ? 'sim' : 'não (fiado)',
      l.recebidoEm ?? '',
      l.descricao ?? '',
    ])
  }
  // texto que começa com = + - @ vira fórmula no Excel: um apóstrofo na frente impede
  // (os números do app nunca são negativos, então nada legítimo começa com "-")
  const seguro = (c: string) => (/^[=+\-@\t\r]/.test(c) ? `'${c}` : c)
  if (demonstracao) linhas.unshift(['DEMONSTRAÇÃO — DADOS FICTÍCIOS'])
  return linhas
    .map((r) => r.map((c0) => { const c = seguro(c0); return /[;"\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c }).join(';'))
    .join('\n')
}
