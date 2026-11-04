# ADR-001 — Stack do MVP: PWA local-first (sem servidor)

- **Status:** aceito (03/11/2026)
- **Contexto de decisão:** um desenvolvedor, poucos dias até a entrega de 10/11/2026, usuária com celular e WhatsApp,
  edital que proíbe enviar dados da parceira para IA ou serviço não autorizado e exige testes com dados fictícios.

## Decisão

App web instalável (**PWA**) feito com **Preact + TypeScript + Vite**, dados guardados **só no aparelho**
(IndexedDB via `idb-keyval`), funcionamento offline com **service worker** (`vite-plugin-pwa`/Workbox), hospedagem
estática (**GitHub Pages**). Sem backend, sem conta, sem analytics, sem IA em tempo de execução.

## Por quê

| Critério | PWA local-first | PWA + Supabase | React Native / Expo |
| --- | --- | --- | --- |
| Tempo até produção | horas | dias (auth, RLS, LGPD) | semanas (lojas: teste fechado de 14 dias no Google Play, conta Apple paga) |
| Custo | zero | zero no começo; plano grátis pausa | US$ 99/ano Apple + US$ 25 Google |
| Compatível com o edital (dados não saem) | **sim** | só com autorização da coordenação | sim, se local |
| Offline | sim | parcial | sim |
| Instalação | "Adicionar à Tela de Início" (guiada no app) | idem | loja |
| Risco principal | perda de dados se trocar/limpar o celular | operação e conformidade | prazo |

Fonte da comparação: [pesquisa-ia-vertical-stack-ux-lgpd.md](../discovery/pesquisa-ia-vertical-stack-ux-lgpd.md) §2.

**Mobile first é necessário?** Sim: a usuária vive no celular (agenda e cobrança pelo WhatsApp, recebe por Pix na
hora do atendimento). Mas **nativo não é necessário agora**: tudo o que o MVP precisa (armazenamento local, offline,
compartilhar arquivo, abrir o WhatsApp, imprimir) funciona em PWA. Ver gatilhos para nativo no [roadmap](../roadmap.md).

## Consequências e mitigação

- **Perda de dados** (trocar/perder celular, limpar dados, despejo do Safari): `navigator.storage.persist()` no
  primeiro lançamento, instalação guiada, cópia de segurança em 1 toque (arquivo JSON versionado + planilha CSV),
  lembrete semanal na tela inicial, restauração com prévia e validação.
- **Sem sincronização entre aparelhos:** aceitável no MVP (uma profissional, um celular). Fase 2 do roadmap.
- **Sem notificação push:** lembretes aparecem ao abrir o app (DAS, fiado, cópia). Push exige servidor (Fase 2).
- **Segurança:** CSP restritiva no `index.html`, nenhum script ou fonte de terceiros, nenhum dado em URL.
- **Testabilidade:** toda regra de dinheiro fica em `src/domain/` (funções puras, centavos inteiros) com testes Vitest.

## Estrutura do código

```
app/src/
  domain/   tipos, dinheiro, datas, cálculos (resumo do mês, fôlego, margem, "e se?", MEI), interpretador de frases, backup, demo
  state/    store com signals + persistência IndexedDB (gaveta "real" separada da "demo")
  ui/       kit de componentes, ícones, roteador por hash, nomes
  screens/  Início, Lançar, Movimentos, Decidir, Reserva, Fiado, Fornecedores, MEI, Backup, Mais, Instalar, Começar
```
