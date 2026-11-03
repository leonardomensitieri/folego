import { useState } from 'preact/hooks'
import { taxaDaForma } from '../domain/calc'
import { diasEntre, hoje } from '../domain/dates'
import { brl, brlCurto } from '../domain/money'
import type { Forma, Servico } from '../domain/types'
import { adicionarLancamento, estado, removerLancamento } from '../state/store'
import { avisar } from '../ui/kit'

/** Os serviços mais feitos nos últimos 60 dias (ou os primeiros da lista, no começo). */
function maisUsados(servicos: Servico[], limite = 4): Servico[] {
  const e = estado.value
  const conta = new Map<string, number>()
  for (const l of e.lancamentos) {
    if (l.tipo === 'entrada' && diasEntre(l.data, hoje()) <= 60) conta.set(l.categoria, (conta.get(l.categoria) ?? 0) + 1)
  }
  const escolhidos = new Set([...servicos].sort((a, b) => (conta.get(b.id) ?? 0) - (conta.get(a.id) ?? 0)).slice(0, limite).map((s) => s.id))
  // a ordem na tela é sempre a da lista de serviços: o botão não muda de lugar depois de um lançamento
  return servicos.filter((s) => escolhidos.has(s.id))
}

const FORMAS: { forma: Forma | 'fiado'; rotulo: string }[] = [
  { forma: 'pix', rotulo: 'Pix' },
  { forma: 'dinheiro', rotulo: 'Dinheiro' },
  { forma: 'debito', rotulo: 'Débito' },
  { forma: 'credito', rotulo: 'Crédito' },
  { forma: 'fiado', rotulo: 'Fiado · paga depois' },
]

/**
 * Atalho da tela inicial: toque no serviço e toque em como pagou — pronto, salvo (com desfazer).
 * É o caminho mais curto para o lançamento mais comum do dia.
 */
export function AtendimentoRapido() {
  const e = estado.value
  const servicos = maisUsados(e.servicos.filter((s) => s.ativo))
  const [aberto, setAberto] = useState<Servico | null>(null)
  const [pedindoNome, setPedindoNome] = useState(false)
  const [nome, setNome] = useState('')

  if (servicos.length === 0) return null

  function salvar(s: Servico, forma: Forma | 'fiado', cliente?: string) {
    const fiado = forma === 'fiado'
    const novo = adicionarLancamento({
      data: hoje(),
      tipo: 'entrada',
      valor: s.preco,
      taxa: fiado ? 0 : taxaDaForma(s.preco, forma, e.config.taxas),
      forma: fiado ? undefined : forma,
      categoria: s.id,
      cliente: cliente?.trim() || undefined,
      recebido: !fiado,
    })
    setAberto(null)
    setPedindoNome(false)
    setNome('')
    const sugerir = !fiado && e.config.reservaPorAtendimento > 0
    const desfazer = { rotulo: 'Desfazer', fazer: () => removerLancamento(novo.id) }
    avisar(
      `Anotado: ${s.nome}, ${brlCurto(s.preco)}${fiado ? ' (fiado)' : ''}.${sugerir ? ` Guardar ${brlCurto(e.config.reservaPorAtendimento)}?` : ''}`,
      sugerir
        ? [desfazer, {
            rotulo: 'Guardar',
            fazer: () => {
              const r = adicionarLancamento({ data: hoje(), tipo: 'reserva', valor: e.config.reservaPorAtendimento, taxa: 0, categoria: 'reserva', recebido: true })
              avisar('Guardado na reserva.', { rotulo: 'Desfazer', fazer: () => removerLancamento(r.id) })
            },
          }]
        : desfazer,
    )
  }

  return (
    <section class="rapido" aria-labelledby="rapido-titulo">
      <h2 class="secao" id="rapido-titulo">Atendimento rápido</h2>
      <div class="rapido-servicos">
        {servicos.map((s) => (
          <button class={`opcao ${aberto?.id === s.id ? 'ativa' : ''}`} aria-pressed={aberto?.id === s.id} aria-expanded={aberto?.id === s.id}
            onClick={() => { setAberto(aberto?.id === s.id ? null : s); setPedindoNome(false) }}>
            <span>{s.nome}</span>
            <small>{brlCurto(s.preco)}</small>
          </button>
        ))}
      </div>
      {aberto && !pedindoNome && (
        <div class="rapido-pagou" role="group" aria-labelledby="rapido-pergunta">
          <p class="campo-rotulo" id="rapido-pergunta">{aberto.nome}, {brl(aberto.preco)}: como a cliente pagou?</p>
          <div class="rapido-formas">
            {FORMAS.map((f) => (
              <button class={`btn ${f.forma === 'fiado' ? 'rapido-fiado' : 'btn-primario'}`}
                onClick={() => (f.forma === 'fiado' ? setPedindoNome(true) : salvar(aberto, f.forma))}>
                {f.rotulo}
              </button>
            ))}
          </div>
          <p class="campo-dica">Valor diferente? Use o botão “Recebi”.</p>
        </div>
      )}
      {aberto && pedindoNome && (
        <form class="rapido-pagou" onSubmit={(ev) => { ev.preventDefault(); if (nome.trim()) salvar(aberto, 'fiado', nome) }}>
          <label class="campo" for="rapido-nome">
            <span class="campo-rotulo">Quem ficou com o fiado?</span>
            <input id="rapido-nome" class="campo-input" value={nome} maxLength={30} placeholder="Primeiro nome ou apelido" autoFocus autoComplete="off"
              onInput={(ev) => setNome((ev.currentTarget as HTMLInputElement).value)} />
          </label>
          <button class="btn btn-primario btn-largo" type="submit" disabled={!nome.trim()}>Salvar fiado de {brlCurto(aberto.preco)}</button>
        </form>
      )}
    </section>
  )
}
