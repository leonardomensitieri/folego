import { signal } from '@preact/signals'
import { Nota, Pagina } from '../ui/kit'

// Android/Chrome oferece um evento para instalar com um toque; no iPhone é pelo menu Compartilhar.
interface PedidoInstalacao extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}
export const pedidoInstalacao = signal<PedidoInstalacao | null>(null)
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  pedidoInstalacao.value = e as PedidoInstalacao
})

export function estaInstalado(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

export function ehIphone(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export function Instalar() {
  const instalado = estaInstalado()
  const iphone = ehIphone()
  return (
    <Pagina titulo="Instalar no celular" voltarPara="mais">
      {instalado ? (
        <Nota tom="bom">O Fôlego já está instalado neste celular. 🎉</Nota>
      ) : (
        <Nota tom="alerta">Instale o app na tela inicial. Assim ele abre como aplicativo, funciona sem internet e o celular protege melhor os seus dados.</Nota>
      )}

      {pedidoInstalacao.value && !instalado && (
        <button class="btn btn-primario btn-largo" onClick={async () => {
          const p = pedidoInstalacao.value!
          await p.prompt()
          await p.userChoice
          pedidoInstalacao.value = null
        }}>Instalar agora</button>
      )}

      <div class="cartao">
        <h3>{iphone ? 'No iPhone (Safari)' : 'No iPhone'}</h3>
        <ol class="passos-lista">
          <li>Abra este endereço no <b>Safari</b>.</li>
          <li>Toque no botão <b>Compartilhar</b> (o quadrado com uma seta para cima).</li>
          <li>Role e toque em <b>Adicionar à Tela de Início</b>.</li>
          <li>Toque em <b>Adicionar</b>. O ícone do Fôlego aparece junto dos seus apps.</li>
        </ol>
      </div>
      <div class="cartao">
        <h3>No Android (Chrome)</h3>
        <ol class="passos-lista">
          <li>Toque nos <b>três pontinhos</b> no canto de cima.</li>
          <li>Toque em <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</li>
          <li>Confirme. Pronto.</li>
        </ol>
      </div>
      <Nota>Dica: depois de instalar, abra sempre pelo ícone. Os dados ficam guardados dentro do app instalado.</Nota>
    </Pagina>
  )
}
