# Roadmap do Fôlego

De ferramenta educativa (MVP do projeto de extensão) a **IA vertical para o micro salão**, no sentido de
"Services: The New Software" (Julien Bek, Sequoia, mar. 2026): vender o **trabalho feito** (obrigações e fechamento do
mês prontos), não mais uma ferramenta para preencher. Base: [pesquisa-ia-vertical-stack-ux-lgpd.md](discovery/pesquisa-ia-vertical-stack-ux-lgpd.md) §1 e §6.

**Regra que atravessa todas as fases:** descrever, não prescrever. O app mostra números, prazos e efeitos; quem decide
é a dona. Nada de recomendar empréstimo, investimento ou produto financeiro (vedado pelo edital e regulado pela CVM).

## Fase 1 — MVP local-first (agora → 10/11/2026) ✅ construído

Objetivo: ser usado de verdade pela Organização Parceira A e virar evidência no relatório (Critério 3).

- Lançar em 3 toques ou escrevendo ("corte 50 pix"), sem nada sair do aparelho.
- Sobrou no salão · separação casa × salão · fôlego (dias que a reserva paga) · fiado · fornecedores.
- "E se…?": desconto, dólar, aumento de preço, indicação (responde ao debriefing: "noção do impacto das decisões").
- MEI em dia: DAS, limite anual (R$ 81 mil em 2026; R$ 110 mil em 2027 e R$ 140 mil em 2028 pela LC 238/2026), relatório mensal de receitas brutas para imprimir (obrigatório só até 2026: revogado a partir de 01/01/2027 pela Res. CGSN 190/2026).
- Backup por arquivo, demonstração com dados fictícios, instalação guiada, letra maior, ouvir resumo.

**Métrica de sucesso:** dentro do projeto (uso real de 06 a 08/11/2026), a dona lança nos dias em que atende; depois, ≥ 5 dias por semana por 2 semanas; faz 1 cópia de segurança; usa o "E se…?"
antes de uma decisão de preço; diz, no retorno, que entende para onde foi o dinheiro do mês.

## Fase 2 — Nuvem opcional, com consentimento (dez/2026 → mar/2027)

Gatilho: mais de uma usuária, ou pedido para usar em dois aparelhos, ou perda de dados real.

- Origem própria (domínio ou organização) — feito em 03/11/2026: o app está em folego.sealugue.com.
- Conta opcional (magic link) e sincronização cifrada (Supabase/Postgres com RLS, região Brasil se possível).
- Notificações push (DAS dia 20, fiado parado, cópia de segurança) — iOS só com app instalado.
- LGPD: aviso de privacidade versionado, base legal por finalidade, contrato de operador, canal da titular, exclusão.
- Fim do vínculo acadêmico: decidir com a CPEX quem mantém o app (licença do código, responsável, contato).

## Fase 3 — Copilot (2027-T1/T2)

O dado nasce no Pix, na maquininha, no comprovante e no WhatsApp. O app passa a **se alimentar sozinho** e a dona só confirma.

- Captura: compartilhar comprovante (foto/PDF) para o app (Web Share Target ou app nativo) → extrai só valor, data e categoria, descarta a imagem.
- Voz no aparelho (reconhecimento local quando disponível; nunca enviar áudio sem consentimento).
- Classificação de gastos por modelo pequeno, com "desfazer" e aprendizado com as correções dela.
- Precificação assistida: "para sobrar R$ X por hora, este serviço precisa custar ≥ R$ Y" (mostra a conta).
- Fechamento do mês em 1 tela: entrou, saiu, sobrou, o que mudou e 1 alerta (descritivo).

## Fase 4 — Autopilot de regras (2027-T3 →)

Onde a tarefa é "inteligência" (regra pública, conferível), o app faz o trabalho e pede 1 toque de aprovação:

- Fechamento do mês gerado sozinho todo dia 1 (para ela, não para a Receita: o relatório mensal obrigatório acaba em 2027); DASN-SIMEI pré-preenchida em maio.
- DAS gerado via API oficial (Integra MEI/SERPRO, com procuração eletrônica no e-CAC); pagamento continua ação dela.
- NFS-e para cliente PJ pelo Emissor Nacional.
- Alerta de limite do MEI (80%) e de caixa ("esta semana sai mais do que entra").
- Canal WhatsApp do próprio app (bot de negócio: "corte 50 pix" por mensagem), avaliando termos da Meta e a decisão do CADE.

Preço (se virar produto): por resultado — ex.: "MEI em dia" mensal — e não por assento.

## Quando ir para nativo (Swift / Kotlin / React Native)

Só se um destes acontecer (senão, continuar PWA):

1. Perda de dados recorrente no iOS mesmo com app instalado e backup.
2. Precisar de notificação/alarme sem servidor, leitura de SMS/notificação de Pix ou widget na tela.
3. IA no aparelho (OCR/voz) que o navegador não oferece com desempenho aceitável.
4. Distribuição em escala por loja exigida por parceiro (ex.: Sebrae, banco, maquininha).

Escolha recomendada nesse caso: **React Native (Expo)** reaproveitando `src/domain/` (TypeScript puro, já testado).
Swift/Kotlin só se o requisito for profundamente nativo (widgets, leitura de notificações).

## Passagem para a equipe técnica

- Toda regra de negócio está em `app/src/domain/` com testes (`npm test`). É o ativo reaproveitável.
- Contratos de dados: `app/src/domain/types.ts` e o formato de backup (`folego-backup`, versão 1) em `backup.ts`.
- Decisões registradas em `docs/arquitetura/`. Requisitos e evidências no vault (`vault/wiki/app/`).
