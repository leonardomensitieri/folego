import { somarMeses } from './dates'
import { estadoInicial } from './defaults'
import { taxaDaForma } from './calc'
import type { Estado, Forma, Lancamento } from './types'

/**
 * Dados 100% FICTÍCIOS para demonstração e testes (exigência do edital: protótipos testados com dados fictícios).
 * Inspirados no perfil genérico de um salão de uma profissional só; nenhum valor vem do parceiro real.
 */
export function estadoDemo(mesAtual: string, diaAtual: number): Estado {
  const e = estadoInicial()
  e.config = {
    ...e.config,
    onboardingFeito: true,
    salarioMensal: 150_000,
    metaReserva: 100_000,
    reservaPorAtendimento: 500,
    gastoMensalEstimado: 70_000,
    valorDAS: 8_200,
    dasPagos: [somarMeses(mesAtual, -3), somarMeses(mesAtual, -2)],
  }
  let seq = 0
  // gerador determinístico: mesma demonstração sempre
  let semente = 7
  const rnd = () => {
    semente = (semente * 1103515245 + 12345) % 2147483648
    return semente / 2147483648
  }
  const lancs: Lancamento[] = []
  const add = (data: string, l: Omit<Lancamento, 'id' | 'data' | 'criadoEm' | 'taxa'> & { taxa?: number }) => {
    lancs.push({ id: `demo-${++seq}`, data, criadoEm: seq, taxa: l.taxa ?? taxaDaForma(l.valor, l.forma, e.config.taxas), ...l })
  }
  const formas: Forma[] = ['pix', 'pix', 'pix', 'dinheiro', 'debito', 'credito']
  const servicosMix = ['corte', 'corte', 'corte', 'escova', 'sobrancelha', 'alisamento', 'coloracao', 'maquiagem']
  const preco = new Map(e.servicos.map((s) => [s.id, s.preco]))
  const nomesFicticios = ['Cliente A', 'Cliente B', 'Cliente C']

  for (let m = -3; m <= 0; m++) {
    const mes = somarMeses(mesAtual, m)
    const ultimoDia = m === 0 ? diaAtual : 28
    for (let dia = 1; dia <= ultimoDia; dia++) {
      const data = `${mes}-${String(dia).padStart(2, '0')}`
      const semana = new Date(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)) - 1, dia).getDay()
      if (semana === 0 || semana === 1) continue // fecha domingo e segunda
      const qtd = rnd() < 0.45 ? 2 : rnd() < 0.8 ? 3 : 1
      for (let i = 0; i < qtd; i++) {
        const servico = servicosMix[Math.floor(rnd() * servicosMix.length)]
        const forma = formas[Math.floor(rnd() * formas.length)]
        add(data, { tipo: 'entrada', valor: preco.get(servico)!, forma, categoria: servico, recebido: true })
        add(data, { tipo: 'reserva', valor: e.config.reservaPorAtendimento, categoria: 'reserva', recebido: true })
      }
    }
    // gastos fixos do mês; no mês atual só entram os que já aconteceram (nada com data no futuro)
    const noMes = (dia: number, l: Parameters<typeof add>[1]) => {
      if (m < 0 || dia <= diaAtual) add(`${mes}-${String(dia).padStart(2, '0')}`, l)
    }
    noMes(2, { tipo: 'saida', valor: 32_000, categoria: 'produtos', descricao: 'Compra do mês (fictícia)', recebido: true })
    noMes(10, { tipo: 'saida', valor: 18_000, categoria: 'contas', descricao: 'Luz e internet (fictício)', recebido: true })
    noMes(12, { tipo: 'saida', valor: 4_500, categoria: 'limpeza', recebido: true })
    noMes(20, { tipo: 'saida', valor: 8_200, categoria: 'das', descricao: 'DAS', recebido: true })
    // o "salário" sai no fim do mês, depois de ver quanto sobrou
    noMes(28, { tipo: 'retirada', valor: 150_000, categoria: 'retirada', recebido: true })
  }
  // um conserto (o "secador") dois meses atrás e um resgate da reserva para pagar parte
  add(`${somarMeses(mesAtual, -2)}-15`, { tipo: 'saida', valor: 25_000, categoria: 'equipamento', descricao: 'Conserto do secador (fictício)', recebido: true })
  add(`${somarMeses(mesAtual, -2)}-15`, { tipo: 'resgate', valor: 15_000, categoria: 'resgate', recebido: true })
  // dois fiados abertos
  const d1 = `${mesAtual}-${String(Math.max(1, diaAtual - 6)).padStart(2, '0')}`
  add(d1, { tipo: 'entrada', valor: 18_000, categoria: 'alisamento', recebido: false, cliente: nomesFicticios[0] })
  add(`${somarMeses(mesAtual, -1)}-22`, { tipo: 'entrada', valor: 5_000, categoria: 'corte', recebido: false, cliente: nomesFicticios[1] })

  e.lancamentos = lancs
  e.fornecedores = [
    { id: 'f1', produto: 'Descolorante', nome: 'Distribuidora 1', preco: 4_990, data: `${mesAtual}-02` },
    { id: 'f2', produto: 'Descolorante', nome: 'Loja online 2', preco: 4_350, data: `${mesAtual}-02` },
    { id: 'f3', produto: 'Máscara', nome: 'Distribuidora 1', preco: 3_890, data: `${mesAtual}-02` },
    { id: 'f4', produto: 'Máscara', nome: 'Atacado 3', preco: 4_200, data: `${somarMeses(mesAtual, -1)}-15` },
  ]
  return e
}
