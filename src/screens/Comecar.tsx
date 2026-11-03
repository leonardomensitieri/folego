import { useState } from 'preact/hooks'
import { brl } from '../domain/money'
import type { Centavos } from '../domain/types'
import { atualizarConfig, estado, prefs, salvarServico, trocarModo } from '../state/store'
import { IcFolego } from '../ui/icons'
import { CampoValor, Escolha, Nota } from '../ui/kit'
import { ir } from '../ui/router'

export function BoasVindas() {
  return (
    <section class="boas-vindas">
      <div class="marca">
        <span class="marca-icone"><IcFolego size={44} /></span>
        <h1>Fôlego</h1>
        <p class="lema">O caixa do seu salão, sem complicação.</p>
      </div>
      <ul class="beneficios">
        <li><b>Anote em segundos</b> o que entrou e o que saiu.</li>
        <li><b>Separe</b> o dinheiro da casa do dinheiro do salão.</li>
        <li><b>Forme uma reserva</b> para os imprevistos.</li>
        <li><b>Veja o efeito</b> de um desconto ou de um aumento antes de decidir.</li>
      </ul>
      <p class="privado">🔒 Sem cadastro e sem senha. Seus dados ficam só neste celular.</p>
      <div class="rodape-acoes">
        <button class="btn btn-primario btn-largo" onClick={() => ir('comecar/1')}>Começar</button>
        <button class="btn btn-largo" onClick={() => trocarModo('demo').then(() => ir('', { substituir: true }))}>Ver com dados de exemplo</button>
      </div>
    </section>
  )
}

/** Três perguntas e pronto. Tudo pode ser mudado depois. */
export function Comecar({ passo }: { passo: string }) {
  const e = estado.value
  const n = passo === '2' ? 2 : passo === '3' ? 3 : 1
  const [salario, setSalario] = useState<Centavos | null>(e.config.salarioMensal || null)
  const [meta, setMeta] = useState<Centavos | null>(e.config.metaReserva)
  const [porAt, setPorAt] = useState<Centavos | null>(e.config.reservaPorAtendimento)
  const [ehMei, setEhMei] = useState<'sim' | 'nao' | undefined>(e.config.ehMei === undefined ? undefined : e.config.ehMei ? 'sim' : 'nao')

  function concluir() {
    atualizarConfig({
      salarioMensal: salario ?? 0,
      metaReserva: meta ?? 0,
      reservaPorAtendimento: porAt ?? 0,
      ehMei: ehMei === undefined ? undefined : ehMei === 'sim',
      onboardingFeito: true,
    })
    ir('', { substituir: true })
  }

  return (
    <section class="pagina comecar">
      <header class="topo">
        <span class="passo">Passo {n} de 3</span>
      </header>
      <div class="conteudo">
        {n === 1 && (
          <>
            <h1>Seus preços</h1>
            <label class="interruptor">
              <input type="checkbox" checked={prefs.value.letraGrande} onChange={(ev) => (prefs.value = { ...prefs.value, letraGrande: (ev.currentTarget as HTMLInputElement).checked })} />
              <span>Letra maior</span>
            </label>
            <p class="intro">Confira o preço de cada serviço. Desligue o que você não faz.</p>
            <ul class="lista">
              {e.servicos.map((s) => (
                <li class="servico-onboarding">
                  <label class="interruptor">
                    <input type="checkbox" checked={s.ativo} onChange={(ev) => salvarServico({ ...s, ativo: (ev.currentTarget as HTMLInputElement).checked })} />
                    <span>{s.nome}</span>
                  </label>
                  {s.ativo && (
                    <CampoValor id={`p-${s.id}`} rotulo={`Preço de ${s.nome.toLowerCase()}`} valor={s.preco}
                      aoMudar={(v) => v !== null && salvarServico({ ...s, preco: v })} />
                  )}
                </li>
              ))}
            </ul>
            <p class="campo-dica">Quanto de produto cada serviço gasta você ajusta depois, em Decidir.</p>
            <button class="btn btn-primario btn-largo" onClick={() => ir('comecar/2', { substituir: true })}>Continuar</button>
          </>
        )}
        {n === 2 && (
          <>
            <h1>Casa e salão</h1>
            <p class="intro">Combine um valor fixo que o salão te paga por mês, como um salário. O resto fica no salão.</p>
            <CampoValor id="sal" rotulo="Meu salário por mês" valor={salario} aoMudar={setSalario} autoFocus />
            <Nota>Não sabe ainda? Deixe em branco e decida no fim do mês, olhando quanto sobrou.</Nota>
            <Escolha<'sim' | 'nao'> rotulo="Você é MEI (tem CNPJ de microempreendedora)?" valor={ehMei} aoMudar={setEhMei}
              opcoes={[{ valor: 'sim', rotulo: 'Sim' }, { valor: 'nao', rotulo: 'Não' }]} />
            <p class="campo-dica">Se for, o app lembra do DAS e soma o relatório mensal. Dá para mudar depois em Ajustes.</p>
            <button class="btn btn-primario btn-largo" onClick={() => ir('comecar/3', { substituir: true })}>Continuar</button>
          </>
        )}
        {n === 3 && (
          <>
            <h1>Sua reserva</h1>
            <p class="intro">Um pouquinho por atendimento vira fôlego para quando o secador quebrar ou você precisar parar uns dias.</p>
            <CampoValor id="porat" rotulo="Guardar a cada atendimento" valor={porAt} aoMudar={setPorAt} />
            <CampoValor id="meta" rotulo="Meta da reserva" valor={meta} aoMudar={setMeta} />
            {porAt && meta ? <p class="calculo">Com {brl(porAt)} por atendimento, a meta chega em cerca de {Math.ceil(meta / porAt)} atendimentos.</p> : null}
            <button class="btn btn-primario btn-largo" onClick={concluir}>Pronto, começar</button>
          </>
        )}
      </div>
    </section>
  )
}
