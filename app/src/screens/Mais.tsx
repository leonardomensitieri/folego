import { useState } from 'preact/hooks'
import { fiadosAbertos, saldoReserva } from '../domain/calc'
import { brl } from '../domain/money'
import type { Centavos } from '../domain/types'
import { apagarTudoReal, armazenamentoPersistente, atualizarConfig, estado, leituraFalhou, modo, prefs, recomecarDemo, temDadosReais, trocarModo } from '../state/store'
import { IcAjuste, IcCalendario, IcCaminhao, IcCelular, IcCofre, IcConversa, IcDado, IcEscudo, IcInfo, IcNuvem, IcPessoa, IcRecibo, IcSeta } from '../ui/icons'
import { avisar, BotaoWhatsApp, CampoNumero, CampoTexto, CampoValor, Escolha, Linha, Nota, Pagina } from '../ui/kit'
import { ir } from '../ui/router'
import { estaInstalado } from './Instalar'

export function nomeDaReserva(): string {
  return estado.value.config.nomeReserva?.trim() || 'Reserva'
}

export function Mais() {
  const e = estado.value
  const fiado = fiadosAbertos(e.lancamentos).reduce((a, l) => a + l.valor, 0)
  const feitos = (e.config.plano30 ?? []).filter(Boolean).length
  return (
    <Pagina titulo="Mais">
      <ul class="lista menu">
        <li><Linha icone={<IcCofre />} titulo="Reserva para imprevistos" sub={`Total na reserva: ${brl(saldoReserva(e.lancamentos))}`} onClick={() => ir('mais/reserva')} /></li>
        <li><Linha icone={<IcPessoa />} titulo="Fiado" sub={fiado ? `${brl(fiado)} para receber` : 'Ninguém com fiado'} onClick={() => ir('mais/fiado')} /></li>
        <li><Linha icone={<IcCalendario />} titulo="Meu plano do mês" sub={`4 passos pequenos · ${feitos} de 4 feitos`} onClick={() => ir('mais/plano')} /></li>
        <li><Linha icone={<IcCaminhao />} titulo="Fornecedores" sub="Compare preços antes de comprar" onClick={() => ir('mais/fornecedores')} /></li>
        <li><Linha icone={<IcRecibo />} titulo="MEI em dia" sub={e.config.ehMei === false ? 'Você disse que não é MEI' : 'DAS, limite e relatório mensal'} onClick={() => ir('mais/mei')} /></li>
        <li>
          <a class="linha linha-botao" href={`${import.meta.env.BASE_URL}laboratorio/`}>
            <span class="linha-icone" aria-hidden="true"><IcDado /></span>
            <span class="linha-meio">
              <span class="linha-titulo">Treinar: e se o produto subir de preço?</span>
              <span class="linha-sub">Um jogo curto com imprevistos de salão, sem nota</span>
            </span>
            <span class="linha-seta" aria-hidden="true"><IcSeta size={20} /></span>
          </a>
        </li>
        <li><Linha icone={<IcConversa />} titulo="Mensagens prontas" sub="Ausência, retorno, horário livre, indicação" onClick={() => ir('mais/mensagens')} /></li>
        {!estaInstalado() && <li><Linha icone={<IcCelular />} titulo="Instalar no celular" sub="Abrir como app, sem internet" onClick={() => ir('mais/instalar')} /></li>}
        <li><Linha icone={<IcNuvem />} titulo="Cópia de segurança" sub="Guardar e voltar seus dados" onClick={() => ir('mais/backup')} /></li>
        <li><Linha icone={<IcAjuste />} titulo="Ajustes" sub="Salário, reserva, maquininha, letra maior" onClick={() => ir('mais/ajustes')} /></li>
        <li><Linha icone={<IcEscudo />} titulo="Privacidade e limites" sub="Onde ficam seus dados" onClick={() => ir('mais/privacidade')} /></li>
        <li><Linha icone={<IcInfo />} titulo="Sobre o Fôlego" sub="Projeto de extensão" onClick={() => ir('mais/sobre')} /></li>
      </ul>

      <h2 class="secao">Demonstração</h2>
      {modo.value === 'demo' ? (
        <>
          <Nota>Você está vendo dados <b>fictícios</b>. Nada aqui é real.</Nota>
          <button class="btn btn-primario btn-largo" onClick={() => trocarModo('real').then(() => ir('', { substituir: true }))}>
            {temDadosReais.value ? 'Sair da demonstração (voltar aos meus dados)' : 'Sair da demonstração e começar'}
          </button>
          <button class="btn btn-largo" onClick={() => { recomecarDemo(); avisar('Demonstração reiniciada.') }}>Reiniciar a demonstração</button>
        </>
      ) : (
        <button class="btn btn-largo" onClick={() => trocarModo('demo').then(() => ir('', { substituir: true }))}>Ver com dados de exemplo (fictícios)</button>
      )}
    </Pagina>
  )
}

