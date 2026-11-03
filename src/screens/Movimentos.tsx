import { competenciaDAS, divisaoDoSobrou, resumoDoMes } from '../domain/calc'
import { dataCurta, diaDaSemana, mesDe, mesValido, nomeMesCurto, somarMeses, tituloMes } from '../domain/dates'
import type { Lancamento } from '../domain/types'
import { estado, mesAtual } from '../state/store'
import { IcSeta, IcVoltar } from '../ui/icons'
import { Cartao, Dinheiro, Pagina, Vazio } from '../ui/kit'
import { ir } from '../ui/router'
import { nomeCategoria, nomeForma, sinalNoCaixa } from '../ui/nomes'
import { IconeCategoria } from '../ui/iconeCategoria'
import { brl } from '../domain/money'

export function ListaLancamentos({ lancamentos, semData }: { lancamentos: Lancamento[]; semData?: boolean }) {
  const e = estado.value
  return (
    <ul class="lista">
      {lancamentos.map((l) => {
        const s = sinalNoCaixa(l)
        const sub = [
          !semData && dataCurta(l.data),
          l.recebidoEm && l.recebidoEm !== l.data && `atendimento de ${dataCurta(l.data)}`,
          l.tipo === 'entrada' && (l.recebido ? nomeForma(l.forma) : 'fiado'),
          l.tipo === 'saida' && l.categoria === 'das' && `de ${nomeMesCurto(competenciaDAS(l))}`,
          l.cliente,
          l.descricao && l.descricao !== nomeCategoria(e, l) ? l.descricao : '',
        ].filter(Boolean).join(' · ')
        return (
          <li>
            <button class="linha linha-botao" onClick={() => ir(`editar/${l.id}`)}>
              <span class="linha-icone" aria-hidden="true"><IconeCategoria l={l} /></span>
              <span class="linha-meio">
                <span class="linha-titulo">{nomeCategoria(e, l)}</span>
                {sub && <span class="linha-sub">{sub}</span>}
              </span>
              <span class={`linha-direita valor-${!l.recebido ? 'fiado' : s > 0 ? 'mais' : s < 0 ? 'menos' : 'neutro'}`}>
                {/* fiado ainda não entrou no caixa: sem o "+", e com "a receber" embaixo */}
                <Dinheiro v={s < 0 ? -l.valor : l.valor} sinal={s !== 0 && l.recebido} />
                {!l.recebido ? <small>a receber</small> : l.taxa > 0 && <small>taxa {brl(l.taxa)}</small>}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function Movimentos({ mes: mesParam }: { mes?: string }) {
  const e = estado.value
  if (mesParam && !mesValido(mesParam)) {
    return (
      <Pagina titulo="Mês não encontrado" voltarPara="">
        <p class="intro">Esse endereço não é de um mês que existe.</p>
        <button class="btn btn-primario btn-largo" onClick={() => ir(`movimentos/${mesAtual.value}`, { substituir: true })}>Ver o mês de agora</button>
      </Pagina>
    )
  }
  const mes = mesParam ?? mesAtual.value
  const r = resumoDoMes(e.lancamentos, mes)
  // Cada anotação aparece no dia em que o dinheiro entrou de verdade (fiado pago aparece no dia do pagamento),
  // e o fiado ainda aberto aparece no dia do atendimento. Assim a lista bate com os totais do mês.
  const diaCaixa = (l: Lancamento) => (l.tipo === 'entrada' && l.recebido ? l.recebidoEm ?? l.data : l.data)
  const doMes = e.lancamentos
    .filter((l) => mesDe(diaCaixa(l)) === mes)
    .sort((a, b) => diaCaixa(b).localeCompare(diaCaixa(a)) || b.criadoEm - a.criadoEm)
  const dias = [...new Set(doMes.map(diaCaixa))]
  const podeAvancar = mes < mesAtual.value
  const divisao = divisaoDoSobrou(r)

  return (
    <section class="pagina">
      <header class="topo">
        <span class="topo-lado">
          <button class="btn-voltar" aria-label={`Mês anterior: ${nomeMesCurto(somarMeses(mes, -1))}`} onClick={() => ir(`movimentos/${somarMeses(mes, -1)}`, { substituir: true })}><IcVoltar /> <span>{nomeMesCurto(somarMeses(mes, -1)).slice(0, 3)}</span></button>
        </span>
        <h1>{tituloMes(mes)}</h1>
        {/* mês que ainda não chegou não tem o que mostrar: o botão some em vez de ficar apagado */}
        <span class="topo-lado topo-direita">
          {podeAvancar && <button class="btn-voltar" aria-label={`Próximo mês: ${nomeMesCurto(somarMeses(mes, 1))}`} onClick={() => ir(`movimentos/${somarMeses(mes, 1)}`, { substituir: true })}><span>{nomeMesCurto(somarMeses(mes, 1)).slice(0, 3)}</span> <IcSeta /></button>}
        </span>
      </header>
      <div class="conteudo">
        <Cartao class="resumo-mes">
          <dl class="numeros">
            <div><dt>Entrou</dt><dd><Dinheiro v={r.entrou} /></dd></div>
            <div><dt>Saiu (gastos do salão)</dt><dd><Dinheiro v={-r.saiu} /></dd></div>
            <div><dt>Pra casa</dt><dd><Dinheiro v={-r.praCasa} /></dd></div>
            <div class="total"><dt>{r.sobrou < 0 ? 'Faltou no salão' : 'Sobrou no salão'}</dt><dd><Dinheiro v={r.sobrou} /></dd></div>
          </dl>
          {divisao && (
            <p class="cartao-sub">
              {divisao.tipo === 'dividido'
                ? <>Na reserva: <b><Dinheiro v={divisao.naReserva} /></b> · No caixa: <b><Dinheiro v={divisao.noCaixa} /></b></>
                : divisao.tipo === 'guardou-mais'
                  ? <>Você guardou <b><Dinheiro v={divisao.naReserva} /></b> na reserva, mais do que sobrou neste mês.</>
                  : <>Mesmo assim, você guardou <b><Dinheiro v={divisao.naReserva} /></b> na reserva neste mês.</>}
            </p>
          )}
          <p class="cartao-sub">
            {r.atendimentos} {r.atendimentos === 1 ? 'atendimento' : 'atendimentos'}
            {r.taxas > 0 && <> · a maquininha ficou com {brl(r.taxas)}</>}
          </p>
        </Cartao>

        {r.porCategoria.length > 0 && (
          <details class="detalhe">
            <summary>Para onde foi o dinheiro <IcSeta size={20} /></summary>
            <ul class="barras">
              {r.porCategoria.map((c) => (
                <li>
                  <span>{nomeCategoria(e, { tipo: 'saida', categoria: c.categoria })}</span>
                  <span class="barrinha"><span style={{ width: `${(c.total / r.saiu) * 100}%` }} /></span>
                  <Dinheiro v={c.total} />
                </li>
              ))}
            </ul>
          </details>
        )}
        {doMes.length > 0 && (
          <details class="detalhe">
            <summary>O que mais trouxe dinheiro <IcSeta size={20} /></summary>
            {r.porServico.length === 0 && <p class="muted">Nenhum atendimento pago neste mês ainda. O fiado entra aqui quando a cliente pagar.</p>}
            <ul class="barras">
              {r.porServico.map((s) => (
                <li>
                  <span>{nomeCategoria(e, { tipo: 'entrada', categoria: s.categoria })} <small>({s.quantidade}x)</small></span>
                  <span class="barrinha boa"><span style={{ width: `${(s.total / r.entrou) * 100}%` }} /></span>
                  <Dinheiro v={s.total} />
                </li>
              ))}
            </ul>
          </details>
        )}

        {doMes.length === 0 ? (
          <Vazio titulo="Nada anotado neste mês" texto="Use os botões Recebi e Gastei na tela inicial." />
        ) : (
          dias.map((d) => (
            <div class="dia">
              <h2 class="secao">{dataCurta(d)} · {diaDaSemana(d)}</h2>
              <ListaLancamentos lancamentos={doMes.filter((l) => diaCaixa(l) === d)} semData />
            </div>
          ))
        )}
      </div>
    </section>
  )
}
