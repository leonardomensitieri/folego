import { useState } from 'preact/hooks'
import { custoIndicacao, margemServico, simular, taxaMediaReal } from '../domain/calc'
import { mesDe, somarMeses } from '../domain/dates'
import { brl, brlCurto, pct } from '../domain/money'
import type { Centavos, Servico } from '../domain/types'
import { estado, mesAtual, novoId, salvarServico } from '../state/store'
import { Cartao, CampoNumero, CampoTexto, CampoValor, Dinheiro, Nota, Pagina, avisar } from '../ui/kit'
import { ir, voltar } from '../ui/router'

/** Atendimentos por mês de cada serviço (média dos últimos 3 meses), para o "e se?" usar números reais. */
function atendimentosPorMes(servicoId: string): number {
  const e = estado.value
  const meses = [1, 2, 3].map((n) => somarMeses(mesAtual.value, -n))
  const qtd = e.lancamentos.filter((l) => l.tipo === 'entrada' && l.categoria === servicoId && meses.includes(mesDe(l.data))).length
  return Math.round(qtd / 3)
}

type Cena = 'livre' | 'concorrente' | 'dolar' | 'aumento'

const CENAS: { id: Cena; titulo: string; texto: string }[] = [
  { id: 'concorrente', titulo: 'Concorrente mais barato', texto: 'E se eu der desconto para não perder cliente?' },
  { id: 'dolar', titulo: 'Produto ficou mais caro', texto: 'E se o dólar subir e o produto encarecer?' },
  { id: 'aumento', titulo: 'Subir o preço', texto: 'E se eu cobrar um pouco mais?' },
]

