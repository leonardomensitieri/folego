import { diasEntre, mesDe, somarMeses } from './dates'
import { MEI } from './defaults'
import { semAcento } from './texto'
import type { Centavos, Config, Estado, Forma, Lancamento, Servico, Taxas } from './types'

export function taxaDaForma(valor: Centavos, forma: Forma | undefined, taxas: Taxas): Centavos {
  if (forma === 'debito') return Math.round((valor * taxas.debito) / 100)
  if (forma === 'credito') return Math.round((valor * taxas.credito) / 100)
  if (forma === 'pix' && taxas.pix) return Math.round((valor * taxas.pix) / 100)
  return 0
}

/**
 * Ao editar uma entrada: fiado que passou a pago entra no caixa de hoje; pago que continua pago mantém a data
 * em que entrou; virou fiado de novo, perde a data.
 */
export function recebidoEmAoEditar(antes: Pick<Lancamento, 'recebido' | 'recebidoEm'>, agoraFiado: boolean, dataHoje: string): string | undefined {
  if (agoraFiado) return undefined
  if (!antes.recebido) return dataHoje
  return antes.recebidoEm
}

export function liquido(l: Lancamento): Centavos {
  return l.valor - l.taxa
}

export interface ResumoMes {
  mes: string
  /** Recebido de fato no mês (já sem a taxa da maquininha). */
  entrou: Centavos
  /** Gastos do salão. */
  saiu: Centavos
  /** O que foi para a casa. */
  praCasa: Centavos
  /** O que o salão gerou: entrou - saiu. */
  resultado: Centavos
  /** O que ficou no salão depois de pagar a dona: entrou - saiu - praCasa. */
  sobrou: Centavos
  guardado: Centavos
  atendimentos: number
  taxas: Centavos
  /** Fiado criado no mês e ainda não pago. */
  aReceber: Centavos
  porCategoria: { categoria: string; total: Centavos }[]
  porServico: { categoria: string; total: Centavos; quantidade: number }[]
}

/**
 * Regime de caixa: o fiado entra no mês em que foi pago, não no mês do atendimento.
 * Assim "sobrou" mostra dinheiro que existe de verdade.
 */
export function resumoDoMes(lancs: Lancamento[], mes: string): ResumoMes {
  let entrou = 0, saiu = 0, praCasa = 0, guardado = 0, atendimentos = 0, taxas = 0, aReceber = 0
  const cat = new Map<string, number>()
  const serv = new Map<string, { total: number; quantidade: number }>()
  for (const l of lancs) {
    if (l.tipo === 'entrada') {
      if (mesDe(l.data) === mes) atendimentos++
      if (!l.recebido) {
        if (mesDe(l.data) === mes) aReceber += l.valor
        continue
      }
      const mesCaixa = mesDe(l.recebidoEm ?? l.data)
      if (mesCaixa !== mes) continue
      entrou += liquido(l)
      taxas += l.taxa
      const s = serv.get(l.categoria) ?? { total: 0, quantidade: 0 }
      s.total += liquido(l)
      s.quantidade++
      serv.set(l.categoria, s)
      continue
    }
    if (mesDe(l.data) !== mes) continue
    if (l.tipo === 'saida') {
      saiu += l.valor
      cat.set(l.categoria, (cat.get(l.categoria) ?? 0) + l.valor)
    } else if (l.tipo === 'retirada') praCasa += l.valor
    else if (l.tipo === 'reserva') guardado += l.valor
    else if (l.tipo === 'resgate') guardado -= l.valor
  }
  return {
    mes,
    entrou,
    saiu,
    praCasa,
    resultado: entrou - saiu,
    sobrou: entrou - saiu - praCasa,
    guardado,
    atendimentos,
    taxas,
    aReceber,
    porCategoria: [...cat].map(([categoria, total]) => ({ categoria, total })).sort((a, b) => b.total - a.total),
    porServico: [...serv].map(([categoria, v]) => ({ categoria, ...v })).sort((a, b) => b.total - a.total),
  }
}