export function Ajustes() {
  const c = estado.value.config
  const [confirmando, setConfirmando] = useState(false)
  const setV = (k: 'salarioMensal' | 'metaReserva' | 'reservaPorAtendimento' | 'gastoMensalEstimado' | 'valorDAS') => (v: Centavos | null) => atualizarConfig({ [k]: v ?? 0 })
  return (
    <Pagina titulo="Ajustes" voltarPara="mais">
      <h2 class="secao">Leitura</h2>
      <label class="interruptor">
        <input type="checkbox" checked={prefs.value.letraGrande} onChange={(ev) => (prefs.value = { ...prefs.value, letraGrande: (ev.currentTarget as HTMLInputElement).checked })} />
        <span>Letra maior</span>
      </label>

      <h2 class="secao">Casa e salão</h2>
      <CampoValor id="salario" rotulo="Quanto o salão paga a você por mês (seu salário)" valor={c.salarioMensal} aoMudar={setV('salarioMensal')} />
      <CampoValor id="gasto" rotulo="Quanto o salão gasta num mês normal (mais ou menos)" valor={c.gastoMensalEstimado} aoMudar={setV('gastoMensalEstimado')} />

      <h2 class="secao">Reserva</h2>
      <CampoTexto id="nome-reserva" rotulo="Nome da sua reserva" valor={c.nomeReserva ?? ''} aoMudar={(v) => atualizarConfig({ nomeReserva: v })}
        placeholder="ex.: Fundo do secador" maxLength={30} dica="Dar um nome ajuda a só usar esse dinheiro em emergência do salão." />
      <CampoValor id="meta" rotulo="Meta da reserva" valor={c.metaReserva} aoMudar={setV('metaReserva')} />
      <CampoValor id="porat" rotulo="Quanto guardar a cada atendimento (sugestão)" valor={c.reservaPorAtendimento} aoMudar={setV('reservaPorAtendimento')} />

      <h2 class="secao">Maquininha</h2>
      <CampoNumero id="tdeb" rotulo="Taxa no débito" valor={c.taxas.debito} sufixo="%" max={20} passo={0.1} aoMudar={(v) => atualizarConfig({ taxas: { ...c.taxas, debito: v } })} />
      <CampoNumero id="tcred" rotulo="Taxa no crédito" valor={c.taxas.credito} sufixo="%" max={30} passo={0.1} aoMudar={(v) => atualizarConfig({ taxas: { ...c.taxas, credito: v } })} />
      <CampoNumero id="tpix" rotulo="Taxa para receber Pix (se o seu banco cobrar)" valor={c.taxas.pix ?? 0} sufixo="%" max={10} passo={0.1} aoMudar={(v) => atualizarConfig({ taxas: { ...c.taxas, pix: v } })} />
      <p class="campo-dica">Veja as taxas no app da sua maquininha e do seu banco. Elas valem para as próximas anotações.</p>

      <h2 class="secao">MEI</h2>
      <Escolha<'sim' | 'nao'>
        rotulo="Você é MEI (tem CNPJ de microempreendedora)?"
        valor={c.ehMei === undefined ? undefined : c.ehMei ? 'sim' : 'nao'}
        aoMudar={(v) => atualizarConfig({ ehMei: v === 'sim' })}
        opcoes={[{ valor: 'sim', rotulo: 'Sim' }, { valor: 'nao', rotulo: 'Não' }]}
      />
      {c.ehMei !== false && <CampoValor id="das" rotulo="Valor do seu DAS por mês" valor={c.valorDAS} aoMudar={setV('valorDAS')} />}

      {modo.value === 'real' && (
        <>
          <h2 class="secao">Apagar</h2>
          {leituraFalhou.value ? (
            <>
              <button class="btn btn-perigo btn-largo" disabled>Apagar todos os meus dados</button>
              <p class="campo-dica">Agora não dá para apagar: o app não conseguiu abrir o que está guardado no celular, então não sabe o que apagaria. Toque em “Tentar de novo” no alto da tela.</p>
            </>
          ) : !confirmando ? (
            <button class="btn btn-perigo btn-largo" onClick={() => setConfirmando(true)}>Apagar todos os meus dados</button>
          ) : (
            <div class="cartao confirmar">
              <p><b>Tem certeza?</b> Isso apaga tudo deste celular e não tem como desfazer. Faça uma cópia antes se quiser guardar.</p>
              <button class="btn btn-perigo btn-largo" onClick={() => apagarTudoReal().then((ok) => {
                if (!ok) { setConfirmando(false); avisar('Não deu para apagar agora. Tente de novo depois de abrir o app outra vez.'); return }
                avisar('Dados apagados deste celular.')
                ir('', { substituir: true })
              })}>Sim, apagar tudo</button>
              <button class="btn btn-largo" onClick={() => setConfirmando(false)}>Cancelar</button>
            </div>
          )}
        </>
      )}
    </Pagina>
  )
}

