import { parseValor } from './money'
import type { Categoria, Centavos, Forma, Servico, Tipo } from './types'

/**
 * "Escreva do seu jeito": entende frases curtas como
 *   "corte 50 pix" · "alisamento 180 crédito maria fiado" · "gastei 45 de shampoo"
 *   "conta de luz 120" · "tirei 300 pra casa" · "guardei 20"
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
  /** Palavras que ajudaram a decidir (para explicar o que foi entendido). */
  pistas: string[]
}

const SEM_ACENTO = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const FORMAS: [RegExp, Forma][] = [
  [/\bpix\b/, 'pix'],
  [/\b(dinheiro|especie|cash)\b/, 'dinheiro'],
  [/\b(debito|cartao de debito)\b/, 'debito'],
  [/\b(credito|cartao de credito|cartao|parcelado)\b/, 'credito'],
]

const RETIRADA = /\b(pra casa|para casa|pra mim|meu salario|tirei|retirei|retirada|pro labore|prolabore)\b/
const RESERVA = /\b(guardei|guardar|reserva|fundo|poupei|separei)\b/
const RESGATE = /\b(resgatei|tirei da reserva|usei da reserva|peguei da reserva|saquei da reserva)\b/
const SAIDA = /\b(gastei|paguei|comprei|compra|conta|boleto|despesa|gasto|conserto|consertei|parcela)\b/
const ENTRADA = /\b(recebi|cobrei|atendi|atendimento|entrou|vendi)\b/
const FIADO = /\b(fiado|depois|vai pagar|pagar depois|deve|devendo|pendurado|pendura)\b/

const PALAVRAS_GASTO: [RegExp, string][] = [
  [/\b(shampoo|mascara|descolorante|tinta|progressiva|produto|produtos|insumo|insumos|oxidante|creme|esmalte|quimica)\b/, 'produtos'],
  [/\b(luz|agua|internet|telefone|celular|energia|gas|light|conta)\b/, 'contas'],
  [/\b(limpeza|desinfetante|alcool|papel|toalha|lencol)\b/, 'limpeza'],
  [/\b(secador|chapinha|babyliss|maquina|cadeira|equipamento|conserto|tesoura|lavatorio)\b/, 'equipamento'],
  [/\b(aluguel)\b/, 'aluguel'],
  [/\b(das|mei|imposto)\b/, 'das'],
  [/\b(emprestimo|parcela|divida|juros)\b/, 'divida'],
  [/\b(instagram|anuncio|divulgacao|panfleto|cartao de visita)\b/, 'divulgacao'],
]

const STOP = new Set([
  'de', 'do', 'da', 'no', 'na', 'em', 'e', 'com', 'pra', 'para', 'por', 'o', 'a', 'os', 'as', 'um', 'uma', 'reais', 'real', 'rs',
  'hoje', 'ontem', 'cliente', 'cartao', 'fiz', 'foi', 'r',
])

export function interpretar(texto: string, servicos: Servico[], categorias: Categoria[]): Interpretacao {
  const t = SEM_ACENTO(texto).replace(/r\$\s*/g, ' ').replace(/\s+/g, ' ').trim()
  const pistas: string[] = []

  // valor: primeiro número que aparecer
  const m = t.match(/\d+(?:[.,]\d+)*/)
  const valor = m ? parseValor(m[0]) : null

  let forma: Forma | undefined
  for (const [re, f] of FORMAS) {
    const achou = t.match(re)
    if (achou) {
      forma = f
      pistas.push(achou[0])
      break
    }
  }

  const fiado = t.match(FIADO)
  let tipo: Tipo
  if (RESGATE.test(t)) tipo = 'resgate'
  else if (RETIRADA.test(t)) tipo = 'retirada'
  else if (RESERVA.test(t)) tipo = 'reserva'
  else if (SAIDA.test(t) && !ENTRADA.test(t)) tipo = 'saida'
  else tipo = 'entrada'

  const servico = servicos.find((s) => s.ativo && t.includes(SEM_ACENTO(s.nome)))
  if (tipo === 'entrada' && !servico && !ENTRADA.test(t) && !fiado) {
    // sem serviço e sem verbo de entrada: pode ser um gasto descrito pelo nome ("shampoo 45")
    const gasto = PALAVRAS_GASTO.find(([re]) => re.test(t))
    if (gasto) tipo = 'saida'
  }

  let categoria = 'outros'
  let cliente: string | undefined
  if (tipo === 'entrada') {
    categoria = servico?.id ?? 'outro-servico'
    if (servico) pistas.push(servico.nome.toLowerCase())
    if (fiado) pistas.push(fiado[0])
    cliente = acharNome(texto, servico?.nome, Boolean(fiado))
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

  const recebido = !(tipo === 'entrada' && fiado)
  return {
    tipo,
    valor,
    forma: tipo === 'entrada' && recebido ? forma ?? 'pix' : forma,
    categoria,
    recebido,
    cliente,
    descricao: texto.trim(),
    pistas,
  }
}

/**
 * Um nome no texto original: palavra com inicial maiúscula (fora do começo da frase), a palavra depois de
 * "da"/"do"/"cliente", ou — quando é fiado — a primeira palavra que não seja serviço, valor ou palavra-chave.
 */
function acharNome(original: string, nomeServico: string | undefined, ehFiado: boolean): string | undefined {
  const palavras = original.replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter(Boolean)
  const ignorar = new Set([
    ...STOP,
    ...(nomeServico ? SEM_ACENTO(nomeServico).split(' ') : []),
    'pix', 'dinheiro', 'especie', 'debito', 'credito', 'parcelado', 'fiado', 'depois', 'vai', 'pagar', 'deve', 'devendo',
    'pendurado', 'pendura', 'recebi', 'cobrei', 'atendi', 'atendimento', 'vendi', 'entrou',
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
