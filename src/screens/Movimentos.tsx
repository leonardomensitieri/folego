import { resumoDoMes } from '../domain/calc'
import { dataCurta, diaDaSemana, mesDe, nomeMesCurto, somarMeses, tituloMes } from '../domain/dates'
import type { Lancamento } from '../domain/types'
import { estado, mesAtual } from '../state/store'
import { IcSeta, IcVoltar } from '../ui/icons'
import { Cartao, Dinheiro, Vazio } from '../ui/kit'
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
                <Dinheiro v={s < 0 ? -l.valor : l.valor} sinal={s !== 0} />
                {!l.recebido ? <small>fiado</small> : l.taxa > 0 && <small>taxa {brl(l.taxa)}</small>}
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
  const mes = mesParam && /^\d{4}-\d{2}$/.test(mesParam) ? mesParam : mesAtual.value
  const r = resumoDoMes(e.lancamentos, mes)
  // Cada anotação aparece no dia em que o dinheiro entrou de verdade (fiado pago aparece no dia do pagamento),
  // e o fiado ainda aberto aparece no dia do atendimento. Assim a lista bate com os totais do mês.
  const diaCaixa = (l: Lancamento) => (l.tipo === 'entrada' && l.recebido ? l.recebidoEm ?? l.data : l.data)
  const doMes = e.lancamentos
    .filter((l) => mesDe(diaCaixa(l)) === mes)
    .sort((a, b) => diaCaixa(b).localeCompare(diaCaixa(a)) || b.criadoEm - a.criadoEm)
  const dias = [...new Set(doMes.map(diaCaixa))]
  const podeAvancar = mes < mesAtual.value

  return (
    <section class="pagina">
      <header class="topo">
        <button class="btn-voltar" onClick={() => ir(`movimentos/${somarMeses(mes, -1)}`, { substituir: true })}><IcVoltar /> <span>{nomeMesCurto(somarMeses(mes, -1)).slice(0, 3)}</span></button>
        <h1>{tituloMes(mes)}</h1>
        <button class="btn-voltar" disabled={!podeAvancar} onClick={() => ir(`movimentos/${somarMeses(mes, 1)}`, { substituir: true })}><span>{nomeMesCurto(somarMeses(mes, 1)).slice(0, 3)}</span> <IcSeta /></button>
      </header>
      <div class="conteudo">
        <Cartao class="resumo-mes">
          <dl class="numeros">
            <div><dt>Entrou</dt><dd><Dinheiro v={r.entrou} /></dd></div>
            <div><dt>Saiu (gastos do salão)</dt><dd><Dinheiro v={-r.saiu} /></dd></div>
            <div><dt>Pra casa</dt><dd><Dinheiro v={-r.praCasa} /></dd></div>
            <div class="total"><dt>{r.sobrou < 0 ? 'Faltou no salão' : 'Sobrou no salão'}</dt><dd><Dinheiro v={r.sobrou} /></dd></div>
          </dl>
          <p class="cartao-sub">
            {r.atendimentos} {r.atendimentos === 1 ? 'atendimento' : 'atendimentos'} · a maquininha ficou com {brl(r.taxas)}
            {r.guardado > 0 && <> · do que sobrou, <Dinheiro v={r.guardado} curto /> foi para a reserva</>}
          </p>
        </Cartao>

        {r.porCategoria.length > 0 && (
          <details class="detalhe">
            <summary>Para onde foi o dinheiro</summary>
            <ul class="barras">
              {r.porCategoria.map((c) => (
                <li>
                  <span>{nomeCategoria(e, { tipo: 'saida', categoria: c.categoria })}</span>
                  <span class="barrinha"><span style={{ width: `${(c.total / r.saiu) * 100}%` }} /></span>
                  <Dinheiro v={c.total} curto />
                </li>
              ))}
            </ul>
          </details>
        )}
        {r.porServico.length > 0 && (
          <details class="detalhe">
            <summary>O que mais trouxe dinheiro</summary>
            <ul class="barras">
              {r.porServico.map((s) => (
                <li>
                  <span>{nomeCategoria(e, { tipo: 'entrada', categoria: s.categoria })} <small>({s.quantidade}x)</small></span>
                  <span class="barrinha boa"><span style={{ width: `${(s.total / r.entrou) * 100}%` }} /></span>
                  <Dinheiro v={s.total} curto />
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
