import { describe, expect, it } from 'vitest'
import { brl, brlCurto, parseValor } from './money'
import { dataValida, diasEntre, hoje, mesValido, somarMeses } from './dates'
import {
  acharFiado, competenciaDAS, custoIndicacao, custoMensal, diasDeFolego, faturamentoAno, feriadosNacionais, fiadosAbertos, margemServico,
  primeiroMesDeUso, receitaBrutaMes, reservaFicaNegativa, resumoDoMes, saldoReserva, simular, situacaoDAS, taxaDaForma, vencimentoDAS,
} from './calc'
import { interpretar } from './parser'
import { conferirEstado, gerarBackup, lerBackup, LIMITES, paraCSV } from './backup'
import { CATEGORIAS_GASTO, SERVICOS_PADRAO, estadoInicial } from './defaults'
import { estadoDemo } from './demo'
import type { Lancamento } from './types'

const L = (p: Partial<Lancamento>): Lancamento => ({
  id: Math.random().toString(36), data: '2026-11-03', criadoEm: 0, tipo: 'entrada', valor: 0, taxa: 0,
  categoria: 'corte', recebido: true, ...p,
})

describe('dinheiro', () => {
  it('formata em reais', () => {
    expect(brl(123456)).toBe('R$\u00a01.234,56')
    expect(brlCurto(5000)).toBe('R$\u00a050')
    expect(brlCurto(5050)).toBe('R$\u00a050,50')
  })
  it('entende o jeito que as pessoas digitam', () => {
    expect(parseValor('50')).toBe(5000)
    expect(parseValor('50,5')).toBe(5050)
    expect(parseValor('R$ 1.200,00')).toBe(120000)
    expect(parseValor('1.200')).toBe(120000)
    expect(parseValor('80.90')).toBe(8090)
    expect(parseValor('abc')).toBeNull()
    expect(parseValor('')).toBeNull()
    // ambíguo ou malformado: melhor perguntar do que adivinhar
    expect(parseValor('1,234')).toBeNull()
    expect(parseValor('1.2.3')).toBeNull()
    expect(parseValor('10.000,00')).toBe(1000000)
    expect(parseValor('0,99')).toBe(99)
  })
})

describe('datas', () => {
  it('soma meses atravessando o ano', () => {
    expect(somarMeses('2026-11', 2)).toBe('2027-01')
    expect(somarMeses('2026-01', -1)).toBe('2025-12')
  })
  it('conta dias', () => {
    expect(diasEntre('2026-11-03', '2026-11-20')).toBe(17)
    expect(hoje(new Date(2026, 10, 3))).toBe('2026-11-03')
  })
})

describe('resumo do mês', () => {
  const lancs = [
    L({ valor: 5000, forma: 'pix' }),
    L({ valor: 10000, forma: 'credito', taxa: 350 }),
    L({ valor: 18000, recebido: false, cliente: 'Ana' }), // fiado: não entra no caixa
    L({ tipo: 'saida', valor: 3000, categoria: 'produtos' }),
    L({ tipo: 'retirada', valor: 4000, categoria: 'retirada' }),
    L({ tipo: 'reserva', valor: 1000, categoria: 'reserva' }),
    L({ data: '2026-10-30', valor: 9999 }), // outro mês
    L({ data: '2026-10-20', valor: 5000, recebido: true, recebidoEm: '2026-11-02' }), // fiado de outubro pago em novembro
  ]
  const r = resumoDoMes(lancs, '2026-11')
  it('soma o que entrou já sem a taxa e com o fiado pago no mês do pagamento', () => {
    expect(r.entrou).toBe(5000 + 9650 + 5000)
    expect(r.taxas).toBe(350)
  })
  it('separa gasto do salão do que foi pra casa', () => {
    expect(r.saiu).toBe(3000)
    expect(r.praCasa).toBe(4000)
    expect(r.resultado).toBe(19650 - 3000)
    expect(r.sobrou).toBe(19650 - 3000 - 4000)
  })
  it('mostra o fiado do mês como a receber', () => {
    expect(r.aReceber).toBe(18000)
    expect(r.atendimentos).toBe(3)
    expect(fiadosAbertos(lancs)).toHaveLength(1)
  })
})

