# PRD — Fôlego v1 (MVP)

**Uma frase:** o caixa de bolso de um salão de uma profissional só — anotar em segundos, separar casa e salão,
formar reserva e ver o efeito de uma decisão antes de tomá-la.

**Para quem:** a proprietária da Organização Parceira A (salão em casa, MEI desde 2020, trabalha sozinha, ~12 clientes
por semana, agenda pelo WhatsApp, recebe por Pix, dinheiro e cartão). Depois: qualquer salão de uma pessoa.

**Onde ele entra no projeto:** é a **parte digital do Kit de Resiliência** (edital §3.3: "conjunto de instrumentos
reutilizáveis"). Substitui o "caderno ou planilha" do Kit e responde à sugestão de um colega do grupo (chat, 29/10) de usar
"o app financeiro do Sebrae no lugar de anotar em cadernos". Ver o porquê de um app próprio em [DISCOVERY.md](../discovery/DISCOVERY.md).

## Problema (com evidência)

| O que vimos | Fonte |
| --- | --- |
| "Não há controle formal" de entradas e saídas; "não há segregação de patrimônio" | formulário de escuta, 2.3 |
| Já pegou empréstimo de curto prazo por falta de controle; já se endividou para trocar secador e babyliss | formulário 3.1a, 3.4b |
| Cliente pediu para pagar depois e atrasou | formulário 3.1b |
| Sem reserva de emergência; se ela parar, o salão para | formulário 5.1, 2.5 |
| Insumos atrelados ao dólar; troca de produto quando encarece | formulário 3.3 |
| Na aplicação: "não entendeu por que a margem caiu, nunca tinha parado para pensar na consequência" | roteiro v4 (aplicação dia 29) |
| Pediu: "gostaria de ter noção do impacto das decisões" | roteiro v4, debriefing fase 2 |
| Ela mesma propôs: reserva de emergência e mais de um fornecedor | roteiro v4, fechamento |

## Objetivos

1. Registrar um atendimento em ≤ 3 toques e < 10 s.
2. Mostrar, a qualquer momento, **quanto sobrou** no salão no mês (regime de caixa, já sem taxa da maquininha).
3. Tornar visível a separação casa × salão e a reserva ("dias de fôlego").
4. Mostrar o efeito, em reais, de um desconto, de uma alta de insumo ou de um novo preço.
5. Deixar o MEI em dia sem esforço (DAS, limite, relatório mensal).
6. Nada sai do aparelho (edital §7.1 e §8.2; LGPD).

## Fora do escopo (de propósito)

Agenda de clientes (ela já usa WhatsApp), estoque, nota fiscal, conta e sincronização, IA em tempo de execução,
recomendações de crédito ou investimento, gráficos complexos.

## Funcionalidades e como funcionam

| # | Função | Como funciona | Liga ao Kit/Laboratório |
| --- | --- | --- | --- |
| 1 | **Início** | Cartão "Sobrou no salão" (entrou − saiu − pra casa), botões grandes Recebi/Gastei, Tirei pra casa, Guardei, "Escreva do seu jeito", cartão Fôlego, alertas (fiado, DAS, cópia, instalar), lançamentos de hoje, fechamento do mês anterior nos primeiros 7 dias, botão Ouvir | Hábito 2 "anotar" e "olhar três números no fim do mês" |
| 2 | **Lançar** | Serviço (preço já preenchido) → forma de pagamento (taxa calculada) → Salvar. Fiado pede só um apelido. Depois de salvar, sugere guardar R$ X na reserva. Desfazer por 7 s | Hábitos 2 e 3 |
| 3 | **Escreva do seu jeito** | Frase livre ("alisamento 180 crédito ana fiado") → interpretação no aparelho → "Entendi assim" → Salvar/Corrigir | Hábito 2 (atrito mínimo) |
| 4 | **Movimentos** | Mês a mês: entrou, gastos, resultado, pra casa, sobrou; para onde foi o dinheiro; o que mais trouxe dinheiro; lista por dia com edição | "Quanto entrou, saiu e sobrou" |
| 5 | **Decidir** | Margem por serviço (preço − taxa média − produto) e por hora. "E se…?" com 3 situações (concorrente/desconto, dólar/insumo, aumento) e atendimentos a mais para empatar. Calculadora de indicação | Rodadas 1 e 2 do Laboratório; debriefing |
| 6 | **Reserva** | Saldo, meta, dias de fôlego (reserva ÷ custo diário), guardar/usar | Hábito 3, Rodadas 3 e 4 |
| 7 | **A receber (fiado)** | Lista, dias em aberto, "Lembrar no WhatsApp" com mensagem educada, "ela pagou" com forma | Choque financeiro 3.1b |
| 8 | **Fornecedores** | Preço por produto em até N lugares, mais barato destacado, aviso de cotação antiga | Hábito 4, Rodada 2 |
| 9 | **MEI em dia** | Faturamento do ano vs. limite do ano (R$ 81 mil em 2026; R$ 110 mil em 2027; R$ 140 mil em 2028, LC 238/2026), DAS por competência (vence dia 20 ou no próximo dia útil, contando feriados nacionais), relatório mensal das receitas brutas para imprimir (obrigatório só até 2026) | Cuidados do MEI (Kit) |
| 10 | **Mensagens prontas** | Ausência (semana sem atender), retorno, horário livre, indicação, sinal | Hábito 5, Rodada 4 |
| 11 | **Cópia de segurança** | Arquivo JSON por compartilhamento (WhatsApp/Drive), restaurar com prévia, planilha CSV | Proteção de dados |
| 12 | **Demonstração** | Gaveta separada com dados 100% fictícios e determinísticos | Edital §8.1 (testes com dados fictícios) |
| 13 | **Acessibilidade** | Toque ≥ 48 px, letra maior, contraste AA, ícone + texto, ouvir resumo, funciona offline | Critério 3 (acessibilidade) |

## Regras de cálculo (as mesmas dos testes)

- Dinheiro em centavos inteiros. Taxa = valor × % da forma (débito, crédito e Pix configuráveis nos Ajustes, porque o Pix pode ser tarifado; dinheiro 0%).
- **Regime de caixa:** fiado só entra no mês em que é pago.
- Resultado do salão = entrou (líquido) − gastos. Sobrou = resultado − pra casa.
- Fôlego (dias) = ⌊reserva ÷ (custo mensal ÷ 30)⌋; custo mensal = o **maior** entre a estimativa dos Ajustes (gasto do mês + salário) e a média de (gastos + max(pra casa, salário)) dos 3 meses anteriores com gastos (conservador: um mês incompleto não infla o fôlego); sem histórico, estimativa dos Ajustes.
- Margem do serviço = preço − preço × taxa média real − custo do produto; por hora = margem ÷ (minutos ÷ 60).
- Atendimentos para empatar = ⌈margem_antes × n ÷ margem_depois − n⌉ (impossível se margem_depois ≤ 0).
- MEI: faturamento = soma dos valores **brutos** recebidos no ano. DAS da competência M vence dia 20 de M+1.

## Critérios de aceite

- [x] 156 testes automáticos passam (`npm test`), build sem erro de tipo.
- [x] Fluxos testados no navegador (375 px): boas-vindas, demonstração, lançar, escrever do seu jeito, decidir.
- [ ] Teste com a proprietária (sessão de entrega marcada para 05/11/2026).
- [x] Publicado em <https://folego.sealugue.com/folego/> (03/11/2026).