/** Como o "Sobrou" se divide entre o que foi para a reserva neste mês e o que ficou no caixa. */
export type DivisaoSobrou =
  /** naReserva + noCaixa = sobrou (a tela mostra as duas partes, sem a pessoa precisar fazer conta). */
  | { tipo: 'dividido'; naReserva: Centavos; noCaixa: Centavos }
  /** Guardou mais do que sobrou neste mês (parte veio de dinheiro de antes). */
  | { tipo: 'guardou-mais'; naReserva: Centavos }
  /** O mês ficou negativo, mas ela guardou mesmo assim. */
  | { tipo: 'faltou'; naReserva: Centavos }

/** null quando não guardou nada no mês (ou mais tirou do que pôs na reserva): não há divisão para mostrar. */
export function divisaoDoSobrou(r: Pick<ResumoMes, 'sobrou' | 'guardado'>): DivisaoSobrou | null {
  if (r.guardado <= 0) return null
  if (r.sobrou < 0) return { tipo: 'faltou', naReserva: r.guardado }
  if (r.guardado > r.sobrou) return { tipo: 'guardou-mais', naReserva: r.guardado }
  return { tipo: 'dividido', naReserva: r.guardado, noCaixa: r.sobrou - r.guardado }
}

export function saldoReserva(lancs: Lancamento[]): Centavos {
  let s = 0
  for (const l of lancs) {
    if (l.tipo === 'reserva') s += l.valor
    else if (l.tipo === 'resgate') s -= l.valor
  }
  return s
}

/**
 * Apagar ou mudar uma anotação não pode deixar a reserva negativa (o dinheiro já foi tirado).
 * Se ela já estava negativa (dado antigo), deixa consertar aos poucos.
 */
export function reservaFicaNegativa(antes: Lancamento[], depois: Lancamento[]): boolean {
  const s = saldoReserva(depois)
  return s < 0 && s < saldoReserva(antes)
}

export function fiadosAbertos(lancs: Lancamento[]): Lancamento[] {
  return lancs.filter((l) => l.tipo === 'entrada' && !l.recebido).sort((a, b) => a.data.localeCompare(b.data))
}

/**
 * "recebi o fiado da ines": acha o fiado aberto pelo nome, sem ligar para acento ("Inês").
 * Se o nome lido não bater, procura o nome inteiro de quem deve dentro da frase ("Cliente A" da demonstração).
 */
export function acharFiado(abertos: Lancamento[], frase: string, nomeLido?: string): Lancamento | undefined {
  const norm = (s: string) => semAcento(s).replace(/[^a-z0-9]+/g, ' ').trim()
  if (nomeLido) {
    const alvo = norm(nomeLido)
    const certo = abertos.find((l) => l.cliente && norm(l.cliente) === alvo)
    if (certo) return certo
  }
  const texto = ` ${norm(frase)} `
  return abertos
    .filter((l) => l.cliente && norm(l.cliente).length >= 2 && texto.includes(` ${norm(l.cliente)} `))
    .sort((a, b) => norm(b.cliente!).length - norm(a.cliente!).length)[0]
}

/**
 * Quanto custa manter o salão + a casa por mês, para medir o fôlego.
 * Usa o MAIOR entre a estimativa dos Ajustes e a média dos últimos 3 meses fechados que tiveram gastos
 * (conservador: melhor prometer fôlego a menos do que a mais). Sem histórico, usa a estimativa.
 */
export function custoMensal(estado: Estado, mesAtual: string): Centavos {
  const meses = [1, 2, 3].map((n) => somarMeses(mesAtual, -n))
  const totais = meses
    .map((m) => resumoDoMes(estado.lancamentos, m))
    .filter((r) => r.saiu > 0)
    .map((r) => r.saiu + Math.max(r.praCasa, estado.config.salarioMensal))
  const estimativa = estado.config.gastoMensalEstimado + estado.config.salarioMensal
  if (totais.length === 0) return estimativa
  // conservador: um mês incompleto (começo de uso) não pode inflar o fôlego
  return Math.max(estimativa, Math.round(totais.reduce((a, b) => a + b, 0) / totais.length))
}

/** Fôlego = quantos dias a reserva paga as contas se o salão parar de atender. */
export function diasDeFolego(reserva: Centavos, custoDoMes: Centavos): number {
  if (custoDoMes <= 0 || reserva <= 0) return 0
  return Math.floor((reserva * 30) / custoDoMes)
}

// ---------- preços e margem ----------

