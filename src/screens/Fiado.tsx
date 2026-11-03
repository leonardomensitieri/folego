import { fiadosAbertos, taxaDaForma } from '../domain/calc'
import { dataCurta, diasEntre, hoje } from '../domain/dates'
import type { Forma, Lancamento } from '../domain/types'
import { atualizarLancamento, estado, marcarRecebido } from '../state/store'
import { avisar, BotaoWhatsApp, Dinheiro, Nota, Pagina, Vazio } from '../ui/kit'
import { ir } from '../ui/router'
import { nomeCategoria } from '../ui/nomes'

/** Lembrete educado, sem serviço nem valor: a cliente já sabe, e assim o mínimo de dado sai do celular. */
export function mensagemCobranca(nome: string | undefined, data: string) {
  return `Oi${nome ? `, ${nome}` : ''}! Tudo bem? 😊 Passando para lembrar do pagamento do atendimento do dia ${dataCurta(data)}. Quando puder, pode ser por Pix. Obrigada!`
}

const FORMAS: { forma: Forma; rotulo: string }[] = [
  { forma: 'pix', rotulo: 'Pix' },
  { forma: 'dinheiro', rotulo: 'Dinheiro' },
  { forma: 'debito', rotulo: 'Débito' },
  { forma: 'credito', rotulo: 'Crédito' },
]

export function Fiado() {
  const e = estado.value
  const abertos = fiadosAbertos(e.lancamentos)
  const total = abertos.reduce((a, l) => a + l.valor, 0)

  function receber(l: Lancamento, forma: Forma) {
    const taxa = taxaDaForma(l.valor, forma, e.config.taxas)
    atualizarLancamento(l.id, { forma, taxa })
    marcarRecebido(l.id)
    avisar(`Pago! ${l.cliente ?? 'A cliente'} acertou o fiado.`, {
      rotulo: 'Desfazer',
      fazer: () => atualizarLancamento(l.id, { recebido: false, recebidoEm: undefined, taxa: 0, forma: undefined }),
    })
  }

  return (
    <Pagina titulo="Fiado" voltarPara="mais">
      {abertos.length === 0 ? (
        <Vazio titulo="Ninguém com fiado 🎉" texto="Quando uma cliente pedir para pagar depois, escolha “Fiado (paga depois)” ao anotar." />
      ) : (
        <>
          <p class="total-fiado">Fiado para receber: <b><Dinheiro v={total} /></b></p>
          <ul class="cartoes-fiado">
            {abertos.map((l) => {
              const dias = diasEntre(l.data, hoje())
              return (
                <li class="cartao fiado">
                  <div class="fiado-topo">
                    <b>{l.cliente ?? 'Cliente'}</b>
                    <Dinheiro v={l.valor} />
                  </div>
                  <p class="cartao-sub">{nomeCategoria(e, l)} · {dataCurta(l.data)} · {dias === 0 ? 'hoje' : dias === 1 ? 'há 1 dia' : `há ${dias} dias`}</p>
                  <BotaoWhatsApp texto={mensagemCobranca(l.cliente, l.data)} rotulo="Lembrar pelo WhatsApp" />
                  <p class="campo-rotulo">Já pagou? Toque em como pagou:</p>
                  <div class="fiado-pagou">
                    {FORMAS.map((f) => (
                      <button class="btn btn-pequeno" onClick={() => receber(l, f.forma)}>{f.rotulo}</button>
                    ))}
                  </div>
                  <button class="btn btn-pequeno btn-sutil" onClick={() => ir(`editar/${l.id}`)}>Mudar ou apagar</button>
                </li>
              )
            })}
          </ul>
          <Nota>A mensagem não leva valor nem serviço. Ela vai para o WhatsApp (empresa Meta) só quando você manda. O app não guarda telefone de ninguém.</Nota>
        </>
      )}
    </Pagina>
  )
}
