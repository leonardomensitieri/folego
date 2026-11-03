import { useState } from 'preact/hooks'
import { custoMensal, diasDeFolego, fiadosAbertos, resumoDoMes, saldoReserva, situacaoDAS, vencimentoDAS } from '../domain/calc'
import { dataCurta, hoje, nomeMesCurto, somarMeses, tituloMes } from '../domain/dates'
import { brlCurto } from '../domain/money'
import { estado, mesAtual, modo } from '../state/store'
import { IcAlerta, IcCofre, IcConversa, IcMenos, IcNuvem, IcRecibo, IcSoma } from '../ui/icons'
import { Barra, Cartao, Dinheiro } from '../ui/kit'
import { ir } from '../ui/router'
import { EscrevaDoSeuJeito } from './EscrevaDoSeuJeito'
import { ListaLancamentos } from './Movimentos'

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
  const das = situacaoDAS(e.config, compDAS, hoje())
  const diasSemBackup = e.config.ultimoBackup ? Math.floor((Date.now() - e.config.ultimoBackup) / 86_400_000) : null
  const precisaBackup = modo.value === 'real' && e.lancamentos.length >= 10 && (diasSemBackup === null || diasSemBackup >= 30)
  const deHoje = e.lancamentos.filter((l) => l.data === hoje()).sort((a, b) => b.criadoEm - a.criadoEm)
  const [mostrarComo, setMostrarComo] = useState(false)
  // Kit de Resiliência: "no fim do mês, olhe três números". Nos primeiros dias do mês, mostra o fechamento do anterior.
  const mesPassado = somarMeses(mes, -1)
  const fechamento = Number(hoje().slice(8, 10)) <= 7 ? resumoDoMes(e.lancamentos, mesPassado) : null

  return (
    <section class="pagina inicio">
      <header class="topo topo-inicio">
        <div>
          <p class="sobretitulo">Seu salão em</p>
          <h1>{tituloMes(mes)}</h1>
        </div>
      </header>

      <div class="conteudo">
        <Cartao class={`destaque ${r.sobrou < 0 ? 'negativo' : ''}`} onClick={() => ir(`movimentos/${mes}`)} rotulo="Ver os lançamentos do mês">
          <p class="destaque-rotulo">Sobrou no salão</p>
          <p class="destaque-valor"><Dinheiro v={r.sobrou} /></p>
          <div class="tres">
            <span><small>Entrou</small><Dinheiro v={r.entrou} curto /></span>
            <span><small>Saiu</small><Dinheiro v={r.saiu} curto /></span>
            <span><small>Pra casa</small><Dinheiro v={r.praCasa} curto /></span>
          </div>
        </Cartao>
        <button class="link-sutil" onClick={() => setMostrarComo(!mostrarComo)} aria-expanded={mostrarComo}>
          {mostrarComo ? 'Fechar explicação' : 'Como esse número é calculado?'}
        </button>
        {mostrarComo && (
          <p class="explica">
            <b>Sobrou</b> = o que entrou (já sem a taxa da maquininha) − os gastos do salão − o que você tirou pra casa.
            Fiado só conta quando a cliente paga.
          </p>
        )}

        {fechamento && (fechamento.entrou > 0 || fechamento.saiu > 0) && (
          <Cartao class="fechamento" onClick={() => ir(`movimentos/${mesPassado}`)} rotulo={`Ver o fechamento de ${nomeMesCurto(mesPassado)}`}>
            <p class="cartao-titulo">Fechamento de {nomeMesCurto(mesPassado)}</p>
            <p class="cartao-sub">
              Entrou <b><Dinheiro v={fechamento.entrou} curto /></b> · saiu <b><Dinheiro v={fechamento.saiu} curto /></b> ·
              o salão gerou <b class={fechamento.resultado < 0 ? 'valor-menos' : 'valor-mais'}><Dinheiro v={fechamento.resultado} curto /></b>
            </p>
          </Cartao>
        )}

        <div class="acoes-grandes">
          <button class="btn-grande btn-entrada" onClick={() => ir('lancar/entrada')}>
            <IcSoma size={28} /> Recebi
          </button>
          <button class="btn-grande btn-saida" onClick={() => ir('lancar/saida')}>
            <IcMenos size={28} /> Gastei
          </button>
        </div>
        <div class="acoes-pequenas">
          <button class="btn-pilula" onClick={() => ir('lancar/retirada')}>🏡 Tirei pra casa</button>
          <button class="btn-pilula" onClick={() => ir('lancar/reserva')}>🐷 Guardei</button>
        </div>

        <EscrevaDoSeuJeito />

        <Cartao class="folego" onClick={() => ir('mais/reserva')} rotulo="Abrir a reserva">
          <div class="folego-topo">
            <IcCofre />
            <div>
              <p class="cartao-titulo">Fôlego</p>
              <p class="folego-dias">
                {reserva <= 0 ? 'Sem reserva ainda' : folego === 1 ? '1 dia' : `${folego} dias`}
              </p>
            </div>
            <Dinheiro v={reserva} curto class="folego-valor" />
          </div>
          <p class="cartao-sub">
            {reserva <= 0
              ? `Guardar ${brlCurto(e.config.reservaPorAtendimento)} por atendimento já começa a sua reserva.`
              : `Se o salão parar, sua reserva paga as contas por ${folego} ${folego === 1 ? 'dia' : 'dias'}.`}
          </p>
          <Barra parte={reserva} total={e.config.metaReserva} rotulo="Quanto da meta da reserva já foi guardado" />
          <p class="cartao-sub pequeno">Meta: {brlCurto(e.config.metaReserva)}</p>
        </Cartao>

        {(totalFiado > 0 || das !== 'pago' || precisaBackup) && (
          <div class="alertas">
            {totalFiado > 0 && (
              <Cartao class="alerta" onClick={() => ir('mais/fiado')} rotulo="Ver quem está devendo">
                <IcConversa />
                <span>
                  <b>A receber: <Dinheiro v={totalFiado} curto /></b>
                  <small>{fiados.length === 1 ? '1 cliente vai pagar depois' : `${fiados.length} clientes vão pagar depois`}</small>
                </span>
              </Cartao>
            )}
            {das !== 'pago' && (
              <Cartao class={`alerta ${das === 'atrasado' ? 'alerta-forte' : ''}`} onClick={() => ir('mais/mei')} rotulo="Abrir MEI em dia">
                {das === 'atrasado' ? <IcAlerta /> : <IcRecibo />}
                <span>
                  <b>{das === 'atrasado' ? 'DAS atrasado' : das === 'vence-logo' ? 'DAS vence logo' : 'DAS do mês'}</b>
                  <small>{das === 'atrasado' ? 'Pague o quanto antes para manter o INSS em dia.' : `Vence em ${dataCurta(vencimentoDAS(compDAS))}. Já pagou? Toque para marcar.`}</small>
                </span>
              </Cartao>
            )}
            {precisaBackup && (
              <Cartao class="alerta" onClick={() => ir('mais/backup')} rotulo="Fazer backup">
                <IcNuvem />
                <span>
                  <b>Faça uma cópia de segurança</b>
                  <small>Seus dados ficam só neste celular. Guarde uma cópia no WhatsApp ou no Drive.</small>
                </span>
              </Cartao>
            )}
          </div>
        )}

        <h2 class="secao">Hoje</h2>
        {deHoje.length === 0 ? (
          <p class="muted">Nada lançado hoje ainda.</p>
        ) : (
          <ListaLancamentos lancamentos={deHoje} semData />
        )}
      </div>
    </section>
  )
}