export function Privacidade() {
  const p = armazenamentoPersistente.value
  return (
    <Pagina titulo="Privacidade e limites" voltarPara="mais">
      <div class="texto">
        <h2>Onde ficam seus dados</h2>
        <p>Tudo o que você anota fica <b>só neste celular</b>. O Fôlego não tem servidor, cadastro nem senha. A equipe do projeto e a faculdade não veem seus números. Nenhuma inteligência artificial lê seus dados.</p>
        <h2>Quando algo sai do celular (só se você tocar)</h2>
        <ul>
          <li><b>WhatsApp:</b> o texto da mensagem vai para o WhatsApp, que é da empresa Meta.</li>
          <li><b>Cópia de segurança e planilha:</b> o arquivo vai para onde você mandar.</li>
          <li><b>Microfone do teclado:</b> o teclado pode mandar a sua voz para o Google ou a Apple para virar texto.</li>
          <li><b>Abrir e atualizar o app:</b> o celular baixa os arquivos do servidor do projeto (folego.sealugue.com). Como qualquer site, ele vê o endereço de internet do aparelho, mas não recebe nenhuma anotação sua.</li>
        </ul>
        <h2>Para que serve</h2>
        <p>Organizar o que entra e sai do seu salão, acompanhar a reserva e montar o relatório mensal do MEI. Os dados ficam até você apagar.</p>
        <h2>Dados das suas clientes</h2>
        <p>Se você anotar o nome de uma cliente, quem cuida desse dado é você. Anote só o primeiro nome ou um apelido. Se a cliente pedir, troque ou apague. O app não guarda telefone, CPF, endereço nem foto.</p>
        <h2>Apagar</h2>
        <p>Em Ajustes, “Apagar todos os meus dados” limpa este celular. As cópias que você mandou para WhatsApp, Drive ou e-mail continuam lá até você apagar.</p>
        <h2>O celular pode apagar sozinho?</h2>
        <p>{p === true
          ? 'Este celular prometeu guardar os dados do app. Mesmo assim, faça cópias.'
          : 'Pode acontecer se faltar espaço ou se você limpar os dados do navegador. Por isso: instale o app e faça cópias de segurança.'}</p>
        <h2>Limites</h2>
        <p>O Fôlego é uma ferramenta educativa de organização. <b>Não é consultoria financeira, contábil ou jurídica</b> e não garante resultado. As contas de “Decidir” são aproximadas, feitas com os números que você digitou. Quem decide é você. Para decisões importantes, procure o Sebrae (0800 570 0800) ou um contador.</p>
        <h2>Quem fez</h2>
        <p>Equipe do Projeto de Extensão “Negócio à Prova de Choques”, curso de Administração da Faculdade HUB, 2º semestre de 2026. Dúvidas: fale com a equipe que apresentou o app a você.</p>
      </div>
    </Pagina>
  )
}

export function Sobre() {
  return (
    <Pagina titulo="Sobre o Fôlego" voltarPara="mais">
      <div class="texto">
        <p><b>Fôlego</b> é o caixa de bolso para salões de uma profissional só: anotar o que entrou e o que saiu em segundos, separar o dinheiro da casa do dinheiro do salão, formar uma reserva e ver o efeito de uma decisão antes de tomá-la.</p>
        <p>Nasceu no Projeto de Extensão “Negócio à Prova de Choques: Laboratório de Decisões sob Incerteza e Resiliência Empresarial”, da graduação em Administração da Faculdade HUB (2º semestre de 2026), como parte digital do Kit de Resiliência.</p>
        <p>Os cinco hábitos do Kit viraram partes do app:</p>
        <ol>
          <li>Separar casa e salão → “Tirei pra casa” e o seu salário do mês.</li>
          <li>Anotar entradas e saídas → Atendimento rápido, “Recebi”, “Gastei” e “Escreva do seu jeito”.</li>
          <li>Formar uma reserva → Fôlego, com o nome que você escolher.</li>
          <li>Ter mais de um fornecedor → Fornecedores.</li>
          <li>Manter o vínculo com as clientes → “Meu diferencial” e Mensagens prontas.</li>
        </ol>
        <p class="muted pequeno">Versão {__APP_VERSION__}. Código feito com apoio de inteligência artificial e revisado pela equipe; testado apenas com dados fictícios.</p>
      </div>
    </Pagina>
  )
}

