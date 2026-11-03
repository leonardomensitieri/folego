import { useState } from 'preact/hooks'
import { fiadosAbertos, taxaDaForma } from '../domain/calc'
import { dataCurta, hoje } from '../domain/dates'
import { brl } from '../domain/money'
import { interpretar, type Interpretacao } from '../domain/parser'
import { adicionarLancamento, atualizarLancamento, estado, marcarRecebido, removerLancamento } from '../state/store'
import { IcTeclado } from '../ui/icons'
import { avisar } from '../ui/kit'
import { ir } from '../ui/router'
import { rascunho } from './Lancar'
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

  // "recebi o fiado da Ana": procura o fiado aberto dela
  const fiadoAQuitar = lido?.quitarFiado
    ? fiadosAbertos(e.lancamentos).find((l) => lido.cliente && l.cliente?.toLowerCase() === lido.cliente.toLowerCase())
    : undefined

  function salvar() {
    if (!lido) return
    if (lido.quitarFiado) {
      if (!fiadoAQuitar) return
      const forma = lido.forma ?? 'pix'
      atualizarLancamento(fiadoAQuitar.id, { forma, taxa: taxaDaForma(fiadoAQuitar.valor, forma, e.config.taxas) })
      marcarRecebido(fiadoAQuitar.id, lido.data)
      setTexto('')
      setLido(null)
      avisar(`Fiado de ${fiadoAQuitar.cliente} marcado como pago.`, {
        rotulo: 'Desfazer',
        fazer: () => atualizarLancamento(fiadoAQuitar.id, { recebido: false, recebidoEm: undefined, taxa: 0, forma: undefined }),
      })
      return
    }
    if (lido.valor === null) return
    const partes = lido.itens ?? [{ categoria: lido.categoria, valor: lido.valor }]
    const guardarTexto = lido.categoria === 'outro-servico' || lido.tipo === 'saida'
    const novos = partes.map((p) =>
      adicionarLancamento({
        data: lido.data,
        tipo: lido.tipo,
        valor: p.valor,
        taxa: lido.tipo === 'entrada' && lido.recebido ? taxaDaForma(p.valor, lido.forma, e.config.taxas) : 0,
        forma: lido.tipo === 'entrada' ? lido.forma : undefined,
        categoria: p.categoria,
        cliente: lido.cliente,
        descricao: guardarTexto ? lido.descricao : undefined,
        recebido: lido.recebido,
      }),
    )
    setTexto('')
    setLido(null)
    avisar(novos.length > 1 ? `${novos.length} anotações feitas!` : 'Anotado!', { rotulo: 'Desfazer', fazer: () => novos.forEach((n) => removerLancamento(n.id)) })
  }

  function corrigir() {
    if (!lido) return
    // passa o rascunho em memória (não no endereço da página, que fica no histórico do navegador)
    rascunho.value = { valor: lido.valor, categoria: lido.categoria, forma: lido.forma, fiado: !lido.recebido, cliente: lido.cliente }
    ir(`lancar/${lido.tipo}`)
  }

  return (
    <div class="escreva">
      <form onSubmit={entender} class="escreva-form">
        <label for="escreva" class="campo-rotulo">
          <IcTeclado size={20} /> Escreva do seu jeito
        </label>
        <div class="escreva-linha">
          <input id="escreva" value={texto} placeholder="ex.: corte 50 pix" autoComplete="off" enterKeyHint="go" aria-describedby="escreva-dica"
            onInput={(ev) => { setTexto((ev.currentTarget as HTMLInputElement).value); setLido(null) }} />
          <button type="submit" class="btn btn-primario" disabled={!texto.trim()}>OK</button>
        </div>
        <p class="campo-dica" id="escreva-dica">Pode usar o microfone do teclado. O Fôlego guarda tudo só no seu celular, mas o teclado pode mandar a sua voz para o Google ou a Apple para virar texto.</p>
      </form>

      <div role="status" aria-live="polite">
        {lido && (
          <div class="entendi">
            {lido.quitarFiado ? (
              fiadoAQuitar ? (
                <>
                  <p class="entendi-titulo">Entendi assim:</p>
                  <p class="entendi-linha">
                    <b>{fiadoAQuitar.cliente}</b> pagou o fiado de <b>{brl(fiadoAQuitar.valor)}</b> ({nomeCategoria(e, fiadoAQuitar)}, {dataCurta(fiadoAQuitar.data)}) · {nomeForma(lido.forma ?? 'pix')}
                  </p>
                  {lido.valor !== null && lido.valor !== fiadoAQuitar.valor && (
                    <p class="campo-dica">Atenção: você escreveu {brl(lido.valor)}, mas o fiado é de {brl(fiadoAQuitar.valor)}. Para mudar o valor, use “Fiado” no menu Mais.</p>
                  )}
                  <div class="entendi-acoes">
                    <button class="btn btn-primario" onClick={salvar}>Marcar como pago</button>
                    <button class="btn" onClick={() => ir('mais/fiado')}>Ver o fiado</button>
                  </div>
                </>
              ) : (
                <>
                  <p>Não achei fiado aberto {lido.cliente ? <>de <b>{lido.cliente}</b></> : 'com esse nome'}.</p>
                  <button class="btn" onClick={() => ir('mais/fiado')}>Ver a lista de fiado</button>
                </>
              )
            ) : lido.valor === null ? (
              <>
                <p>Não achei o valor. Escreva com o número, por exemplo: <b>“{texto} 50”</b>.</p>
                <button class="btn" onClick={corrigir}>Anotar pelo formulário</button>
              </>
            ) : (
              <>
                <p class="entendi-titulo">Entendi assim:</p>
                {lido.itens ? (
                  <ul class="entendi-itens">
                    {lido.itens.map((i) => (
                      <li><b>{ROTULO_TIPO[lido.tipo]}</b> · {nomeCategoria(e, { tipo: lido.tipo, categoria: i.categoria })} · <b>{brl(i.valor)}</b></li>
                    ))}
                  </ul>
                ) : (
                  <p class="entendi-linha">
                    <b>{ROTULO_TIPO[lido.tipo]}</b> · {nomeCategoria(e, lido)} · <b>{brl(lido.valor)}</b>
                  </p>
                )}
                <p class="entendi-linha">
                  {lido.tipo === 'entrada' && (lido.recebido ? nomeForma(lido.forma) : 'fiado')}
                  {lido.cliente && ` · ${lido.cliente}`}
                  {lido.data !== hoje() && ` · ${dataCurta(lido.data)}`}
                </p>
                <div class="entendi-acoes">
                  <button class="btn btn-primario" onClick={salvar}>Salvar</button>
                  {!lido.itens && <button class="btn" onClick={corrigir}>Corrigir</button>}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
