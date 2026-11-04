import { describe, expect, it } from 'vitest'
import { interpretar } from './parser'
import { CATEGORIAS_GASTO, SERVICOS_PADRAO } from './defaults'
import type { Tipo } from './types'

// Bateria de frases do jeito que uma dona de salão escreveria (critério A3 da régua: ≥ 90% de acerto).
const CASOS: [string, Tipo, number | null, Partial<{ forma: string; categoria: string; recebido: boolean; cliente: string }>][] = [
  ['corte 50 pix', 'entrada', 5000, { forma: 'pix', categoria: 'corte' }],
  ['Corte 50', 'entrada', 5000, { categoria: 'corte' }],
  ['escova 40 dinheiro', 'entrada', 4000, { forma: 'dinheiro', categoria: 'escova' }],
  ['alisamento 180 no crédito', 'entrada', 18000, { forma: 'credito', categoria: 'alisamento' }],
  ['alisamento 180 cartão de débito', 'entrada', 18000, { forma: 'debito' }],
  ['sobrancelha 30 pix', 'entrada', 3000, { categoria: 'sobrancelha' }],
  ['maquiagem R$ 80,00 pix', 'entrada', 8000, { categoria: 'maquiagem' }],
  ['penteado 90 parcelado', 'entrada', 9000, { forma: 'credito', categoria: 'penteado' }],
  ['coloração 120 débito', 'entrada', 12000, { forma: 'debito', categoria: 'coloracao' }],
  ['recebi 70 da hidratação', 'entrada', 7000, { categoria: 'outro-servico' }],
  ['corte 50 maria vai pagar depois', 'entrada', 5000, { recebido: false, cliente: 'Maria' }],
  ['escova 40 fiado joana', 'entrada', 4000, { recebido: false, cliente: 'Joana' }],
  ['alisamento 200 da Ana fiado', 'entrada', 20000, { recebido: false, cliente: 'Ana' }],
  ['gastei 45 de shampoo', 'saida', 4500, { categoria: 'produtos' }],
  ['comprei descolorante 89,90', 'saida', 8990, { categoria: 'produtos' }],
  ['máscara 60', 'saida', 6000, { categoria: 'produtos' }],
  ['paguei a luz 135', 'saida', 13500, { categoria: 'contas' }],
  ['conta de internet 99,90', 'saida', 9990, { categoria: 'contas' }],
  ['paguei 250 conserto do secador', 'saida', 25000, { categoria: 'equipamento' }],
  ['comprei chapinha nova 320', 'saida', 32000, { categoria: 'equipamento' }],
  ['paguei o DAS 82', 'saida', 8200, { categoria: 'das' }],
  ['parcela do empréstimo 300', 'saida', 30000, { categoria: 'divida' }],
  ['comprei material de limpeza 35', 'saida', 3500, { categoria: 'limpeza' }],
  ['aluguel 600', 'saida', 60000, { categoria: 'aluguel' }],
  ['tirei 300 pra casa', 'retirada', 30000, {}],
  ['meu salário 1500', 'retirada', 150000, {}],
  ['guardei 20', 'reserva', 2000, {}],
  ['separei 10 pra reserva', 'reserva', 1000, {}],
  ['usei da reserva 100', 'resgate', 10000, {}],
  ['escova', 'entrada', null, { categoria: 'escova' }],
]

describe('escreva do seu jeito — bateria de 30 frases', () => {
  const resultados = CASOS.map(([frase, tipo, valor, extra]) => {
    const r = interpretar(frase, SERVICOS_PADRAO, CATEGORIAS_GASTO)
    const ok =
      r.tipo === tipo && r.valor === valor &&
      Object.entries(extra).every(([k, v]) => (r as unknown as Record<string, unknown>)[k] === v)
    return { frase, ok, r }
  })

  it.each(resultados.map((x) => [x.frase, x]))('%s', (_f, x) => {
    expect(x.ok, JSON.stringify(x.r)).toBe(true)
  })

  it('acerta pelo menos 90%', () => {
    const acertos = resultados.filter((x) => x.ok).length
    expect(acertos / resultados.length).toBeGreaterThanOrEqual(0.9)
  })
})

