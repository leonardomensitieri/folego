# Gauntlet — régua congelada (03/11/2026)

Prompt aplicado: `gauntlet-loop` (prompt-router), adaptado. Preenchimento:

- **[THING]** app Fôlego v1 (PWA) + Laboratório v2 (simulação HTML)
- **[REFERENCE]** (alvo real, lado a lado) o **app financeiro do Sebrae** que um colega do grupo propôs no lugar do caderno
  (telas públicas da loja/site) **+ esta régua** (critérios medíveis, congelados antes da primeira crítica)
- **[LOOK]** elegante, simples, acolhedor; legível para quem tem pouca familiaridade com finanças e celular
- **[TIER]** produção (nível das melhores fintechs brasileiras para microempreendedor)
- **[AREA_1] → [AREA_2]** da **corretude das contas** à **acessibilidade e linguagem**, passando por privacidade/edital, robustez offline e encaixe no Kit
- **[CHECK]** críticos independentes e duros, às cegas, com prints a 375 px lado a lado com a referência e esta régua
- **[STACK]** Preact + TypeScript + Vite + vite-plugin-pwa (a atual — sem trocar de stack)

Esta régua **não muda** durante o loop. Só muda o produto.

## Critérios (cada um 0–10; passa com ≥ 9 em todos e nenhum bloqueador aberto)

### A. Corretude das contas
- A1. `npm test` verde; nenhum NaN, `undefined` ou valor negativo indevido em tela.
- A2. Para qualquer mês: Sobrou = Entrou − Saiu − Pra casa; fiado só entra quando pago; taxa só em cartão.
- A3. "Escreva do seu jeito" acerta tipo, valor e forma em ≥ 90% de 30 frases reais de salão (bateria do crítico).
- A4. MEI: DAS vence dia 20 de M+1; nenhum "atrasado" falso; faturamento usa valor bruto.

### B. Tarefas da usuária (contagem de toques a partir da tela inicial)
- B1. Lançar um corte pago no Pix: ≤ 3 toques.  B2. Lançar fiado com nome: ≤ 5 toques + digitar o nome.
- B3. Ver quanto sobrou no mês: 0 toques.  B4. Simular desconto de 15% num serviço: ≤ 3 toques.
- B5. Fazer cópia de segurança: ≤ 3 toques.  B6. Desfazer um lançamento errado: ≤ 2 toques.

### C. Acessibilidade
- C1. Alvos de toque ≥ 44 px (meta 48) em tudo que é clicável.  C2. Contraste de texto WCAG AA.
- C3. Todo campo com rótulo; ícone nunca sozinho sem texto.  C4. Foco visível; `lang="pt-BR"`.
- C5. Sem rolagem horizontal a 320 px, também com "Letra maior".

### D. Linguagem
- D1. Telas principais em linguagem de 6º ano; sem jargão (fluxo de caixa, DRE, conciliação).
- D2. Vocabulário consistente (Entrou / Saiu / Sobrou / Pra casa / Reserva / Fiado) em todas as telas.
- D3. Português correto, com acentuação; tom acolhedor, nunca culpando a usuária.

### E. Visual (comparação cega)
- E1. Lado a lado com a referência, sem rótulos, o crítico prefere o Fôlego em clareza **e** elegância.
- E2. Hierarquia: o número principal ("Sobrou") é a primeira coisa lida; no máximo 1 cor de destaque por tela.

### F. Privacidade e edital
- F1. Nenhuma requisição de rede em uso além da própria origem; CSP ativa; nada de terceiros.
- F2. Nenhum dado pessoal ou do parceiro no código, nos textos ou na demonstração.
- F3. "Não é consultoria" visível onde há conta de decisão; nenhuma recomendação de crédito/investimento.
- F4. Demonstração 100% fictícia, sinalizada o tempo todo e separada dos dados reais.

### G. Robustez (PWA)
- G1. Funciona offline depois do primeiro acesso; manifest válido e instalável.
- G2. Dados sobrevivem a recarregar e a trocar de modo (demo ↔ real).
- G3. Backup ida e volta sem perda; importação recusa arquivo estranho.  G4. Console sem erros.

### H. Encaixe no projeto
- H1. Cada um dos 5 hábitos do Kit tem uma função correspondente.
- H2. O pedido do debriefing ("noção do impacto das decisões") é atendido de forma visível.
- H3. O Laboratório v2 mantém as rodadas 1–3 da v1, tem botão voltar e resumo exportável.

## Bloqueadores (reprovam na hora)
Conta errada em tela · dado real ou pessoal exposto · requisição para terceiros · perda de dados ao recarregar ·
texto que recomenda produto financeiro · tela quebrada a 375 px.
