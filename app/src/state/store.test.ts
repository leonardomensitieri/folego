// Testes da camada de estado (vindos da crítica independente do gauntlet), com idb-keyval em memória.
import { beforeEach, describe, expect, it, vi } from 'vitest'

const banco = new Map<string, unknown>()
const ctl = { falharGet: 0, travarGet: false, falharGetDe: '' }
vi.mock('idb-keyval', () => ({
  createStore: () => 'store',
  get: async (k: string) => {
    if (ctl.travarGet) return new Promise(() => {}) // IndexedDB que trava sem dar erro
    if (ctl.falharGet > 0 || ctl.falharGetDe === k) {
      if (ctl.falharGet > 0) ctl.falharGet--
      throw new Error('UnknownError: Connection to Indexed Database server lost')
    }
    return structuredClone(banco.get(k))
  },
  set: async (k: string, v: unknown) => {
    banco.set(k, structuredClone(v))
  },
  del: async (k: string) => {
    banco.delete(k)
  },
}))

const ls = new Map<string, string>()
vi.stubGlobal('localStorage', { getItem: (k: string) => ls.get(k) ?? null, setItem: (k: string, v: string) => ls.set(k, v), removeItem: (k: string) => ls.delete(k) })
vi.stubGlobal('document', { documentElement: { classList: { toggle() {} } }, addEventListener() {}, visibilityState: 'visible' })
vi.stubGlobal('location', { hash: '', search: '', replace() {}, reload() {} })
vi.stubGlobal('window', { addEventListener() {}, scrollTo() {} })

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms))
const lanc = { data: '2026-11-03', tipo: 'entrada' as const, valor: 5000, taxa: 0, forma: 'pix' as const, categoria: 'corte', recebido: true }

async function abrirApp() {
  vi.resetModules()
  const s = await import('./store')
  await s.iniciar()
  return s
}

beforeEach(() => {
  banco.clear()
  ls.clear()
  ctl.falharGet = 0
  ctl.travarGet = false
  ctl.falharGetDe = ''
})

