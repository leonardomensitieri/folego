# Discovery — app financeiro para a Organização Parceira A

**Pergunta de partida** (chat do grupo, 29/10/2026): "o que acham de a gente sugerir o app financeiro do
Sebrae no lugar de ela anotar tudo em cadernos e etc.?" O Leonardo assumiu o item "App financeiro Sebrae e HTML".
Este documento responde: **qual app resolve o problema real da parceira, dentro das regras do projeto?**

Fontes: inventário em `vault/raw/` (formulário de escuta, caderno de choques, kit, roteiro v4 aplicado, edital, aulas),
[pesquisa-ia-vertical-stack-ux-lgpd.md](pesquisa-ia-vertical-stack-ux-lgpd.md) e
[pesquisa-sebrae-mei-concorrentes.md](pesquisa-sebrae-mei-concorrentes.md).

## 1. Quem é a usuária

Uma profissional só, salão em casa (município do Rio de Janeiro), MEI desde 2020, cabelo (corte e alisamento são o
que mais fatura), sobrancelha, maquiagem e penteado. Terça a sábado, 9h às 21h, ~12 clientes por semana, um por vez.
Clientes chegam por indicação, público maduro e sensível a preço. Agenda pelo WhatsApp; recebe por Pix, dinheiro e
cartão; parte paga antecipado. Compra insumos uma vez por mês, sem estoque, de até três fornecedores, com preço
atrelado ao dólar. Decide tudo sozinha. (formulário de escuta, seções 0–2)

## 2. O problema, nas palavras das fontes

| Sintoma | Consequência vivida | Fonte |
| --- | --- | --- |
| "Não tem controle formal" de entradas e saídas | não sabe quanto o salão rende | formulário 2.3 |
| "Não há segregação de patrimônio" (casa e salão misturados) | não sabe quanto tem para um imprevisto | formulário 2.3; caderno, premissas |
| Sem reserva de emergência | pegou empréstimo de curto prazo; se endividou para repor secador/babyliss | formulário 3.1a, 3.4b, 5.1 |
| Cliente pede para pagar depois | atrasou o pagamento | formulário 3.1b |
| Insumo importado encarece | trocou de produto; resultado inferior, voltou à marca antiga | formulário 3.3; roteiro v4 |
| Se ela parar, o salão para | sem plano para uma semana fora | formulário 2.5–2.6; caderno, rodada 4 |
| Na simulação, a margem caiu e ela "não entendeu por quê, nunca tinha parado para pensar na consequência" | decisões por intuição (benefício por indicação, troca de fornecedor) | roteiro v4, rodada 1 |
| "Gostaria de ter noção do impacto das decisões" | — | roteiro v4, debriefing fase 2 |
| Ação que **ela mesma** propôs: reserva de emergência e mais de um fornecedor | — | roteiro v4, fechamento |

**Trabalho a ser feito (JTBD):** "Quando eu termino um atendimento ou pago uma conta, quero registrar isso sem
esforço, para no fim do mês saber quanto sobrou, quanto posso tirar pra casa e se dá para aguentar um imprevisto —
e, antes de mexer no preço ou trocar um produto, ver o que isso faz com o meu bolso."

## 3. Restrições que mandam no desenho

1. **Edital §7.1 e §8.2:** dados pessoais, financeiros ou estratégicos da parceira não podem ir para IA nem para
   serviço não autorizado → **nada sai do aparelho**; nada de nuvem nem IA em tempo de execução no MVP.
2. **Edital §8.1:** protótipos testados com **dados fictícios** → modo demonstração separado.
3. **Edital §3.5 e Aula 7:** não é consultoria; **vedado recomendar produto financeiro** (desconta nota) → o app
   **descreve** efeitos, não prescreve.
4. **Nota só pelo relatório** (≤ 20 p.) → o app precisa gerar evidência fácil de mostrar (prints da demonstração,
   testes, roteiro de uso, avaliação da parceira).
5. **Relatório vai para repositório público** → nada identificável em prints ou textos.
6. **Prazo:** 10/11/2026 → stack que vai para produção no mesmo dia.

## 4. Recomendar o app do Sebrae ou construir um próprio?

**O que é "o app financeiro do Sebrae":** quase certamente o **App Sebrae**, módulo **Fluxo de Caixa** (Google Play:
nota 4,1, 1 mi+ downloads, atualizado em 19/10/2026; App Store: 3,9; também na web em fluxocaixa.sebrae.com.br).
É uma ferramenta **genérica** para MEI, ME e EPP, dentro de um app que faz de tudo (cursos, eventos, DAS, conteúdo).
Pede login e cadastro de empresa *(inferência a partir da página web)*. Não tem nada específico de salão: não calcula
o líquido por forma de pagamento, não controla fiado por cliente nem mostra a margem por serviço. Uma pesquisa do
próprio Sebrae-SP (2020) sobre a ferramenta encontrou uso pouco recorrente, gente mantendo o caderno junto,
dados que sumiam e abandono. Fonte: [pesquisa-sebrae-mei-concorrentes.md](pesquisa-sebrae-mei-concorrentes.md) §1.

**Concorrentes:** os apps de salão (Trinks, Avec, Booksy, Gendo…) são de **agenda** e custam R$ 40–110/mês. As peças
de que ela precisa existem soltas (fiado num, cobrança noutro, lembrete de DAS noutro), mas **nenhum junta tudo de
forma simples para quem trabalha sozinha**. O app MEI Fácil está sendo descontinuado. (§2)