export function Decidir() {
  const e = estado.value
  const taxaMedia = taxaMediaReal(e.lancamentos, e.config.taxas)
  const servicos = e.servicos.filter((s) => s.ativo)
  const [servicoId, setServicoId] = useState(servicos[0]?.id ?? '')
  const s = e.servicos.find((x) => x.id === servicoId) ?? servicos[0]
  const [cena, setCena] = useState<Cena>('concorrente')
  const [desconto, setDesconto] = useState(15)
  const [aumentoProduto, setAumentoProduto] = useState(30)
  // sugestão: +10% arredondado; volta para a sugestão sempre que o serviço muda
  const [novoPrecoDigitado, setNovoPreco] = useState<Centavos | null>(null)
  const novoPreco = novoPrecoDigitado ?? (s ? Math.max(s.preco + 500, Math.round((s.preco * 1.1) / 500) * 500) : null)
  const sugerido = s ? atendimentosPorMes(s.id) : 0
  const [qtdManual, setQtdManual] = useState<number | null>(null)
  const qtd = qtdManual ?? (sugerido || 8)

  const res = s
    ? simular({
        servico: s,
        atendimentosMes: qtd,
        taxaMediaPct: taxaMedia,
        descontoPct: cena === 'concorrente' ? desconto : undefined,
        aumentoProdutoPct: cena === 'dolar' ? aumentoProduto : undefined,
        novoPreco: cena === 'aumento' && novoPreco ? novoPreco : undefined,
      })
    : null

  const [beneficio, setBeneficio] = useState<Centavos | null>(1000)
  const [servicoInd, setServicoInd] = useState(servicos[0]?.id ?? '')
  const sInd = e.servicos.find((x) => x.id === servicoInd) ?? servicos[0]
  const [visitas, setVisitas] = useState(4)

  return (
    <Pagina titulo="Decidir com calma">
      <p class="intro">Antes de dar desconto, subir o preço ou trocar de produto, veja o efeito no seu bolso. É só uma conta: quem decide é você.</p>

      <h2 class="secao" id="ese">E se eu…?</h2>
      <div class="cenas" role="group" aria-label="Situação para simular">
        {CENAS.map((c) => (
          <button aria-pressed={cena === c.id} class={`cena ${cena === c.id ? 'ativa' : ''}`} onClick={() => setCena(c.id)}>
            <b>{c.titulo}</b>
            <small>{c.texto}</small>
          </button>
        ))}
      </div>

      {s && res && (
        <Cartao class="simulador">
          <label class="campo" for="servico-ese">
            <span class="campo-rotulo">Serviço</span>
            <select id="servico-ese" class="campo-input" value={s.id} onChange={(ev) => { setServicoId((ev.currentTarget as HTMLSelectElement).value); setQtdManual(null); setNovoPreco(null) }}>
              {servicos.map((x) => <option value={x.id}>{x.nome} ({brlCurto(x.preco)})</option>)}
            </select>
          </label>
          {cena === 'concorrente' && <CampoNumero id="desc" rotulo="Desconto" valor={desconto} aoMudar={setDesconto} sufixo="%" max={90} passo={5} />}
          {cena === 'dolar' && <CampoNumero id="dolar" rotulo="O produto ficou mais caro em" valor={aumentoProduto} aoMudar={setAumentoProduto} sufixo="%" max={300} passo={5} />}
          {cena === 'aumento' && <CampoValor id="novo-preco" rotulo="Novo preço" valor={novoPreco} aoMudar={setNovoPreco} />}
          <CampoNumero id="qtd" rotulo={`Quantos por mês? ${sugerido ? `(seu histórico: ${sugerido})` : ''}`} valor={qtd} aoMudar={(v) => setQtdManual(Math.round(v))} max={200} />

          <div class="antes-depois">
            <div><small>Margem hoje</small><b><Dinheiro v={res.antes.margem} /></b><small>sobra por atendimento</small></div>
            <div aria-hidden="true" class="seta">→</div>
            <div><small>Margem depois</small><b class={res.depois.margem < res.antes.margem ? 'valor-menos' : 'valor-mais'}><Dinheiro v={res.depois.margem} /></b><small>sobra por atendimento</small></div>
          </div>
          <p class={`veredito ${res.impactoMes < 0 ? 'ruim' : 'bom'}`}>
            Caixa do mês: <b><Dinheiro v={res.impactoMes} sinal /></b> no “Sobrou no salão”.
          </p>
          {res.impactoMes < 0 && (
            <p class="explica">
              {res.atendimentosParaEmpatar === null
                ? 'Com esse valor, o serviço não cobre nem o produto. Nenhuma quantidade de clientes compensa.'
                : <>Clientela: para sobrar o mesmo dinheiro, você precisaria de <b>{res.atendimentosParaEmpatar} {res.atendimentosParaEmpatar === 1 ? 'atendimento' : 'atendimentos'} a mais</b> por mês ({qtd} → {qtd + res.atendimentosParaEmpatar}).</>}
            </p>
          )}
          <p class="muted pequeno">Margem, Caixa e Clientela são os mesmos indicadores do jogo do Laboratório. É uma conta aproximada com os seus números. Não é consultoria: quem decide é você.</p>
          {cena === 'concorrente' && res.impactoMes < 0 && (
            <Nota>Antes de baixar o preço de tudo, dá para testar uma oferta com prazo, um pacote ou uma condição só para clientes antigas.</Nota>
          )}
          {cena === 'dolar' && (
            <>
              <Nota>Compare o preço em mais de um fornecedor antes da compra do mês. Mais barato nem sempre compensa: veja se o resultado no cabelo é o mesmo.</Nota>
              <button class="btn btn-largo" onClick={() => ir('mais/fornecedores')}>Abrir fornecedores</button>
            </>
          )}
        </Cartao>
      )}

      <h2 class="secao">Quanto sobra em cada serviço</h2>
      <p class="muted pequeno">Já sem o produto usado e sem a taxa média da maquininha nas suas vendas ({pct(taxaMedia)}; Pix e dinheiro não pagam taxa). <b>Ainda não desconta aluguel, luz e água</b>: isso sai do total do mês.</p>
      <ul class="lista">
        {servicos.map((x) => {
          const m = margemServico(x, taxaMedia)
          return (
            <li>
              <button class="linha linha-botao" onClick={() => ir(`servico/${x.id}`)}>
                <span class="linha-meio">
                  <span class="linha-titulo">{x.nome} · {brlCurto(x.preco)}</span>
                  <span class="linha-sub">produto {brlCurto(x.custoProduto)} · {x.minutos} min</span>
                </span>
                <span class="linha-direita">
                  <Dinheiro v={m.margem} curto class={m.margem <= 0 ? 'valor-menos' : ''} />
                  <small>sobra por atendimento</small>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <button class="btn btn-largo" onClick={() => ir('servico/novo')}>+ Adicionar serviço</button>

      <h2 class="secao">Desconto para quem indicar compensa?</h2>
      <Cartao class="simulador">
        <label class="campo" for="servico-ind">
          <span class="campo-rotulo">Serviço que a cliente nova costuma fazer</span>
          <select id="servico-ind" class="campo-input" value={sInd?.id} onChange={(ev) => setServicoInd((ev.currentTarget as HTMLSelectElement).value)}>
            {servicos.map((x) => <option value={x.id}>{x.nome} ({brlCurto(x.preco)})</option>)}
          </select>
        </label>
        <CampoValor id="beneficio" rotulo="Desconto que você dá para quem indica" valor={beneficio} aoMudar={setBeneficio} />
        <CampoNumero id="visitas" rotulo="Quantas vezes a cliente nova vem no ano (contando a primeira)?" valor={visitas} aoMudar={(v) => setVisitas(Math.max(1, Math.round(v)))} min={1} max={52} />
        {sInd && beneficio !== null && (() => {
          const m = margemServico(sInd, taxaMedia).margem
          const r = custoIndicacao(beneficio, m, visitas)
          return (
            <>
              <p class="explica">“{sInd.nome}” deixa {brl(m)} de margem por atendimento. Com o desconto de {brl(beneficio)}:</p>
              <p class={`veredito ${r.valeAPena ? 'bom' : 'ruim'}`}>
                Na 1ª visita sobra <b><Dinheiro v={r.ganhoPrimeiraVisita} /></b>. No ano: <b><Dinheiro v={r.ganhoNoAno} /></b>.
              </p>
              <p class="muted pequeno">O desconto pesa na margem do começo; o que paga a conta é a cliente voltar. Conta aproximada, não é consultoria.</p>
            </>
          )
        })()}
      </Cartao>
    </Pagina>
  )
}

export function EditarServico({ id }: { id: string }) {
  const e = estado.value
  const existente = e.servicos.find((s) => s.id === id)
  const [nome, setNome] = useState(existente?.nome ?? '')
  const [preco, setPreco] = useState<Centavos | null>(existente?.preco ?? null)
  const [custo, setCusto] = useState<Centavos | null>(existente?.custoProduto ?? 0)
  const [minutos, setMinutos] = useState(existente?.minutos ?? 60)
  const taxaMedia = taxaMediaReal(e.lancamentos, e.config.taxas)
  const m = preco ? margemServico({ preco, custoProduto: custo ?? 0, minutos }, taxaMedia) : null

  function salvar(ativo = true) {
    if (!nome.trim() || !preco) {
      avisar('Preencha o nome e o preço.')
      return
    }
    const s: Servico = { id: existente?.id ?? novoId(), nome: nome.trim(), preco, custoProduto: custo ?? 0, minutos, ativo }
    salvarServico(s)
    avisar(ativo ? 'Serviço salvo.' : 'Serviço escondido. Os lançamentos antigos continuam.')
    voltar('decidir')
  }

  return (
    <Pagina titulo={existente ? existente.nome : 'Novo serviço'} voltarPara="decidir">
      <CampoTexto id="nome" rotulo="Nome do serviço" valor={nome} aoMudar={setNome} placeholder="ex.: Hidratação" maxLength={30} />
      <CampoValor id="preco" rotulo="Preço que você cobra" valor={preco} aoMudar={setPreco} />
      <CampoValor id="custo" rotulo="Quanto de produto vai em um atendimento (mais ou menos)" valor={custo} aoMudar={setCusto} />
      <Nota>Dica: pegue o preço do frasco e divida por quantos atendimentos ele rende.</Nota>
      <CampoNumero id="min" rotulo="Tempo do atendimento" valor={minutos} aoMudar={(v) => setMinutos(Math.round(v))} sufixo="min" max={600} passo={15} />
      {m && (
        <Cartao class="resumo-servico">
          <p>Sobra por atendimento: <b><Dinheiro v={m.margem} /></b> ({pct(Math.round(m.margemPct))})</p>
          <p>Por hora de trabalho: <b><Dinheiro v={m.porHora} /></b></p>
        </Cartao>
      )}
      <div class="rodape-acoes">
        <button class="btn btn-primario btn-largo" onClick={() => salvar(true)}>Salvar</button>
        {existente?.ativo && <button class="btn btn-largo" onClick={() => salvar(false)}>Não ofereço mais este serviço</button>}
      </div>
    </Pagina>
  )
}
