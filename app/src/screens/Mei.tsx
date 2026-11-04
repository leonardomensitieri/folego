import { competenciaDAS, faturamentoAno, primeiroMesDeUso, receitaBrutaMes, situacaoDAS, vencimentoDAS } from '../domain/calc'
import { dataCurta, diasEntre, mesValido, nomeMes, nomeMesCurto, somarMeses, tituloMes } from '../domain/dates'
import { MEI, limiteMei } from '../domain/defaults'
import { brl, brlComCentavos } from '../domain/money'
import { alternarDAS, atualizarConfig, dataHoje, estado, mesAtual, modo } from '../state/store'
import { avisar, Barra, Cartao, Detalhe, Dinheiro, Nota, Pagina } from '../ui/kit'
import { IcCheck } from '../ui/icons'
import { ir } from '../ui/router'

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
  // Competências dos últimos 12 meses, desde que ela começou a usar o app (antes disso o app não sabe se pagou:
  // não acusa atraso falso). Passa da virada do ano: em fevereiro, o DAS de dezembro sem pagar continua aqui.
  // O DAS do mês atual só vence no mês que vem, então a lista vai até o mês passado.
  const dia = dataHoje.value
  const ultimaComp = somarMeses(mesAtual.value, -1)
  const primeiroUso = primeiroMesDeUso(e.lancamentos, dia)
  const inicio = [primeiroUso, somarMeses(ultimaComp, -11)].sort().reverse()[0]
  const comps: string[] = []
  for (let c = inicio < ultimaComp ? inicio : ultimaComp; c <= ultimaComp; c = somarMeses(c, 1)) comps.push(c)

  // o DAS que falta pagar vem primeiro (é o que pede ação); os já pagos ficam na lista de baixo
  const situacoes = [...comps].reverse().map((c) => ({ c, s: situacaoDAS(e.config, c, dia, e.lancamentos) }))
  const aPagar = situacoes.filter((x) => x.s !== 'pago')
  const pagos = situacoes.filter((x) => x.s === 'pago')

  function itemDAS({ c, s }: { c: string; s: ReturnType<typeof situacaoDAS> }) {
    // pago pelo "Gastei → DAS do MEI": mostra o valor anotado e não tem o que desfazer aqui
    const anotado = e.lancamentos.find((l) => l.tipo === 'saida' && l.categoria === 'das' && competenciaDAS(l) === c)
    const marcado = e.config.dasPagos.includes(c)
    const venc = vencimentoDAS(c)
    const nome = `DAS de ${nomeMesCurto(c)}${c.slice(0, 4) !== String(ano) ? ` de ${c.slice(0, 4)}` : ''}`
    return (
      <li class="das">
        <div class="das-topo">
          <span class="das-nome">{nome}</span>
          <Dinheiro v={anotado?.valor ?? e.config.valorDAS} class="das-valor" />
        </div>
        <div class="das-baixo">
          {s === 'pago' ? (
            <>
              <span class="das-situacao"><IcCheck size={18} /> Pago{anotado && !marcado ? ' (anotado em Gastei)' : ''}</span>
              {marcado && (
                <button class="link" onClick={() => alternarDAS(c)} aria-label={`Desfazer: ${nome} não foi pago`}>Desfazer</button>
              )}
            </>
          ) : (
            <>
              <span class="das-situacao">
                {s === 'atrasado' ? `Venceu ${dataCurta(venc)}, sem marcar` : `Vence ${dataCurta(venc)} · em ${diasEntre(dia, venc)} ${diasEntre(dia, venc) === 1 ? 'dia' : 'dias'}`}
              </span>
              <button class="btn btn-pequeno btn-primario" aria-label={`Já paguei o ${nome}`}
                onClick={() => { alternarDAS(c); avisar(`${nome}: marcado como pago.`, { rotulo: 'Desfazer', fazer: () => { if (estado.value.config.dasPagos.includes(c)) alternarDAS(c) } }) }}>Já paguei</button>
            </>
          )}
        </div>
      </li>
    )
  }

  return (
    <Pagina titulo="MEI em dia" voltarPara="mais">
      {aPagar.length > 0 && (
        <>
          <h2 class="secao secao-primeira">DAS a pagar</h2>
          <ul class="lista">{aPagar.map(itemDAS)}</ul>
        </>
      )}

      <Cartao>
        <p class="cartao-titulo">Quanto você cobrou em {ano}</p>
        <p class="destaque-valor pequeno"><Dinheiro v={fat} /></p>
        <Barra parte={fat} total={limite} rotulo="Quanto do limite anual do MEI já foi usado" />
        <p class={`cartao-sub ${usado >= MEI.alertaLimite ? 'valor-menos' : ''}`}>
          {Math.round(usado * 100)}% do limite do MEI ({brl(limite)} por ano).
          {usado >= MEI.alertaLimite && ' Atenção: perto do limite. Converse com o Sebrae ou com um contador.'}
        </p>
        {ano <= 2026 && (
          <Detalhe resumo="O limite vai mudar">
            <p class="cartao-sub">Pela Lei Complementar 238/2026, o limite sobe para R$ 110 mil em 2027 e R$ 140 mil em 2028. Confira sempre no Portal do Empreendedor.</p>
          </Detalhe>
        )}
      </Cartao>

      <h2 class="secao">DAS (boleto mensal do MEI)</h2>
      <p class="muted">Vence todo dia 20 (ou no próximo dia útil). Pagar em dia garante seu INSS.</p>
      <Detalhe resumo="Mais detalhes">
        <p class="cartao-sub">
          O DAS de cada mês vence no dia {MEI.diaVencimentoDAS} do mês seguinte. Se cair em fim de semana ou feriado, vence no próximo dia útil.
          Pagar em dia mantém sua contribuição ao INSS (aposentadoria e auxílio-doença). O valor do seu DAS ({brl(e.config.valorDAS)}) dá para trocar em Ajustes.
        </p>
      </Detalhe>
      {pagos.length > 0 && <ul class="lista">{pagos.map(itemDAS)}</ul>}
      <a class="btn btn-largo" href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor" target="_blank" rel="noopener noreferrer">Tirar o boleto no site oficial do MEI</a>
      <p class="muted pequeno">Também dá pelo app “MEI” da Receita Federal.</p>

      <h2 class="secao">Relatório mensal do que você cobrou</h2>
      <p class="muted">Preencha até o dia 20 do mês seguinte e guarde junto com as notas.</p>
      {ano >= MEI.anoFimRelatorioMensal - 1 && (
        <Detalhe resumo="Vai mudar em 2027">
          <p class="cartao-sub">A partir de 2027 ele deixa de ser obrigatório (Resolução CGSN 190/2026), mas continua útil para você se organizar.</p>
        </Detalhe>
      )}
      <ul class="lista">
        {[0, 1, 2].map((n) => {
          const m = somarMeses(mesAtual.value, -n)
          return (
            <li>
              <button class="linha linha-botao" onClick={() => ir(`mei/relatorio/${m}`)}>
                <span class="linha-meio"><span class="linha-titulo">{tituloMes(m)}</span></span>
                <span class="linha-direita"><Dinheiro v={receitaBrutaMes(e.lancamentos, m)} /></span>
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
  const m = mesValido(mes) ? mes : mesAtual.value
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
            <tr class="total"><th>Total das receitas brutas no mês</th><td>{brlComCentavos(total)}</td></tr>
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