**Contexto que pesa:** só 39,6% dos MEIs de serviços seguem ativos 5 anos depois de abrir; 63% dos MEIs pagam despesas
da empresa com a conta pessoal; no setor de beleza, 41,9% controlam em caderno, 29,2% dizem que a maior dificuldade é
separar gastos pessoais e do negócio e 76,6% trabalham sozinhos; 42% dos MEIs vendem fiado e 86% desses já tiveram
problema para receber. "Cabeleireiros e tratamento de beleza" é a atividade com mais MEIs do país (~1 milhão). (§5)

Critérios de comparação, do ponto de vista dela e do projeto:

| Critério | App Sebrae (Fluxo de Caixa) | App próprio (Fôlego) |
| --- | --- | --- |
| Registrar em segundos, sem conta/senha | login e cadastro | 2 toques, sem conta |
| Separar casa × salão e mostrar reserva | não específico | "Pra casa" + salário + fôlego |
| Efeito de uma decisão (margem por serviço) — pedido no debriefing | não tem | "Decidir" / "E se…?" |
| Fiado por cliente + lembrete | não tem | sim, mensagem sem valor |
| Dados não saem do aparelho (edital §7.1) | nuvem com conta | só no aparelho |
| Liga ao Laboratório (Margem, Caixa, Clientela) | não | mesmos indicadores + simulação v2 |
| Obrigações do MEI | DAS no app | DAS, limite (LC 238/2026), relatório mensal |
| Custo | grátis | grátis |

### 4.1 Resultado

**Construir um app próprio, pequeno e específico**, e usar o Sebrae como **fonte de método** (fluxo de caixa,
precificação por markup) e **canal de apoio** (0800 570 0800, cursos gratuitos "Como controlar o fluxo de caixa" e
"Preço de vendas para beleza") — sem "recomendar" ferramenta, banco ou maquininha (o edital veda recomendar produto
ou instituição financeira). Motivos: (a) nenhum app genérico liga os números dela aos choques do Laboratório nem ao
Kit; (b) o "e se…?" por serviço, que ela pediu, não existe nos apps genéricos de MEI; (c) apps com conta e nuvem
conflitam com a regra de dados do edital se a equipe for configurar ou acompanhar; (d) o app próprio é um **produto
extensionista demonstrável**, que pontua no Critério 3. A sugestão do colega fica registrada como origem da ideia.

**Números do MEI usados no app** (§3): DAS 2026 de serviços **R$ 86,05** (5% de R$ 1.621 + R$ 5 de ISS), vence dia 20;
limite R$ 81 mil em 2026 → **R$ 110 mil em 2027 e R$ 140 mil em 2028** (LC 238/2026, sancionada em 21/10/2026);
DASN-SIMEI até o último dia de maio; **Relatório Mensal das Receitas Brutas revogado a partir de 2027** (Res. CGSN
190/2026); Pix pode ser tarifado para quem recebe mais de 30 por mês (Res. BCB 1 e 19) → taxa de Pix configurável.

## 5. A solução: Fôlego

Nome: vem do Kit ("ganhar fôlego diante dos imprevistos"). O indicador-chave é **dias de fôlego** = quantos dias a
reserva paga as contas se o salão parar (liga direto às rodadas 3 e 4 do Laboratório).

| Necessidade (fonte) | Função |
| --- | --- |
| Anotar sem esforço (Kit hábito 2) | Atendimento rápido (2 toques), Recebi/Gastei, "Escreva do seu jeito" ("corte 50 pix") |
| Saber quanto sobrou (Kit: "três números") | "Sobrou no salão" sempre no topo; fechamento do mês anterior |
| Separar casa e salão (Kit hábito 1) | "Tirei pra casa" + salário mensal combinado |
| Reserva (Kit hábito 3; ação proposta por ela) | Fôlego em dias, meta, sugestão de guardar R$ X a cada atendimento |
| Mais de um fornecedor (Kit hábito 4; ação proposta por ela) | Fornecedores com preço comparado |
| Vínculo com clientes, semana fora (Kit hábito 5; rodada 4) | Mensagens prontas para WhatsApp |
| Fiado (choque 3.1b) | A receber + "Lembrar no WhatsApp" |
| Impacto das decisões (debriefing) | Decidir: margem por serviço e por hora; "E se…?" desconto, dólar, aumento, indicação |
| MEI em dia (Kit, cuidados do MEI) | DAS, limite anual, relatório mensal das receitas brutas |
| Treinar decisões (Laboratório) | Simulação v2 (5 rodadas, voltar, resumo exportável) dentro do app |

Detalhes de funcionamento: [PRD](../produto/PRD.md). Stack e porquê: [ADR-001](../arquitetura/ADR-001-stack-local-first.md).
Evolução para IA vertical: [roadmap](../roadmap.md).

## 6. O que validar com a parceira (hipóteses)

1. Ela consegue lançar um atendimento em < 10 s sem ajuda depois da primeira explicação.
2. "Sobrou", "Pra casa" e "Fôlego" são palavras que ela entende sem explicação.
3. Ela usa o "E se…?" antes de decidir um desconto (ou diz que usaria).
4. Ela aceita combinar um "salário" fixo do salão.
5. Ela faz a cópia de segurança quando o app pede.
