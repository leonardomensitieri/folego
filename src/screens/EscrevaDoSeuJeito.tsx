import { useState } from 'preact/hooks'
import { acharFiado, competenciaDAS, fiadosAbertos, saldoReserva, taxaDaForma } from '../domain/calc'
import { LIMITES } from '../domain/backup'
import { dataCurta, hoje, nomeMesCurto } from '../domain/dates'
import { brl } from '../domain/money'
import { interpretar, type Interpretacao } from '../domain/parser'
import type { Lancamento } from '../domain/types'
import { adicionarLancamento, atualizarLancamento, estado, marcarRecebido, removerLancamento } from '../state/store'
import { IcTeclado } from '../ui/icons'
import { avisar } from '../ui/kit'
import { ir } from '../ui/router'
import { rascunho } from './Lancar'
import { nomeCategoria, nomeForma, ROTULO_TIPO, TEXTO_RESERVA_USADA } from '../ui/nomes'

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

  // "recebi o fiado da Ana": procura o fiado aberto dela (sem ligar para acento: "ines" acha "Inês")
  const fiadoAQuitar = lido?.quitarFiado ? acharFiado(fiadosAbertos(e.lancamentos), lido.descricao ?? '', lido.cliente) : undefined
  // resgate: só sai o que tem na reserva
  const naReserva = Math.max(0, saldoReserva(e.lancamentos))
  const valorFinal = lido?.valor != null && lido.tipo === 'resgate' ? Math.min(lido.valor, naReserva) : lido?.valor ?? null
  const ehDAS = lido?.tipo === 'saida' && lido.categoria === 'das'
  const competencia = ehDAS ? lido.competencia ?? competenciaDAS({ data: lido.data }) : undefined

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
    if (valorFinal === null || valorFinal <= 0) return
    const partes = lido.itens ?? [{ categoria: lido.categoria, valor: valorFinal, forma: lido.forma }]
    const guardarTexto = lido.categoria === 'outro-servico' || lido.tipo === 'saida'
    const novos = partes
      .map((p) =>
        adicionarLancamento({
          data: lido.data,
          tipo: lido.tipo,
          valor: p.valor,
          taxa: lido.tipo === 'entrada' && lido.recebido ? taxaDaForma(p.valor, p.forma, e.config.taxas) : 0,
          forma: lido.tipo === 'entrada' ? p.forma : undefined,
          categoria: p.categoria,
          cliente: lido.cliente,
          descricao: guardarTexto ? lido.descricao : undefined,
          recebido: lido.recebido,
          competencia,
        }),
      )
      .filter((n): n is Lancamento => n !== null)
    if (novos.length === 0) return
    setTexto('')
    setLido(null)
    avisar(novos.length > 1 ? `${novos.length} anotações feitas!` : 'Anotado!', {
      rotulo: 'Desfazer',
      fazer: () => {
        const desfeitos = novos.filter((n) => removerLancamento(n.id))
        if (desfeitos.length < novos.length) avisar(TEXTO_RESERVA_USADA)
      },
    })
  }

  function corrigir() {
    if (!lido) return
    // passa o rascunho em memória (não no endereço da página, que fica no histórico do navegador)
    rascunho.value = { valor: valorFinal, categoria: lido.categoria, forma: lido.forma, fiado: !lido.recebido, cliente: lido.cliente, data: lido.data, competencia }
    ir(`lancar/${lido.tipo}`)
  }

  const formasDiferentes = lido?.itens && new Set(lido.itens.map((i) => i.forma)).size > 1

  return (
    <div class="escreva">
      <form onSubmit={entender} class="escreva-form">
        <label for="escreva" class="campo-rotulo">
          <IcTeclado size={20} /> Escreva do seu jeito
        </label>
        <div class="escreva-linha">
          <input id="escreva" value={texto} placeholder="ex.: corte 50 pix" autoComplete="off" enterKeyHint="go" aria-describedby="escreva-dica"
            maxLength={LIMITES.descricao}
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
            ) : lido.tipo === 'resgate' && naReserva <= 0 ? (
              <>
                <p>A reserva está vazia, então não tem o que tirar dela.</p>
                <button class="btn" onClick={() => ir('mais/reserva')}>Ver a reserva</button>
              </>
            ) : valorFinal === null || valorFinal <= 0 ? (
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
                      <li><b>{ROTULO_TIPO[lido.tipo]}</b> · {nomeCategoria(e, { tipo: lido.tipo, categoria: i.categoria })} · <b>{brl(i.valor)}</b>{formasDiferentes && ` · ${nomeForma(i.forma)}`}</li>
                    ))}
                  </ul>
                ) : (
                  <p class="entendi-linha">
                    <b>{ROTULO_TIPO[lido.tipo]}</b> · {nomeCategoria(e, lido)}{competencia && ` de ${nomeMesCurto(competencia)}`} · <b>{brl(valorFinal)}</b>
                  </p>
                )}
                {lido.tipo === 'resgate' && lido.valor !== null && lido.valor > valorFinal && (
                  <p class="campo-dica">Você escreveu {brl(lido.valor)}, mas na reserva só tem {brl(naReserva)}. Vai sair {brl(valorFinal)}.</p>
                )}
                <p class="entendi-linha">
                  {lido.tipo === 'entrada' && !formasDiferentes && (lido.recebido ? nomeForma(lido.forma) : 'fiado')}
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
