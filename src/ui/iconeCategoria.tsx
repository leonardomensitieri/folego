import type { JSX } from 'preact'
import type { Lancamento } from '../domain/types'
import { IcBrilho, IcCartao, IcCasinha, IcCofre, IcFolha, IcFrasco, IcLampada, IcMegafone, IcCaixa, IcRecibo, IcSetaVolta, IcTesoura, IcTomada } from './icons'

const POR_CATEGORIA: Record<string, (p: { size?: number }) => JSX.Element> = {
  produtos: IcFrasco,
  contas: IcLampada,
  limpeza: IcBrilho,
  equipamento: IcTomada,
  aluguel: IcCasinha,
  das: IcRecibo,
  divida: IcCartao,
  divulgacao: IcMegafone,
  outros: IcCaixa,
}

/** Um ícone de traço por conceito (sem emoji), para o app inteiro falar a mesma língua visual. */
export function IconeCategoria({ l, size = 22 }: { l: Pick<Lancamento, 'tipo' | 'categoria'>; size?: number }) {
  if (l.tipo === 'entrada') return <IcTesoura size={size} />
  if (l.tipo === 'retirada') return <IcCasinha size={size} />
  if (l.tipo === 'reserva') return <IcCofre size={size} />
  if (l.tipo === 'resgate') return <IcSetaVolta size={size} />
  const C = POR_CATEGORIA[l.categoria] ?? IcFolha
  return <C size={size} />
}
