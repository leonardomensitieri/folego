import { signal } from '@preact/signals'

/** Navegação por "#/caminho": o botão voltar do celular funciona sem configuração no servidor. */
export const rota = signal(lerRota())

// quantas telas foram abertas dentro do app (para o "voltar" não sair do app sem querer)
let profundidade = 0

function lerRota(): string[] {
  const h = location.hash.replace(/^#\/?/, '')
  return h ? h.split('/').map(decodeURIComponent) : []
}

window.addEventListener('hashchange', () => {
  rota.value = lerRota()
  window.scrollTo(0, 0)
})

export function ir(caminho: string, opcoes: { substituir?: boolean } = {}) {
  const alvo = '#/' + caminho.replace(/^\/+/, '')
  if (location.hash === alvo) {
    rota.value = lerRota()
    return
  }
  if (opcoes.substituir) {
    location.replace(alvo)
  } else {
    profundidade++
    location.hash = alvo
  }
}

export function voltar(padrao = '') {
  if (profundidade > 0) {
    profundidade--
    history.back()
  } else {
    ir(padrao, { substituir: true })
  }
}
