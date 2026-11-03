import { useState } from 'preact/hooks'
import { fiadosAbertos, saldoReserva } from '../domain/calc'
import { brlCurto } from '../domain/money'
import type { Centavos } from '../domain/types'
import { apagarTudoReal, armazenamentoPersistente, atualizarConfig, estado, modo, prefs, recomecarDemo, temDadosReais, trocarModo } from '../state/store'
import { IcAjuste, IcBalanca, IcCaminhao, IcCasa, IcCofre, IcConversa, IcEscudo, IcInfo, IcNuvem, IcPessoa, IcRecibo } from '../ui/icons'
import { avisar, CampoNumero, CampoValor, Linha, linkWhatsApp, Nota, Pagina } from '../ui/kit'
import { ir, voltar } from '../ui/router'
import { estaInstalado } from './Instalar'

export function Mais() {
  const e = estado.value
  const fiado = fiadosAbertos(e.lancamentos).reduce((a, l) => a + l.valor, 0)
  return (
    <Pagina titulo="Mais">
      <ul class="lista menu">
        <li><Linha icone={<IcCofre />} titulo="Reserva (fôlego)" sub={`Guardado: ${brlCurto(saldoReserva(e.lancamentos))}`} onClick={() => ir('mais/reserva')} /></li>
        <li><Linha icone={<IcPessoa />} titulo="A receber (fiado)" sub={fiado ? `${brlCurto(fiado)} para receber` : 'Ninguém devendo'} onClick={() => ir('mais/fiado')} /></li>
        <li><Linha icone={<IcCaminhao />} titulo="Fornecedores" sub="Compare preços antes de comprar" onClick={() => ir('mais/fornecedores')} /></li>
        <li><Linha icone={<IcRecibo />} titulo="MEI em dia" sub="DAS, limite e relatório mensal" onClick={() => ir('mais/mei')} /></li>
        <li>
          <a class="linha linha-botao" href={`${import.meta.env.BASE_URL}laboratorio/`}>
            <span class="linha-icone" aria-hidden="true"><IcBalanca /></span>
            <span class="linha-meio">
              <span class="linha-titulo">Treinar decisões (Laboratório)</span>
              <span class="linha-sub">Jogo dos choques: concorrente, dólar, secador...</span>
            </span>
          </a>
        </li>
        <li><Linha icone={<IcConversa />} titulo="Mensagens prontas" sub="Aviso de ausência, retorno, cobrança" onClick={() => ir('mais/mensagens')} /></li>
        {!estaInstalado() && <li><Linha icone={<IcCasa />} titulo="Instalar no celular" sub="Abrir como app e proteger os dados" onClick={() => ir('mais/instalar')} /></li>}
        <li><Linha icone={<IcNuvem />} titulo="Cópia de segurança" sub="Guardar e voltar seus dados" onClick={() => ir('mais/backup')} /></li>
        <li><Linha icone={<IcAjuste />} titulo="Ajustes" sub="Salário, meta, taxas da maquininha" onClick={() => ir('mais/ajustes')} /></li>
        <li><Linha icone={<IcEscudo />} titulo="Privacidade e limites" sub="Onde ficam seus dados" onClick={() => ir('mais/privacidade')} /></li>
        <li><Linha icone={<IcInfo />} titulo="Sobre o Fôlego" sub="Projeto de extensão" onClick={() => ir('mais/sobre')} /></li>
      </ul>

      <h2 class="secao">Demonstração</h2>
      {modo.value === 'demo' ? (
        <>
          <Nota>Você está vendo dados <b>fictícios</b>. Nada aqui é real.</Nota>
          <button class="btn btn-primario btn-largo" onClick={() => trocarModo('real').then(() => ir('', { substituir: true }))}>
            {temDadosReais.value ? 'Voltar para os meus dados' : 'Começar com os meus dados'}
          </button>
          <button class="btn btn-largo" onClick={() => { recomecarDemo(); avisar('Demonstração reiniciada.') }}>Reiniciar a demonstração</button>
        </>
      ) : (
        <button class="btn btn-largo" onClick={() => trocarModo('demo').then(() => ir('', { substituir: true }))}>Ver com dados de exemplo</button>
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
      <h2 class="secao">Casa e salão</h2>
      <CampoValor id="salario" rotulo="Quanto o salão te paga por mês (seu salário)" valor={c.salarioMensal} aoMudar={setV('salarioMensal')} />
      <CampoValor id="gasto" rotulo="Gastos do salão num mês normal (estimativa)" valor={c.gastoMensalEstimado} aoMudar={setV('gastoMensalEstimado')} />

      <h2 class="secao">Reserva</h2>
      <CampoValor id="meta" rotulo="Meta da reserva" valor={c.metaReserva} aoMudar={setV('metaReserva')} />
      <CampoValor id="porat" rotulo="Sugestão para guardar a cada atendimento" valor={c.reservaPorAtendimento} aoMudar={setV('reservaPorAtendimento')} />

      <h2 class="secao">Maquininha</h2>
      <CampoNumero id="tdeb" rotulo="Taxa no débito" valor={c.taxas.debito} sufixo="%" max={20} passo={0.1} aoMudar={(v) => atualizarConfig({ taxas: { ...c.taxas, debito: v } })} />
      <CampoNumero id="tcred" rotulo="Taxa no crédito" valor={c.taxas.credito} sufixo="%" max={30} passo={0.1} aoMudar={(v) => atualizarConfig({ taxas: { ...c.taxas, credito: v } })} />
      <p class="campo-dica">Veja as taxas no app da sua maquininha. Elas valem para os próximos lançamentos.</p>

      <h2 class="secao">MEI</h2>
      <CampoValor id="das" rotulo="Valor do seu DAS mensal" valor={c.valorDAS} aoMudar={setV('valorDAS')} />

      <h2 class="secao">Leitura</h2>
      <label class="interruptor">
        <input type="checkbox" checked={prefs.value.letraGrande} onChange={(ev) => (prefs.value = { ...prefs.value, letraGrande: (ev.currentTarget as HTMLInputElement).checked })} />
        <span>Letra maior</span>
      </label>

      {modo.value === 'real' && (
        <>
          <h2 class="secao">Apagar</h2>
          {!confirmando ? (
            <button class="btn btn-perigo btn-largo" onClick={() => setConfirmando(true)}>Apagar todos os meus dados</button>
          ) : (
            <div class="cartao confirmar">
              <p><b>Tem certeza?</b> Isso apaga tudo deste celular e não tem como desfazer. Faça uma cópia antes se quiser guardar.</p>
              <button class="btn btn-perigo btn-largo" onClick={() => apagarTudoReal().then(() => { avisar('Dados apagados.'); ir('', { substituir: true }) })}>Sim, apagar tudo</button>
              <button class="btn btn-largo" onClick={() => setConfirmando(false)}>Cancelar</button>
            </div>
          )}
        </>
      )}
    </Pagina>
  )
}

export function Privacidade() {
  return (
    <Pagina titulo="Privacidade e limites" voltarPara="mais">
      <div class="texto">
        <h2>Onde ficam seus dados</h2>
        <p>Tudo o que você lança fica guardado <b>só neste celular</b>, dentro do navegador. O Fôlego não tem servidor, não pede cadastro, não usa senha e não envia seus números para ninguém — nem para a equipe do projeto, nem para a faculdade, nem para inteligência artificial.</p>
        <p>O app só usa a internet para se atualizar. Para isso o celular baixa os arquivos do app do GitHub (serviço que hospeda o site), que, como todo site, registra o endereço de internet (IP) do aparelho. Depois de aberto uma vez, funciona sem internet.</p>
        <h2>Para que serve</h2>
        <p>Organizar o que entra e sai do seu salão, acompanhar sua reserva e montar o relatório mensal do MEI. Os dados ficam até você apagar.</p>
        <h2>Cópia de segurança</h2>
        <p>Se você mandar a cópia de segurança por WhatsApp, e-mail ou Drive, o arquivo passa por esses serviços. Guarde num lugar só seu.</p>
        <p>Armazenamento protegido contra limpeza automática: <b>{armazenamentoPersistente.value === true ? 'sim' : armazenamentoPersistente.value === false ? 'não garantido neste navegador' : 'não informado'}</b>. Por isso, faça cópias de segurança.</p>
        <h2>O que o app guarda</h2>
        <p>Valores, datas, serviços, gastos e, se você quiser, o primeiro nome de quem ficou devendo. Não guarda telefone, CPF, endereço nem foto.</p>
        <p>Se você anotar nomes de clientes, quem cuida desses dados é você: anote só o necessário (um apelido basta). Use também o bloqueio de tela do celular.</p>
        <h2>Você manda nos seus dados</h2>
        <p>Você pode fazer uma cópia, levar para outro celular ou apagar tudo em Ajustes. Ao apagar, não sobra nada em lugar nenhum.</p>
        <h2>Limites</h2>
        <p>O Fôlego é uma ferramenta educativa de organização. <b>Não é consultoria financeira, contábil ou jurídica</b> e não garante resultado. As contas de “E se…?” mostram efeitos prováveis a partir dos números que você digitou. Para decisões importantes, procure o Sebrae (0800 570 0800) ou um contador.</p>
      </div>
    </Pagina>
  )
}

export function Sobre() {
  return (
    <Pagina titulo="Sobre o Fôlego" voltarPara="mais">
      <div class="texto">
        <p><b>Fôlego</b> é o caixa de bolso para salões de uma profissional só: anotar entradas e saídas em segundos, separar o dinheiro da casa do dinheiro do salão, formar uma reserva e ver o efeito de uma decisão antes de tomá-la.</p>
        <p>Nasceu no Projeto de Extensão “Negócio à Prova de Choques: Laboratório de Decisões sob Incerteza e Resiliência Empresarial”, da graduação em Administração da Faculdade HUB (2º semestre de 2026), como parte digital do Kit de Resiliência entregue à organização parceira.</p>
        <p>Os cinco hábitos do Kit viraram partes do app:</p>
        <ol>
          <li>Separar casa e salão → “Tirei pra casa” e o seu salário mensal.</li>
          <li>Anotar entradas e saídas → “Recebi”, “Gastei” e “Escreva do seu jeito”.</li>
          <li>Formar uma reserva → Fôlego.</li>
          <li>Ter mais de um fornecedor → Fornecedores.</li>
          <li>Manter o vínculo com as clientes → Mensagens prontas e A receber.</li>
        </ol>
        <p class="muted pequeno">Versão {__APP_VERSION__}. Código feito com apoio de inteligência artificial e revisado pela equipe; testado apenas com dados fictícios.</p>
      </div>
    </Pagina>
  )
}

const MENSAGENS = [
  {
    titulo: 'Aviso de ausência (semana sem atender)',
    texto: 'Oi! Tudo bem? 😊 Vou precisar ficar fora do salão de __/__ a __/__ por um imprevisto. Seu horário está guardado: me responde aqui que a gente remarca do jeito melhor para você. Obrigada pela compreensão!',
  },
  {
    titulo: 'Lembrete de retorno',
    texto: 'Oi! Tudo bem? Já faz um tempinho do seu último atendimento. Quer garantir um horário nesta semana? Tenho vagas na __ e na __. 💇‍♀️',
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

export function Mensagens() {
  return (
    <Pagina titulo="Mensagens prontas" voltarPara="mais">
      <p class="intro">Toque para abrir no WhatsApp. Você completa os espaços (__) e escolhe para quem mandar.</p>
      {MENSAGENS.map((m) => (
        <div class="cartao mensagem">
          <h3>{m.titulo}</h3>
          <p>{m.texto}</p>
          <div class="mensagem-acoes">
            <a class="btn btn-whats" href={linkWhatsApp(m.texto)} target="_blank" rel="noopener noreferrer">Abrir no WhatsApp</a>
            <button class="btn" onClick={() => navigator.clipboard?.writeText(m.texto).then(() => avisar('Mensagem copiada.'), () => avisar('Não deu para copiar.'))}>Copiar</button>
          </div>
        </div>
      ))}
      <button class="btn btn-largo" onClick={() => voltar('mais')}>Voltar</button>
    </Pagina>
  )
}
