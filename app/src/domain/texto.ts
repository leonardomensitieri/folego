/** "Inês" → "ines": para comparar nomes e palavras sem ligar para acento nem maiúscula. */
export function semAcento(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** Corta um texto no limite sem partir um emoji ao meio. */
export function cortarTexto(s: string, max: number): string {
  if (s.length <= max) return s
  let r = s.slice(0, max)
  if (/[\uD800-\uDBFF]$/.test(r)) r = r.slice(0, -1)
  return r
}
