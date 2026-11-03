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
  let s = texto.replace(/r\$/gi, '').replace(/\s/g, '')
  if (!s) return null
  if (!/^\d[\d.,]*$/.test(s)) return null
  const temVirgula = s.includes(',')
  if (temVirgula) {
    s = s.replace(/\./g, '').replace(',', '.')
  } else {
    // "1.200" = mil e duzentos; "80.90" = oitenta e noventa.
    const partes = s.split('.')
    if (partes.length > 1 && partes[partes.length - 1].length !== 3) {
      s = partes.slice(0, -1).join('') + '.' + partes[partes.length - 1]
    } else {
      s = partes.join('')
    }
  }
  const n = Number(s)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n * 100)
}

export function pct(n: number): string {
  return `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}
