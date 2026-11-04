import { render } from 'preact'
import { registerSW } from 'virtual:pwa-register'
import { App } from './app'
import { iniciar } from './state/store'
import { aviso, avisar } from './ui/kit'
import './styles.css'

iniciar()
render(<App />, document.getElementById('app')!)

// Versão nova: avisa e deixa ela escolher a hora (nada recarrega no meio de uma anotação).
// Se não tocar, a versão nova entra sozinha da próxima vez que o app for fechado e aberto.
let versaoNova = false
const mostrarVersaoNova = () => avisar('Versão nova do Fôlego pronta.', { rotulo: 'Atualizar', fazer: () => atualizar(true) }, 60_000)
const atualizar = registerSW({
  immediate: true,
  onNeedRefresh() {
    versaoNova = true
    mostrarVersaoNova()
  },
})
// se outro aviso tomou o lugar, lembra de novo quando ela voltar ao app
document.addEventListener('visibilitychange', () => {
  if (versaoNova && document.visibilityState === 'visible' && !aviso.peek()) mostrarVersaoNova()
})
