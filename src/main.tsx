import { render } from 'preact'
import { registerSW } from 'virtual:pwa-register'
import { App } from './app'
import { iniciar } from './state/store'
import './styles.css'

iniciar()
render(<App />, document.getElementById('app')!)

registerSW({ immediate: true })
