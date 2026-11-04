import { useState } from 'preact/hooks'
import { signal } from '@preact/signals'
import { competenciaDAS, recebidoEmAoEditar, saldoReserva, taxaDaForma } from '../domain/calc'
import { hoje, mesDe, nomeMesCurto, somarMeses } from '../domain/dates'
import { LIMITES } from '../domain/backup'
import { NOMES_FORMA, SERVICO_AVULSO } from '../domain/defaults'
import { brl } from '../domain/money'
import type { Centavos, Forma, Lancamento, Tipo } from '../domain/types'
import { adicionarLancamento, atualizarLancamento, estado, removerLancamento, restaurarLancamento } from '../state/store'
import { avisar, CampoTexto, CampoValor, Escolha, Nota, Pagina } from '../ui/kit'
import { ir, voltar } from '../ui/router'
import { ROTULO_TIPO, TEXTO_RESERVA_USADA } from '../ui/nomes'
import { IconeCategoria } from '../ui/iconeCategoria'

type FormaOuFiado = Forma | 'fiado'

/** Rascunho vindo do "Escreva do seu jeito" → "Corrigir". Fica só na memória (nada no endereço da página). */
export interface Rascunho {
  valor: Centavos | null
  categoria: string
  forma?: Forma
  fiado: boolean
  cliente?: string
  /** Dia entendido na frase ("ontem"). */
  data?: string
  /** DAS: de qual mês é o boleto. */
  competencia?: string
}
export const rascunho = signal<Rascunho | null>(null)

const TITULOS: Record<Tipo, string> = {
  entrada: 'Recebi',
  saida: 'Gastei',
  retirada: 'Tirei pra casa',
  reserva: 'Guardei na reserva',
  resgate: 'Tirei da reserva',
}

/** Os quatro tipos do controle segmentado no alto do formulário. */
const NAS_ABAS: Tipo[] = ['entrada', 'saida', 'retirada', 'reserva']

