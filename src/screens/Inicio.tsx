import { useEffect, useState } from 'preact/hooks'
import type { JSX } from 'preact'
import { custoMensal, diasDeFolego, divisaoDoSobrou, fiadosAbertos, primeiroMesDeUso, resumoDoMes, saldoReserva, situacaoDAS, vencimentoDAS } from '../domain/calc'
import { dataCurta, nomeMesCurto, somarMeses, tituloMes } from '../domain/dates'
import { brl } from '../domain/money'
import { dataHoje, estado, mesAtual, modo, prefs } from '../state/store'
import { IcAlerta, IcAltoFalante, IcCelular, IcCofre, IcMenos, IcNuvem, IcPessoa, IcRecibo, IcSeta, IcSoma } from '../ui/icons'
import { Barra, Cartao, Dinheiro } from '../ui/kit'
import { ir } from '../ui/router'
import { AtendimentoRapido } from './AtendimentoRapido'
import { EscrevaDoSeuJeito } from './EscrevaDoSeuJeito'
import { estaInstalado } from './Instalar'
import { ListaLancamentos } from './Movimentos'
import { nomeDaReserva } from './Mais'

/** Só usa voz que roda no próprio aparelho: os números não podem ir para um serviço de voz na internet. */
function vozLocal(): SpeechSynthesisVoice | undefined {
  if (!('speechSynthesis' in window)) return undefined
  return speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith('pt') && v.localService)
}

function ouvir(entrou: number, saiu: number, praCasa: number, sobrou: number) {
  const voz = vozLocal()
  if (!voz) return
  const falar = (c: number) => `${Math.floor(Math.abs(c) / 100)} reais${Math.abs(c) % 100 ? ` e ${Math.abs(c) % 100} centavos` : ''}`
  const texto = `Este mês entrou ${falar(entrou)}. Saiu ${falar(saiu)}. Pra casa, ${falar(praCasa)}. ${sobrou < 0 ? 'Faltaram' : 'Sobrou no salão'} ${falar(sobrou)}.`
  const u = new SpeechSynthesisUtterance(texto)
  u.voice = voz
  u.lang = voz.lang
  speechSynthesis.cancel()
  speechSynthesis.speak(u)
}

interface Aviso {
  chave: string
  forte?: boolean
  icone: JSX.Element
  titulo: JSX.Element | string
  texto: string
  ir: string
  rotulo: string
}

