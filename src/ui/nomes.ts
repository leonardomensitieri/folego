import { NOMES_FORMA, SERVICO_AVULSO } from '../domain/defaults'
import type { Estado, Lancamento } from '../domain/types'

export function nomeCategoria(e: Estado, l: Pick<Lancamento, 'tipo' | 'categoria'>): string {
  if (l.tipo === 'retirada') return 'Pra casa'
  if (l.tipo === 'reserva') return 'Guardado na reserva'
  if (l.tipo === 'resgate') return 'Tirado da reserva'
  if (l.tipo === 'entrada') {
    if (l.categoria === SERVICO_AVULSO) return 'Outro serviço'
    return e.servicos.find((s) => s.id === l.categoria)?.nome ?? 'Serviço'
  }
  return e.categorias.find((c) => c.id === l.categoria)?.nome ?? 'Gasto'
}

export function nomeForma(f: Lancamento['forma']): string {
  return f ? NOMES_FORMA[f] : ''
}

export const ROTULO_TIPO: Record<Lancamento['tipo'], string> = {
  entrada: 'Recebi',
  saida: 'Gastei',
  retirada: 'Pra casa',
  reserva: 'Guardei',
  resgate: 'Tirei da reserva',
}

/** Sinal do lançamento do ponto de vista do caixa do salão. */
export function sinalNoCaixa(l: Lancamento): 1 | -1 | 0 {
  if (l.tipo === 'entrada') return 1
  if (l.tipo === 'saida' || l.tipo === 'retirada') return -1
  return 0
}

/** Quando apagar ou mudar uma anotação deixaria a reserva negativa (o dinheiro já foi tirado). */
export const TEXTO_RESERVA_USADA = 'Não dá: esse dinheiro já foi tirado da reserva, e ela ficaria negativa. Se precisar, mude antes o valor de “Tirei da reserva”.'
