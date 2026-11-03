import { render } from 'preact'
import { registerSW } from 'virtual:pwa-register'
import { App } from './app'
import { iniciar } from './state/store'
import { avisar } from './ui/kit'
import './styles.css'

iniciar()
render(<App />, document.getElementById('app')!)

const atualizar = registerSW({
  onNeedRefresh() {
    avisar('Há uma versão nova do app.', { rotulo: 'Atualizar', fazer: () => atualizar(true) }, 20000)
  },
})