describe('reserva e fôlego', () => {
  it('saldo da reserva desconta resgates', () => {
    expect(saldoReserva([L({ tipo: 'reserva', valor: 5000 }), L({ tipo: 'resgate', valor: 2000 })])).toBe(3000)
  })
  it('fôlego é quantos dias a reserva paga as contas', () => {
    expect(diasDeFolego(30000, 90000)).toBe(10)
    expect(diasDeFolego(0, 90000)).toBe(0)
    expect(diasDeFolego(1000, 0)).toBe(0)
  })
  it('custo mensal: estimativa sem histórico; com histórico, o maior dos dois (conservador)', () => {
    const e = estadoInicial()
    e.config.gastoMensalEstimado = 60000
    e.config.salarioMensal = 100000
    expect(custoMensal(e, '2026-11')).toBe(160000)
    // mês incompleto (começo de uso) não infla o fôlego
    e.lancamentos = [L({ data: '2026-10-28', tipo: 'saida', valor: 5000, categoria: 'produtos' })]
    expect(custoMensal(e, '2026-11')).toBe(160000)
    // histórico maior que a estimativa vale
    e.lancamentos = [L({ data: '2026-10-05', tipo: 'saida', valor: 90000, categoria: 'produtos' })]
    expect(custoMensal(e, '2026-11')).toBe(190000)
  })
  it('fôlego sem erro de arredondamento', () => {
    expect(diasDeFolego(100000, 100000)).toBe(30)
    expect(diasDeFolego(125000, 62500)).toBe(60)
  })
})

describe('taxas, margem e "e se?"', () => {
  const taxas = { debito: 1.5, credito: 3.5 }
  it('calcula a taxa da maquininha', () => {
    expect(taxaDaForma(10000, 'credito', taxas)).toBe(350)
    expect(taxaDaForma(10000, 'debito', taxas)).toBe(150)
    expect(taxaDaForma(10000, 'pix', taxas)).toBe(0)
  })
  it('margem do serviço desconta taxa e produto', () => {
    const m = margemServico({ preco: 10000, custoProduto: 2000, minutos: 60 }, 2)
    expect(m.margem).toBe(10000 - 200 - 2000)
    expect(m.porHora).toBe(7800)
    expect(Math.round(m.margemPct)).toBe(78)
  })
  it('desconto de 20% mostra quantos atendimentos a mais para empatar', () => {
    const r = simular({ servico: { preco: 5000, custoProduto: 1000, minutos: 45 }, atendimentosMes: 20, descontoPct: 20, taxaMediaPct: 0 })
    expect(r.antes.margem).toBe(4000)
    expect(r.depois.margem).toBe(3000)
    expect(r.impactoMes).toBe(-20000)
    expect(r.atendimentosParaEmpatar).toBe(7) // 80000/3000 = 26,7 → 27 - 20
  })
  it('alta do produto (dólar) reduz a margem', () => {
    const r = simular({ servico: { preco: 18000, custoProduto: 4500, minutos: 180 }, atendimentosMes: 4, aumentoProdutoPct: 30, taxaMediaPct: 0 })
    expect(r.depois.margem).toBe(18000 - 5850)
  })
  it('margem zerada não tem como empatar', () => {
    const r = simular({ servico: { preco: 1000, custoProduto: 900, minutos: 30 }, atendimentosMes: 10, descontoPct: 50, taxaMediaPct: 0 })
    expect(r.atendimentosParaEmpatar).toBeNull()
  })
  it('indicação com benefício compensa se a cliente volta', () => {
    expect(custoIndicacao(1000, 4000, 4)).toEqual({ ganhoPrimeiraVisita: 3000, ganhoNoAno: 15000, valeAPena: true })
    // "0 visitas" vira 1 (a primeira): sem contradição entre a 1ª visita e o ano
    expect(custoIndicacao(1000, 4000, 0)).toEqual({ ganhoPrimeiraVisita: 3000, ganhoNoAno: 3000, valeAPena: true })
  })
})

