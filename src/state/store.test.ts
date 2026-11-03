// Testes da camada de estado (vindos da crítica independente do gauntlet), com idb-keyval em memória.
import { beforeEach, describe, expect, it, vi } from 'vitest'

const banco = new Map<string, unknown>()
const ctl = { falharGet: 0 }
vi.mock('idb-keyval', () => ({
  createStore: () => 'store',
  get: async (k: string) => {
    if (ctl.falharGet > 0) {
      ctl.falharGet--
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

  it('dados guardados com defeito não são sobrescritos e ficam disponíveis para baixar', async () => {
    banco.set('estado-real-v1', { config: { dasPagos: null }, lancamentos: [{ ...lanc, id: 'a', criadoEm: 1 }] })
    const s = await abrirApp()
    expect(s.leituraFalhou.value).toBe(true)
    expect(s.dadosComDefeito.value).not.toBeNull()
    s.atualizarConfig({ onboardingFeito: true })
    await espera(5)
    expect((banco.get('estado-real-v1') as { config: { dasPagos: unknown } }).config.dasPagos).toBeNull()
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

  it('fiado de outubro editado para Pix em novembro entra em novembro', async () => {
    const s = await abrirApp()
    const { recebidoEmAoEditar, resumoDoMes } = await import('../domain/calc')
    const f = s.adicionarLancamento({ data: '2026-10-20', tipo: 'entrada', valor: 18000, taxa: 0, categoria: 'alisamento', recebido: false, cliente: 'Ana' })
    s.atualizarLancamento(f.id, { forma: 'pix', recebido: true, recebidoEm: recebidoEmAoEditar(f, false, '2026-11-03') })
    expect(resumoDoMes(s.estado.value.lancamentos, '2026-11').entrou).toBe(18000)
    expect(resumoDoMes(s.estado.value.lancamentos, '2026-10').entrou).toBe(0)
  })
})
