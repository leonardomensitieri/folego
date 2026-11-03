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
