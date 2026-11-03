import { faturamentoAno, receitaBrutaMes, situacaoDAS, vencimentoDAS } from '../domain/calc'
import { dataCurta, diasEntre, hoje, nomeMes, nomeMesCurto, somarMeses, tituloMes } from '../domain/dates'
import { MEI, limiteMei } from '../domain/defaults'
import { brl, brlCurto } from '../domain/money'
import { alternarDAS, atualizarConfig, estado, mesAtual, modo } from '../state/store'
import { Barra, Cartao, Dinheiro, Nota, Pagina } from '../ui/kit'
import { IcCheck } from '../ui/icons'
import { ir } from '../ui/router'

const SELO = { pago: 'pago', 'a-vencer': 'a vencer', 'vence-logo': 'vence logo', atrasado: 'sem marcar' } as const


export function Mei() {
  const e = estado.value
  const ano = Number(mesAtual.value.slice(0, 4))

  if (e.config.ehMei === undefined || e.config.ehMei === false) {
    return (
      <Pagina titulo="MEI em dia" voltarPara="mais">
        {e.config.ehMei === undefined ? (
          <Cartao>
            <p class="cartao-titulo">Você é MEI (tem CNPJ de microempreendedora)?</p>
            <p class="cartao-sub">O app só mostra DAS, limite e relatório mensal para quem é MEI.</p>
            <div class="acoes-grandes">
              <button class="btn btn-primario" onClick={() => atualizarConfig({ ehMei: true })}>Sim, sou MEI</button>
              <button class="btn" onClick={() => atualizarConfig({ ehMei: false })}>Não sou</button>
            </div>
          </Cartao>
        ) : (
          <>
            <Nota>Você disse que não é MEI. Por isso o app não mostra DAS nem limite.</Nota>
            <p class="intro">Ser MEI dá CNPJ, nota fiscal e contribuição ao INSS (aposentadoria e auxílio-doença). Para saber se vale para você, veja o Portal do Empreendedor (gov.br/mei) ou fale com o Sebrae: 0800 570 0800.</p>
            <button class="btn btn-largo" onClick={() => atualizarConfig({ ehMei: true })}>Na verdade, sou MEI</button>
          </>
        )}
      </Pagina>
    )
  }

  const limite = limiteMei(ano)
  const fat = faturamentoAno(e.lancamentos, ano)
  const usado = fat / limite
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
        <p class="cartao-titulo">Quanto você cobrou em {ano}</p>
        <p class="destaque-valor pequeno"><Dinheiro v={fat} /></p>
        <Barra parte={fat} total={limite} rotulo="Quanto do limite anual do MEI já foi usado" />
        <p class={`cartao-sub ${usado >= MEI.alertaLimite ? 'valor-menos' : ''}`}>
          {Math.round(usado * 100)}% do limite do MEI ({brlCurto(limite)} por ano).
          {usado >= MEI.alertaLimite && ' Atenção: perto do limite. Converse com o Sebrae ou com um contador.'}
        </p>
        {ano <= 2026 && (
          <details class="detalhe-inline">
            <summary>Saiba mais: o limite vai mudar</summary>
            <p class="cartao-sub pequeno">Pela Lei Complementar 238/2026, o limite sobe para R$ 110 mil em 2027 e R$ 140 mil em 2028. Confira sempre no Portal do Empreendedor.</p>
          </details>
        )}
      </Cartao>

      <h2 class="secao">DAS (boleto mensal do MEI)</h2>
      <p class="muted pequeno">
        Vence dia {MEI.diaVencimentoDAS} do mês seguinte (se cair em fim de semana, no próximo dia útil). Pagar em dia mantém sua contribuição ao INSS.
        Seu DAS: {brl(e.config.valorDAS)} (troque em Ajustes se mudar).
      </p>
      <ul class="lista">
        {[...comps].reverse().map((c) => {
          const s = situacaoDAS(e.config, c, hoje(), e.lancamentos)
          return (
            <li>
              <button class={`linha linha-botao das-${s}`} onClick={() => alternarDAS(c)} aria-pressed={s === 'pago'}>
                <span class="linha-meio">
                  <span class="linha-titulo">DAS de {nomeMesCurto(c)}</span>
                  <span class="linha-sub">vence {dataCurta(vencimentoDAS(c))}{s === 'a-vencer' || s === 'vence-logo' ? ` · faltam ${diasEntre(hoje(), vencimentoDAS(c))} dias` : ''} · toque para {s === 'pago' ? 'desmarcar' : 'marcar como pago'}</span>
                </span>
                <span class={`linha-direita selo selo-${s}`}>{s === 'pago' && <IcCheck size={18} />}{SELO[s]}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <a class="btn btn-largo" href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor" target="_blank" rel="noopener noreferrer">Tirar o boleto no site oficial do MEI</a>
      <p class="muted pequeno">Também dá pelo app “MEI” da Receita Federal. Depois de pagar, volte aqui e toque no mês para marcar.</p>

      <h2 class="secao">Relatório mensal do que você cobrou</h2>
      <p class="muted pequeno">
        Preencha até o dia 20 do mês seguinte e guarde junto com as notas.
        {ano >= MEI.anoFimRelatorioMensal - 1 && ' A partir de 2027 ele deixa de ser obrigatório (Resolução CGSN 190/2026), mas continua útil para você se organizar.'}
      </p>
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

      <Nota>Prazos e valores do MEI mudam. Confira sempre no Portal do Empreendedor (gov.br/mei) ou no Sebrae. A declaração anual (DASN-SIMEI) vence no último dia de maio.</Nota>
    </Pagina>
  )
}

/** Página para imprimir, no formato do Relatório Mensal das Receitas Brutas do MEI. */
export function RelatorioMei({ mes }: { mes: string }) {
  const e = estado.value
  const m = /^\d{4}-\d{2}$/.test(mes) ? mes : mesAtual.value
  const total = receitaBrutaMes(e.lancamentos, m)
  const [y, mm] = m.split('-')
  const demo = modo.value === 'demo'
  return (
    <Pagina titulo="Relatório mensal" voltarPara="mais/mei">
      <div class="folha">
        {demo && <p class="marca-demo">DEMONSTRAÇÃO — DADOS FICTÍCIOS</p>}
        <h2>RELATÓRIO MENSAL DAS RECEITAS BRUTAS</h2>
        <table class="tabela-folha">
          <tbody>
            <tr><th>CNPJ</th><td class="preencher">&nbsp;</td></tr>
            <tr><th>Empreendedor(a)</th><td class="preencher">&nbsp;</td></tr>
            <tr><th>Período de apuração</th><td>{mm}/{y} ({nomeMes(m)})</td></tr>
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
        <p class="pequeno">Total calculado pelo app Fôlego a partir do que foi anotado como “Recebi” no mês (valor cobrado, antes da taxa da maquininha). Divida o total entre “com nota” e “sem nota” conforme as notas emitidas.</p>
        <p class="assinatura">Local e data: ______________________________</p>
        <p class="assinatura">Assinatura: ______________________________</p>
        <p class="pequeno">Anexe a este relatório os comprovantes de compras e as notas fiscais do mês.</p>
      </div>
      <button class="btn btn-primario btn-largo nao-imprimir" onClick={() => window.print()}>Imprimir ou salvar PDF</button>
    </Pagina>
  )
}
