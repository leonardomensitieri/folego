// Todo valor em dinheiro é guardado em centavos (inteiro) para não errar conta.
export type Centavos = number

export type Forma = 'pix' | 'dinheiro' | 'debito' | 'credito'

/**
 * entrada  = dinheiro que o salão recebeu (ou vai receber, se for fiado)
 * saida    = gasto do salão (produto, conta, equipamento...)
 * retirada = dinheiro que saiu do salão para a casa ("meu salário")
 * reserva  = dinheiro guardado no fundo de emergência
 * resgate  = dinheiro tirado do fundo de emergência
 */
export type Tipo = 'entrada' | 'saida' | 'retirada' | 'reserva' | 'resgate'

export interface Lancamento {
  id: string
  /** Dia do lançamento, formato AAAA-MM-DD (horário local). */
  data: string
  criadoEm: number
  tipo: Tipo
  /** Valor cheio cobrado ou pago. */
  valor: Centavos
  /** Taxa da maquininha descontada do valor (só em entradas no cartão). */
  taxa: Centavos
  forma?: Forma
  /** id do serviço (entradas) ou id da categoria de gasto (saídas). */
  categoria: string
  descricao?: string
  /** Primeiro nome ou apelido. Usado só para lembrar quem ficou devendo. */
  cliente?: string
  /** false = "fiado": a cliente ainda vai pagar. */
  recebido: boolean
  recebidoEm?: string
}

export interface Servico {
  id: string
  nome: string
  preco: Centavos
  /** Quanto de produto se gasta em um atendimento (estimativa). */
  custoProduto: Centavos
  minutos: number
  ativo: boolean
}

export interface Categoria {
  id: string
  nome: string
  icone: string
}

export interface Fornecedor {
  id: string
  produto: string
  nome: string
  preco: Centavos
  /** AAAA-MM-DD da última cotação. */
  data: string
}

export interface Taxas {
  /** Percentuais da maquininha, ex.: 1.5 = 1,5%. */
  debito: number
  credito: number
}

export interface Config {
  versao: 1
  onboardingFeito: boolean
  /** Quanto o salão "paga" para a dona por mês (separar casa e salão). */
  salarioMensal: Centavos
  metaReserva: Centavos
  /** Sugestão de quanto guardar a cada atendimento. */
  reservaPorAtendimento: Centavos
  /** Gastos fixos do mês estimados (contas, produtos de rotina...). Usado no "fôlego" quando ainda não há histórico. */
  gastoMensalEstimado: Centavos
  taxas: Taxas
  /** Valor do boleto DAS do MEI (pode mudar todo ano). */
  valorDAS: Centavos
  /** Competências (AAAA-MM) do DAS já pagas. */
  dasPagos: string[]
  ultimoBackup?: number
}

export interface Estado {
  config: Config
  servicos: Servico[]
  categorias: Categoria[]
  lancamentos: Lancamento[]
  fornecedores: Fornecedor[]
}