describe('MEI', () => {
  const lancs = [
    L({ data: '2026-03-10', valor: 10000, taxa: 350 }),
    L({ data: '2026-11-01', valor: 5000 }),
    L({ data: '2026-11-02', valor: 7000, recebido: false }),
    L({ data: '2025-12-30', valor: 99999 }),
  ]
  it('faturamento do ano usa o valor bruto recebido', () => {
    expect(faturamentoAno(lancs, 2026)).toBe(15000)
    expect(receitaBrutaMes(lancs, '2026-11')).toBe(5000)
  })
  it('DAS que vence no fim de semana passa para segunda-feira', () => {
    expect(vencimentoDAS('2026-11')).toBe('2026-12-21') // 20/12/2026 é domingo
    expect(vencimentoDAS('2026-09')).toBe('2026-10-20') // terça
  })
  it('gasto "DAS do MEI" no mês do vencimento conta como pago', () => {
    const c = estadoInicial().config
    expect(situacaoDAS(c, '2026-10', '2026-11-25', [L({ data: '2026-11-18', tipo: 'saida', categoria: 'das', valor: 8605 })])).toBe('pago')
    expect(situacaoDAS(c, '2026-10', '2026-11-25', [])).toBe('atrasado')
  })
  it('primeiro mês de uso', () => {
    expect(primeiroMesDeUso([], '2026-11-25')).toBe('2026-11')
    expect(primeiroMesDeUso([L({ data: '2026-08-02' })], '2026-11-25')).toBe('2026-08')
  })
  it('situação do DAS', () => {
    const c = { ...estadoInicial().config, dasPagos: ['2026-09'] }
    expect(situacaoDAS(c, '2026-09', '2026-11-03')).toBe('pago')
    expect(situacaoDAS(c, '2026-10', '2026-11-03')).toBe('a-vencer')
    expect(situacaoDAS(c, '2026-10', '2026-11-17')).toBe('a-vencer') // 6 dias antes do dia 23
    expect(situacaoDAS(c, '2026-10', '2026-11-18')).toBe('vence-logo')
    // 20/11/2026 é sexta e feriado (Consciência Negra): vence na segunda 23/11
    expect(situacaoDAS(c, '2026-10', '2026-11-21')).toBe('vence-logo')
    expect(situacaoDAS(c, '2026-10', '2026-11-23')).toBe('vence-logo')
    expect(situacaoDAS(c, '2026-10', '2026-11-24')).toBe('atrasado')
  })
})

describe('escreva do seu jeito', () => {
  const p = (t: string) => interpretar(t, SERVICOS_PADRAO, CATEGORIAS_GASTO)
  it('atendimento com forma de pagamento', () => {
    const r = p('corte 50 pix')
    expect(r).toMatchObject({ tipo: 'entrada', valor: 5000, forma: 'pix', categoria: 'corte', recebido: true })
  })
  it('fiado com nome da cliente', () => {
    const r = p('alisamento 180 crédito maria fiado')
    expect(r).toMatchObject({ tipo: 'entrada', valor: 18000, categoria: 'alisamento', recebido: false, cliente: 'Maria' })
  })
  it('gastos', () => {
    expect(p('gastei 45 de shampoo')).toMatchObject({ tipo: 'saida', valor: 4500, categoria: 'produtos' })
    expect(p('conta de luz 120')).toMatchObject({ tipo: 'saida', valor: 12000, categoria: 'contas' })
    expect(p('descolorante 89,90')).toMatchObject({ tipo: 'saida', valor: 8990, categoria: 'produtos' })
    expect(p('paguei 250 conserto do secador')).toMatchObject({ tipo: 'saida', valor: 25000, categoria: 'equipamento' })
  })
  it('pra casa, reserva e resgate', () => {
    expect(p('tirei 300 pra casa')).toMatchObject({ tipo: 'retirada', valor: 30000 })
    expect(p('guardei 20')).toMatchObject({ tipo: 'reserva', valor: 2000 })
    expect(p('usei da reserva 100')).toMatchObject({ tipo: 'resgate', valor: 10000 })
  })
  it('sem valor devolve null para a tela pedir', () => {
    expect(p('escova').valor).toBeNull()
  })
})

