import { CATEGORIAS_GASTO, CONFIG_PADRAO, SERVICOS_PADRAO } from './defaults'
import { hoje } from './dates'
import type { Categoria, Config, Estado, Fornecedor, Lancamento, Servico } from './types'

export const FORMATO_BACKUP = 'folego-backup'

export interface ArquivoBackup {
  formato: typeof FORMATO_BACKUP
  versao: 1
  geradoEm: string
  estado: Estado
}

export function gerarBackup(estado: Estado, agora: Date = new Date()): ArquivoBackup {
  return { formato: FORMATO_BACKUP, versao: 1, geradoEm: agora.toISOString(), estado }
}

export type ResultadoImportacao = { ok: true; estado: Estado } | { ok: false; erro: string }

const TIPOS = new Set(['entrada', 'saida', 'retirada', 'reserva', 'resgate'])
const FORMAS = new Set(['pix', 'dinheiro', 'debito', 'credito'])
const DATA = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
const MES = /^\d{4}-(0[1-9]|1[0-2])$/
const ehCentavos = (v: unknown, max = 1_000_000_000) => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= max
const ehTexto = (v: unknown, max = 200) => typeof v === 'string' && v.length <= max
const ehPct = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100

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
  const e = b.estado as Partial<Estado>
  const defeito = (o: string): ResultadoImportacao => ({ ok: false, erro: `A cópia tem ${o} com defeito e não foi carregada. Seus dados atuais continuam como estavam.` })
  if (!Array.isArray(e.lancamentos)) return { ok: false, erro: 'A cópia está incompleta.' }
  if (e.lancamentos.length > 200_000) return defeito('anotações demais')

  const ids = new Set<string>()
  const lancamentos: Lancamento[] = []
  for (const l of e.lancamentos as Partial<Lancamento>[]) {
    if (
      typeof l !== 'object' || l === null ||
      !ehTexto(l.id, 80) || ids.has(l.id!) ||
      typeof l.data !== 'string' || !DATA.test(l.data) ||
      !TIPOS.has(l.tipo as string) ||
      !ehCentavos(l.valor) ||
      !(l.taxa === undefined || (ehCentavos(l.taxa) && l.taxa! <= l.valor!)) ||
      !(l.forma === undefined || FORMAS.has(l.forma)) ||
      !(l.recebido === undefined || typeof l.recebido === 'boolean') ||
      !(l.recebidoEm === undefined || (typeof l.recebidoEm === 'string' && DATA.test(l.recebidoEm))) ||
      !ehTexto(l.categoria, 80) ||
      !(l.descricao === undefined || ehTexto(l.descricao, 500)) ||
      !(l.cliente === undefined || ehTexto(l.cliente, 60))
    ) {
      return defeito('uma anotação')
    }
    ids.add(l.id!)
    lancamentos.push({
      id: l.id!, data: l.data, criadoEm: Number.isFinite(l.criadoEm) ? l.criadoEm! : 0, tipo: l.tipo!, valor: l.valor!,
      taxa: l.taxa ?? 0, forma: l.forma, categoria: l.categoria!, descricao: l.descricao, cliente: l.cliente,
      recebido: l.recebido ?? true, recebidoEm: l.recebidoEm,
    })
  }

  let servicos: Servico[] = structuredClone(SERVICOS_PADRAO)
  if (e.servicos !== undefined) {
    if (!Array.isArray(e.servicos)) return defeito('a lista de serviços')
    for (const s of e.servicos as Partial<Servico>[]) {
      if (typeof s !== 'object' || s === null || !ehTexto(s.id, 80) || !ehTexto(s.nome, 60) || !s.nome!.trim() ||
        !ehCentavos(s.preco) || !ehCentavos(s.custoProduto) || !(Number.isInteger(s.minutos) && s.minutos! >= 0 && s.minutos! <= 1440) ||
        typeof s.ativo !== 'boolean') return defeito('um serviço')
    }
    if (e.servicos.length) servicos = (e.servicos as Servico[]).map((s) => ({ id: s.id, nome: s.nome, preco: s.preco, custoProduto: s.custoProduto, minutos: s.minutos, ativo: s.ativo }))
  }

  let categorias: Categoria[] = structuredClone(CATEGORIAS_GASTO)
  if (e.categorias !== undefined) {
    if (!Array.isArray(e.categorias)) return defeito('a lista de gastos')
    for (const c of e.categorias as Partial<Categoria>[]) {
      if (typeof c !== 'object' || c === null || !ehTexto(c.id, 80) || !ehTexto(c.nome, 60) || !ehTexto(c.icone, 16)) return defeito('um tipo de gasto')
    }
    if (e.categorias.length) categorias = (e.categorias as Categoria[]).map((c) => ({ id: c.id, nome: c.nome, icone: c.icone }))
  }

  const fornecedores: Fornecedor[] = []
  if (e.fornecedores !== undefined) {
    if (!Array.isArray(e.fornecedores)) return defeito('a lista de fornecedores')
    for (const f of e.fornecedores as Partial<Fornecedor>[]) {
      if (typeof f !== 'object' || f === null || !ehTexto(f.id, 80) || !ehTexto(f.produto, 60) || !ehTexto(f.nome, 60) ||
        !ehCentavos(f.preco) || typeof f.data !== 'string' || !DATA.test(f.data)) return defeito('um fornecedor')
      fornecedores.push({ id: f.id!, produto: f.produto!, nome: f.nome!, preco: f.preco!, data: f.data })
    }
  }

  const c = (e.config ?? {}) as Partial<Config>
  const config: Config = { ...structuredClone(CONFIG_PADRAO), versao: 1 }
  if (typeof c.onboardingFeito === 'boolean') config.onboardingFeito = c.onboardingFeito
  for (const k of ['salarioMensal', 'metaReserva', 'reservaPorAtendimento', 'gastoMensalEstimado', 'valorDAS'] as const) {
    if (c[k] !== undefined) {
      if (!ehCentavos(c[k])) return defeito('um ajuste')
      config[k] = c[k] as number
    }
  }
  if (c.taxas !== undefined) {
    const t = c.taxas as Partial<Config['taxas']>
    if (typeof t !== 'object' || t === null || !ehPct(t.debito) || !ehPct(t.credito) || !(t.pix === undefined || ehPct(t.pix))) return defeito('a taxa da maquininha')
    config.taxas = { debito: t.debito!, credito: t.credito!, pix: t.pix ?? 0 }
  }
  if (c.dasPagos !== undefined) {
    if (!Array.isArray(c.dasPagos) || !c.dasPagos.every((x) => typeof x === 'string' && MES.test(x))) return defeito('a lista do DAS')
    config.dasPagos = [...new Set(c.dasPagos)].sort()
  }
  if (c.ehMei !== undefined) {
    if (typeof c.ehMei !== 'boolean') return defeito('um ajuste')
    config.ehMei = c.ehMei
  }
  if (c.nomeReserva !== undefined && ehTexto(c.nomeReserva, 60)) config.nomeReserva = c.nomeReserva
  if (c.diferencial !== undefined && ehTexto(c.diferencial, 200)) config.diferencial = c.diferencial
  if (c.plano30 !== undefined && Array.isArray(c.plano30) && c.plano30.length === 4 && c.plano30.every((x) => typeof x === 'boolean')) config.plano30 = c.plano30
  if (c.ultimoBackup !== undefined && Number.isFinite(c.ultimoBackup)) config.ultimoBackup = c.ultimoBackup

  return { ok: true, estado: { config, servicos, categorias, lancamentos, fornecedores } }
}

export function nomeArquivoBackup(agora: Date = new Date()): string {
  return `folego-copia-${hoje(agora)}.json`
}

/** Planilha simples (abre no Excel/Google Planilhas) com todos os lançamentos. */
export function paraCSV(estado: Estado): string {
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
      nomes.get(l.categoria) ?? l.categoria,
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
  const seguro = (c: string) => (/^[=+\-@\t\r]/.test(c) && !/^-?\d/.test(c) ? `'${c}` : c)
  return linhas
    .map((r) => r.map((c0) => { const c = seguro(c0); return /[;"\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c }).join(';'))
    .join('\n')
}
