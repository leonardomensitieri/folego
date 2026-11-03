import { hoje } from './dates'
import { parseValor } from './money'
import type { Categoria, Centavos, Forma, Servico, Tipo } from './types'

/**
 * "Escreva do seu jeito": entende frases curtas como
 *   "corte 50 pix" · "alisamento 180 crédito maria fiado" · "gastei 45 de shampoo" · "corte 50 e escova 40 no pix"
 *   "conta de luz 120" · "tirei 300 pra casa" · "guardei 20" · "usei 150 da reserva" · "recebi o fiado da Ana 180"
 * Roda 100% no aparelho (nada é enviado para fora). Sempre mostra o que entendeu antes de salvar.
 */
export interface Interpretacao {
  tipo: Tipo
  valor: Centavos | null
  forma?: Forma
  categoria: string
  recebido: boolean
  cliente?: string
  descricao?: string
  /** Dia do lançamento (AAAA-MM-DD): hoje, ou ontem/anteontem se a frase disser. */
  data: string
  /** Vários serviços numa frase ("corte 50 e escova 40"): um item por serviço. */
  itens?: { categoria: string; valor: Centavos }[]
  /** "recebi o fiado da Ana": é o pagamento de um fiado que já existe, não um atendimento novo. */
  quitarFiado?: boolean
  /** Palavras que ajudaram a decidir (para explicar o que foi entendido). */
  pistas: string[]
}

const SEM_ACENTO = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const FORMAS: [RegExp, Forma][] = [
  [/\bpix\b/, 'pix'],
  [/\b(dinheiro|especie|cash)\b/, 'dinheiro'],
  [/\b(debito|cartao de debito)\b/, 'debito'],
  [/\b(credito|cartao de credito|cartao|parcelado|\d+ ?x)\b/, 'credito'],
]

const RESGATE = /\b(tirei|usei|peguei|saquei|resgatei|retirei)\b.*\b(da|do) (reserva|cofrinho|fundo|poupanca)\b|\bresgate\b/
const RESERVA = /\b(guardei|guardar|poupei|separei|coloquei|botei|depositei)\b|\b(na|pra|para a|no) (reserva|cofrinho|fundo|poupanca)\b|^reserva\b/
const RETIRADA = /\b(pra casa|para casa|pra mim|meu salario|salario|pro ?-? ?labore|tirei|retirei|retirada|pro mercado|pra feira)\b/
const QUITAR = /\b(recebi|pagou|acertou|quitou)\b.*\bfiado\b|\bfiado\b.*\b(pago|pagou|acertou|quitou)\b/
const SAIDA = /\b(gastei|paguei|comprei|compra|conta|boleto|despesa|gasto|conserto|consertei|manutencao|parcela|devolvi|devolucao|reembolso|reembolsei)\b/
const ENTRADA = /\b(recebi|cobrei|atendi|atendimento|entrou|vendi|fiz)\b/
const FIADO = /\b(fiado|depois|vai pagar|paga (semana|mes|dia|amanha)|semana que vem|mes que vem|amanha|ficou devendo|deve|devendo|pendurado|pendura)\b/

const PALAVRAS_GASTO: [RegExp, string][] = [
  [/\b(shampoos?|condicionador(es)?|mascaras?|descolorantes?|tintas?|produtos?|insumos?|oxidantes?|cremes?|esmaltes?|quimica|ampolas?|acetona)\b/, 'produtos'],
  [/\b(luz|agua|internet|telefone|celular|energia|gas|light|conta)\b/, 'contas'],
  [/\b(limpeza|desinfetante|alcool|papel|toalhas?|lencol|lencois|detergente|sabao)\b/, 'limpeza'],
  [/\b(secador|chapinha|babyliss|maquina|cadeira|equipamento|conserto|tesouras?|lavatorio|manutencao|escova rotativa)\b/, 'equipamento'],
  [/\b(aluguel)\b/, 'aluguel'],
  [/\b(das|mei|imposto)\b/, 'das'],
  [/\b(emprestimo|parcela|divida|juros)\b/, 'divida'],
  [/\b(instagram|anuncio|divulgacao|panfletos?|cartao de visita)\b/, 'divulgacao'],
]