describe('backup', () => {
  it('ida e volta sem perder nada', () => {
    const e = estadoDemo('2026-11', 3)
    const r = lerBackup(JSON.stringify(gerarBackup(e)))
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.estado.lancamentos.length).toBe(e.lancamentos.length)
  })
  it('recusa cópia malformada que travaria o app', () => {
    const base = () => gerarBackup(estadoDemo('2026-11', 3))
    const casos: ((b: ReturnType<typeof base>) => void)[] = [
      (b) => { (b.estado.config as unknown as Record<string, unknown>).dasPagos = null },
      (b) => { (b.estado as unknown as Record<string, unknown>).servicos = [null] },
      (b) => { (b.estado.servicos[0] as unknown as Record<string, unknown>).nome = undefined },
      (b) => { (b.estado.config.taxas as unknown as Record<string, unknown>).debito = 'x' },
      (b) => { b.estado.lancamentos[0].taxa = b.estado.lancamentos[0].valor + 1 },
      (b) => { (b.estado.lancamentos[0] as unknown as Record<string, unknown>).recebido = 'false' },
      (b) => { b.estado.lancamentos[0].recebidoEm = 'banana' },
      (b) => { b.estado.lancamentos[0].data = '2026-13-45' },
      (b) => { (b.estado.lancamentos[0] as unknown as Record<string, unknown>).forma = 'bitcoin' },
      (b) => { b.estado.lancamentos[1].id = b.estado.lancamentos[0].id },
      (b) => { b.estado.lancamentos[0].valor = 1e300 },
    ]
    for (const estragar of casos) {
      const b = base()
      estragar(b)
      expect(lerBackup(JSON.stringify(b)).ok).toBe(false)
    }
  })
  it('cópia da demonstração nunca entra nos dados reais', () => {
    const b = gerarBackup(estadoDemo('2026-11', 3), new Date(), true)
    const r = lerBackup(JSON.stringify(b))
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.erro).toContain('demonstração')
  })
  it('recusa arquivo estranho ou com defeito', () => {
    expect(lerBackup('oi').ok).toBe(false)
    expect(lerBackup(JSON.stringify({ formato: 'outro' })).ok).toBe(false)
    const ruim = gerarBackup(estadoInicial())
    ruim.estado.lancamentos = [{ ...L({}), valor: -5 }]
    expect(lerBackup(JSON.stringify(ruim)).ok).toBe(false)
  })
  it('gera planilha CSV com cabeçalho', () => {
    const csv = paraCSV(estadoDemo('2026-11', 3))
    expect(csv.split('\n')[0]).toContain('Data;Tipo;O quê;Valor')
  })
  it('planilha não deixa texto virar fórmula no Excel', () => {
    const e = estadoInicial()
    e.lancamentos = [L({ descricao: '=HYPERLINK("x")' })]
    expect(paraCSV(e)).toContain(`"'=HYPERLINK(""x"")"`)
  })
})

describe('demonstração', () => {
  it('é determinística e só tem dados fictícios', () => {
    const a = estadoDemo('2026-11', 3)
    const b = estadoDemo('2026-11', 3)
    expect(a.lancamentos.length).toBe(b.lancamentos.length)
    expect(a.lancamentos.every((l) => l.id.startsWith('demo-'))).toBe(true)
    const r = resumoDoMes(a.lancamentos, '2026-10')
    expect(r.entrou).toBeGreaterThan(0)
    expect(r.saiu).toBeGreaterThan(0)
  })
  it('nunca cria lançamento com data no futuro', () => {
    for (const dia of [1, 3, 15, 28]) {
      const d = estadoDemo('2026-11', dia)
      const hojeDemo = `2026-11-${String(dia).padStart(2, '0')}`
      expect(d.lancamentos.every((l) => l.data <= hojeDemo)).toBe(true)
    }
  })
  it('no começo do mês o mês atual não fica negativo por causa do salário', () => {
    const r = resumoDoMes(estadoDemo('2026-11', 3).lancamentos, '2026-11')
    expect(r.praCasa).toBe(0)
  })
})

