// Ícones simples em traço, desenhados para leitura em tela pequena.
import type { JSX } from 'preact'

type P = { size?: number; title?: string }

function Svg({ size = 24, title, children }: P & { children: JSX.Element | JSX.Element[] }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden={title ? undefined : 'true'} role={title ? 'img' : undefined}>
      {title ? <title>{title}</title> : <g />}
      {children}
    </svg>
  )
}

export const IcCasa = (p: P) => <Svg {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /><path d="M10 20v-5h4v5" /></Svg>
export const IcLista = (p: P) => <Svg {...p}><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1" /><circle cx="3.5" cy="12" r="1" /><circle cx="3.5" cy="18" r="1" /></Svg>
export const IcBalanca = (p: P) => <Svg {...p}><path d="M12 3v18M7 21h10" /><path d="M5 7h14" /><path d="m5 7-3 6a3 3 0 0 0 6 0L5 7Zm14 0-3 6a3 3 0 0 0 6 0l-3-6Z" /></Svg>
export const IcMais = (p: P) => <Svg {...p}><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></Svg>
export const IcSoma = (p: P) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
export const IcMenos = (p: P) => <Svg {...p}><path d="M5 12h14" /></Svg>
export const IcVoltar = (p: P) => <Svg {...p}><path d="M15 18 9 12l6-6" /></Svg>
export const IcSeta = (p: P) => <Svg {...p}><path d="m9 18 6-6-6-6" /></Svg>
export const IcCofre = (p: P) => <Svg {...p}><rect x="3" y="5" width="18" height="14" rx="2.5" /><circle cx="12" cy="12" r="3" /><path d="M12 9v1M12 14v1M7 19v1.5M17 19v1.5" /></Svg>
export const IcRelogio = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>
export const IcCasinha = (p: P) => <Svg {...p}><path d="M4 11 12 4l8 7v9H4z" /><path d="M9.5 20v-4.5h5V20" /></Svg>
export const IcRecibo = (p: P) => <Svg {...p}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" /><path d="M9 8h6M9 12h6M9 16h3" /></Svg>
export const IcCaixa = (p: P) => <Svg {...p}><path d="M3 8h18l-1.5 11a2 2 0 0 1-2 1.7H6.5a2 2 0 0 1-2-1.7z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></Svg>
export const IcEscudo = (p: P) => <Svg {...p}><path d="M12 3 5 6v5.5c0 4.5 3 7.8 7 9.5 4-1.7 7-5 7-9.5V6z" /><path d="m9 12 2 2 4-4" /></Svg>
export const IcNuvem = (p: P) => <Svg {...p}><path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5a4 4 0 0 1-.5 8.5z" /><path d="M12 11v6m-2.5-2.5L12 17l2.5-2.5" /></Svg>
export const IcConversa = (p: P) => <Svg {...p}><path d="M4 18.5V6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H8z" /><path d="M8 9h8M8 12.5h5" /></Svg>
export const IcAjuste = (p: P) => <Svg {...p}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></Svg>
export const IcInfo = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5v.5" /></Svg>
export const IcLixo = (p: P) => <Svg {...p}><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></Svg>
export const IcCheck = (p: P) => <Svg {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>
export const IcAlerta = (p: P) => <Svg {...p}><path d="M12 4 2.5 20h19z" /><path d="M12 10v4.5M12 17.5v.3" /></Svg>
export const IcPessoa = (p: P) => <Svg {...p}><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></Svg>
export const IcCaminhao = (p: P) => <Svg {...p}><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17.5" cy="17.5" r="1.8" /></Svg>
export const IcTeclado = (p: P) => <Svg {...p}><rect x="2.5" y="6" width="19" height="12" rx="2" /><path d="M6 10h.01M9.5 10h.01M13 10h.01M16.5 10h.01M7 14h10" /></Svg>
export const IcFolego = (p: P) => (
  <Svg {...p}>
    <path d="M3 9h11a3 3 0 1 0-3-3" />
    <path d="M3 13h15a3 3 0 1 1-3 3" />
    <path d="M3 17h6" />
  </Svg>
)