describe('persistência', () => {
  it('grava na hora: fechar o app 1 ms depois de anotar não perde nada', async () => {
    const s = await abrirApp()
    s.atualizarConfig({ onboardingFeito: true })
    s.adicionarLancamento(lanc)
    await espera(1)
    const salvo = banco.get('estado-real-v1') as { lancamentos: unknown[] }
    expect(salvo.lancamentos.length).toBe(1)
  })

  it('trocar para a demonstração logo depois de anotar não perde a anotação', async () => {
    const s = await abrirApp()
    s.atualizarConfig({ onboardingFeito: true })
    s.adicionarLancamento(lanc)
    await s.trocarModo('demo')
    await s.trocarModo('real')
    expect(s.estado.value.lancamentos.length).toBe(1)
    expect((banco.get('estado-real-v1') as { lancamentos: unknown[] }).lancamentos.length).toBe(1)
  })

  it('falha ao LER a memória: nada é gravado por cima dos dados reais', async () => {
    banco.set('estado-real-v1', { config: { onboardingFeito: true, versao: 1 }, servicos: [], categorias: [], fornecedores: [], lancamentos: [{ ...lanc, id: 'a', criadoEm: 1 }] })
    ctl.falharGet = 1
    const s = await abrirApp()
    expect(s.erroArmazenamento.value).not.toBeNull()
    expect(s.leituraFalhou.value).toBe(true)
    await s.trocarModo('demo')
    s.atualizarConfig({ onboardingFeito: true })
    await espera(5)
    const real = banco.get('estado-real-v1') as { lancamentos: unknown[] }
    expect(real.lancamentos.length, 'os dados reais foram sobrescritos').toBe(1)
  })

  it('dados guardados com a estrutura quebrada não são sobrescritos e ficam disponíveis para baixar', async () => {
    banco.set('estado-real-v1', { config: { onboardingFeito: true }, lancamentos: 'quebrado' })
    const s = await abrirApp()
    expect(s.leituraFalhou.value).toBe(true)
    expect(s.dadosComDefeito.value).not.toBeNull()
    s.atualizarConfig({ onboardingFeito: true })
    await espera(5)
    expect((banco.get('estado-real-v1') as { lancamentos: unknown }).lancamentos).toBe('quebrado')
  })

  it('um defeito pequeno nos dados é consertado campo a campo, e o original fica guardado à parte', async () => {
    const bom = { ...lanc, id: 'a', criadoEm: 1 }
    const estragado = { ...lanc, id: 'b', criadoEm: 2, valor: -5 }
    const original = { config: { onboardingFeito: true, dasPagos: null }, lancamentos: [bom, estragado] }
    banco.set('estado-real-v1', original)
    const s = await abrirApp()
    expect(s.leituraFalhou.value).toBe(false)
    expect(s.estado.value.lancamentos.map((l) => l.id)).toEqual(['a'])
    expect(s.estado.value.config.dasPagos).toEqual([])
    expect(s.dadosConsertados.value).toEqual({ separadas: 1, ajustes: 1 })
    expect(banco.get('estado-real-v1:como-estava')).toEqual(original)
    s.adicionarLancamento(lanc)
    await espera(5)
    expect((banco.get('estado-real-v1') as { lancamentos: unknown[] }).lancamentos).toHaveLength(2)
  })

  it('BLOQUEADOR: frase longa no "Escreva" e nome comprido não travam o app depois de recarregar', async () => {
    let s = await abrirApp()
    s.atualizarConfig({ onboardingFeito: true })
    s.adicionarLancamento({ ...lanc, tipo: 'saida', categoria: 'produtos', descricao: 'gastei 45 de shampoo ' + 'e mais um monte de coisa '.repeat(40) })
    s.adicionarLancamento({ ...lanc, recebido: false, forma: undefined, cliente: 'A'.repeat(61) })
    await espera(5)
    s = await abrirApp()
    expect(s.leituraFalhou.value).toBe(false)
    expect(s.estado.value.lancamentos).toHaveLength(2)
    expect(s.estado.value.lancamentos[0].descricao!.length).toBeLessThanOrEqual(500)
    expect(s.estado.value.lancamentos[1].cliente!.length).toBeLessThanOrEqual(60)
    // editar também corta
    s.atualizarLancamento(s.estado.value.lancamentos[0].id, { descricao: 'z'.repeat(2000) })
    expect(s.estado.value.lancamentos[0].descricao!.length).toBe(500)
  })

  it('dados antigos com texto comprido abrem normalmente (texto cortado)', async () => {
    banco.set('estado-real-v1', { config: { onboardingFeito: true }, lancamentos: [{ ...lanc, id: 'a', criadoEm: 1, descricao: 'x'.repeat(551) }] })
    const s = await abrirApp()
    expect(s.leituraFalhou.value).toBe(false)
    expect(s.estado.value.lancamentos[0].descricao).toHaveLength(500)
  })

  it('leitura que trava sem erro vira falha de leitura depois de alguns segundos', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    ctl.travarGet = true
    vi.resetModules()
    const s = await import('./store')
    const abrindo = s.iniciar()
    await vi.advanceTimersByTimeAsync(6000)
    await abrindo
    vi.useRealTimers()
    expect(s.carregado.value).toBe(true)
    expect(s.leituraFalhou.value).toBe(true)
    expect(s.erroArmazenamento.value).not.toBeNull()
  })

  it('"Apagar tudo" fica bloqueado enquanto a leitura falhou', async () => {
    banco.set('estado-real-v1', { config: { onboardingFeito: true }, lancamentos: [{ ...lanc, id: 'a', criadoEm: 1 }] })
    ctl.falharGet = 1
    const s = await abrirApp()
    expect(s.leituraFalhou.value).toBe(true)
    expect(await s.apagarTudoReal()).toBe(false)
    expect(banco.has('estado-real-v1')).toBe(true)
  })

  it('sai da demonstração mesmo se a gaveta da demonstração não abriu', async () => {
    banco.set('estado-real-v1', { config: { onboardingFeito: true }, lancamentos: [{ ...lanc, id: 'real', criadoEm: 1 }] })
    ls.set('folego:modo', 'demo')
    ctl.falharGetDe = 'estado-demo-v1'
    const s = await abrirApp()
    expect(s.modo.value).toBe('demo')
    expect(s.leituraFalhou.value).toBe(true)
    ctl.falharGetDe = ''
    await s.trocarModo('real')
    expect(s.modo.value).toBe('real')
    expect(s.leituraFalhou.value).toBe(false)
    expect(s.estado.value.lancamentos.map((l) => l.id)).toEqual(['real'])
  })

  it('só abrir a demonstração não cria a gaveta dos dados reais', async () => {
    let s = await abrirApp()
    await s.trocarModo('demo')
    expect(banco.has('estado-real-v1')).toBe(false)
    s = await abrirApp()
    expect(s.temDadosReais.value).toBe(false)
  })

  it('demonstração é refeita quando muda o dia (não fica velha)', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 3, 10, 0))
    ls.set('folego:modo', 'demo')
    let s = await abrirApp()
    s.adicionarLancamento({ ...lanc, data: '2026-11-03', descricao: 'mexi na demo' })
    await espera(5)
    s = await abrirApp()
    expect(s.estado.value.lancamentos.some((l) => l.descricao === 'mexi na demo'), 'mesmo dia: mantém').toBe(true)
    vi.setSystemTime(new Date(2026, 10, 25, 10, 0))
    s = await abrirApp()
    const lancs = s.estado.value.lancamentos
    vi.useRealTimers()
    expect(lancs.some((l) => l.descricao === 'mexi na demo'), 'outro dia: refeita').toBe(false)
    expect(lancs.some((l) => l.data === '2026-11-25')).toBe(true)
  })

  it('"Apagar todos os meus dados" não recria o registro', async () => {
    const s = await abrirApp()
    s.atualizarConfig({ onboardingFeito: true })
    s.adicionarLancamento(lanc)
    await espera(5)
    await s.apagarTudoReal()
    await espera(20)
    expect(banco.has('estado-real-v1')).toBe(false)
    expect(s.temDadosReais.value).toBe(false)
  })

  it('voltar uma cópia estando na demonstração é bloqueado (nunca mistura real e fictício)', async () => {
    const s = await abrirApp()
    await s.trocarModo('demo')
    const { gerarBackup } = await import('../domain/backup')
    const { estadoInicial } = await import('../domain/defaults')
    const e = estadoInicial()
    e.lancamentos = [{ ...lanc, id: 'meu-real', criadoEm: 1 }]
    expect(s.importarBackup(JSON.stringify(gerarBackup(e)))).not.toBeNull()
    expect(s.estado.value.lancamentos.some((l) => l.id === 'meu-real')).toBe(false)
  })

  it('o mês acompanha a virada com o app aberto', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 9, 31, 22, 0))
    const s = await abrirApp()
    expect(s.mesAtual.value).toBe('2026-10')
    vi.setSystemTime(new Date(2026, 10, 1, 8, 0))
    s.adicionarLancamento({ ...lanc, data: '2026-11-01' })
    const mes = s.mesAtual.value
    vi.useRealTimers()
    expect(mes).toBe('2026-11')
  })
})

