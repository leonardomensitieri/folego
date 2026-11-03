import { CATEGORIAS_GASTO, CONFIG_PADRAO, SERVICOS_PADRAO } from './defaults'
import type { Estado } from './types'

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

/** Confere o arquivo antes de trocar os dados do aparelho. Nunca confia no conteúdo. */
export function lerBackup(texto: string): ResultadoImportacao {
  let json: unknown
  try {
    json = JSON.parse(texto)
  } catch {
    return { ok: false, erro: 'O arquivo não é um backup do Fôlego.' }
  }
  const b = json as Partial<ArquivoBackup>
  if (!b || b.formato !== FORMATO_BACKUP || !b.estado) return { ok: false, erro: 'O arquivo não é um backup do Fôlego.' }
  if (b.versao !== 1) return { ok: false, erro: 'Este backup é de uma versão mais nova do app. Atualize o app e tente de novo.' }
  const e = b.estado as Partial<Estado>
  if (!Array.isArray(e.lancamentos)) return { ok: false, erro: 'O backup está incompleto.' }
  for (const l of e.lancamentos) {
    if (
      typeof l !== 'object' || l === null ||
      typeof l.id !== 'string' ||
      typeof l.data !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(l.data) ||
      !TIPOS.has(l.tipo) ||
      !Number.isInteger(l.valor) || l.valor < 0 ||
      !Number.isInteger(l.taxa ?? 0)
    ) {
      return { ok: false, erro: 'O backup tem um lançamento com defeito e não foi carregado.' }
    }
  }
  const estado: Estado = {
    config: { ...CONFIG_PADRAO, ...(e.config ?? {}), versao: 1 },
    servicos: Array.isArray(e.servicos) && e.servicos.length ? e.servicos : structuredClone(SERVICOS_PADRAO),
    categorias: Array.isArray(e.categorias) && e.categorias.length ? e.categorias : structuredClone(CATEGORIAS_GASTO),
    lancamentos: e.lancamentos.map((l) => ({ ...l, taxa: l.taxa ?? 0, recebido: l.recebido ?? true })),
    fornecedores: Array.isArray(e.fornecedores) ? e.fornecedores : [],
  }
  return { ok: true, estado }
}

export function nomeArquivoBackup(agora: Date = new Date()): string {
  const d = agora.toISOString().slice(0, 10)
  return `folego-backup-${d}.json`
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
  const tipo: Record<string, string> = { entrada: 'Entrada', saida: 'Saída', retirada: 'Pra casa', reserva: 'Reserva', resgate: 'Resgate' }
  const linhas = [['Data', 'Tipo', 'Categoria', 'Valor', 'Taxa', 'Líquido', 'Forma', 'Pago', 'Pago em', 'Descrição']]
  const num = (c: number) => (c / 100).toFixed(2).replace('.', ',')
  for (const l of [...estado.lancamentos].sort((a, b) => a.data.localeCompare(b.data))) {
    linhas.push([
      l.data,
      tipo[l.tipo],
      nomes.get(l.categoria) ?? l.categoria,
      num(l.valor),
      num(l.taxa),
      num(l.valor - l.taxa),
      l.forma ?? '',
      l.recebido ? 'sim' : 'não',
      l.recebidoEm ?? '',
      l.descricao ?? '',
    ])
  }
  return linhas.map((r) => r.map((c) => (/[;"\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(';')).join('\n')
}