describe('DAS: feriados e competência (crítico 2)', () => {
  const c = { ...estadoInicial().config, ehMei: true }
  it('feriados nacionais fixos e os que dependem da Páscoa', () => {
    const f = feriadosNacionais(2026)
    for (const d of ['2026-01-01', '2026-04-21', '2026-05-01', '2026-09-07', '2026-10-12', '2026-11-02', '2026-11-15', '2026-11-20', '2026-12-25']) expect(f.has(d), d).toBe(true)
    // Páscoa 2026 = 05/04: Carnaval 16 e 17/02, Sexta-feira Santa 03/04, Corpus Christi 04/06
    for (const d of ['2026-02-16', '2026-02-17', '2026-04-03', '2026-06-04']) expect(f.has(d), d).toBe(true)
    expect(f.has('2026-02-18')).toBe(false) // quarta de cinzas tem expediente
    expect(feriadosNacionais(2023).has('2023-11-20')).toBe(false) // feriado nacional só a partir de 2024
  })
  it('vencimento pula fim de semana e feriado (próximo dia útil)', () => {
    expect(vencimentoDAS('2026-10')).toBe('2026-11-23') // 20/11 sexta, feriado
    expect(vencimentoDAS('2023-01')).toBe('2023-02-22') // 20 e 21/02/2023: Carnaval
    expect(vencimentoDAS('2019-05')).toBe('2019-06-21') // 20/06/2019: Corpus Christi
    expect(vencimentoDAS('2025-03')).toBe('2025-04-22') // 20/04 domingo, 21/04 Tiradentes
    expect(vencimentoDAS('2027-01')).toBe('2027-02-22') // 20/02/2027 sábado
  })
  it('gasto DAS vale para a competência escolhida; sem escolha, o mês anterior à data', () => {
    const atrasado = [L({ tipo: 'saida', categoria: 'das', valor: 8605, data: '2026-12-05', competencia: '2026-10' })]
    expect(situacaoDAS(c, '2026-10', '2026-12-05', atrasado)).toBe('pago')
    expect(situacaoDAS(c, '2026-11', '2026-12-05', atrasado)).toBe('a-vencer')
    const semEscolha = [L({ tipo: 'saida', categoria: 'das', valor: 8605, data: '2026-12-05' })]
    expect(situacaoDAS(c, '2026-11', '2026-12-05', semEscolha)).toBe('pago')
    expect(competenciaDAS(semEscolha[0])).toBe('2026-11')
  })
})

describe('backup: conferência mais rígida no que é estrutura, gentil no texto', () => {
  const base = () => gerarBackup(estadoDemo('2026-11', 3))
  it('recusa data impossível e serviço repetido', () => {
    const b1 = base(); b1.estado.lancamentos[0].data = '2026-02-31'
    expect(lerBackup(JSON.stringify(b1)).ok).toBe(false)
    const b2 = base(); b2.estado.servicos[1].id = b2.estado.servicos[0].id
    expect(lerBackup(JSON.stringify(b2)).ok).toBe(false)
    const b3 = base(); b3.estado.lancamentos[0].recebidoEm = '2026-04-31'
    expect(lerBackup(JSON.stringify(b3)).ok).toBe(false)
  })
  it('texto comprido é cortado, não recusa a cópia', () => {
    const b = base()
    b.estado.lancamentos[0].descricao = 'x'.repeat(900)
    b.estado.lancamentos[1].cliente = 'A'.repeat(61)
    const r = lerBackup(JSON.stringify(b))
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.estado.lancamentos[0].descricao).toHaveLength(LIMITES.descricao)
      expect(r.estado.lancamentos[1].cliente).toHaveLength(LIMITES.cliente)
    }
  })
  it('competência do DAS vai e volta, e é conferida', () => {
    const b = base()
    b.estado.lancamentos[0] = { ...b.estado.lancamentos[0], tipo: 'saida', categoria: 'das', competencia: '2026-09' }
    const r = lerBackup(JSON.stringify(b))
    expect(r.ok && r.estado.lancamentos[0].competencia).toBe('2026-09')
    b.estado.lancamentos[0].competencia = '2026-13'
    expect(lerBackup(JSON.stringify(b)).ok).toBe(false)
  })
  it('nos próprios dados: separa só a anotação estragada e conserta o resto', () => {
    const e = estadoDemo('2026-11', 3) as unknown as Record<string, any>
    const total = e.lancamentos.length
    e.lancamentos[0].valor = -5
    e.lancamentos[1].data = '2026-02-31'
    e.lancamentos[2].descricao = 'y'.repeat(800)
    e.config.dasPagos = null
    const r = conferirEstado(e, true)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.estado.lancamentos).toHaveLength(total - 2)
      expect(r.descartados).toBe(2)
      expect(r.cortados).toBe(1)
      expect(r.consertados).toBe(1)
      expect(r.estado.config.dasPagos).toEqual([])
    }
    // estrutura quebrada continua sendo recusada
    expect(conferirEstado({ lancamentos: 'x' }, true).ok).toBe(false)
    expect(conferirEstado(null, true).ok).toBe(false)
  })
  it('planilha: texto que começa com "-" também leva apóstrofo', () => {
    const e = estadoInicial()
    e.lancamentos = [L({ tipo: 'saida', categoria: 'outros', descricao: '-1+1+cmd|calc' })]
    expect(paraCSV(e)).toContain("'-1+1")
  })
  it('planilha mostra a competência do DAS', () => {
    const e = estadoInicial()
    e.lancamentos = [L({ tipo: 'saida', categoria: 'das', valor: 8605, data: '2026-12-05', competencia: '2026-10' })]
    expect(paraCSV(e)).toContain('DAS do MEI (outubro de 2026)')
  })
})