/** Formulário de lançamento. Também serve para editar (passando o id). */
export function Lancar({ tipo: tipoInicial, editarId }: { tipo?: string; editarId?: string }) {
  const e = estado.value
  const editando = editarId ? e.lancamentos.find((l) => l.id === editarId) : undefined
  // o rascunho é lido uma vez e descartado
  const [r] = useState(() => {
    const x = rascunho.peek()
    rascunho.value = null
    return x
  })

  const tipo: Tipo = editando?.tipo ?? (['entrada', 'saida', 'retirada', 'reserva', 'resgate'].includes(tipoInicial ?? '') ? (tipoInicial as Tipo) : 'entrada')
  const servicos = e.servicos.filter((s) => s.ativo)

  const [categoria, setCategoria] = useState<string>(
    editando?.categoria ?? r?.categoria ?? (tipo === 'entrada' ? '' : tipo === 'saida' ? '' : tipo),
  )
  const [valor, setValor] = useState<Centavos | null>(editando?.valor ?? r?.valor ?? null)
  // entrada nova começa no Pix (o jeito mais comum no salão); rascunho do "Escreva do seu jeito" mantém o que foi entendido
  const [forma, setForma] = useState<FormaOuFiado | undefined>(
    editando ? (editando.recebido ? editando.forma : 'fiado') : r ? (r.fiado ? 'fiado' : r.forma) : tipo === 'entrada' ? 'pix' : undefined,
  )
  const [cliente, setCliente] = useState(editando?.cliente ?? r?.cliente ?? '')
  const [descricao, setDescricao] = useState(editando?.descricao ?? '')
  const [data, setData] = useState(editando?.data ?? r?.data ?? hoje())
  const [outroDia, setOutroDia] = useState(() => {
    const d = editando?.data ?? r?.data
    return Boolean(d && d !== hoje() && d !== ontem())
  })
  // DAS: de qual mês é o boleto (o normal é o do mês anterior à data)
  const [competencia, setCompetencia] = useState<string | undefined>(editando?.competencia ?? r?.competencia)
  const [tentou, setTentou] = useState(false)
  const [bloqueio, setBloqueio] = useState<string | null>(null)
  const ehDAS = tipo === 'saida' && categoria === 'das'
  const compDAS = competenciaDAS({ data, competencia })
  const opcoesDAS = [...new Set([1, 2, 3].map((n) => somarMeses(mesDe(data), -n)).concat(compDAS))].sort().reverse()

  const ehEntrada = tipo === 'entrada'
  const disponivel = saldoReserva(e.lancamentos) + (editando?.tipo === 'resgate' ? editando.valor : 0)
  const formaReal: Forma | undefined = forma === 'fiado' ? undefined : forma
  const taxa = ehEntrada && valor && forma !== 'fiado' ? taxaDaForma(valor, formaReal, e.config.taxas) : 0
  const faltando =
    !valor || valor <= 0 ? 'Digite o valor.' :
    ehEntrada && !categoria ? 'Escolha o serviço.' :
    ehEntrada && !forma ? 'Escolha como a cliente pagou.' :
    tipo === 'saida' && !categoria ? 'Escolha o tipo de gasto.' :
    tipo === 'resgate' && valor > disponivel
      ? disponivel <= 0 ? 'A reserva está vazia: não tem o que tirar.' : `Na reserva só tem ${brl(disponivel)}.` :
    forma === 'fiado' && !cliente.trim() ? 'Escreva o nome de quem ficou com o fiado.' : null

  // o preço do serviço vai para o Valor (sem apagar um valor que ela digitou à mão)
  const valorEhDeServico = !valor || servicos.some((x) => x.preco === valor)
  function escolherServico(id: string) {
    setCategoria(id)
    const s = e.servicos.find((x) => x.id === id)
    if (s && valorEhDeServico) setValor(s.preco)
  }
  // "Outro": o preço de um serviço não vale; o campo fica vazio e pronto para digitar
  function escolherOutro() {
    setCategoria(SERVICO_AVULSO)
    if (valor && valorEhDeServico) setValor(null)
    requestAnimationFrame(() => document.getElementById('valor')?.focus())
  }

  function salvar() {
    setTentou(true)
    setBloqueio(null)
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
      // fiado que agora foi pago entra no caixa de hoje (regime de caixa); pago que continua pago mantém a data
      recebidoEm: editando ? recebidoEmAoEditar(editando, forma === 'fiado', hoje()) : undefined,
      competencia: ehDAS ? compDAS : undefined,
    }
    if (editando) {
      if (!atualizarLancamento(editando.id, dados)) {
        setBloqueio(TEXTO_RESERVA_USADA)
        return
      }
      avisar('Alterado!')
      voltar('')
      return
    }
    const novo = adicionarLancamento(dados)
    if (!novo) {
      setBloqueio(tipo === 'resgate' ? 'A reserva está vazia: não tem o que tirar.' : 'Digite o valor.')
      return
    }
    const sugerir = ehEntrada && forma !== 'fiado' && e.config.reservaPorAtendimento > 0
    voltar('')
    const desfazer = { rotulo: 'Desfazer', fazer: () => removerLancamento(novo.id) }
    avisar(
      sugerir ? `Anotado! Guardar ${brl(e.config.reservaPorAtendimento)} na reserva?` : 'Anotado!',
      sugerir
        ? [desfazer, {
            rotulo: 'Guardar',
            fazer: () => {
              const r = adicionarLancamento({ data, tipo: 'reserva', valor: e.config.reservaPorAtendimento, taxa: 0, categoria: 'reserva', recebido: true })
              if (r) avisar('Guardado na reserva.', { rotulo: 'Desfazer', fazer: () => { if (!removerLancamento(r.id)) avisar(TEXTO_RESERVA_USADA) } })
            },
          }]
        : desfazer,
    )
  }

  function apagar() {
    if (!editando) return
    const l = removerLancamento(editando.id)
    if (!l) {
      setBloqueio(TEXTO_RESERVA_USADA)
      return
    }
    voltar('')
    avisar('Anotação apagada.', { rotulo: 'Desfazer', fazer: () => { if (!restaurarLancamento(l)) avisar(TEXTO_RESERVA_USADA) } })
  }

  if (editarId && !editando) {
    return (
      <Pagina titulo="Anotação" voltarPara="">
        <p class="intro">Esta anotação não existe mais (talvez tenha sido apagada).</p>
        <button class="btn btn-primario btn-largo" onClick={() => ir('', { substituir: true })}>Voltar para o início</button>
      </Pagina>
    )
  }

  return (
    <Pagina class="lancar" titulo={editando ? `Mudar: ${ROTULO_TIPO[tipo]}` : NAS_ABAS.includes(tipo) ? 'Anotar' : TITULOS[tipo]} voltarPara="">
      {/* título neutro ("Anotar") + controle segmentado: o tipo aparece uma vez só, no controle */}
      {!editando && NAS_ABAS.includes(tipo) && (
        <nav class="abas-tipo" aria-label="O que você quer anotar">
          {NAS_ABAS.map((t) => (
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
                <small>{brl(s.preco)}</small>
              </button>
            ))}
            <button type="button" class={`opcao ${categoria === SERVICO_AVULSO ? 'ativa' : ''}`} aria-pressed={categoria === SERVICO_AVULSO} onClick={escolherOutro}>
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
                <span aria-hidden="true" class="opcao-ic"><IconeCategoria l={{ tipo: 'saida', categoria: c.id }} /></span>
                <span>{c.nome}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {ehDAS && (
        <Escolha<string>
          rotulo="De qual mês é esse DAS?"
          valor={compDAS}
          aoMudar={setCompetencia}
          colunas={3}
          opcoes={opcoesDAS.map((m) => ({ valor: m, rotulo: capitalizar(nomeMesCurto(m)), extra: m.slice(0, 4) }))}
        />
      )}
      {ehDAS && <p class="campo-dica">Normalmente é o do mês passado. Assim o app marca certo qual DAS já foi pago.</p>}

      {tipo === 'retirada' && (
        <Nota>Separar o dinheiro da casa do dinheiro do salão ajuda a saber quanto o salão rende de verdade. {e.config.salarioMensal > 0 ? `Seu combinado: ${brl(e.config.salarioMensal)} por mês.` : 'Você ainda não combinou um salário. Dá para combinar em Ajustes.'}</Nota>
      )}
      {tipo === 'reserva' && <Nota tom="bom">Dinheiro guardado é fôlego para quando um imprevisto chegar, como o secador quebrar.</Nota>}
      {tipo === 'resgate' && <Nota>Use a reserva só para emergência do salão. Depois, volte a guardar aos poucos.</Nota>}

      <CampoValor id="valor" rotulo="Valor" valor={valor} aoMudar={setValor} autoFocus={!ehEntrada && tipo !== 'saida'}
        dica={ehEntrada && categoria !== SERVICO_AVULSO ? 'o preço vem do serviço' : undefined} />

      {ehEntrada && (
        <Escolha<FormaOuFiado>
          rotulo="Como pagou?"
          valor={forma}
          aoMudar={setForma}
          class="formas"
          colunas={6}
          opcoes={[
            { valor: 'pix', rotulo: 'Pix' },
            { valor: 'dinheiro', rotulo: 'Dinheiro' },
            { valor: 'debito', rotulo: 'Débito' },
            { valor: 'credito', rotulo: 'Crédito' },
            { valor: 'fiado', rotulo: 'Fiado' },
          ]}
        />
      )}

      {ehEntrada && taxa > 0 && valor && (
        <p class="calculo">A maquininha fica com {brl(taxa)}. Para você: <b>{brl(valor - taxa)}</b>.</p>
      )}
      {ehEntrada && forma === 'fiado' && <p class="campo-dica">Fiado: a cliente paga depois. Só entra no caixa quando ela pagar.</p>}

      {(forma === 'fiado' || (ehEntrada && cliente)) && (
        <CampoTexto id="cliente" rotulo={forma === 'fiado' ? 'Quem ficou com o fiado?' : 'Cliente (opcional)'} valor={cliente} aoMudar={setCliente}
          placeholder="Primeiro nome ou apelido" dica="Só para você lembrar. Não precisa de sobrenome nem telefone." maxLength={30} />
      )}

      <CampoTexto id="descricao" rotulo="Anotação (opcional)" valor={descricao} aoMudar={setDescricao}
        placeholder={tipo === 'saida' ? 'ex.: shampoo e máscara' : ''} maxLength={LIMITES.descricao} />

      <Escolha<string>
        rotulo="Quando?"
        valor={outroDia ? 'outro' : data === hoje() ? 'hoje' : data === ontem() ? 'ontem' : 'outro'}
        aoMudar={(v) => {
          setOutroDia(v === 'outro')
          if (v === 'hoje') setData(hoje())
          else if (v === 'ontem') setData(ontem())
        }}
        estilo="linha"
        opcoes={[{ valor: 'hoje', rotulo: 'Hoje' }, { valor: 'ontem', rotulo: 'Ontem' }, { valor: 'outro', rotulo: 'Outro dia' }]}
      />
      {outroDia && <label class="campo" for="data">
        <span class="campo-rotulo sr-only">Data</span>
        <input id="data" type="date" class="campo-input" value={data} max={hoje()} min={`${somarMeses(hoje().slice(0, 7), -24)}-01`}
          onInput={(ev) => { const v = (ev.currentTarget as HTMLInputElement).value; if (v) setData(v) }} />
      </label>}

      {tentou && faltando && <p class="erro" role="alert">{faltando}</p>}
      {bloqueio && !faltando && <p class="erro" role="alert">{bloqueio}</p>}

      <div class="rodape-acoes rodape-fixo">
        <button class="btn btn-primario btn-largo" onClick={salvar}>
          {editando ? 'Salvar alteração' : valor ? `Salvar ${brl(valor)}${ehEntrada && forma ? ` · ${forma === 'fiado' ? 'fiado' : NOMES_FORMA[forma]}` : ''}` : 'Salvar'}
        </button>
        {editando && <button class="btn btn-perigo btn-largo" onClick={apagar}>Apagar esta anotação</button>}
      </div>
    </Pagina>
  )
}

function capitalizar(t: string) {
  return t.charAt(0).toUpperCase() + t.slice(1)
}

function ontem() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return hoje(d)
}
