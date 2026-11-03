import { signal } from '@preact/signals'
import type { ComponentChildren, JSX } from 'preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { brl, brlCurto, parseValor } from '../domain/money'
import type { Centavos } from '../domain/types'
import { IcSeta, IcVoltar } from './icons'
import { voltar } from './router'

// ---------- aviso rápido (toast) com "desfazer" ----------
export interface AcaoAviso {
  rotulo: string
  fazer: () => void
}
export interface Aviso {
  texto: string
  acoes: AcaoAviso[]
}
export const aviso = signal<Aviso | null>(null)
let avisoTimer: ReturnType<typeof setTimeout> | undefined
let avisoMs = 10_000

/** Mostra um aviso por 10 s (ou mais). Aceita até duas ações, ex.: "Desfazer" e "Guardar". */
export function avisar(texto: string, acao?: AcaoAviso | AcaoAviso[], ms = 10_000) {
  aviso.value = { texto, acoes: acao ? (Array.isArray(acao) ? acao : [acao]) : [] }
  avisoMs = ms
  armarTimer()
}
function armarTimer() {
  clearTimeout(avisoTimer)
  avisoTimer = setTimeout(() => (aviso.value = null), avisoMs)
}
function pausarTimer() {
  clearTimeout(avisoTimer)
}

