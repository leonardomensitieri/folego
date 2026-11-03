import { useState } from 'preact/hooks'
import { custoIndicacao, margemServico, simular, taxaMediaReal } from '../domain/calc'
import { mesDe, somarMeses } from '../domain/dates'
import { brl, pct } from '../domain/money'
import type { Centavos, Servico } from '../domain/types'
import { estado, mesAtual, novoId, salvarServico } from '../state/store'
import { Cartao, CampoNumero, CampoTexto, CampoValor, Dinheiro, Escolha, Nota, Pagina, avisar } from '../ui/kit'
import { ir, voltar } from '../ui/router'

/** Atendimentos por mês de cada serviço (média dos últimos 3 meses), para o "e se?" usar números reais. */
function atendimentosPorMes(servicoId: string): number {
  const e = estado.value
  const meses = [1, 2, 3].map((n) => somarMeses(mesAtual.value, -n))
  const qtd = e.lancamentos.filter((l) => l.tipo === 'entrada' && l.categoria === servicoId && meses.includes(mesDe(l.data))).length
  return Math.round(qtd / 3)
}

type Cena = 'livre' | 'concorrente' | 'dolar' | 'aumento'

// Nomes curtos para caber numa linha, mesmo a 320 px (as rodadas do Laboratório: concorrente, dólar, preço)
const CENAS: { id: Cena; titulo: string }[] = [
  { id: 'concorrente', titulo: 'Dar desconto' },
  { id: 'dolar', titulo: 'Produto subiu' },
  { id: 'aumento', titulo: 'Subir o preço' },
]

/** "R$ 50 → R$ 42,50": antes e depois numa linha só. */
function AntesDepois({ antes, depois }: { antes: Centavos; depois: Centavos }) {
  return (
    <>
      <Dinheiro v={antes} /> <span aria-hidden="true">→</span><span class="sr-only">passa para</span> <b><Dinheiro v={depois} /></b>
    </>
  )
}