function mensagens(diferencial: string) {
  const dif = diferencial.trim()
  return [
    {
      titulo: 'Aviso de ausência (uma semana sem atender)',
      texto: 'Oi! Tudo bem? 😊 Vou precisar ficar fora do salão de __/__ a __/__ por um imprevisto. Seu horário está guardado: me responde aqui que a gente remarca do jeito que for melhor para você. Obrigada pela compreensão!',
    },
    {
      titulo: 'Lembrete de retorno',
      texto: `Oi! Tudo bem? Já faz um tempinho do seu último atendimento. Quer garantir um horário nesta semana? Tenho vaga na __ e na __.${dif ? ` ${dif}` : ''} 💇‍♀️`,
    },
    {
      titulo: 'Horário livre de última hora',
      texto: 'Oi! Abriu um horário hoje às __h. Se quiser aproveitar, é só me responder aqui. 😊',
    },
    {
      titulo: 'Agradecimento pela indicação',
      texto: 'Oi! Muito obrigada por me indicar para a sua amiga. 💜 No seu próximo atendimento você tem um presentinho de agradecimento.',
    },
    {
      titulo: 'Sinal para horário disputado',
      texto: 'Oi! Para garantir o horário de __/__ às __h, peço um sinal de R$ __ por Pix. O valor é descontado no dia. Combinado?',
    },
  ]
}

export function Mensagens() {
  const c = estado.value.config
  return (
    <Pagina titulo="Mensagens prontas" voltarPara="mais">
      <CampoTexto id="diferencial" rotulo="Meu diferencial em uma frase" valor={c.diferencial ?? ''} aoMudar={(v) => atualizarConfig({ diferencial: v })}
        placeholder="ex.: Atendo uma cliente por vez, com calma e cuidado." maxLength={120}
        dica="Do Kit de Resiliência: sua vantagem é a confiança, não o preço. Essa frase entra no lembrete de retorno." />
      <p class="intro">Toque para mandar. Você completa os espaços (__) e escolhe para quem.</p>
      {mensagens(c.diferencial ?? '').map((m) => (
        <div class="cartao mensagem">
          <h3>{m.titulo}</h3>
          <p>{m.texto}</p>
          <div class="mensagem-acoes">
            <BotaoWhatsApp texto={m.texto} />
            <button class="btn" onClick={() => navigator.clipboard?.writeText(m.texto).then(() => avisar('Mensagem copiada.'), () => avisar('Não deu para copiar.'))}>Copiar</button>
          </div>
        </div>
      ))}
    </Pagina>
  )
}

const PLANO = [
  'Semana 1 — Combinar o valor que o salão me paga por mês e começar a anotar entradas e saídas.',
  'Semana 2 — Dar nome à reserva e fazer o primeiro depósito.',
  'Semana 3 — Anotar ao menos dois preços por produto em Fornecedores.',
  'Semana 4 — Escrever meu diferencial e a mensagem de aviso de ausência.',
]

/** "Meu plano para os próximos 30 dias", do Kit de Resiliência, como lista de marcar (fica só no celular). */
export function Plano30() {
  const c = estado.value.config
  const feito = c.plano30 ?? [false, false, false, false]
  return (
    <Pagina titulo="Meu plano do mês" voltarPara="mais">
      <p class="intro">Um passo pequeno por semana, do Kit de Resiliência que a equipe preparou com você.</p>
      <ul class="lista">
        {PLANO.map((t, i) => (
          <li>
            <label class="interruptor plano-item">
              <input type="checkbox" checked={feito[i]} onChange={(ev) => {
                const novo = [...feito]
                novo[i] = (ev.currentTarget as HTMLInputElement).checked
                atualizarConfig({ plano30: novo })
                if (novo[i]) avisar('Muito bem! Passo feito. ✅')
              }} />
              <span>{t}</span>
            </label>
          </li>
        ))}
      </ul>
      <div class="acoes-pequenas">
        <button class="btn-pilula" onClick={() => ir('mais/ajustes')}>Salário e reserva</button>
        <button class="btn-pilula" onClick={() => ir('mais/fornecedores')}>Fornecedores</button>
        <button class="btn-pilula" onClick={() => ir('mais/mensagens')}>Mensagens</button>
      </div>
    </Pagina>
  )
}
