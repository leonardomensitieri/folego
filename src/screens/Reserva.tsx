import { custoMensal, diasDeFolego, saldoReserva } from '../domain/calc'
import { brlCurto } from '../domain/money'
import { estado, mesAtual } from '../state/store'
import { Barra, Cartao, Dinheiro, Nota, Pagina, Vazio } from '../ui/kit'
import { ir } from '../ui/router'
import { ListaLancamentos } from './Movimentos'

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
    <Pagina titulo="Reserva (fôlego)" voltarPara="mais">
      <Cartao class="destaque">
        <p class="destaque-rotulo">Guardado</p>
        <p class="destaque-valor"><Dinheiro v={saldo} /></p>
        <p class="cartao-sub">
          {saldo > 0 ? <>Paga as contas por <b>{dias} {dias === 1 ? 'dia' : 'dias'}</b> se o salão parar.</> : 'Ainda não há reserva.'}
        </p>
        <Barra parte={saldo} total={meta} rotulo="Progresso da meta" />
        <p class="cartao-sub pequeno">
          Meta {brlCurto(meta)} · {falta > 0 ? `faltam ${brlCurto(falta)}` : 'meta alcançada! 🎉'}
        </p>
      </Cartao>

      {falta > 0 && atendimentosParaMeta !== null && (
        <Nota tom="bom">Guardando {brlCurto(porAtend)} por atendimento, você chega na meta em cerca de {atendimentosParaMeta} atendimentos.</Nota>
      )}

      <div class="acoes-grandes">
        <button class="btn-grande btn-entrada" onClick={() => ir('lancar/reserva')}>🐷 Guardar</button>
        <button class="btn-grande btn-neutro" onClick={() => ir('lancar/resgate')} disabled={saldo <= 0}>↩️ Usar</button>
      </div>

      <details class="detalhe">
        <summary>Como o fôlego é calculado</summary>
        <p class="explica">
          Fôlego = dinheiro guardado ÷ custo de um dia. O custo do mês ({brlCurto(custo)}) é a média dos seus gastos do salão
          mais o que você tira pra casa nos últimos 3 meses. Sem histórico, usamos a estimativa dos Ajustes.
        </p>
        <p class="explica">Use a reserva só para emergências do salão: equipamento que quebrou, semana sem atender, conta inesperada.</p>
      </details>

      <h2 class="secao">Movimentos da reserva</h2>
      {movs.length === 0 ? (
        <Vazio titulo="Nada guardado ainda" texto="Dê um nome para esse dinheiro, como “Fundo do secador”, e comece com pouco." />
      ) : (
        <ListaLancamentos lancamentos={movs} />
      )}
    </Pagina>
  )
}
