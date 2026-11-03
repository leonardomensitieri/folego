import type { Centavos } from './types'

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function brl(c: Centavos): string {
  // Intl usa espaço não separável depois do "R$"; trocamos por espaço comum para leitura de tela e testes.
  return fmt.format(c / 100).replace(/ /g, ' ')
}

/** "R$ 1.234,56" sem centavos quando é valor redondo: "R$ 50". */
export function brlCurto(c: Centavos): string {
  if (c % 100 === 0) return brl(c).replace(/,00$/, '')
  return brl(c)
}

/**
 * Aceita o jeito que as pessoas digitam: "50", "50,5", "50,50", "1.200", "1.200,00", "R$ 80", "80.90".
 * Devolve centavos ou null se não der para entender.
 */
export function parseValor(texto: string): Centavos | null {
  const s = texto.replace(/r\$/gi, '').replace(/\s/g, '')
  if (!s) return null
  let normal: string
  if (/^\d+$/.test(s)) normal = s // 50
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) normal = s.replace(/\./g, '') // 1.200 = mil e duzentos
  else if (/^\d+,\d{1,2}$/.test(s)) normal = s.replace(',', '.') // 50,5 · 89,90
  else if (/^\d{1,3}(\.\d{3})+,\d{1,2}$/.test(s)) normal = s.replace(/\./g, '').replace(',', '.') // 1.200,00
  else if (/^\d+\.\d{1,2}$/.test(s)) normal = s // 80.90 (jeito de teclado americano)
  else if (/^\d+,$/.test(s)) normal = s.slice(0, -1) // "50," enquanto digita
  else return null // "1,234", "1.2.3": melhor perguntar do que adivinhar
  const n = Number(normal)
  if (!Number.isFinite(n) || n < 0 || n > 10_000_000) return null
  return Math.round(n * 100)
}

export function pct(n: number): string {
  return `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}
