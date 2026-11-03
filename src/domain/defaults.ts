import type { Categoria, Config, Estado, Servico } from './types'

/**
 * Números públicos do MEI. Conferir todo ano no Portal do Empreendedor (gov.br/mei).
 * Fontes: docs/discovery/pesquisa-sebrae-mei-concorrentes.md (§3).
 * O valor do DAS fica editável no app porque muda com o salário mínimo.
 */
export const MEI = {
  alertaLimite: 0.8,
  diaVencimentoDAS: 20,
  /** A partir de 2027 o Relatório Mensal das Receitas Brutas deixa de ser exigido (Res. CGSN 190/2026). */
  anoFimRelatorioMensal: 2027,
}

/** Limite anual de faturamento do MEI: R$ 81 mil até 2026; LC 238/2026 → R$ 110 mil em 2027 e R$ 140 mil a partir de 2028. */
export function limiteMei(ano: number): number {
  if (ano >= 2028) return 14_000_000
  if (ano === 2027) return 11_000_000
  return 8_100_000
}

// Serviços comuns num salão de bairro de uma profissional só. Preços são exemplos editáveis.
export const SERVICOS_PADRAO: Servico[] = [
  { id: 'corte', nome: 'Corte', preco: 5000, custoProduto: 300, minutos: 45, ativo: true },
  { id: 'alisamento', nome: 'Alisamento', preco: 18000, custoProduto: 4500, minutos: 180, ativo: true },
  { id: 'escova', nome: 'Escova', preco: 4000, custoProduto: 400, minutos: 45, ativo: true },
  { id: 'coloracao', nome: 'Coloração', preco: 12000, custoProduto: 3500, minutos: 120, ativo: true },
  { id: 'sobrancelha', nome: 'Sobrancelha', preco: 3000, custoProduto: 200, minutos: 30, ativo: true },
  { id: 'maquiagem', nome: 'Maquiagem', preco: 8000, custoProduto: 800, minutos: 60, ativo: true },
  { id: 'penteado', nome: 'Penteado', preco: 9000, custoProduto: 500, minutos: 60, ativo: true },
]

export const SERVICO_AVULSO = 'outro-servico'

export const CATEGORIAS_GASTO: Categoria[] = [
  { id: 'produtos', nome: 'Produtos e insumos', icone: '🧴' },
  { id: 'contas', nome: 'Contas (luz, água, internet)', icone: '💡' },
  { id: 'limpeza', nome: 'Limpeza', icone: '🧽' },
  { id: 'equipamento', nome: 'Equipamento e conserto', icone: '🔌' },
  { id: 'aluguel', nome: 'Aluguel do espaço', icone: '🏠' },
  { id: 'das', nome: 'DAS do MEI', icone: '🧾' },
  { id: 'divida', nome: 'Parcela de empréstimo', icone: '💳' },
  { id: 'divulgacao', nome: 'Divulgação', icone: '📣' },
  { id: 'outros', nome: 'Outros gastos do salão', icone: '📦' },
]

export const CONFIG_PADRAO: Config = {
  versao: 1,
  onboardingFeito: false,
  salarioMensal: 0,
  metaReserva: 100_000,
  reservaPorAtendimento: 500,
  gastoMensalEstimado: 60_000,
  // Taxas típicas de maquininha; a dona troca pelas taxas dela.
  taxas: { debito: 1.5, credito: 3.5, pix: 0 },
  // DAS 2026 para serviços: 5% do salário mínimo (R$ 1.621) + R$ 5 de ISS
  valorDAS: 8_605,
  dasPagos: [],
}

export function estadoInicial(): Estado {
  return {
    config: structuredClone(CONFIG_PADRAO),
    servicos: structuredClone(SERVICOS_PADRAO),
    categorias: structuredClone(CATEGORIAS_GASTO),
    lancamentos: [],
    fornecedores: [],
  }
}

export const NOMES_FORMA = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  debito: 'Débito',
  credito: 'Crédito',
} as const
