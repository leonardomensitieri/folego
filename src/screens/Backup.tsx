import { useState } from 'preact/hooks'
import { gerarBackup, nomeArquivoBackup, paraCSV } from '../domain/backup'
import { estado, importarBackup, modo, registrarBackupFeito } from '../state/store'
import { avisar, Nota, Pagina } from '../ui/kit'

async function compartilharOuBaixar(nome: string, conteudo: string, tipo: string): Promise<'compartilhado' | 'baixado' | 'cancelado'> {
  const arquivo = new File([conteudo], nome, { type: tipo })
  if (navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo], title: nome })
      return 'compartilhado'
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return 'cancelado'
    }
  }
  const url = URL.createObjectURL(arquivo)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
  return 'baixado'
}

export function Backup() {
  const [erro, setErro] = useState<string | null>(null)
  const e = estado.value
  const ultimo = e.config.ultimoBackup ? new Date(e.config.ultimoBackup).toLocaleDateString('pt-BR') : null

  async function exportar() {
    const r = await compartilharOuBaixar(nomeArquivoBackup(), JSON.stringify(gerarBackup(estado.value)), 'application/json')
    if (r !== 'cancelado') {
      registrarBackupFeito()
      avisar(r === 'compartilhado' ? 'Cópia enviada. Guarde num lugar seguro.' : 'Cópia baixada.')
    }
  }

  async function planilha() {
    await compartilharOuBaixar(`folego-lancamentos-${new Date().toISOString().slice(0, 10)}.csv`, '﻿' + paraCSV(estado.value), 'text/csv')
  }

  function importar(ev: Event) {
    const input = ev.currentTarget as HTMLInputElement
    const f = input.files?.[0]
    input.value = ''
    if (!f) return
    if (f.size > 20_000_000) {
      setErro('Arquivo grande demais para ser um backup do Fôlego.')
      return
    }
    f.text().then((t) => {
      if (!confirmarTroca()) return
      const msg = importarBackup(t)
      setErro(msg)
      if (!msg) avisar('Backup carregado!')
    })
  }

  return (
    <Pagina titulo="Cópia de segurança" voltarPara="mais">
      <Nota tom="alerta">
        Seus dados ficam <b>só neste celular</b>. Se o celular quebrar, for trocado ou o app for apagado, eles somem. Faça uma cópia por mês.
      </Nota>
      {modo.value === 'demo' && <Nota>Você está no modo demonstração. A cópia vai sair com os dados fictícios.</Nota>}
      <p class="muted">Última cópia: {ultimo ?? 'nunca'}</p>

      <button class="btn btn-primario btn-largo" onClick={exportar}>Fazer cópia agora</button>
      <p class="campo-dica">No celular abre o “Compartilhar”: mande para você mesma no WhatsApp ou salve no Drive/iCloud.</p>

      <h2 class="secao">Voltar uma cópia</h2>
      <label class="btn btn-largo arquivo">
        Escolher arquivo de cópia
        <input type="file" accept="application/json,.json" onChange={importar} />
      </label>
      <p class="campo-dica">Atenção: isso troca os dados deste celular pelos da cópia.</p>
      {erro && <p class="erro" role="alert">{erro}</p>}

      <h2 class="secao">Planilha</h2>
      <button class="btn btn-largo" onClick={planilha}>Baixar planilha (Excel/Google Planilhas)</button>
      <p class="campo-dica">Útil para mostrar a um contador ou ao Sebrae.</p>
    </Pagina>
  )
}

function confirmarTroca(): boolean {
  // confirm() é simples e funciona em todos os celulares; aqui a troca é irreversível, então vale a pausa.
  return window.confirm('Trocar os dados deste celular pelos da cópia?')
}