export function Inicio() {
  const e = estado.value
  const mes = mesAtual.value
  const r = resumoDoMes(e.lancamentos, mes)
  const reserva = saldoReserva(e.lancamentos)
  const custo = custoMensal(e, mes)
  const folego = diasDeFolego(reserva, custo)
  const fiados = fiadosAbertos(e.lancamentos)
  const totalFiado = fiados.reduce((a, l) => a + l.valor, 0)
  const compDAS = somarMeses(mes, -1)
  const dia = dataHoje.value
  // o app só cobra o DAS se ela é MEI e se já usava o app no mês da competência (sem alarme falso no primeiro uso)
  const cobraDAS = e.config.ehMei === true && primeiroMesDeUso(e.lancamentos, dia) <= compDAS
  const das = cobraDAS ? situacaoDAS(e.config, compDAS, dia, e.lancamentos) : 'pago'
  const diasSemBackup = e.config.ultimoBackup ? Math.floor((Date.now() - e.config.ultimoBackup) / 86_400_000) : null
  const precisaBackup = modo.value === 'real' && e.lancamentos.length >= 5 && (diasSemBackup === null || diasSemBackup >= 7)
  const sugerirInstalar = modo.value === 'real' && !estaInstalado() && !prefs.value.ocultarInstalar
  const deHoje = e.lancamentos.filter((l) => l.data === dia).sort((a, b) => b.criadoEm - a.criadoEm)
  const [mostrarComo, setMostrarComo] = useState(false)
  // as vozes do aparelho carregam depois da página; quando chegam, a tela redesenha e o botão "Ouvir" aparece
  const [temVoz, setTemVoz] = useState(() => Boolean(vozLocal()))
  useEffect(() => {
    if (!('speechSynthesis' in window)) return
    const f = () => setTemVoz(Boolean(vozLocal()))
    speechSynthesis.addEventListener('voiceschanged', f)
    return () => speechSynthesis.removeEventListener('voiceschanged', f)
  }, [])
  // Kit de Resiliência: "no fim do mês, olhe três números". Nos primeiros dias do mês, mostra o fechamento do anterior.
  const mesPassado = somarMeses(mes, -1)
  const fechamento = Number(dia.slice(8, 10)) <= 7 ? resumoDoMes(e.lancamentos, mesPassado) : null

  // Um aviso por vez, o mais importante primeiro (tela simples para quem lê palavra por palavra).
  const avisos: Aviso[] = []
  if (das === 'atrasado') avisos.push({ chave: 'das', forte: true, icone: <IcAlerta />, titulo: `DAS de ${nomeMesCurto(compDAS)} sem marcar como pago`, texto: `Venceu em ${dataCurta(vencimentoDAS(compDAS))}. Já pagou? Toque para marcar.`, ir: 'mais/mei', rotulo: 'Abrir MEI em dia' })
  if (sugerirInstalar) avisos.push({ chave: 'instalar', icone: <IcCelular />, titulo: 'Instale o Fôlego no celular', texto: e.lancamentos.length > 0 ? 'Abre como app e funciona sem internet. No iPhone, faça uma cópia antes: o app instalado começa vazio.' : 'Abre como app e funciona sem internet. Instale antes de começar a anotar.', ir: 'mais/instalar', rotulo: 'Ver como instalar' })
  if (totalFiado > 0) avisos.push({ chave: 'fiado', icone: <IcPessoa />, titulo: <>Fiado para receber: <Dinheiro v={totalFiado} /></>, texto: fiados.length === 1 ? '1 cliente vai pagar depois.' : `${fiados.length} clientes vão pagar depois.`, ir: 'mais/fiado', rotulo: 'Ver o fiado' })
  if (das === 'vence-logo') avisos.push({ chave: 'das', icone: <IcRecibo />, titulo: `DAS vence em ${dataCurta(vencimentoDAS(compDAS))}`, texto: 'Já pagou? Toque para marcar.', ir: 'mais/mei', rotulo: 'Abrir MEI em dia' })
  if (precisaBackup) avisos.push({ chave: 'backup', icone: <IcNuvem />, titulo: 'Faça uma cópia de segurança', texto: 'Seus dados ficam só neste celular.', ir: 'mais/backup', rotulo: 'Fazer cópia de segurança' })
  if (das === 'a-vencer') avisos.push({ chave: 'das', icone: <IcRecibo />, titulo: `DAS vence em ${dataCurta(vencimentoDAS(compDAS))}`, texto: 'Já pagou? Toque para marcar.', ir: 'mais/mei', rotulo: 'Abrir MEI em dia' })
  const aviso = avisos[0]
  const divisao = divisaoDoSobrou(r)

  return (
    <section class="pagina inicio">
      <header class="topo topo-inicio">
        <p class="sobretitulo">Seu salão em</p>
        <h1>{tituloMes(mes)}</h1>
      </header>

      <div class="conteudo">
        <Cartao class="destaque" onClick={() => ir(`movimentos/${mes}`)} rotulo="Toque para ver as anotações do mês">
          <p class="destaque-rotulo">{r.sobrou < 0 ? 'Faltou no salão' : 'Sobrou no salão'}</p>
          <p class="destaque-valor"><Dinheiro v={r.sobrou} /></p>
          <div class="tres">
            <span><small>Entrou</small><Dinheiro v={r.entrou} /></span>
            <span><small>Saiu</small><Dinheiro v={r.saiu} /></span>
            <span><small>Pra casa</small><Dinheiro v={r.praCasa} /></span>
          </div>
          {divisao && (
            <p class="destaque-nota">
              {divisao.tipo === 'dividido'
                ? <>Na reserva: <b><Dinheiro v={divisao.naReserva} /></b> · No caixa: <b><Dinheiro v={divisao.noCaixa} /></b></>
                : divisao.tipo === 'guardou-mais'
                  ? <>Você guardou <b><Dinheiro v={divisao.naReserva} /></b> na reserva, mais do que sobrou neste mês.</>
                  : <>Mesmo assim, você guardou <b><Dinheiro v={divisao.naReserva} /></b> na reserva neste mês.</>}
            </p>
          )}
        </Cartao>
        <div class="linha-links">
          <button class="link-sutil" onClick={() => setMostrarComo(!mostrarComo)} aria-expanded={mostrarComo}>
            {mostrarComo ? 'Fechar explicação' : 'Como esse número é calculado?'}
          </button>
          {temVoz && (
            <button class="link-sutil" onClick={() => ouvir(r.entrou, r.saiu, r.praCasa, r.sobrou)}><IcAltoFalante size={20} /> Ouvir</button>
          )}
        </div>
        {mostrarComo && (
          <p class="explica">
            <b>Sobrou</b> = o que entrou (já sem a taxa da maquininha) − os gastos do salão − o que você tirou pra casa.
            Fiado só conta quando a cliente paga.
            {divisao?.tipo === 'dividido' && ' “Na reserva” é a parte do que sobrou que você guardou neste mês; “No caixa” é o resto.'}
          </p>
        )}

        {aviso && (
          <button class="cartao aviso" onClick={() => ir(aviso.ir)}>
            <span class="aviso-icone" aria-hidden="true">{aviso.icone}</span>
            <span class="aviso-texto">
              <b>{aviso.titulo}</b>
              <small>{aviso.texto}</small>
            </span>
            <span class="linha-seta" aria-hidden="true"><IcSeta size={20} /></span>
            <span class="sr-only">{aviso.rotulo}</span>
          </button>
        )}
        {aviso?.chave === 'instalar' && (
          <button class="btn btn-pequeno btn-sutil" onClick={() => (prefs.value = { ...prefs.value, ocultarInstalar: true })}>Agora não</button>
        )}

        <AtendimentoRapido />

        <div class="atalhos">
          <button class="link" onClick={() => ir('lancar/retirada')}>Tirei pra casa</button>
          <button class="link" onClick={() => ir('lancar/reserva')}>Guardei na reserva</button>
        </div>

        {/* Recebi / Gastei ficam sempre à mão, presos logo acima do menu */}
        <div class="barra-acao" role="group" aria-label="Anotar">
          <button class="btn-grande btn-entrada" onClick={() => ir('lancar/entrada')}><IcSoma size={26} /> Recebi</button>
          <button class="btn-grande btn-saida" onClick={() => ir('lancar/saida')}><IcMenos size={26} /> Gastei</button>
        </div>

        <Cartao class="folego" onClick={() => ir('mais/reserva')} rotulo="Abrir a reserva">
          <div class="folego-topo">
            <IcCofre />
            <div>
              <p class="cartao-titulo">Reserva{nomeDaReserva() !== 'Reserva' ? ` · ${nomeDaReserva()}` : ''}</p>
              <p class="folego-dias">
                {reserva <= 0 ? 'Sem reserva ainda' : folego === 1 ? '1 dia de fôlego' : `${folego} dias de fôlego`}
              </p>
            </div>
            <Dinheiro v={reserva} class="folego-valor" />
          </div>
          <Barra parte={reserva} total={e.config.metaReserva} rotulo="Quanto da meta da reserva já foi guardado" />
          <p class="cartao-sub">
            {reserva <= 0
              ? `Guardar ${brl(e.config.reservaPorAtendimento)} por atendimento já começa a sua reserva.`
              : `Meta: ${brl(e.config.metaReserva)}. Se o salão parar, dá para cerca de ${folego} ${folego === 1 ? 'dia' : 'dias'} de contas.`}
          </p>
        </Cartao>

        {fechamento && (fechamento.entrou > 0 || fechamento.saiu > 0) && (
          <Cartao class="fechamento" onClick={() => ir(`movimentos/${mesPassado}`)} rotulo={`Ver o fechamento de ${nomeMesCurto(mesPassado)}`}>
            <p class="cartao-titulo">Fechamento de {nomeMesCurto(mesPassado)}</p>
            <p class="cartao-sub">
              Entrou <b><Dinheiro v={fechamento.entrou} /></b> · saiu <b><Dinheiro v={fechamento.saiu} /></b> ·
              pra casa <b><Dinheiro v={fechamento.praCasa} /></b> · sobrou <b class={fechamento.sobrou < 0 ? 'valor-menos' : 'valor-mais'}><Dinheiro v={fechamento.sobrou} /></b>
            </p>
          </Cartao>
        )}

        <EscrevaDoSeuJeito />

        <h2 class="secao">Hoje</h2>
        {deHoje.length === 0 ? (
          <p class="muted">Nada anotado hoje ainda.</p>
        ) : (
          <ListaLancamentos lancamentos={deHoje} semData />
        )}
      </div>
    </section>
  )
}