/** A região "ao vivo" fica sempre na página para o leitor de tela anunciar cada aviso novo. */
export function Toast() {
  const a = aviso.value
  return (
    <div class="toast-regiao" role="status" aria-live="polite" aria-atomic="true">
      {a && (
        <div class="toast" onPointerEnter={pausarTimer} onPointerLeave={armarTimer} onFocusCapture={pausarTimer} onBlurCapture={armarTimer}>
          <span>{a.texto}</span>
          {a.acoes.length > 0 && (
            <span class="toast-acoes">
              {a.acoes.map((ac) => (
                <button class="toast-acao" onClick={() => { aviso.value = null; ac.fazer() }}>{ac.rotulo}</button>
              ))}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ---------- estrutura de página ----------
export function Pagina({ titulo, voltarPara, children, acao }: {
  titulo: string
  voltarPara?: string
  acao?: JSX.Element
  children: ComponentChildren
}) {
  return (
    <section class="pagina">
      <header class="topo">
        {voltarPara !== undefined ? (
          <button class="btn-icone" aria-label="Voltar" onClick={() => voltar(voltarPara)}>
            <IcVoltar />
          </button>
        ) : <span class="topo-espaco" />}
        <h1>{titulo}</h1>
        {acao ?? <span class="topo-espaco" />}
      </header>
      <div class="conteudo">{children}</div>
    </section>
  )
}

export function Cartao({ children, class: cls = '', onClick, rotulo }: {
  children: ComponentChildren
  class?: string
  onClick?: () => void
  rotulo?: string
}) {
  if (onClick) {
    return (
      <button class={`cartao cartao-botao ${cls}`} onClick={onClick}>
        {children}
        {rotulo && <span class="sr-only">{rotulo}</span>}
      </button>
    )
  }
  return <div class={`cartao ${cls}`}>{children}</div>
}

export function Dinheiro({ v, curto, sinal: comSinal, class: cls = '' }: { v: Centavos; curto?: boolean; sinal?: boolean; class?: string }) {
  const txt = curto ? brlCurto(Math.abs(v)) : brl(Math.abs(v))
  const prefixo = comSinal ? (v > 0 ? '+ ' : v < 0 ? '− ' : '') : v < 0 ? '− ' : ''
  return <span class={`dinheiro ${cls}`}>{prefixo}{txt}</span>
}

// ---------- campo de valor em reais ----------
export function CampoValor({ valor, aoMudar, rotulo, autoFocus, id }: {
  valor: Centavos | null
  aoMudar: (v: Centavos | null) => void
  rotulo: string
  autoFocus?: boolean
  id: string
}) {
  const [texto, setTexto] = useState(valor !== null && valor > 0 ? formatarEdicao(valor) : '')
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    // quando o valor muda por fora (ex.: escolheu um serviço), atualiza o campo
    const atual = parseValor(texto)
    if (valor !== atual) setTexto(valor !== null && valor > 0 ? formatarEdicao(valor) : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valor])
  useEffect(() => {
    if (autoFocus) ref.current?.focus()
  }, [autoFocus])
  return (
    <label class="campo campo-valor" for={id}>
      <span class="campo-rotulo">{rotulo}</span>
      <span class="campo-caixa">
        <span class="campo-prefixo">R$</span>
        <input
          ref={ref}
          id={id}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00"
          value={texto}
          onInput={(e) => {
            const t = (e.currentTarget as HTMLInputElement).value.replace(/[^\d.,]/g, '')
            setTexto(t)
            aoMudar(parseValor(t))
          }}
        />
      </span>
    </label>
  )
}

function formatarEdicao(c: Centavos) {
  return c % 100 === 0 ? String(c / 100) : (c / 100).toFixed(2).replace('.', ',')
}

export function CampoTexto({ valor, aoMudar, rotulo, placeholder, id, dica, maxLength = 60 }: {
  valor: string
  aoMudar: (v: string) => void
  rotulo: string
  placeholder?: string
  id: string
  dica?: string
  maxLength?: number
}) {
  return (
    <label class="campo" for={id}>
      <span class="campo-rotulo">{rotulo}</span>
      <input id={id} class="campo-input" value={valor} placeholder={placeholder} maxLength={maxLength} autoComplete="off"
        aria-describedby={dica ? `${id}-dica` : undefined}
        onInput={(e) => aoMudar((e.currentTarget as HTMLInputElement).value)} />
      {dica && <span class="campo-dica" id={`${id}-dica`}>{dica}</span>}
    </label>
  )
}

export function CampoNumero({ valor, aoMudar, rotulo, id, sufixo, min = 0, max = 1000, passo = 1 }: {
  valor: number
  aoMudar: (v: number) => void
  rotulo: string
  id: string
  sufixo?: string
  min?: number
  max?: number
  passo?: number
}) {
  return (
    <label class="campo" for={id}>
      <span class="campo-rotulo">{rotulo}</span>
      <span class="campo-caixa">
        <input id={id} inputMode="decimal" value={String(valor).replace('.', ',')}
          onInput={(e) => {
            const n = Number((e.currentTarget as HTMLInputElement).value.replace(',', '.'))
            if (Number.isFinite(n)) aoMudar(Math.min(max, Math.max(min, n)))
          }} />
        {sufixo && <span class="campo-sufixo">{sufixo}</span>}
      </span>
      <span class="passos" aria-hidden="true">
        <button type="button" tabIndex={-1} onClick={() => aoMudar(Math.max(min, +(valor - passo).toFixed(2)))}>−</button>
        <button type="button" tabIndex={-1} onClick={() => aoMudar(Math.min(max, +(valor + passo).toFixed(2)))}>+</button>
      </span>
    </label>
  )
}

/** Grupo de opções grandes, uma escolhida (ex.: forma de pagamento). */
export function Escolha<T extends string>({ opcoes, valor, aoMudar, rotulo, colunas = 2 }: {
  opcoes: { valor: T; rotulo: string; extra?: string }[]
  valor: T | undefined
  aoMudar: (v: T) => void
  rotulo: string
  colunas?: number
}) {
  return (
    <fieldset class="escolha">
      <legend class="campo-rotulo">{rotulo}</legend>
      <div class="escolha-grade" style={{ '--cols': String(colunas) } as Record<string, string>}>
        {opcoes.map((o) => (
          <button type="button" class={`opcao ${valor === o.valor ? 'ativa' : ''}`} aria-pressed={valor === o.valor}
            onClick={() => aoMudar(o.valor)}>
            <span>{o.rotulo}</span>
            {o.extra && <small>{o.extra}</small>}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

export function Barra({ parte, total, rotulo }: { parte: number; total: number; rotulo: string }) {
  const p = total > 0 ? Math.max(0, Math.min(1, parte / total)) : 0
  return (
    <div class="barra" role="progressbar" aria-label={rotulo} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(p * 100)}>
      <span style={{ width: `${p * 100}%` }} />
    </div>
  )
}

export function Vazio({ titulo, texto, children }: { titulo: string; texto: string; children?: ComponentChildren }) {
  return (
    <div class="vazio">
      <strong>{titulo}</strong>
      <p>{texto}</p>
      {children}
    </div>
  )
}

export function Linha({ titulo, sub, direita, onClick, icone }: {
  titulo: ComponentChildren
  sub?: ComponentChildren
  direita?: ComponentChildren
  onClick?: () => void
  icone?: ComponentChildren
}) {
  const corpo = (
    <>
      {icone && <span class="linha-icone" aria-hidden="true">{icone}</span>}
      <span class="linha-meio">
        <span class="linha-titulo">{titulo}</span>
        {sub && <span class="linha-sub">{sub}</span>}
      </span>
      {direita && <span class="linha-direita">{direita}</span>}
      {onClick && <span class="linha-seta" aria-hidden="true"><IcSeta size={20} /></span>}
    </>
  )
  return onClick ? <button class="linha linha-botao" onClick={onClick}>{corpo}</button> : <div class="linha">{corpo}</div>
}

export function Nota({ children, tom = 'info' }: { children: ComponentChildren; tom?: 'info' | 'alerta' | 'bom' }) {
  return <p class={`nota nota-${tom}`}>{children}</p>
}

/**
 * Manda um texto para o WhatsApp (ou outro app) sem colocar nada no endereço da internet:
 * 1) "Compartilhar" do celular (o texto vai direto, dentro do aparelho, para o app escolhido);
 * 2) se não houver, copia o texto para ela colar;
 * 3) só em último caso abre o wa.me (aí o texto passa pelo endereço).
 */
export async function enviarTexto(texto: string) {
  if (navigator.share) {
    try {
      await navigator.share({ text: texto })
      return
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return
    }
  }
  try {
    await navigator.clipboard.writeText(texto)
    avisar('Mensagem copiada. Abra o WhatsApp e cole na conversa.')
    return
  } catch {
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank', 'noopener,noreferrer')
  }
}

export function BotaoWhatsApp({ texto, rotulo = 'Mandar pelo WhatsApp' }: { texto: string; rotulo?: string }) {
  return (
    <button type="button" class="btn btn-whats" onClick={() => enviarTexto(texto)}>
      {rotulo}
    </button>
  )
}
