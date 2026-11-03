import { diasEntre, dataCurta, hoje } from '../domain/dates'
import { brl } from '../domain/money'
import type { Lancamento } from '../domain/types'
import { atualizarLancamento, estado, marcarRecebido } from '../state/store'
import { avisar, Dinheiro, linkWhatsApp, Nota, Pagina, Vazio } from '../ui/kit'
import { ir } from '../ui/router'
import { nomeCategoria } from '../ui/nomes'
import { fiadosAbertos, taxaDaForma } from '../domain/calc'
import type { Forma } from '../domain/types'

export function mensagemCobranca(nome: string | undefined, servico: string, data: string, valor: number) {
  return `Oi${nome ? `, ${nome}` : ''}! Tudo bem? 😊 Passando para lembrar do ${servico.toLowerCase()} do dia ${dataCurta(data)}, no valor de ${brl(valor)}. Quando puder, pode ser por Pix. Obrigada!`
}

export function Fiado() {
  const e = estado.value
  const abertos = fiadosAbertos(e.lancamentos)
  const total = abertos.reduce((a, l) => a + l.valor, 0)

  function receber(l: Lancamento, forma: Forma) {
    const taxa = taxaDaForma(l.valor, forma, e.config.taxas)
    atualizarLancamento(l.id, { forma, taxa })
    marcarRecebido(l.id)
    avisar(`Recebido de ${l.cliente ?? 'cliente'}!`, { rotulo: 'Desfazer', fazer: () => atualizarLancamento(l.id, { recebido: false, recebidoEm: undefined, taxa: 0, forma: undefined }) })
  }

  return (
    <Pagina titulo="A receber (fiado)" voltarPara="mais">
      {abertos.length === 0 ? (
        <Vazio titulo="Ninguém devendo 🎉" texto="Quando uma cliente pedir para pagar depois, escolha “Vai pagar depois” ao lançar." />
      ) : (
        <>
          <p class="total-fiado">Total a receber: <b><Dinheiro v={total} /></b></p>
          <ul class="cartoes-fiado">
            {abertos.map((l) => {
              const dias = diasEntre(l.data, hoje())
              const servico = nomeCategoria(e, l)
              return (
                <li class="cartao fiado">
                  <div class="fiado-topo">
                    <b>{l.cliente ?? 'Cliente'}</b>
                    <Dinheiro v={l.valor} />
                  </div>
                  <p class="cartao-sub">{servico} · {dataCurta(l.data)} · {dias === 0 ? 'hoje' : dias === 1 ? 'há 1 dia' : `há ${dias} dias`}</p>
                  <div class="fiado-acoes">
                    <a class="btn btn-whats" href={linkWhatsApp(mensagemCobranca(l.cliente, servico, l.data, l.valor))} target="_blank" rel="noopener noreferrer">
                      Lembrar no WhatsApp
                    </a>
                  </div>
                  <p class="campo-rotulo">Ela pagou? Como:</p>
                  <div class="fiado-pagou">
                    {(['pix', 'dinheiro', 'debito', 'credito'] as Forma[]).map((f) => (
                      <button class="btn btn-pequeno" onClick={() => receber(l, f)}>
                        {f === 'pix' ? 'Pix' : f === 'dinheiro' ? 'Dinheiro' : f === 'debito' ? 'Débito' : 'Crédito'}
                      </button>
                    ))}
                  </div>
                  <button class="link" onClick={() => ir(`editar/${l.id}`)}>Editar ou apagar</button>
                </li>
              )
            })}
          </ul>
          <Nota>O WhatsApp abre com a mensagem pronta e você escolhe o contato. O app não guarda telefone de ninguém.</Nota>
        </>
      )}
    </Pagina>
  )
}
