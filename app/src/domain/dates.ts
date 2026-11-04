// Datas no formato AAAA-MM-DD, sempre no fuso do aparelho.

export function hoje(agora: Date = new Date()): string {
  const y = agora.getFullYear()
  const m = String(agora.getMonth() + 1).padStart(2, '0')
  const d = String(agora.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** "2026-11" válido (mês de 01 a 12). */
export function mesValido(mes: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(mes)
}

/** "2026-02-31" não existe: confere se o dia cabe no mês. */
export function dataValida(data: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(data)
  if (!m) return false
  const [y, mm, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const t = new Date(Date.UTC(y, mm - 1, d))
  return t.getUTCFullYear() === y && t.getUTCMonth() === mm - 1 && t.getUTCDate() === d
}

export function mesDe(data: string): string {
  return data.slice(0, 7)
}

export function somarMeses(mes: string, n: number): string {
  const [y, m] = mes.split('-').map(Number)
  const total = y * 12 + (m - 1) + n
  const ny = Math.floor(total / 12)
  const nm = (total % 12) + 1
  return `${ny}-${String(nm).padStart(2, '0')}`
}

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

export function nomeMes(mes: string): string {
  const [y, m] = mes.split('-').map(Number)
  return `${MESES[m - 1]} de ${y}`
}

/** "Novembro de 2026" (só a primeira letra maiúscula). */
export function tituloMes(mes: string): string {
  const n = nomeMes(mes)
  return n.charAt(0).toUpperCase() + n.slice(1)
}

export function nomeMesCurto(mes: string): string {
  const m = Number(mes.split('-')[1])
  return MESES[m - 1]
}

export function dataCurta(data: string): string {
  const [, m, d] = data.split('-')
  return `${d}/${m}`
}

export function diaDaSemana(data: string): string {
  const [y, m, d] = data.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'long' })
}

export function diasEntre(a: string, b: string): number {
  const [ya, ma, da] = a.split('-').map(Number)
  const [yb, mb, db] = b.split('-').map(Number)
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86_400_000)
}