// Bateria do crítico 2 (gauntlet rodada 3): 40 frases NOVAS. Conta tipo + valor + forma (forma só em entrada recebida).
const HOJE = '2026-11-03'
type Esp = { tipo: Tipo; valor: number | null; forma?: string; extra?: Record<string, unknown> }
const NOVAS: [string, Esp][] = [
  ['fiz uma escova 45 no pix', { tipo: 'entrada', valor: 4500, forma: 'pix' }],
  ['corte masc 35 dinheiro', { tipo: 'entrada', valor: 3500, forma: 'dinheiro' }],
  ['progressiva 250 cartao 3x', { tipo: 'entrada', valor: 25000, forma: 'credito', extra: { categoria: 'alisamento' } }],
  ['selagem 220 no credito em 2x', { tipo: 'entrada', valor: 22000, forma: 'credito' }],
  ['luzes 300 debito', { tipo: 'entrada', valor: 30000, forma: 'debito', extra: { categoria: 'coloracao' } }],
  ['sobrancelha c henna 40 pix', { tipo: 'entrada', valor: 4000, forma: 'pix' }],
  ['corte e escova 90 pix', { tipo: 'entrada', valor: 9000, forma: 'pix' }],
  ['corte 40 e escova 40 pix', { tipo: 'entrada', valor: 8000, forma: 'pix' }],
  ['escova 40, corte 50 dinheiro', { tipo: 'entrada', valor: 9000, forma: 'dinheiro' }],
  ['corte 50 e escova progressiva 200 credito', { tipo: 'entrada', valor: 25000, forma: 'credito' }],
  ['corte 50 pix caiu na conta', { tipo: 'entrada', valor: 5000, forma: 'pix' }],
  ['recebi 50 da Ana que tava devendo', { tipo: 'entrada', valor: 5000, forma: 'pix', extra: { recebido: true, quitarFiado: true } }],
  ['manicure 30 pix', { tipo: 'entrada', valor: 3000, forma: 'pix' }],
  ['hidratacao 60 pix ontem', { tipo: 'entrada', valor: 6000, forma: 'pix', extra: { data: '2026-11-02' } }],
  ['escova 40 fiado pra Dani', { tipo: 'entrada', valor: 4000, extra: { recebido: false, cliente: 'Dani' } }],
  ['Joana ficou devendo 80 da coloracao', { tipo: 'entrada', valor: 8000, extra: { recebido: false, cliente: 'Joana' } }],
  ['penteado 120 pendura pra Lu', { tipo: 'entrada', valor: 12000, extra: { recebido: false, cliente: 'Lu' } }],
  ['gastei 32,50 de acetona', { tipo: 'saida', valor: 3250, extra: { categoria: 'produtos' } }],
  ['comprei 2 tintas 70', { tipo: 'saida', valor: 7000, extra: { categoria: 'produtos' } }],
  ['paguei luz 189,90', { tipo: 'saida', valor: 18990, extra: { categoria: 'contas' } }],
  ['boleto da internet 99', { tipo: 'saida', valor: 9900, extra: { categoria: 'contas' } }],
  ['conserto do secador 150', { tipo: 'saida', valor: 15000, extra: { categoria: 'equipamento' } }],
  ['das de outubro 86,05', { tipo: 'saida', valor: 8605, extra: { categoria: 'das', competencia: '2026-10' } }],
  ['aluguel do espaço 500', { tipo: 'saida', valor: 50000, extra: { categoria: 'aluguel' } }],
  ['devolvi 40 pra cliente', { tipo: 'saida', valor: 4000 }],
  ['estornei 50 da cliente', { tipo: 'saida', valor: 5000 }],
  ['prolabore 2000', { tipo: 'retirada', valor: 200000 }],
  ['pró-labore 1.500', { tipo: 'retirada', valor: 150000 }],
  ['salario do mes 1800', { tipo: 'retirada', valor: 180000 }],
  ['tirei 100 pro mercado', { tipo: 'retirada', valor: 10000 }],
  ['paguei a luz de casa 150', { tipo: 'retirada', valor: 15000 }],
  ['guardei 10 no cofrinho', { tipo: 'reserva', valor: 1000 }],
  ['botei 50 na reserva', { tipo: 'reserva', valor: 5000 }],
  ['peguei 200 da reserva pro secador', { tipo: 'resgate', valor: 20000 }],
  ['escova 40 em especie', { tipo: 'entrada', valor: 4000, forma: 'dinheiro' }],
  ['mechas 1.200 credito 10x', { tipo: 'entrada', valor: 120000, forma: 'credito' }],
  ['maquiagem 80,5 pix', { tipo: 'entrada', valor: 8050, forma: 'pix' }],
  ['corte 50 pix, depois escova 40 dinheiro', { tipo: 'entrada', valor: 9000, forma: 'pix', extra: { recebido: true } }],
  ['corte 50 debto', { tipo: 'entrada', valor: 5000, forma: 'debito' }],
  ['comprei secador novo 450 em 3x', { tipo: 'saida', valor: 45000, extra: { categoria: 'equipamento' } }],
]