describe('ações', () => {
  it('aviso: tocar "Guardar" mostra o aviso seguinte com "Desfazer"', async () => {
    vi.resetModules()
    const kit = await import('../ui/kit')
    kit.avisar('Corte R$ 50 anotado. Guardar R$ 5?', [
      { rotulo: 'Desfazer', fazer: () => {} },
      { rotulo: 'Guardar', fazer: () => kit.avisar('Guardado na reserva.', { rotulo: 'Desfazer', fazer: () => {} }) },
    ])
    const a = kit.aviso.value!
    expect(a.acoes.map((x) => x.rotulo)).toEqual(['Desfazer', 'Guardar'])
    // mesmo jeito do botão do aviso: some o aviso atual e depois roda a ação
    kit.aviso.value = null
    a.acoes[1].fazer()
    const atual = (): { texto: string } | null => kit.aviso.peek()
    expect(atual()?.texto).toBe('Guardado na reserva.')
  })

  it('não dá para tirar da reserva mais do que tem', async () => {
    const s = await abrirApp()
    const { saldoReserva } = await import('../domain/calc')
    s.adicionarLancamento({ data: '2026-11-03', tipo: 'reserva', valor: 1000, taxa: 0, categoria: 'reserva', recebido: true })
    s.adicionarLancamento({ data: '2026-11-03', tipo: 'resgate', valor: 5000, taxa: 0, categoria: 'resgate', recebido: true })
    expect(saldoReserva(s.estado.value.lancamentos)).toBe(0)
  })

  it('resgate com a reserva vazia é recusado (não cria anotação de R$ 0)', async () => {
    const s = await abrirApp()
    const r = s.adicionarLancamento({ data: '2026-11-03', tipo: 'resgate', valor: 5000, taxa: 0, categoria: 'resgate', recebido: true })
    expect(r).toBeNull()
    expect(s.estado.value.lancamentos).toHaveLength(0)
  })

  it('apagar ou diminuir um "Guardei" que já foi usado não deixa a reserva negativa', async () => {
    const s = await abrirApp()
    const { saldoReserva } = await import('../domain/calc')
    const g = s.adicionarLancamento({ data: '2026-11-03', tipo: 'reserva', valor: 10000, taxa: 0, categoria: 'reserva', recebido: true })!
    const r = s.adicionarLancamento({ data: '2026-11-03', tipo: 'resgate', valor: 8000, taxa: 0, categoria: 'resgate', recebido: true })!
    expect(s.removerLancamento(g.id)).toBeUndefined()
    expect(s.atualizarLancamento(g.id, { valor: 2000 })).toBe(false)
    expect(saldoReserva(s.estado.value.lancamentos)).toBe(2000)
    // mexer no resgate primeiro resolve
    expect(s.atualizarLancamento(r.id, { valor: 1000 })).toBe(true)
    expect(s.atualizarLancamento(g.id, { valor: 2000 })).toBe(true)
    expect(saldoReserva(s.estado.value.lancamentos)).toBe(1000)
  })

  it('fiado de outubro editado para Pix em novembro entra em novembro', async () => {
    const s = await abrirApp()
    const { recebidoEmAoEditar, resumoDoMes } = await import('../domain/calc')
    const f = s.adicionarLancamento({ data: '2026-10-20', tipo: 'entrada', valor: 18000, taxa: 0, categoria: 'alisamento', recebido: false, cliente: 'Ana' })!
    s.atualizarLancamento(f.id, { forma: 'pix', recebido: true, recebidoEm: recebidoEmAoEditar(f, false, '2026-11-03') })
    expect(resumoDoMes(s.estado.value.lancamentos, '2026-11').entrou).toBe(18000)
    expect(resumoDoMes(s.estado.value.lancamentos, '2026-10').entrou).toBe(0)
  })
})
