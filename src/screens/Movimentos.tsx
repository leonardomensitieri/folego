import { resumoDoMes } from '../domain/calc'
import { dataCurta, diaDaSemana, mesDe, somarMeses, tituloMes } from '../domain/dates'
import type { Lancamento } from '../domain/types'
import { estado, mesAtual } from '../state/store'
import { IcSeta, IcVoltar } from '../ui/icons'
import { Cartao, Dinheiro, Vazio } from '../ui/kit'
import { ir } from '../ui/router'
import { iconeCategoria, nomeCategoria, nomeForma, sinalNoCaixa } from '../ui/nomes'

export function ListaLancamentos({ lancamentos, semData }: { lancamentos: Lancamento[]; semData?: boolean }) {
  const e = estado.value
  return (
    <ul class="lista">
      {lancamentos.map((l) => {
        const s = sinalNoCaixa(l)
        const sub = [
          !semData && dataCurta(l.data),
          l.tipo === 'entrada' && (l.recebido ? nomeForma(l.forma) : 'vai pagar depois'),
          l.cliente,
          l.descricao && l.descricao !== nomeCategoria(e, l) ? l.descricao : '',
        ].filter(Boolean).join(' · ')
        return (
          <li>
            <button class="linha linha-botao" onClick={() => ir(`editar/${l.id}`)} aria-label={`Editar ${nomeCategoria(e, l)}`}>
              <span class="linha-icone" aria-hidden="true">{iconeCategoria(e, l)}</span>
              <span class="linha-meio">
                <span class="linha-titulo">{nomeCategoria(e, l)}</span>
                {sub && <span class="linha-sub">{sub}</span>}
              </span>
              <span class={`linha-direita valor-${s > 0 ? 'mais' : s < 0 ? 'menos' : 'neutro'} ${!l.recebido ? 'pendente' : ''}`}>
                <Dinheiro v={s < 0 ? -l.valor : l.valor} sinal={s !== 0} />
                {l.taxa > 0 && <small>taxa {(l.taxa / 100).toFixed(2).replace('.', ',')}</small>}
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
  const doMes = e.lancamentos
    .filter((l) => mesDe(l.data) === mes || (l.recebidoEm && mesDe(l.recebidoEm) === mes))
    .sort((a, b) => b.data.localeCompare(a.data) || b.criadoEm - a.criadoEm)
  const dias = [...new Set(doMes.map((l) => l.data))]
  const podeAvancar = mes < mesAtual.value

  return (
    <section class="pagina">
      <header class="topo">
        <button class="btn-icone" aria-label="Mês anterior" onClick={() => ir(`movimentos/${somarMeses(mes, -1)}`, { substituir: true })}><IcVoltar /></button>
        <h1>{tituloMes(mes)}</h1>
        <button class="btn-icone" aria-label="Próximo mês" disabled={!podeAvancar} onClick={() => ir(`movimentos/${somarMeses(mes, 1)}`, { substituir: true })}><IcSeta /></button>
      </header>
      <div class="conteudo">
        <Cartao class="resumo-mes">
          <dl class="numeros">
            <div><dt>Entrou</dt><dd><Dinheiro v={r.entrou} /></dd></div>
            <div><dt>Gastos do salão</dt><dd><Dinheiro v={-r.saiu} /></dd></div>
            <div class="total"><dt>Resultado do salão</dt><dd><Dinheiro v={r.resultado} /></dd></div>
            <div><dt>Pra casa</dt><dd><Dinheiro v={-r.praCasa} /></dd></div>
            <div class="total"><dt>Sobrou no salão</dt><dd><Dinheiro v={r.sobrou} /></dd></div>
          </dl>
          <p class="cartao-sub">
            {r.atendimentos} atendimentos · taxas da maquininha {(r.taxas / 100).toFixed(2).replace('.', ',')}
            {r.guardado !== 0 && <> · guardado na reserva <Dinheiro v={r.guardado} curto /></>}
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
          <Vazio titulo="Nenhum lançamento neste mês" texto="Use os botões Recebi e Gastei na tela inicial." />
        ) : (
          dias.map((d) => (
            <div class="dia">
              <h2 class="secao">{dataCurta(d)} · {diaDaSemana(d)}</h2>
              <ListaLancamentos lancamentos={doMes.filter((l) => l.data === d)} semData />
            </div>
          ))
        )}
      </div>
    </section>
  )
}