describe('escreva do seu jeito — 40 frases novas do crítico (A3)', () => {
  const res = NOVAS.map(([f, esp]) => {
    const r = interpretar(f, SERVICOS_PADRAO, CATEGORIAS_GASTO, HOJE) as unknown as Record<string, unknown>
    const ok = r.tipo === esp.tipo && r.valor === esp.valor && (esp.forma === undefined || r.forma === esp.forma)
    const okExtra = Object.entries(esp.extra ?? {}).every(([k, v]) => r[k] === v)
    return { f, ok: ok && okExtra, r }
  })
  it.each(res.map((x) => [x.f, x]))('%s', (_f, x) => {
    expect(x.ok, JSON.stringify(x.r)).toBe(true)
  })
  it('acerta pelo menos 90%', () => {
    expect(res.filter((x) => x.ok).length / res.length).toBeGreaterThanOrEqual(0.9)
  })
})

describe('escreva do seu jeito — casos que mudam dinheiro', () => {
  const p = (t: string, d = HOJE) => interpretar(t, SERVICOS_PADRAO, CATEGORIAS_GASTO, d)
  it('valores repetidos não somem: cada serviço com o seu número', () => {
    expect(p('corte 40 e escova 40 pix').itens).toEqual([
      { categoria: 'corte', valor: 4000, forma: 'pix' },
      { categoria: 'escova', valor: 4000, forma: 'pix' },
    ])
  })
  it('serviço dentro do nome de outro ("escova progressiva") conta uma vez só', () => {
    const r = p('escova progressiva 200 pix')
    expect([r.categoria, r.valor, r.itens]).toEqual(['alisamento', 20000, undefined])
    expect(p('corte 50 e escova progressiva 200 credito').itens?.map((i) => i.categoria)).toEqual(['corte', 'alisamento'])
  })
  it('cada serviço guarda a forma de pagamento dele', () => {
    expect(p('corte 50 pix, depois escova 40 dinheiro').itens?.map((i) => i.forma)).toEqual(['pix', 'dinheiro'])
  })
  it('"depois" só é fiado quando fala de pagar', () => {
    expect(p('corte 50 paga depois').recebido).toBe(false)
    expect(p('escova 40 pago depois ana').recebido).toBe(false)
    expect(p('corte 50 deixa pra depois').recebido).toBe(false)
    expect(p('escova 40 depois pago').recebido).toBe(false)
    expect(p('corte 50 pix e depois escova 40 pix').recebido).toBe(true)
  })
  it('pagamento de fiado sem a palavra "fiado"', () => {
    const r = p('a Ana acertou o que devia 80')
    expect([r.quitarFiado, r.cliente]).toEqual([true, 'Ana'])
    expect(p('recebi 50 da Ana que tava devendo').quitarFiado).toBe(true)
    // fiado novo continua fiado novo
    expect(p('Joana ficou devendo 80 da coloracao').quitarFiado).toBeUndefined()
  })
  it('"conta" sozinha ainda é gasto quando não tem serviço', () => {
    expect(p('conta 100').tipo).toBe('saida')
    expect(p('parcela do empréstimo 300').tipo).toBe('saida')
  })
  it('DAS: o mês escrito vira a competência; sem mês, fica sem (a tela usa o mês anterior)', () => {
    expect(p('das de outubro 86,05').competencia).toBe('2026-10')
    expect(p('paguei o das de dezembro 86', '2027-01-10').competencia).toBe('2026-12')
    expect(p('paguei o DAS 82').competencia).toBeUndefined()
  })
  it('nome de 2 letras só quando parece nome (maiúscula ou depois de "da")', () => {
    expect(p('escova 40 fiado da lu').cliente).toBe('Lu')
    expect(p('corte 50 fiado eu').cliente).toBeUndefined()
  })
})
