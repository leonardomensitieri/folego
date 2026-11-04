import { custoMensal, diasDeFolego, saldoReserva } from '../domain/calc'
import { brl } from '../domain/money'
import { estado, mesAtual } from '../state/store'
import { Barra, Cartao, Dinheiro, Pagina, Vazio } from '../ui/kit'
import { IcSeta } from '../ui/icons'
import { ir } from '../ui/router'
import { ListaLancamentos } from './Movimentos'
import { nomeDaReserva } from './Mais'

export function Reserva() {
  const e = estado.value
  const saldo = saldoReserva(e.lancamentos)
  const custo = custoMensal(e, mesAtual.value)
  const dias = diasDeFolego(saldo, custo)
  const meta = e.config.metaReserva
  const falta = Math.max(0, meta - saldo)
  const porAtend = e.config.reservaPorAtendimento
  const atendimentosParaMeta = porAtend > 0 ? Math.ceil(falta / porAtend) : null
  const movs = e.lancamentos.filter((l) => l.tipo === 'reserva' || l.tipo === 'resgate').sort((a, b) => b.data.localeCompare(a.data) || b.criadoEm - a.criadoEm)

  return (
    <Pagina titulo={nomeDaReserva()} voltarPara="mais">
      <Cartao class="destaque">
        <p class="destaque-rotulo">Total na reserva</p>
        <p class="destaque-valor"><Dinheiro v={saldo} /></p>
        <p class="cartao-sub">
          {saldo > 0 ? <>Se o salão parar, daria para cerca de <b>{dias} {dias === 1 ? 'dia' : 'dias'}</b> de contas (conta aproximada).</> : 'Ainda não há reserva.'}
        </p>
        <Barra parte={saldo} total={meta} rotulo="Progresso da meta" />
        <p class="cartao-sub pequeno">
          Meta {brl(meta)} · {falta > 0 ? `faltam ${brl(falta)}` : 'meta alcançada! 🎉'}
        </p>
      </Cartao>

      {falta > 0 && atendimentosParaMeta !== null && (
        <p class="muted">Guardando {brl(porAtend)} por atendimento, você chega na meta em cerca de {atendimentosParaMeta} atendimentos.</p>
      )}

      <div class="acoes-grandes">
        <button class="btn-grande btn-entrada" onClick={() => ir('lancar/reserva')}>Guardar</button>
        <button class="btn-grande btn-neutro" onClick={() => ir('lancar/resgate')} disabled={saldo <= 0}>Tirar da reserva</button>
      </div>

      <details class="detalhe">
        <summary>Como o fôlego é calculado <IcSeta size={20} /></summary>
        <p class="explica">
          Fôlego = dinheiro guardado ÷ custo de um dia. Para não prometer fôlego a mais, o custo do mês ({brl(custo)}) é o
          maior entre dois números: o que você pôs nos Ajustes (gasto do salão mais o seu salário) e a média dos últimos 3 meses
          (gastos do salão mais o seu salário, ou o que você tirou pra casa, se foi mais). Sem histórico, vale o dos Ajustes.
        </p>
        <p class="explica">Use a reserva só para emergências do salão: equipamento que quebrou, semana sem atender, conta inesperada.</p>
      </details>

      <h2 class="secao">Movimentos da reserva</h2>
      {movs.length === 0 ? (
        <Vazio titulo="Nada guardado ainda" texto="Comece com pouco. Em Ajustes você pode dar um nome a esse dinheiro, como “Fundo do secador”." />
      ) : (
        <ListaLancamentos lancamentos={movs} />
      )}
    </Pagina>
  )
}