export interface Margem {
  liquidoCobrado: Centavos
  margem: Centavos
  margemPct: number
  porHora: Centavos
}

/** Margem de um atendimento: o que sobra depois da taxa média da maquininha e do produto usado. */
export function margemServico(s: Pick<Servico, 'preco' | 'custoProduto' | 'minutos'>, taxaMediaPct: number): Margem {
  const taxa = Math.round((s.preco * taxaMediaPct) / 100)
  const liquidoCobrado = s.preco - taxa
  const margem = liquidoCobrado - s.custoProduto
  const margemPct = s.preco > 0 ? (margem / s.preco) * 100 : 0
  const porHora = s.minutos > 0 ? Math.round(margem / (s.minutos / 60)) : 0
  return { liquidoCobrado, margem, margemPct, porHora }
}

/** Taxa média ponderada pelas formas de pagamento reais (ou 1/3 cartão se não houver histórico). */
export function taxaMediaReal(lancs: Lancamento[], taxas: Taxas): number {
  const entradas = lancs.filter((l) => l.tipo === 'entrada' && l.recebido)
  const bruto = entradas.reduce((a, l) => a + l.valor, 0)
  if (bruto === 0) return (taxas.debito + taxas.credito) / 6
  const taxa = entradas.reduce((a, l) => a + l.taxa, 0)
  return (taxa / bruto) * 100
}

export interface CenarioEseResultado {
  antes: Margem
  depois: Margem
  /** Diferença no mês considerando a quantidade de atendimentos informada. */
  impactoMes: Centavos
  /** Atendimentos a mais por mês para sobrar o mesmo dinheiro. null = impossível (margem zerou). */
  atendimentosParaEmpatar: number | null
  /** Só para mostrar na tela: o preço cobrado e o produto por atendimento depois da mudança. */
  precoDepois: Centavos
  custoProdutoDepois: Centavos
}

export interface CenarioEse {
  servico: Pick<Servico, 'preco' | 'custoProduto' | 'minutos'>
  atendimentosMes: number
  /** % de desconto no preço (ex.: 10 = 10% mais barato). */
  descontoPct?: number
  /** Novo preço cheio (substitui o preço atual). */
  novoPreco?: Centavos
  /** % de aumento no custo do produto (ex.: dólar subiu). */
  aumentoProdutoPct?: number
  taxaMediaPct: number
}

export function simular(c: CenarioEse): CenarioEseResultado {
  const antes = margemServico(c.servico, c.taxaMediaPct)
  let preco = c.novoPreco ?? c.servico.preco
  if (c.descontoPct) preco = Math.round(preco * (1 - c.descontoPct / 100))
  const custoProduto = Math.round(c.servico.custoProduto * (1 + (c.aumentoProdutoPct ?? 0) / 100))
  const depois = margemServico({ preco, custoProduto, minutos: c.servico.minutos }, c.taxaMediaPct)
  const impactoMes = (depois.margem - antes.margem) * c.atendimentosMes
  let atendimentosParaEmpatar: number | null = 0
  if (depois.margem < antes.margem) {
    atendimentosParaEmpatar =
      depois.margem <= 0 ? null : Math.ceil((antes.margem * c.atendimentosMes) / depois.margem - c.atendimentosMes)
  }
  return { antes, depois, impactoMes, atendimentosParaEmpatar, precoDepois: preco, custoProdutoDepois: custoProduto }
}

/**
 * Indicação com desconto: quanto custa dar R$ X para quem indicar, e quanto entra com a cliente nova
 * no primeiro atendimento e se ela voltar.
 */
export function custoIndicacao(beneficio: Centavos, margemNovaCliente: Centavos, visitasNoAno: number) {
  // visitas no ano contando a primeira (no mínimo 1)
  const visitas = Math.max(1, Math.round(visitasNoAno))
  const ganhoPrimeiraVisita = margemNovaCliente - beneficio
  const ganhoNoAno = margemNovaCliente * visitas - beneficio
  return { ganhoPrimeiraVisita, ganhoNoAno, valeAPena: ganhoNoAno > 0 }
}

// ---------- MEI ----------

