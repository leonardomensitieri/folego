import { faturamentoAno, receitaBrutaMes, situacaoDAS, vencimentoDAS } from '../domain/calc'
import { dataCurta, hoje, nomeMes, nomeMesCurto, somarMeses, tituloMes } from '../domain/dates'
import { MEI } from '../domain/defaults'
import { brl, brlCurto } from '../domain/money'
import { alternarDAS, estado, mesAtual } from '../state/store'
import { Barra, Cartao, Dinheiro, Nota, Pagina } from '../ui/kit'
import { ir } from '../ui/router'

const SELO = { pago: '✅ pago', 'a-vencer': 'a vencer', 'vence-logo': '⏰ vence logo', atrasado: '⚠️ atrasado' } as const

export function Mei() {
  const e = estado.value
  const ano = Number(mesAtual.value.slice(0, 4))
  const fat = faturamentoAno(e.lancamentos, ano)
  const usado = fat / MEI.limiteAnual
  // Competências desde que ela começou a usar o app (antes disso o app não sabe se pagou: não acusa atraso falso).
  // O DAS do mês atual só vence no mês que vem, então a lista vai até o mês passado.
  const ultimaComp = somarMeses(mesAtual.value, -1)
  const primeiroUso = e.lancamentos.reduce((min, l) => (l.data < min ? l.data : min), hoje()).slice(0, 7)
  const inicio = [primeiroUso, `${ano}-01`, somarMeses(ultimaComp, -11)].sort().reverse()[0]
  const comps: string[] = []
  for (let c = inicio < ultimaComp ? inicio : ultimaComp; c <= ultimaComp; c = somarMeses(c, 1)) comps.push(c)

  return (
    <Pagina titulo="MEI em dia" voltarPara="mais">
      <Cartao>
        <p class="cartao-titulo">Faturamento em {ano}</p>
        <p class="destaque-valor pequeno"><Dinheiro v={fat} /></p>
        <Barra parte={fat} total={MEI.limiteAnual} rotulo="Quanto do limite anual do MEI já foi usado" />
        <p class={`cartao-sub ${usado >= MEI.alertaLimite ? 'valor-menos' : ''}`}>
          {Math.round(usado * 100)}% do limite do MEI ({brlCurto(MEI.limiteAnual)} por ano).
          {usado >= MEI.alertaLimite && ' Atenção: perto do limite. Converse com o Sebrae ou um contador.'}
        </p>
      </Cartao>

      <h2 class="secao">DAS (boleto mensal do MEI)</h2>
      <p class="muted pequeno">
        Vence todo dia {MEI.diaVencimentoDAS} do mês seguinte. Pagar em dia mantém sua contribuição ao INSS.
        Valor que você paga: {brl(e.config.valorDAS)} (troque em Ajustes se mudar).
      </p>
      <ul class="lista">
        {[...comps].reverse().map((c) => {
          const s = situacaoDAS(e.config, c, hoje())
          return (
            <li>
              <button class={`linha linha-botao das-${s}`} onClick={() => alternarDAS(c)} aria-pressed={s === 'pago'}
                aria-label={`DAS de ${nomeMes(c)}: ${SELO[s]}. Toque para ${s === 'pago' ? 'desmarcar' : 'marcar como pago'}.`}>
                <span class="linha-meio">
                  <span class="linha-titulo">DAS de {nomeMesCurto(c)}</span>
                  <span class="linha-sub">vence {dataCurta(vencimentoDAS(c))}</span>
                </span>
                <span class="linha-direita">{SELO[s]}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <p class="muted pequeno">Toque no mês para marcar ou desmarcar como pago. O boleto se emite no app oficial MEI ou no Portal do Empreendedor.</p>

      <h2 class="secao">Relatório mensal de receitas</h2>
      <p class="muted pequeno">Preencha até o dia 20 do mês seguinte. O app soma o que entrou no mês; imprima ou salve em PDF e guarde junto com as notas.</p>
      <ul class="lista">
        {[0, 1, 2].map((n) => {
          const m = somarMeses(mesAtual.value, -n)
          return (
            <li>
              <button class="linha linha-botao" onClick={() => ir(`mei/relatorio/${m}`)}>
                <span class="linha-meio"><span class="linha-titulo">{tituloMes(m)}</span></span>
                <span class="linha-direita"><Dinheiro v={receitaBrutaMes(e.lancamentos, m)} curto /></span>
              </button>
            </li>
          )
        })}
      </ul>

      <Nota>Prazos e valores do MEI mudam. Confira sempre no Portal do Empreendedor (gov.br/mei) ou no Sebrae. A declaração anual (DASN-SIMEI) vence em 31 de maio.</Nota>
    </Pagina>
  )
}

/** Página para imprimir, no formato do Relatório Mensal das Receitas Brutas do MEI. */
export function RelatorioMei({ mes }: { mes: string }) {
  const e = estado.value
  const m = /^\d{4}-\d{2}$/.test(mes) ? mes : mesAtual.value
  const total = receitaBrutaMes(e.lancamentos, m)
  const [y, mm] = m.split('-')
  return (
    <Pagina titulo="Relatório mensal" voltarPara="mais/mei">
      <div class="folha">
        <h2>RELATÓRIO MENSAL DAS RECEITAS BRUTAS</h2>
        <table class="tabela-folha">
          <tbody>
            <tr><th>CNPJ</th><td class="preencher">&nbsp;</td></tr>
            <tr><th>Empreendedor(a)</th><td class="preencher">&nbsp;</td></tr>
            <tr><th>Período de apuração</th><td>{mm}/{y}</td></tr>
          </tbody>
        </table>
        <table class="tabela-folha">
          <thead><tr><th colspan={2}>RECEITA BRUTA MENSAL – PRESTAÇÃO DE SERVIÇOS</th></tr></thead>
          <tbody>
            <tr><th>Com dispensa de emissão de documento fiscal</th><td class="preencher">&nbsp;</td></tr>
            <tr><th>Com documento fiscal emitido</th><td class="preencher">&nbsp;</td></tr>
            <tr class="total"><th>Total das receitas brutas no mês</th><td>{brl(total)}</td></tr>
          </tbody>
        </table>
        <p class="pequeno">Total calculado pelo app Fôlego com base nos lançamentos “Recebi” do mês (valor cobrado, antes da taxa da maquininha). Divida o total entre “com nota” e “sem nota” conforme as notas emitidas.</p>
        <p class="assinatura">Local e data: ______________________________</p>
        <p class="assinatura">Assinatura: ______________________________</p>
        <p class="pequeno">Anexe a este relatório os comprovantes de compras e as notas fiscais do mês.</p>
      </div>
      <button class="btn btn-primario btn-largo nao-imprimir" onClick={() => window.print()}>Imprimir ou salvar PDF</button>
    </Pagina>
  )
}