describe('reserva nunca negativa', () => {
  it('apagar ou diminuir um "Guardei" já usado é bloqueado', () => {
    const g = L({ id: 'g', tipo: 'reserva', categoria: 'reserva', valor: 10000 })
    const r = L({ id: 'r', tipo: 'resgate', categoria: 'resgate', valor: 8000 })
    expect(reservaFicaNegativa([g, r], [r])).toBe(true)
    expect(reservaFicaNegativa([g, r], [{ ...g, valor: 2000 }, r])).toBe(true)
    expect(reservaFicaNegativa([g, r], [{ ...g, valor: 9000 }, r])).toBe(false)
    // apagar o resgate é sempre possível
    expect(reservaFicaNegativa([g, r], [g])).toBe(false)
    // dado antigo já negativo: dá para consertar aos poucos
    expect(reservaFicaNegativa([r], [{ ...r, valor: 5000 }])).toBe(false)
  })
})

describe('fiado: achar pelo nome sem diferença de acento', () => {
  const abertos = [
    L({ id: 'i', recebido: false, cliente: 'Inês' }),
    L({ id: 'a', recebido: false, cliente: 'Cliente A' }),
    L({ id: 'b', recebido: false, cliente: 'Cliente B' }),
  ]
  it('acha Inês escrevendo "ines"', () => {
    expect(acharFiado(abertos, 'recebi o fiado da ines', 'Ines')?.id).toBe('i')
  })
  it('acha os nomes da demonstração ("Cliente A")', () => {
    expect(acharFiado(abertos, 'recebi o fiado da cliente a', undefined)?.id).toBe('a')
    expect(acharFiado(abertos, 'a Cliente B pagou o fiado', undefined)?.id).toBe('b')
    expect(acharFiado(abertos, 'recebi o fiado da Maria', 'Maria')).toBeUndefined()
  })
})

describe('demonstração em qualquer dia', () => {
  it('cotação de fornecedor nunca fica no futuro (dia 1)', () => {
    const e = estadoDemo('2026-11', 1)
    expect(e.fornecedores.every((f) => f.data <= '2026-11-01')).toBe(true)
  })
  it('nenhum dia do mês tem DAS atrasado, nem mesmo com o feriado de 20/11', () => {
    for (let d = 1; d <= 30; d++) {
      const hj = `2026-11-${String(d).padStart(2, '0')}`
      const e = estadoDemo('2026-11', d)
      expect(situacaoDAS(e.config, '2026-10', hj, e.lancamentos), hj).not.toBe('atrasado')
    }
  })
})

describe('mês no endereço', () => {
  it('reconhece mês inválido', () => {
    expect(mesValido('2026-11')).toBe(true)
    expect(mesValido('2026-13')).toBe(false)
    expect(mesValido('2026-00')).toBe(false)
    expect(mesValido('abc')).toBe(false)
  })
  it('reconhece data impossível', () => {
    expect(dataValida('2026-02-28')).toBe(true)
    expect(dataValida('2028-02-29')).toBe(true)
    expect(dataValida('2026-02-29')).toBe(false)
    expect(dataValida('2026-02-31')).toBe(false)
  })
})