export function Decidir() {
  const e = estado.value
  const taxaMedia = taxaMediaReal(e.lancamentos, e.config.taxas)
  const servicos = e.servicos.filter((s) => s.ativo)
  const [servicoId, setServicoId] = useState(servicos[0]?.id ?? '')
  const s = e.servicos.find((x) => x.id === servicoId) ?? servicos[0]
  const [cena, setCena] = useState<Cena>('concorrente')
  const [desconto, setDesconto] = useState(15)
  const [aumentoProduto, setAumentoProduto] = useState(30)
  // sugestão: +10% arredondado; volta para a sugestão sempre que o serviço muda.
  // undefined = ainda não mexeu (vale a sugestão); null = apagou o campo (não calcula com valor escondido)
  const [novoPrecoDigitado, setNovoPreco] = useState<Centavos | null | undefined>(undefined)
  const novoPreco = novoPrecoDigitado === undefined ? (s ? Math.max(s.preco + 500, Math.round((s.preco * 1.1) / 500) * 500) : null) : novoPrecoDigitado
  const semNovoPreco = cena === 'aumento' && !novoPreco
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
  const opcoesServico = servicos.map((x) => ({ valor: x.id, rotulo: x.nome }))

  return (
    <Pagina titulo="Decidir com calma" class="decidir">
      <p class="intro">Veja o efeito antes de decidir.</p>

      <fieldset class="escolha">
        <legend class="campo-rotulo">O que você quer testar?</legend>
        <div class="segmentado segmentado-3">
          {CENAS.map((c) => (
            <button type="button" aria-pressed={cena === c.id} class={cena === c.id ? 'ativa' : ''} onClick={() => setCena(c.id)}>{c.titulo}</button>
          ))}
        </div>
      </fieldset>

      {/* o efeito no bolso vem logo abaixo da escolha: aparece sem rolar e muda junto com os números de baixo */}
      {s && res && (
        <section class="cartao efeito" aria-live="polite" aria-label="Efeito no seu bolso">
          {semNovoPreco ? (
            <p class="efeito-sub">Digite o novo preço para ver a conta.</p>
          ) : (
            <>
              <p class="efeito-rotulo">Caixa do mês</p>
              <p class={`efeito-valor ${res.impactoMes < 0 ? 'valor-menos' : res.impactoMes > 0 ? 'valor-mais' : ''}`}><Dinheiro v={res.impactoMes} sinal /></p>
              <p class="efeito-sub">
                {res.impactoMes < 0 ? 'a menos' : res.impactoMes > 0 ? 'a mais' : 'sem mudança'} no “Sobrou no salão”, por mês.
              </p>
              <dl class="efeito-linhas">
                {res.precoDepois !== s.preco && <div><dt>Preço</dt><dd><AntesDepois antes={s.preco} depois={res.precoDepois} /></dd></div>}
                {res.custoProdutoDepois !== s.custoProduto && <div><dt>Produto</dt><dd><AntesDepois antes={s.custoProduto} depois={res.custoProdutoDepois} /></dd></div>}
                <div><dt>Margem</dt><dd><AntesDepois antes={res.antes.margem} depois={res.depois.margem} /></dd></div>
                {res.impactoMes < 0 && (
                  <div>
                    <dt>Clientela</dt>
                    <dd>{res.atendimentosParaEmpatar === null
                      ? 'nenhuma compensa'
                      : <>{qtd} <span aria-hidden="true">→</span><span class="sr-only">passa para</span> <b>{qtd + res.atendimentosParaEmpatar}</b> por mês</>}</dd>
                  </div>
                )}
              </dl>
              {res.atendimentosParaEmpatar === null && <p class="efeito-sub">Com esse valor, o serviço não cobre nem o produto.</p>}
              <p class="efeito-nota">Margem: o que sobra por atendimento. Clientela: atendimentos por mês para sobrar o mesmo. Conta aproximada, não é consultoria.</p>
            </>
          )}
        </section>
      )}

      {s && (
        <>
          <Escolha<string> rotulo="Serviço" estilo="linha" valor={s.id} opcoes={opcoesServico}
            aoMudar={(id) => { setServicoId(id); setQtdManual(null); setNovoPreco(undefined) }} />
          {cena === 'concorrente' && <CampoNumero id="desc" rotulo="Desconto" valor={desconto} aoMudar={setDesconto} sufixo="%" max={90} passo={5} />}
          {cena === 'dolar' && <CampoNumero id="dolar" rotulo="Quanto o produto subiu" valor={aumentoProduto} aoMudar={setAumentoProduto} sufixo="%" max={300} passo={5} />}
          {cena === 'aumento' && <CampoValor id="novo-preco" rotulo="Novo preço" valor={novoPreco} aoMudar={setNovoPreco} />}
          <CampoNumero id="qtd" rotulo="Atendimentos por mês" dica={sugerido ? `Pelo seu histórico: ${sugerido} por mês.` : undefined}
            valor={qtd} aoMudar={(v) => setQtdManual(Math.round(v))} max={200} />
          {cena === 'concorrente' && res && res.impactoMes < 0 && (
            <Nota>Antes de baixar o preço de tudo, dá para testar uma oferta com prazo, um pacote ou uma condição só para clientes antigas.</Nota>
          )}
          {cena === 'dolar' && (
            <>
              <Nota>Compare o preço em mais de um fornecedor antes da compra do mês. Mais barato nem sempre compensa: veja se o resultado no cabelo é o mesmo.</Nota>
              <button class="btn btn-largo" onClick={() => ir('mais/fornecedores')}>Abrir fornecedores</button>
            </>
          )}
        </>
      )}

      <h2 class="secao">Quanto sobra em cada serviço</h2>
      <p class="muted pequeno">
        Já sem o produto e sem a taxa média da maquininha ({pct(taxaMedia)}). Aluguel, luz e água saem do total do mês.
      </p>
      <ul class="lista">
        {servicos.map((x) => {
          const m = margemServico(x, taxaMedia)
          return (
            <li>
              <button class="linha linha-botao" onClick={() => ir(`servico/${x.id}`)}>
                <span class="linha-meio">
                  <span class="linha-titulo">{x.nome} · {brl(x.preco)}</span>
                  <span class="linha-sub">produto {brl(x.custoProduto)} · {x.minutos} min</span>
                </span>
                <span class="linha-direita">
                  <Dinheiro v={m.margem} class={m.margem <= 0 ? 'valor-menos' : ''} />
                  <small>sobra por atendimento</small>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <button class="btn btn-largo" onClick={() => ir('servico/novo')}>+ Adicionar serviço</button>

      <h2 class="secao">Desconto para quem indicar compensa?</h2>
      {sInd && (
        <Escolha<string> rotulo="Serviço que a cliente nova costuma fazer" estilo="linha" valor={sInd.id} opcoes={opcoesServico} aoMudar={setServicoInd} />
      )}
      <CampoValor id="beneficio" rotulo="Desconto que você dá para quem indica" valor={beneficio} aoMudar={setBeneficio} />
      <CampoNumero id="visitas" rotulo="Quantas vezes a cliente nova vem no ano?" dica="Contando a primeira visita." valor={visitas} aoMudar={(v) => setVisitas(Math.max(1, Math.round(v)))} min={1} max={52} />
      {sInd && beneficio !== null && (() => {
        const m = margemServico(sInd, taxaMedia).margem
        const r = custoIndicacao(beneficio, m, visitas)
        return (
          <section class="cartao efeito" aria-live="polite" aria-label="Resultado da indicação">
            <dl class="efeito-linhas">
              <div><dt>Na 1ª visita sobra</dt><dd><b class={r.ganhoPrimeiraVisita < 0 ? 'valor-menos' : ''}><Dinheiro v={r.ganhoPrimeiraVisita} /></b></dd></div>
              <div><dt>No ano, com {visitas} {visitas === 1 ? 'visita' : 'visitas'}</dt><dd><b class={r.valeAPena ? 'valor-mais' : 'valor-menos'}><Dinheiro v={r.ganhoNoAno} /></b></dd></div>
            </dl>
            <p class="efeito-nota">“{sInd.nome}” deixa {brl(m)} de margem por atendimento; o desconto de {brl(beneficio)} sai da 1ª visita. O que paga a conta é a cliente voltar. Conta aproximada, não é consultoria.</p>
          </section>
        )
      })()}
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
