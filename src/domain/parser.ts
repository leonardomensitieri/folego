import { hoje } from './dates'
import { parseValor } from './money'
import { semAcento } from './texto'
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
  /** Vários serviços numa frase ("corte 50 e escova 40"): um item por serviço, cada um com a forma dele. */
  itens?: { categoria: string; valor: Centavos; forma?: Forma }[]
  /** Gasto "DAS do MEI" com o mês escrito ("das de outubro"): a competência AAAA-MM. */
  competencia?: string
  /** "recebi o fiado da Ana": é o pagamento de um fiado que já existe, não um atendimento novo. */
  quitarFiado?: boolean
  /** Palavras que ajudaram a decidir (para explicar o que foi entendido). */
  pistas: string[]
}

const SEM_ACENTO = semAcento

const FORMAS: [RegExp, Forma][] = [
  [/\bpix\b/, 'pix'],
  [/\b(dinheiro|especie|cash)\b/, 'dinheiro'],
  [/\b(debito|debto|cartao de debito)\b/, 'debito'],
  [/\b(credito|credto|cartao de credito|cartao|parcelado|\d+ ?x)\b/, 'credito'],
]

function acharForma(t: string): { forma: Forma; palavra: string } | undefined {
  for (const [re, forma] of FORMAS) {
    const m = t.match(re)
    if (m) return { forma, palavra: m[0] }
  }
  return undefined
}

const RESGATE = /\b(tirei|usei|peguei|saquei|resgatei|retirei)\b.*\b(da|do) (reserva|cofrinho|fundo|poupanca)\b|\bresgate\b/
const RESERVA = /\b(guardei|guardar|poupei|separei|coloquei|botei|depositei)\b|\b(na|pra|para a|no) (reserva|cofrinho|fundo|poupanca)\b|^reserva\b/
const RETIRADA = /\b(pra casa|para casa|de casa|pra mim|meu salario|salario|pro ?-? ?labore|tirei|retirei|retirada|pro mercado|pra feira)\b/
// pagamento de um fiado que já existe: "recebi o fiado da Ana", "recebi 50 da Ana que tava devendo", "a Ana acertou o que devia"
const QUITAR = new RegExp([
  '\\b(recebi|pagou|acertou|quitou)\\b.*\\bfiado\\b',
  '\\bfiado\\b.*\\b(pago|pagou|acertou|quitou)\\b',
  '\\b(recebi|pagou|acertou|quitou)\\b.*\\b(devendo|devia|divida|pendurado)\\b',
  '\\b(devendo|devia)\\b.*\\b(pagou|acertou|quitou)\\b',
].join('|'))
const SAIDA = /\b(gastei|paguei|comprei|compra|boleto|despesa|gasto|conserto|consertei|manutencao|devolvi|devolucao|reembolso|reembolsei|estornei|estorno|estornar)\b/
// "conta" e "parcela" sozinhas só são gasto quando a frase não fala de atendimento ("corte 50 pix caiu na conta")
const SAIDA_FRACA = /\b(conta|parcela)\b/
const ENTRADA = /\b(recebi|cobrei|atendi|atendimento|entrou|vendi|fiz|caiu)\b/
// "depois" só é fiado quando fala de pagar ("paga depois"); "corte 50 pix, depois escova 40" não é
const FIADO = /\b(fiado|vai pagar|(paga|pago|pagar|pagou|acerta|acertar) depois|depois (paga|pago|pagar|acerta|acerto)|(deixa|deixou|fica|ficou) (pra|para) depois|paga (semana|mes|dia|amanha)|semana que vem|mes que vem|amanha|ficou devendo|deve|devendo|pendurado|pendura)\b/

const MESES = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

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
  // palavras curtas que não são nome
  'eu', 'ja', 'so', 'la', 'ai', 'me', 'te', 'se', 'ou', 'ao', 'tb', 'pq', 'vc', 'ok', 'nao', 'sim', 'mas', 'mais',
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

interface ServicoAchado {
  s: Servico
  pos: number
  fim: number
}

const escapar = (n: string) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function acharServicos(t: string, servicos: Servico[]): ServicoAchado[] {
  const achados: ServicoAchado[] = []
  for (const s of servicos.filter((x) => x.ativo)) {
    const nomes = [SEM_ACENTO(s.nome).trim(), ...(SINONIMOS[s.id] ?? [])].filter(Boolean)
    let melhor: { pos: number; fim: number } | null = null
    for (const n of nomes) {
      // aceita plural simples ("escovas")
      const m = new RegExp(`\\b${escapar(n)}s?\\b`).exec(t)
      if (!m) continue
      const fim = m.index + m[0].length
      if (!melhor || m.index < melhor.pos || (m.index === melhor.pos && fim > melhor.fim)) melhor = { pos: m.index, fim }
    }
    if (melhor) achados.push({ s, ...melhor })
  }
  // "escova progressiva" é alisamento: o serviço cujo nome está dentro do nome de outro não conta de novo
  const dentro = (a: ServicoAchado, b: ServicoAchado) => b !== a && b.pos <= a.pos && a.fim <= b.fim && b.fim - b.pos > a.fim - a.pos
  return achados.filter((a) => !achados.some((b) => dentro(a, b))).sort((a, b) => a.pos - b.pos)
}

