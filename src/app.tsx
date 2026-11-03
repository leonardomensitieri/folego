import { carregado, erroArmazenamento, estado, modo } from './state/store'
import { IcBalanca, IcCasa, IcLista, IcMais } from './ui/icons'
import { Toast } from './ui/kit'
import { ir, rota } from './ui/router'
import { Inicio } from './screens/Inicio'
import { Lancar } from './screens/Lancar'
import { Movimentos } from './screens/Movimentos'
import { Decidir, EditarServico } from './screens/Decidir'
import { Ajustes, Mais, Mensagens, Privacidade, Sobre } from './screens/Mais'
import { Reserva } from './screens/Reserva'
import { Fiado } from './screens/Fiado'
import { Fornecedores } from './screens/Fornecedores'
import { Mei, RelatorioMei } from './screens/Mei'
import { Backup } from './screens/Backup'
import { BoasVindas, Comecar } from './screens/Comecar'

const ABAS = [
  { id: '', rotulo: 'Início', Icone: IcCasa },
  { id: 'movimentos', rotulo: 'Movimentos', Icone: IcLista },
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
      return <Lancar key={`${b}-${c ?? ''}`} tipo={b} params={c} />
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
        default: return <Mais />
      }
    case 'comecar':
      return <Comecar passo={b ?? '1'} />
    default:
      return <Inicio />
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
      <a class="pular" href="#principal">Pular para o conteúdo</a>
      {modo.value === 'demo' && (
        <div class="faixa-demo" role="note">
          Demonstração com dados fictícios · <button class="link" onClick={() => ir('mais')}>sair</button>
        </div>
      )}
      {erroArmazenamento.value && <div class="faixa-erro" role="alert">{erroArmazenamento.value}</div>}
      <main id="principal">
        <Tela />
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
