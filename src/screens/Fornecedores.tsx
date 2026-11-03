import { useState } from 'preact/hooks'
import { dataCurta, diasEntre, hoje } from '../domain/dates'
import { brl } from '../domain/money'
import type { Centavos, Fornecedor } from '../domain/types'
import { estado, novoId, removerFornecedor, salvarFornecedor } from '../state/store'
import { avisar, CampoTexto, CampoValor, Cartao, Nota, Pagina, Vazio } from '../ui/kit'

/** Hábito 4 do Kit de Resiliência: ter até três fornecedores para os produtos principais e comparar preços. */
export function Fornecedores() {
  const e = estado.value
  const porProduto = new Map<string, Fornecedor[]>()
  for (const f of e.fornecedores) {
    const k = f.produto.trim()
    porProduto.set(k, [...(porProduto.get(k) ?? []), f])
  }
  const [produto, setProduto] = useState('')
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState<Centavos | null>(null)

  function adicionar(ev: Event) {
    ev.preventDefault()
    if (!produto.trim() || !nome.trim() || !preco) {
      avisar('Preencha produto, onde compra e preço.')
      return
    }
    salvarFornecedor({ id: novoId(), produto: produto.trim(), nome: nome.trim(), preco, data: hoje() })
    setNome('')
    setPreco(null)
    avisar('Preço anotado.')
  }

  return (
    <Pagina titulo="Fornecedores" voltarPara="mais">
      <Nota>Ter mais de um lugar para comprar o mesmo produto ajuda quando o preço sobe ou falta mercadoria. Compare antes da compra do mês. Mais barato nem sempre compensa: teste em pouca quantidade e veja se o resultado é o mesmo.</Nota>

      {porProduto.size === 0 ? (
        <Vazio titulo="Nenhum preço anotado" texto="Comece pelos produtos que mais pesam: descolorante, máscara, shampoo." />
      ) : (
        [...porProduto].map(([p, lista]) => {
          const ordenada = [...lista].sort((a, b) => a.preco - b.preco)
          const maisBarato = ordenada[0]
          const maisCaro = ordenada[ordenada.length - 1]
          return (
            <Cartao class="fornecedor">
              <h3>{p}</h3>
              <ul>
                {ordenada.map((f) => (
                  <li class={f.id === maisBarato.id && ordenada.length > 1 ? 'melhor' : ''}>
                    <span class="fornecedor-nome">{f.nome}{f.id === maisBarato.id && ordenada.length > 1 && <small>menor preço</small>}</span>
                    <span class="fornecedor-preco">{brl(f.preco)} <small>{dataCurta(f.data)}{diasEntre(f.data, hoje()) > 90 ? ' (antigo)' : ''}</small></span>
                    <button class="btn btn-pequeno btn-sutil" onClick={() => { removerFornecedor(f.id); avisar(`Preço de ${f.nome} apagado.`, { rotulo: 'Desfazer', fazer: () => salvarFornecedor(f) }) }}>Apagar</button>
                  </li>
                ))}
              </ul>
              {ordenada.length > 1 && maisCaro.preco > maisBarato.preco && (
                <p class="cartao-sub">Diferença: {brl(maisCaro.preco - maisBarato.preco)} por unidade.</p>
              )}
              {ordenada.length === 1 && <p class="cartao-sub">Anote mais um lugar para comparar.</p>}
            </Cartao>
          )
        })
      )}

      <form class="cartao" onSubmit={adicionar}>
        <h3>Anotar um preço</h3>
        <CampoTexto id="prod" rotulo="Produto" valor={produto} aoMudar={setProduto} placeholder="ex.: Descolorante" maxLength={40} />
        <CampoTexto id="forn" rotulo="Onde comprou / cotou" valor={nome} aoMudar={setNome} placeholder="ex.: Distribuidora do centro" maxLength={40} />
        <CampoValor id="preco-f" rotulo="Preço" valor={preco} aoMudar={setPreco} />
        <button class="btn btn-primario btn-largo" type="submit">Anotar</button>
      </form>
    </Pagina>
  )
}
