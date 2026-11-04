import { useState } from 'preact/hooks'
import { fiadosAbertos, taxaDaForma } from '../domain/calc'
import { dataCurta, diasEntre, hoje } from '../domain/dates'
import type { Forma, Lancamento } from '../domain/types'
import { atualizarLancamento, estado, marcarRecebido } from '../state/store'
import { avisar, Dinheiro, enviarTexto, Nota, Pagina, Vazio } from '../ui/kit'
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

function ItemFiado({ l }: { l: Lancamento }) {
  const e = estado.value
  const [aberto, setAberto] = useState<'pagou' | 'lembrar' | null>(null)
  const dias = diasEntre(l.data, hoje())
  // mais de uma semana: vira selo "Atrasado · 12 dias" (mesmo critério de antes)
  const atrasado = dias > 7
  const texto = mensagemCobranca(l.cliente, l.data)

  function receber(forma: Forma) {
    atualizarLancamento(l.id, { forma, taxa: taxaDaForma(l.valor, forma, e.config.taxas) })
    marcarRecebido(l.id)
    avisar(`Pago! ${l.cliente ?? 'A cliente'} acertou o fiado.`, {
      rotulo: 'Desfazer',
      fazer: () => atualizarLancamento(l.id, { recebido: false, recebidoEm: undefined, taxa: 0, forma: undefined }),
    })
  }

  return (
    <li class="fiado-item">
      <div class="fiado-linha">
        <span class="fiado-quem">
          <b>{l.cliente ?? 'Cliente'}</b>
          <small>{nomeCategoria(e, l)} · {dataCurta(l.data)}{!atrasado && ` · ${dias === 0 ? 'hoje' : dias === 1 ? 'há 1 dia' : `há ${dias} dias`}`}</small>
          {atrasado && <span class="selo-atraso">Atrasado · {dias} dias</span>}
        </span>
        <Dinheiro v={l.valor} class="fiado-valor" />
      </div>
      <div class="fiado-botoes">
        <button class="btn btn-pequeno btn-primario" aria-expanded={aberto === 'lembrar'} onClick={() => setAberto(aberto === 'lembrar' ? null : 'lembrar')}>Lembrar pelo WhatsApp</button>
        <button class="btn btn-pequeno btn-contorno" aria-expanded={aberto === 'pagou'} onClick={() => setAberto(aberto === 'pagou' ? null : 'pagou')}>Ela pagou</button>
      </div>
      {aberto === 'lembrar' && (
        <div class="fiado-painel">
          <p class="campo-rotulo">A mensagem vai assim:</p>
          <p class="mensagem-previa">{texto}</p>
          <button class="btn btn-whats btn-largo" onClick={() => enviarTexto(texto)}>Mandar pelo WhatsApp</button>
        </div>
      )}
      {aberto === 'pagou' && (
        <div class="fiado-painel">
          <p class="campo-rotulo">Como ela pagou?</p>
          <div class="fiado-pagou">
            {FORMAS.map((f) => <button class="btn btn-pequeno" onClick={() => receber(f.forma)}>{f.rotulo}</button>)}
          </div>
          <button class="btn btn-pequeno btn-sutil" onClick={() => ir(`editar/${l.id}`)}>Pagou outro valor? Mudar a anotação</button>
        </div>
      )}
    </li>
  )
}

export function Fiado() {
  const e = estado.value
  const abertos = fiadosAbertos(e.lancamentos)
  const total = abertos.reduce((a, l) => a + l.valor, 0)

  return (
    <Pagina titulo="Fiado" voltarPara="mais">
      {abertos.length === 0 ? (
        <Vazio titulo="Ninguém com fiado" texto="Quando uma cliente pedir para pagar depois, escolha “Fiado” ao anotar." />
      ) : (
        <>
          <div class="cartao destaque">
            <p class="destaque-rotulo">Fiado para receber</p>
            <p class="destaque-valor"><Dinheiro v={total} /></p>
            <p class="cartao-sub">{abertos.length === 1 ? '1 cliente vai pagar depois.' : `${abertos.length} clientes vão pagar depois.`}</p>
          </div>
          <ul class="lista fiado-lista">
            {abertos.map((l) => <ItemFiado key={l.id} l={l} />)}
          </ul>
          <Nota>A mensagem não leva valor nem serviço. Ela vai para o WhatsApp (empresa Meta) só quando você manda. O app não guarda telefone de ninguém.</Nota>
        </>
      )}
    </Pagina>
  )
}
