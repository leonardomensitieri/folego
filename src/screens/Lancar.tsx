import { useMemo, useState } from 'preact/hooks'
import { taxaDaForma } from '../domain/calc'
import { hoje, somarMeses } from '../domain/dates'
import { SERVICO_AVULSO } from '../domain/defaults'
import { brl, brlCurto } from '../domain/money'
import type { Centavos, Forma, Lancamento, Tipo } from '../domain/types'
import { adicionarLancamento, atualizarLancamento, estado, removerLancamento, restaurarLancamento } from '../state/store'
import { avisar, CampoTexto, CampoValor, Escolha, Nota, Pagina } from '../ui/kit'
import { ir, voltar } from '../ui/router'
import { ROTULO_TIPO } from '../ui/nomes'

type FormaOuFiado = Forma | 'fiado'

const TITULOS: Record<Tipo, string> = {
  entrada: 'Recebi',
  saida: 'Gastei',
  retirada: 'Tirei pra casa',
  reserva: 'Guardei na reserva',
  resgate: 'Tirei da reserva',
}

/** Formulário de lançamento. Também serve para editar (passando o id). */
export function Lancar({ tipo: tipoInicial, params, editarId }: { tipo?: string; params?: string; editarId?: string }) {
  const e = estado.value
  const editando = editarId ? e.lancamentos.find((l) => l.id === editarId) : undefined
  const q = useMemo(() => new URLSearchParams(params ?? ''), [params])

  const tipo: Tipo = editando?.tipo ?? (['entrada', 'saida', 'retirada', 'reserva', 'resgate'].includes(tipoInicial ?? '') ? (tipoInicial as Tipo) : 'entrada')
  const servicos = e.servicos.filter((s) => s.ativo)

  const [categoria, setCategoria] = useState<string>(
    editando?.categoria ?? q.get('categoria') ?? (tipo === 'entrada' ? '' : tipo === 'saida' ? '' : tipo),
  )
  const [valor, setValor] = useState<Centavos | null>(editando?.valor ?? (q.get('valor') ? Number(q.get('valor')) : null))
  const [forma, setForma] = useState<FormaOuFiado | undefined>(
    editando ? (editando.recebido ? editando.forma : 'fiado') : q.get('fiado') ? 'fiado' : ((q.get('forma') as Forma | null) ?? undefined),
  )
  const [cliente, setCliente] = useState(editando?.cliente ?? q.get('cliente') ?? '')
  const [descricao, setDescricao] = useState(editando?.descricao ?? '')
  const [data, setData] = useState(editando?.data ?? hoje())
  const [outroDia, setOutroDia] = useState(Boolean(editando && editando.data !== hoje() && editando.data !== ontem()))
  const [tentou, setTentou] = useState(false)

  const ehEntrada = tipo === 'entrada'
  const formaReal: Forma | undefined = forma === 'fiado' ? undefined : forma
  const taxa = ehEntrada && valor && forma !== 'fiado' ? taxaDaForma(valor, formaReal, e.config.taxas) : 0
  const faltando =
    !valor || valor <= 0 ? 'Digite o valor.' :
    ehEntrada && !categoria ? 'Escolha o serviço.' :
    ehEntrada && !forma ? 'Escolha como a cliente pagou.' :
    tipo === 'saida' && !categoria ? 'Escolha o tipo de gasto.' :
    forma === 'fiado' && !cliente.trim() ? 'Escreva o nome de quem vai pagar depois.' : null

  function escolherServico(id: string) {
    setCategoria(id)
    const s = e.servicos.find((x) => x.id === id)
    if (s && (!valor || servicos.some((x) => x.preco === valor))) setValor(s.preco)
  }

  function salvar() {
    setTentou(true)
    if (faltando || !valor) return
    const dados: Omit<Lancamento, 'id' | 'criadoEm'> = {
      data,
      tipo,
      valor,
      taxa,
      forma: ehEntrada ? formaReal : undefined,
      categoria: tipo === 'retirada' || tipo === 'reserva' || tipo === 'resgate' ? tipo : categoria,
      descricao: descricao.trim() || undefined,
      cliente: ehEntrada && cliente.trim() ? cliente.trim() : undefined,
      recebido: !(ehEntrada && forma === 'fiado'),
      recebidoEm: editando?.recebido && forma !== 'fiado' ? editando.recebidoEm : undefined,
    }
    if (editando) {
      atualizarLancamento(editando.id, dados)
      avisar('Alterado!')
      voltar('')
      return
    }
    const novo = adicionarLancamento(dados)
    const sugerir = ehEntrada && forma !== 'fiado' && e.config.reservaPorAtendimento > 0
    voltar('')
    avisar(
      sugerir ? `Salvo! Guardar ${brlCurto(e.config.reservaPorAtendimento)} na reserva?` : 'Salvo!',
      sugerir
        ? { rotulo: 'Guardar', fazer: () => { adicionarLancamento({ data, tipo: 'reserva', valor: e.config.reservaPorAtendimento, taxa: 0, categoria: 'reserva', recebido: true }); avisar('Guardado na reserva 🐷') } }
        : { rotulo: 'Desfazer', fazer: () => removerLancamento(novo.id) },
      7000,
    )
  }

  function apagar() {
    if (!editando) return
    const l = removerLancamento(editando.id)
    voltar('')
    if (l) avisar('Apagado.', { rotulo: 'Desfazer', fazer: () => restaurarLancamento(l) })
  }

  return (
    <Pagina titulo={editando ? `Editar: ${ROTULO_TIPO[tipo]}` : TITULOS[tipo]} voltarPara="">
      {!editando && (
        <nav class="abas-tipo" aria-label="Tipo de lançamento">
          {(['entrada', 'saida', 'retirada', 'reserva'] as Tipo[]).map((t) => (
            <button class={t === tipo ? 'ativa' : ''} aria-current={t === tipo ? 'page' : undefined}
              onClick={() => ir(`lancar/${t}`, { substituir: true })}>{ROTULO_TIPO[t]}</button>
          ))}
        </nav>
      )}

      {ehEntrada && (
        <fieldset class="escolha">
          <legend class="campo-rotulo">Qual serviço?</legend>
          <div class="grade-servicos">
            {servicos.map((s) => (
              <button type="button" class={`opcao ${categoria === s.id ? 'ativa' : ''}`} aria-pressed={categoria === s.id} onClick={() => escolherServico(s.id)}>
                <span>{s.nome}</span>
                <small>{brlCurto(s.preco)}</small>
              </button>
            ))}
            <button type="button" class={`opcao ${categoria === SERVICO_AVULSO ? 'ativa' : ''}`} aria-pressed={categoria === SERVICO_AVULSO} onClick={() => setCategoria(SERVICO_AVULSO)}>
              <span>Outro</span>
              <small>digitar</small>
            </button>
          </div>
        </fieldset>
      )}

      {tipo === 'saida' && (
        <fieldset class="escolha">
          <legend class="campo-rotulo">Com o quê?</legend>
          <div class="grade-servicos">
            {e.categorias.map((c) => (
              <button type="button" class={`opcao opcao-icone ${categoria === c.id ? 'ativa' : ''}`} aria-pressed={categoria === c.id} onClick={() => setCategoria(c.id)}>
                <span aria-hidden="true" class="emoji">{c.icone}</span>
                <span>{c.nome}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {tipo === 'retirada' && (
        <Nota>Separar o dinheiro da casa do dinheiro do salão ajuda a saber quanto o salão rende de verdade. Seu combinado: {brlCurto(e.config.salarioMensal)} por mês.</Nota>
      )}
      {tipo === 'reserva' && <Nota tom="bom">Dinheiro guardado é fôlego para quando um imprevisto chegar (como o secador quebrar).</Nota>}

      <CampoValor id="valor" rotulo="Valor" valor={valor} aoMudar={setValor} autoFocus={!ehEntrada && tipo !== 'saida'} />

      {ehEntrada && (
        <Escolha<FormaOuFiado>
          rotulo="Como pagou?"
          valor={forma}
          aoMudar={setForma}
          colunas={3}
          opcoes={[
            { valor: 'pix', rotulo: 'Pix' },
            { valor: 'dinheiro', rotulo: 'Dinheiro' },
            { valor: 'debito', rotulo: 'Débito', extra: `${String(e.config.taxas.debito).replace('.', ',')}%` },
            { valor: 'credito', rotulo: 'Crédito', extra: `${String(e.config.taxas.credito).replace('.', ',')}%` },
            { valor: 'fiado', rotulo: 'Vai pagar depois' },
          ]}
        />
      )}

      {ehEntrada && taxa > 0 && valor && (
        <p class="calculo">A maquininha fica com {brl(taxa)}. Para você: <b>{brl(valor - taxa)}</b>.</p>
      )}

      {(forma === 'fiado' || (ehEntrada && cliente)) && (
        <CampoTexto id="cliente" rotulo={forma === 'fiado' ? 'Quem vai pagar depois?' : 'Cliente (opcional)'} valor={cliente} aoMudar={setCliente}
          placeholder="Primeiro nome ou apelido" dica="Só para você lembrar. Não precisa de sobrenome nem telefone." maxLength={30} />
      )}

      <CampoTexto id="descricao" rotulo="Anotação (opcional)" valor={descricao} aoMudar={setDescricao}
        placeholder={tipo === 'saida' ? 'ex.: shampoo e máscara' : ''} />

      <Escolha<string>
        rotulo="Quando?"
        valor={outroDia ? 'outro' : data === hoje() ? 'hoje' : data === ontem() ? 'ontem' : 'outro'}
        aoMudar={(v) => {
          setOutroDia(v === 'outro')
          if (v === 'hoje') setData(hoje())
          else if (v === 'ontem') setData(ontem())
        }}
        colunas={3}
        opcoes={[{ valor: 'hoje', rotulo: 'Hoje' }, { valor: 'ontem', rotulo: 'Ontem' }, { valor: 'outro', rotulo: 'Outro dia' }]}
      />
      {outroDia && <label class="campo" for="data">
        <span class="campo-rotulo sr-only">Data</span>
        <input id="data" type="date" class="campo-input" value={data} max={hoje()} min={`${somarMeses(hoje().slice(0, 7), -24)}-01`}
          onInput={(ev) => { const v = (ev.currentTarget as HTMLInputElement).value; if (v) setData(v) }} />
      </label>}

      {tentou && faltando && <p class="erro" role="alert">{faltando}</p>}

      <div class="rodape-acoes">
        <button class="btn btn-primario btn-largo" onClick={salvar}>{editando ? 'Salvar alteração' : 'Salvar'}</button>
        {editando && <button class="btn btn-perigo btn-largo" onClick={apagar}>Apagar este lançamento</button>}
      </div>
    </Pagina>
  )
}

function ontem() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return hoje(d)
}
