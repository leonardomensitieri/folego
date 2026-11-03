import { Component, type ComponentChildren } from 'preact'
import { carregado, dadosComDefeito, dadosConsertados, erroArmazenamento, estado, leituraFalhou, modo, tentarDeNovo, trocarModo } from './state/store'
import { gerarBackup } from './domain/backup'
import { IcBalanca, IcCasa, IcLista, IcMais } from './ui/icons'
import { Toast } from './ui/kit'
import { ir, rota } from './ui/router'
import { Inicio } from './screens/Inicio'
import { Lancar } from './screens/Lancar'
import { Movimentos } from './screens/Movimentos'
import { Decidir, EditarServico } from './screens/Decidir'
import { Ajustes, Mais, Mensagens, Plano30, Privacidade, Sobre } from './screens/Mais'
import { Reserva } from './screens/Reserva'
import { Fiado } from './screens/Fiado'
import { Fornecedores } from './screens/Fornecedores'
import { Mei, RelatorioMei } from './screens/Mei'
import { Backup } from './screens/Backup'
import { BoasVindas, Comecar } from './screens/Comecar'
import { Instalar } from './screens/Instalar'

const ABAS = [
  { id: '', rotulo: 'Início', Icone: IcCasa },
  { id: 'movimentos', rotulo: 'Meu mês', Icone: IcLista },
  { id: 'decidir', rotulo: 'Decidir', Icone: IcBalanca },
  { id: 'mais', rotulo: 'Mais', Icone: IcMais },
]

function Tela() {
  const [a, b, c] = rota.value
  const e = estado.value
  if (!e.config.onboardingFeito && modo.value === 'real') {
    if (a === 'comecar') return <Comecar passo={b ?? '1'} />
    return <BoasVindas />
  }
  switch (a) {
    case undefined:
    case '':
      return <Inicio />
    case 'lancar':
      return <Lancar key={`novo-${b}`} tipo={b} />
    case 'editar':
      return <Lancar key={`ed-${b}`} editarId={b} />
    case 'movimentos':
      return <Movimentos mes={b} />
    case 'decidir':
      return <Decidir />
    case 'servico':
      return <EditarServico key={b} id={b ?? 'novo'} />
    case 'mei':
      return b === 'relatorio' ? <RelatorioMei mes={c ?? ''} /> : <Mei />
    case 'mais':
      switch (b) {
        case 'reserva': return <Reserva />
        case 'fiado': return <Fiado />
        case 'fornecedores': return <Fornecedores />
        case 'mei': return <Mei />
        case 'mensagens': return <Mensagens />
        case 'backup': return <Backup />
        case 'ajustes': return <Ajustes />
        case 'privacidade': return <Privacidade />
        case 'sobre': return <Sobre />
        case 'instalar': return <Instalar />
        case 'plano': return <Plano30 />
        default: return <Mais />
      }
    case 'comecar':
      return <Comecar passo={b ?? '1'} />
    default:
      return <Inicio />
  }
}

function baixarComoEsta() {
  const bruto = dadosComDefeito.value ?? estado.value
  const blob = new Blob([JSON.stringify(dadosComDefeito.value ? { formato: 'folego-dados-com-defeito', estado: bruto } : gerarBackup(estado.value))], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'folego-dados-como-estao.json'
  a.click()
}

function textoConserto({ separadas, ajustes }: { separadas: number; ajustes: number }) {
  const partes = [
    separadas === 1 ? '1 anotação guardada estava com defeito e ficou de fora.' : separadas > 1 ? `${separadas} anotações guardadas estavam com defeito e ficaram de fora.` : '',
    ajustes > 0 ? 'Algum ajuste estava com defeito e voltou ao normal; confira em Mais → Ajustes.' : '',
  ]
  return partes.filter(Boolean).join(' ')
}

/** Se alguma tela quebrar, mostra saídas em vez de uma tela branca. */
class Protecao extends Component<{ children: ComponentChildren }, { erro: boolean }> {
  state = { erro: false }
  static getDerivedStateFromError() {
    return { erro: true }
  }
  componentDidCatch(err: unknown) {
    console.error('[Fôlego] erro de tela', err)
  }
  render() {
    if (!this.state.erro) return this.props.children
    return (
      <section class="pagina">
        <div class="conteudo">
          <h1>Algo deu errado nesta tela</h1>
          <p class="intro">Seus dados não foram apagados. Tente voltar para o início. Se continuar, baixe uma cópia dos dados.</p>
          <button class="btn btn-primario btn-largo" onClick={() => { location.hash = '#/'; this.setState({ erro: false }) }}>Voltar para o início</button>
          <button class="btn btn-largo" onClick={baixarComoEsta}>Baixar uma cópia dos dados</button>
          <button class="btn btn-largo" onClick={() => location.reload()}>Recarregar o app</button>
        </div>
      </section>
    )
  }
}

export function App() {
  const [a] = rota.value
  const abaAtiva = a === 'movimentos' || a === 'decidir' || a === 'mais' ? a : a === 'servico' ? 'decidir' : a === 'mei' ? 'mais' : ''
  const configurado = estado.value.config.onboardingFeito || modo.value === 'demo'
  const mostrarAbas = carregado.value && configurado && a !== 'lancar' && a !== 'editar' && a !== 'comecar'

  if (!carregado.value) {
    return <div class="carregando" aria-busy="true">Abrindo…</div>
  }

  return (
    <div class={`app ${modo.value === 'demo' ? 'em-demo' : ''} ${mostrarAbas ? 'com-abas' : ''}`}>
      <a class="pular" href="#/" onClick={(ev) => { ev.preventDefault(); const m = document.getElementById('principal'); if (m) { m.tabIndex = -1; m.focus() } }}>Pular para o conteúdo</a>
      {modo.value === 'demo' && (
        <div class="faixa-demo" role="note">
          <span>Exemplo com dados fictícios</span>
          <button class="btn-faixa" onClick={() => trocarModo('real').then(() => ir('', { substituir: true }))}>Sair do exemplo</button>
        </div>
      )}
      {erroArmazenamento.value && (
        <div class="faixa-erro" role="alert">
          <p>{erroArmazenamento.value}</p>
          {leituraFalhou.value && (
            <div class="faixa-acoes">
              <button class="btn btn-pequeno" onClick={tentarDeNovo}>Tentar de novo</button>
              {dadosComDefeito.value !== null && <button class="btn btn-pequeno" onClick={baixarComoEsta}>Baixar dados como estão</button>}
            </div>
          )}
        </div>
      )}
      {!erroArmazenamento.value && dadosConsertados.value && (
        <div class="faixa-erro" role="alert">
          <p>{textoConserto(dadosConsertados.value)} O resto abriu normalmente. Uma cópia de como estava ficou guardada no celular.</p>
          <div class="faixa-acoes">
            <button class="btn btn-pequeno" onClick={baixarComoEsta}>Baixar como estava</button>
            <button class="btn btn-pequeno" onClick={() => (dadosConsertados.value = null)}>Entendi</button>
          </div>
        </div>
      )}
      <main id="principal">
        <Protecao>
          <Tela />
        </Protecao>
      </main>
      {mostrarAbas && (
        <nav class="abas" aria-label="Seções do app">
          {ABAS.map(({ id, rotulo, Icone }) => (
            <button class={abaAtiva === id ? 'ativa' : ''} aria-current={abaAtiva === id ? 'page' : undefined} onClick={() => ir(id, { substituir: true })}>
              <Icone />
              <span>{rotulo}</span>
            </button>
          ))}
        </nav>
      )}
      <Toast />
    </div>
  )
}