// Nomes que a profissional usa para um serviço da lista padrão.
const SINONIMOS: Record<string, string[]> = {
  alisamento: ['progressiva', 'selagem', 'escova progressiva', 'botox capilar'],
  coloracao: ['tintura', 'pintar', 'retoque de raiz', 'luzes', 'mechas', 'luzes'],
  sobrancelha: ['design de sobrancelha', 'henna'],
}

const STOP = new Set([
  'de', 'do', 'da', 'no', 'na', 'em', 'e', 'com', 'pra', 'para', 'por', 'o', 'a', 'os', 'as', 'um', 'uma', 'reais', 'real', 'rs',
  'hoje', 'ontem', 'anteontem', 'cliente', 'cartao', 'fiz', 'foi', 'r', 'ficou', 'semana', 'que', 'vem', 'mes', 'amanha', 'paga', 'masculino', 'feminino',
])

interface NumeroAchado {
  valor: Centavos
  inicio: number
  fim: number
}

/** Números da frase que são dinheiro (ignora "2x", "2 escovas", "dia 15"). */
function numerosDeDinheiro(t: string): NumeroAchado[] {
  const todos: NumeroAchado[] = []
  for (const m of t.matchAll(/\d+(?:[.,]\d+)*/g)) {
    const v = parseValor(m[0])
    if (v === null) continue
    const inicio = m.index ?? 0
    const fim = inicio + m[0].length
    const depois = t.slice(fim, fim + 12)
    const antes = t.slice(Math.max(0, inicio - 5), inicio)
    if (/^ ?x\b/.test(depois)) continue // parcelado em 2x
    if (/\bdia $/.test(antes)) continue // "dia 15"
    todos.push({ valor: v, inicio, fim })
  }
  // quantidade pequena colada numa palavra ("2 escovas", "3 tintas") quando há outro número na frase
  if (todos.length > 1) {
    return todos.filter((n) => !(n.valor < 1000 && Number.isInteger(n.valor / 100) && /^ [a-z]{3,}s\b/.test(t.slice(n.fim, n.fim + 16))))
  }
  return todos
}

function acharServicos(t: string, servicos: Servico[]): { s: Servico; pos: number }[] {
  const achados: { s: Servico; pos: number }[] = []
  for (const s of servicos.filter((x) => x.ativo)) {
    const nomes = [SEM_ACENTO(s.nome), ...(SINONIMOS[s.id] ?? [])]
    let melhor = -1
    for (const n of nomes) {
      // aceita plural simples ("escovas")
      const m = new RegExp(`\\b${n}s?\\b`).exec(t)
      if (m && (melhor < 0 || m.index < melhor)) melhor = m.index
    }
    if (melhor >= 0) achados.push({ s, pos: melhor })
  }
  return achados.sort((a, b) => a.pos - b.pos)
}

