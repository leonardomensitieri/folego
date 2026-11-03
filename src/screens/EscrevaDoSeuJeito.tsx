import { useState } from 'preact/hooks'
import { taxaDaForma } from '../domain/calc'
import { hoje } from '../domain/dates'
import { brl } from '../domain/money'
import { interpretar, type Interpretacao } from '../domain/parser'
import { adicionarLancamento, estado, removerLancamento } from '../state/store'
import { IcTeclado } from '../ui/icons'
import { avisar } from '../ui/kit'
import { ir } from '../ui/router'
import { nomeCategoria, nomeForma, ROTULO_TIPO } from '../ui/nomes'

/**
 * Lançar escrevendo (ou ditando pelo microfone do teclado) uma frase curta.
 * A interpretação acontece no próprio celular e sempre aparece para conferir antes de salvar.
 */
export function EscrevaDoSeuJeito() {
  const [texto, setTexto] = useState('')
  const [lido, setLido] = useState<Interpretacao | null>(null)
  const e = estado.value

  function entender(ev: Event) {
    ev.preventDefault()
    if (!texto.trim()) return
    setLido(interpretar(texto, e.servicos, e.categorias))
  }

  function salvar() {
    if (!lido || lido.valor === null) return
    const taxa = lido.tipo === 'entrada' && lido.recebido ? taxaDaForma(lido.valor, lido.forma, e.config.taxas) : 0
    const novo = adicionarLancamento({
      data: hoje(),
      tipo: lido.tipo,
      valor: lido.valor,
      taxa,
      forma: lido.tipo === 'entrada' ? lido.forma : undefined,
      categoria: lido.categoria,
      cliente: lido.cliente,
      recebido: lido.recebido,
    })
    setTexto('')
    setLido(null)
    avisar('Salvo!', { rotulo: 'Desfazer', fazer: () => removerLancamento(novo.id) })
  }

  function corrigir() {
    if (!lido) return
    const params = new URLSearchParams()
    if (lido.valor !== null) params.set('valor', String(lido.valor))
    params.set('categoria', lido.categoria)
    if (lido.forma) params.set('forma', lido.forma)
    if (!lido.recebido) params.set('fiado', '1')
    if (lido.cliente) params.set('cliente', lido.cliente)
    ir(`lancar/${lido.tipo}/${params.toString()}`)
  }

  return (
    <div class="escreva">
      <form onSubmit={entender} class="escreva-form">
        <label for="escreva" class="campo-rotulo">
          <IcTeclado size={20} /> Escreva do seu jeito
        </label>
        <div class="escreva-linha">
          <input id="escreva" value={texto} placeholder="ex.: corte 50 pix" autoComplete="off" enterKeyHint="go"
            onInput={(ev) => { setTexto((ev.currentTarget as HTMLInputElement).value); setLido(null) }} />
          <button type="submit" class="btn btn-primario" disabled={!texto.trim()}>OK</button>
        </div>
        <p class="campo-dica">Dá para usar o microfone do teclado. Tudo fica só no seu celular.</p>
      </form>

      {lido && (
        <div class="entendi" role="status">
          {lido.valor === null ? (
            <>
              <p>Não achei o valor. Escreva com o número, por exemplo: <b>“{texto} 50”</b>.</p>
              <button class="btn" onClick={corrigir}>Lançar pelo formulário</button>
            </>
          ) : (
            <>
              <p class="entendi-titulo">Entendi assim:</p>
              <p class="entendi-linha">
                <b>{ROTULO_TIPO[lido.tipo]}</b> · {nomeCategoria(e, lido)} · <b>{brl(lido.valor)}</b>
                {lido.tipo === 'entrada' && (lido.recebido ? ` · ${nomeForma(lido.forma)}` : ' · fiado')}
                {lido.cliente && ` · ${lido.cliente}`}
              </p>
              <div class="entendi-acoes">
                <button class="btn btn-primario" onClick={salvar}>Salvar</button>
                <button class="btn" onClick={corrigir}>Corrigir</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