export function faturamentoAno(lancs: Lancamento[], ano: number): Centavos {
  // Para o MEI vale a receita bruta (valor cobrado, antes da taxa da maquininha).
  return lancs
    .filter((l) => l.tipo === 'entrada' && l.recebido && (l.recebidoEm ?? l.data).startsWith(String(ano)))
    .reduce((a, l) => a + l.valor, 0)
}

export function receitaBrutaMes(lancs: Lancamento[], mes: string): Centavos {
  return lancs
    .filter((l) => l.tipo === 'entrada' && l.recebido && mesDe(l.recebidoEm ?? l.data) === mes)
    .reduce((a, l) => a + l.valor, 0)
}

export type SituacaoDAS = 'pago' | 'a-vencer' | 'vence-logo' | 'atrasado'

/** De qual mês é um gasto "DAS do MEI": o que ela escolheu, ou o mês anterior à data (o normal é pagar no mês seguinte). */
export function competenciaDAS(l: Pick<Lancamento, 'data' | 'competencia'>): string {
  return l.competencia ?? somarMeses(mesDe(l.data), -1)
}

/**
 * O DAS da competência M vence no dia 20 do mês M+1 (ou no próximo dia útil). Conta como pago se foi marcado,
 * ou se ela anotou um gasto "DAS do MEI" daquela competência.
 */
export function situacaoDAS(config: Config, competencia: string, dataHoje: string, lancs: Lancamento[] = []): SituacaoDAS {
  if (config.dasPagos.includes(competencia)) return 'pago'
  if (lancs.some((l) => l.tipo === 'saida' && l.categoria === 'das' && competenciaDAS(l) === competencia)) return 'pago'
  const vencimento = vencimentoDAS(competencia)
  const faltam = diasEntre(dataHoje, vencimento)
  if (faltam < 0) return 'atrasado'
  if (faltam <= 5) return 'vence-logo'
  return 'a-vencer'
}

const DIA_MS = 86_400_000
const iso = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher, calendário gregoriano), em UTC. */
function pascoa(ano: number): Date {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451)
  const n = h + l - 7 * m + 114
  return new Date(Date.UTC(ano, Math.floor(n / 31) - 1, (n % 31) + 1))
}

const feriadosCache = new Map<number, Set<string>>()

/**
 * Dias sem expediente bancário no país: feriados nacionais fixos (20/11 desde 2024, Lei 14.759/2023),
 * Carnaval (segunda e terça), Sexta-feira Santa e Corpus Christi. Feriado municipal fica de fora:
 * no pior caso o aviso chega um dia antes, nunca um "atrasado" falso por causa dos nacionais.
 */
export function feriadosNacionais(ano: number): Set<string> {
  const pronto = feriadosCache.get(ano)
  if (pronto) return pronto
  const fixos = ['01-01', '04-21', '05-01', '09-07', '10-12', '11-02', '11-15', '12-25', ...(ano >= 2024 ? ['11-20'] : [])]
  const p = pascoa(ano).getTime()
  const moveis = [-48, -47, -2, 60].map((n) => iso(new Date(p + n * DIA_MS)))
  const dias = new Set([...fixos.map((d) => `${ano}-${d}`), ...moveis])
  feriadosCache.set(ano, dias)
  return dias
}

/** Dia 20 do mês seguinte; se cair em fim de semana ou feriado, passa para o próximo dia útil. */
export function vencimentoDAS(competencia: string): string {
  const [y, m] = somarMeses(competencia, 1).split('-').map(Number)
  const d = new Date(Date.UTC(y, m - 1, MEI.diaVencimentoDAS))
  while (d.getUTCDay() === 0 || d.getUTCDay() === 6 || feriadosNacionais(d.getUTCFullYear()).has(iso(d))) d.setUTCDate(d.getUTCDate() + 1)
  return iso(d)
}

/** Primeiro mês (AAAA-MM) com alguma anotação; antes disso o app não sabe nada sobre o DAS. */
export function primeiroMesDeUso(lancs: Lancamento[], dataHoje: string): string {
  return lancs.reduce((min, l) => (l.data < min ? l.data : min), dataHoje).slice(0, 7)
}

/** Média do que entrou por dia no mês. */
export function mediaPorDia(r: ResumoMes, diasNoMes: number): Centavos {
  return diasNoMes > 0 ? Math.round(r.entrou / diasNoMes) : 0
}