export function interpretar(texto: string, servicos: Servico[], categorias: Categoria[], dataHoje: string = hoje()): Interpretacao {
  const t = SEM_ACENTO(texto).replace(/r\$\s*/g, ' ').replace(/[-–]/g, ' ').replace(/\s+/g, ' ').trim()
  const pistas: string[] = []

  const numeros = numerosDeDinheiro(t)
  let valor = numeros[0]?.valor ?? null

  let forma: Forma | undefined
  for (const [re, f] of FORMAS) {
    const achou = t.match(re)
    if (achou) {
      forma = f
      pistas.push(achou[0])
      break
    }
  }

  const quitar = QUITAR.test(t)
  const fiado = quitar ? null : t.match(FIADO)
  let tipo: Tipo
  if (RESGATE.test(t)) tipo = 'resgate'
  else if (RESERVA.test(t)) tipo = 'reserva'
  else if (quitar) tipo = 'entrada'
  else if (RETIRADA.test(t)) tipo = 'retirada'
  else if (SAIDA.test(t) && !(ENTRADA.test(t) && /\b(recebi|cobrei|atendi)\b/.test(t))) tipo = 'saida'
  else tipo = 'entrada'

  const achados = tipo === 'entrada' && !quitar ? acharServicos(t, servicos) : []
  if (tipo === 'entrada' && achados.length === 0 && !ENTRADA.test(t) && !fiado && !quitar) {
    // sem serviço e sem verbo de entrada: pode ser um gasto descrito pelo nome ("shampoo 45")
    if (PALAVRAS_GASTO.some(([re]) => re.test(t))) tipo = 'saida'
  }

  let categoria = 'outros'
  let cliente: string | undefined
  let itens: Interpretacao['itens']
  if (tipo === 'entrada') {
    const servico = achados[0]?.s
    categoria = quitar ? 'outro-servico' : servico?.id ?? 'outro-servico'
    if (servico) pistas.push(servico.nome.toLowerCase())
    if (fiado) pistas.push(fiado[0])
    // "corte 50 e escova 40": cada serviço com o número que vem logo depois dele
    if (achados.length >= 2 && numeros.length >= 2) {
      const pares = achados.map((a) => ({ categoria: a.s.id, valor: numeros.find((n) => n.inicio > a.pos)?.valor ?? null }))
      const usados = new Set<number>()
      const ok = pares.every((p) => p.valor !== null && !usados.has(p.valor) && (usados.add(p.valor), true))
      if (ok) {
        itens = pares as { categoria: string; valor: Centavos }[]
        valor = itens.reduce((a, i) => a + i.valor, 0)
      }
    }
    cliente = acharNome(texto, achados.map((a) => a.s.nome), Boolean(fiado) || quitar)
  } else if (tipo === 'saida') {
    const gasto = PALAVRAS_GASTO.find(([re]) => re.test(t))
    if (gasto) {
      categoria = gasto[1]
      pistas.push(t.match(gasto[0])![0])
    }
    if (!categorias.some((c) => c.id === categoria)) categoria = 'outros'
  } else {
    categoria = tipo
  }

  const diasAtras = /\banteontem\b/.test(t) ? 2 : /\bontem\b/.test(t) ? 1 : 0
  const recebido = !(tipo === 'entrada' && fiado)
  return {
    tipo,
    valor,
    forma: tipo === 'entrada' && recebido ? forma ?? 'pix' : undefined,
    categoria,
    recebido,
    cliente,
    descricao: texto.trim(),
    data: diasAtras ? voltarDias(dataHoje, diasAtras) : dataHoje,
    itens,
    quitarFiado: quitar || undefined,
    pistas,
  }
}

function voltarDias(data: string, n: number): string {
  const [y, m, d] = data.split('-').map(Number)
  return hoje(new Date(y, m - 1, d - n))
}

/**
 * Um nome no texto original: palavra com inicial maiúscula (fora do começo da frase), a palavra depois de
 * "da"/"do"/"cliente", ou — quando é fiado — a primeira palavra que não seja serviço, valor ou palavra-chave.
 */
function acharNome(original: string, nomesServico: string[], ehFiado: boolean): string | undefined {
  const palavras = original.replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter(Boolean)
  const ignorar = new Set([
    ...STOP,
    ...nomesServico.flatMap((n) => SEM_ACENTO(n).split(' ')),
    ...Object.values(SINONIMOS).flat().flatMap((n) => n.split(' ')),
    'pix', 'dinheiro', 'especie', 'debito', 'credito', 'parcelado', 'fiado', 'depois', 'vai', 'pagar', 'deve', 'devendo',
    'pendurado', 'pendura', 'recebi', 'cobrei', 'atendi', 'atendimento', 'vendi', 'entrou', 'pagou', 'acertou', 'quitou',
    'escovas', 'cortes',
  ])
  let candidata: string | undefined
  for (let i = 0; i < palavras.length; i++) {
    const p = palavras[i]
    const ps = SEM_ACENTO(p)
    if (ignorar.has(ps) || ps.length < 3) continue
    const anterior = i > 0 ? SEM_ACENTO(palavras[i - 1]) : ''
    if (/^\p{Lu}/u.test(p) && i > 0) return capitalizar(p)
    if (anterior === 'da' || anterior === 'do' || anterior === 'cliente') return capitalizar(p)
    candidata ??= p
  }
  return ehFiado && candidata ? capitalizar(candidata) : undefined
}

function capitalizar(p: string) {
  return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
}
