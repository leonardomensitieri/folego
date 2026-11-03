import { diasEntre, mesDe, somarMeses } from './dates'
import { MEI } from './defaults'
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

export function saldoReserva(lancs: Lancamento[]): Centavos {
  let s = 0
  for (const l of lancs) {
    if (l.tipo === 'reserva') s += l.valor
    else if (l.tipo === 'resgate') s -= l.valor
  }
  return s
}

export function fiadosAbertos(lancs: Lancamento[]): Lancamento[] {
  return lancs.filter((l) => l.tipo === 'entrada' && !l.recebido).sort((a, b) => a.data.localeCompare(b.data))
}

/**
 * Quanto custa manter o salão + a casa por mês, para medir o fôlego.
 * Usa a média dos últimos 3 meses fechados que tiveram gastos; sem histórico, usa a estimativa da configuração.
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
  return { antes, depois, impactoMes, atendimentosParaEmpatar }
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

/**
 * O DAS da competência M vence no dia 20 do mês M+1. Conta como pago se foi marcado, ou se ela anotou
 * um gasto "DAS do MEI" no mês do vencimento.
 */
export function situacaoDAS(config: Config, competencia: string, dataHoje: string, lancs: Lancamento[] = []): SituacaoDAS {
  if (config.dasPagos.includes(competencia)) return 'pago'
  const mesVenc = somarMeses(competencia, 1)
  if (lancs.some((l) => l.tipo === 'saida' && l.categoria === 'das' && mesDe(l.data) === mesVenc)) return 'pago'
  const vencimento = vencimentoDAS(competencia)
  const faltam = diasEntre(dataHoje, vencimento)
  if (faltam < 0) return 'atrasado'
  if (faltam <= 5) return 'vence-logo'
  return 'a-vencer'
}

/** Dia 20 do mês seguinte; se cair em sábado ou domingo, passa para a segunda-feira (dia útil seguinte). */
export function vencimentoDAS(competencia: string): string {
  const mes = somarMeses(competencia, 1)
  const [y, m] = mes.split('-').map(Number)
  const d = new Date(y, m - 1, MEI.diaVencimentoDAS)
  const semana = d.getDay()
  if (semana === 6) d.setDate(d.getDate() + 2)
  if (semana === 0) d.setDate(d.getDate() + 1)
  return `${mes}-${String(d.getDate()).padStart(2, '0')}`
}

/** Primeiro mês (AAAA-MM) com alguma anotação; antes disso o app não sabe nada sobre o DAS. */
export function primeiroMesDeUso(lancs: Lancamento[], dataHoje: string): string {
  return lancs.reduce((min, l) => (l.data < min ? l.data : min), dataHoje).slice(0, 7)
}

/** Média do que entrou por dia no mês. */
export function mediaPorDia(r: ResumoMes, diasNoMes: number): Centavos {
  return diasNoMes > 0 ? Math.round(r.entrou / diasNoMes) : 0
}