export function interpretar(texto: string, servicos: Servico[], categorias: Categoria[], dataHoje: string = hoje()): Interpretacao {
  const t = SEM_ACENTO(texto).replace(/r\$\s*/g, ' ').replace(/[-–]/g, ' ').replace(/\s+/g, ' ').trim()
  const pistas: string[] = []

  const numeros = numerosDeDinheiro(t)
  let valor = numeros[0]?.valor ?? null

  const achouForma = acharForma(t)
  const forma = achouForma?.forma
  if (achouForma) pistas.push(achouForma.palavra)

  const servicosNaFrase = acharServicos(t, servicos)
  const quitar = QUITAR.test(t)
  const fiado = quitar ? null : t.match(FIADO)
  const recebiDeCliente = /\b(recebi|cobrei|atendi)\b/.test(t)
  let tipo: Tipo
  if (RESGATE.test(t)) tipo = 'resgate'
  else if (RESERVA.test(t)) tipo = 'reserva'
  else if (quitar) tipo = 'entrada'
  else if (RETIRADA.test(t)) tipo = 'retirada'
  else if (SAIDA.test(t) && !(ENTRADA.test(t) && recebiDeCliente)) tipo = 'saida'
  else if (SAIDA_FRACA.test(t) && servicosNaFrase.length === 0 && !ENTRADA.test(t)) tipo = 'saida'
  else tipo = 'entrada'

  const achados = tipo === 'entrada' && !quitar ? servicosNaFrase : []
  if (tipo === 'entrada' && achados.length === 0 && !ENTRADA.test(t) && !fiado && !quitar) {
    // sem serviço e sem verbo de entrada: pode ser um gasto descrito pelo nome ("shampoo 45")
    if (PALAVRAS_GASTO.some(([re]) => re.test(t))) tipo = 'saida'
  }

  const diasAtras = /\banteontem\b/.test(t) ? 2 : /\bontem\b/.test(t) ? 1 : 0
  const data = diasAtras ? voltarDias(dataHoje, diasAtras) : dataHoje
  const recebido = !(tipo === 'entrada' && fiado)
  const formaFinal = tipo === 'entrada' && recebido ? forma ?? 'pix' : undefined

  let categoria = 'outros'
  let cliente: string | undefined
  let itens: Interpretacao['itens']
  let competencia: string | undefined
  if (tipo === 'entrada') {
    const servico = achados[0]?.s
    categoria = quitar ? 'outro-servico' : servico?.id ?? 'outro-servico'
    if (servico) pistas.push(servico.nome.toLowerCase())
    if (fiado) pistas.push(fiado[0])
    // "corte 50 e escova 40": cada serviço com o primeiro número depois dele que ainda não foi usado
    // (pela posição, não pelo valor: "corte 40 e escova 40" são dois de 40) e com a forma escrita no trecho dele
    if (achados.length >= 2 && numeros.length >= 2) {
      const usados = new Set<number>()
      const pares = achados.map((a, i) => {
        const k = numeros.findIndex((n, j) => n.inicio > a.pos && !usados.has(j))
        if (k >= 0) usados.add(k)
        const trecho = t.slice(a.pos, achados[i + 1]?.pos ?? t.length)
        return { categoria: a.s.id, valor: k >= 0 ? numeros[k].valor : null, forma: recebido ? acharForma(trecho)?.forma ?? formaFinal : undefined }
      })
      if (pares.every((p) => p.valor !== null)) {
        itens = pares as NonNullable<Interpretacao['itens']>
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
    if (categoria === 'das') {
      // "das de outubro": o mês mais recente com esse nome, sem passar do mês da anotação
      const m = t.match(new RegExp(`\\b(${MESES.join('|')})\\b`))
      if (m) {
        const n = MESES.indexOf(m[1]) + 1
        const ano = Number(data.slice(0, 4)) - (n > Number(data.slice(5, 7)) ? 1 : 0)
        competencia = `${ano}-${String(n).padStart(2, '0')}`
      }
    }
  } else {
    categoria = tipo
  }

  return {
    tipo,
    valor,
    forma: formaFinal,
    categoria,
    recebido,
    cliente,
    descricao: texto.trim(),
    data,
    itens,
    competencia,
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
    'escovas', 'cortes', 'devia', 'tava', 'estava', 'caiu', 'conta', 'pago', 'paguei',
  ])
  let candidata: string | undefined
  for (let i = 0; i < palavras.length; i++) {
    const p = palavras[i]
    const ps = SEM_ACENTO(p)
    // nome de 2 letras ("Lu") só quando parece nome: com maiúscula ou depois de "da"/"do"
    if (ignorar.has(ps) || ps.length < 2) continue
    const anterior = i > 0 ? SEM_ACENTO(palavras[i - 1]) : ''
    if (/^\p{Lu}/u.test(p) && i > 0) return capitalizar(p)
    if (anterior === 'da' || anterior === 'do' || anterior === 'cliente') return capitalizar(p)
    if (ps.length >= 3) candidata ??= p
  }
  return ehFiado && candidata ? capitalizar(candidata) : undefined
}

function capitalizar(p: string) {
  return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
}
