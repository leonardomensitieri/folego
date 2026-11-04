# Pesquisa de discovery: Sebrae, regras do MEI em 2026, concorrentes e dados citáveis

**Data da pesquisa:** 03/11/2026 · **Para:** discovery do app financeiro (ver [DISCOVERY.md](DISCOVERY.md))
**Pergunta de origem:** um colega sugeriu "o app financeiro do Sebrae" no lugar do caderno. Isso resolve o problema
da usuária? Se não, o que um app próprio precisa ter?

**Usuária-alvo (resumo, sem dados identificáveis):** MEI desde 2020, salão de beleza em casa no município do Rio de
Janeiro, trabalha sozinha, ~12 clientes/semana, agenda pelo WhatsApp, recebe por Pix, dinheiro e cartão, não tem
controle financeiro, mistura dinheiro de casa e do salão, não tem reserva, já pegou empréstimo de curto prazo, já teve
cliente "pagando depois", compra insumos importados (preço ligado ao dólar) de até 3 fornecedores, clientela madura e
sensível a preço, movimento cai em janeiro e fevereiro.

**Como ler as fontes.** Cada fato traz a URL. Legenda de confiança:

- **[P] Primária oficial:** lei, decreto, resolução, órgão público, Sebrae (Nacional ou estadual), página do próprio
  fornecedor, loja de apps.
- **[S] Secundária:** imprensa, blog contábil ou conteúdo colaborativo. Use com cautela no relatório acadêmico.
- **[I] Inferência nossa:** conclusão tirada de evidência (por exemplo, código de uma página web). Não é afirmação da fonte.

Quando algo não foi achado, o texto diz **"não encontrado"**.

> Atenção: os artigos da "Comunidade Sebrae" (sebraepr.com.br/comunidade) são **colaborativos**. A própria página avisa
> que o Sebrae não se responsabiliza por conteúdo de terceiros. Por isso eles aparecem aqui como [S], mesmo estando no
> domínio do Sebrae/PR.

---

## Resumo em 10 linhas

1. "O app financeiro do Sebrae" é, quase certamente, o **App Sebrae**. O controle financeiro dele é o módulo
   **Fluxo de Caixa**, que também existe na web em fluxocaixa.sebrae.com.br. É gratuito, mas é um app de tudo um pouco
   (cursos, eventos, DAS, posts com IA, valuation), genérico para MEI/ME/EPP, e pede conta. [P][I]
2. Na Google Play: nota 4,1, 8,77 mil avaliações, 1 mi+ downloads, atualizado em 19/10/2026. Na App Store: 3,9, com
   621 avaliações. [P]
3. A pesquisa qualitativa do próprio Sebrae-SP (2020) sobre a ferramenta encontrou uso pouco recorrente, gente que
   mantinha o caderno em paralelo, perda de dados, impossibilidade de lançar datas passadas e abandono. [P]
4. Em 2026 o DAS-MEI de serviços (cabeleireiro e manicure são serviço com ISS) é **R$ 86,05/mês**, com vencimento
   **todo dia 20**. O limite de faturamento é **R$ 81 mil/ano**. [P]
5. A **LC 238/2026** (sancionada em 21/10/2026) sobe o limite para **R$ 110 mil em 2027** e **R$ 140 mil em 2028**,
   permite 2 empregados e perdoa dívidas federais do MEI constituídas até 13/10/2026. [P]
6. **Reforma Tributária:** a partir de 01/01/2027 o DAS passa a incluir CBS e IBS em valores fixos (centavos até 2028).
   O Relatório Mensal de Receitas Brutas deixa de existir na forma atual. O MEI passa a ter de emitir documento fiscal,
   mas nas vendas a consumidor pessoa física a DASN-SIMEI poderá valer como documento fiscal. [P]
7. Pix é grátis para o MEI enviar. Receber pode ser tarifado quando o Pix é de "compra": QR dinâmico, aproximação, a
   partir do 31º Pix no mês etc. Isso depende do banco. [P]
8. Maquininha em 2026, plano de entrada (≤ R$ 20 mil/mês): débito ~1,4–1,7%, crédito à vista ~3,1–3,9%, 12x ~12–20%.
   Receber "na hora" custa mais. [P]
9. Dados-chave para o relatório: 5 anos depois da abertura, só 41,5% dos MEIs seguem ativos (39,6% em serviços)
   (Sebrae, coorte 2021–2025). 63% dos MEIs pagam despesas da empresa com a conta pessoal (Sebrae, 2023). No setor de
   beleza, 41,9% controlam em caderno e 29,2% dizem que a maior dificuldade financeira é separar gastos pessoais dos do
   negócio (Sebrae, 2021). [P]
10. Recomendação: **não** indicar o App Sebrae como solução principal. Construir um app próprio mínimo (sem login,
    offline, focado em salão) e usar o Sebrae como complemento: cursos gratuitos e o app oficial da Receita para o DAS.

---

## 1. Sebrae: ferramentas financeiras gratuitas para MEI hoje

### 1.1 Inventário

| Ferramenta (nome exato) | Tipo / plataforma | O que faz (funções financeiras) | Atualização e nota | Cadastro/login | Fonte |
|---|---|---|---|---|---|
| **App Sebrae**: "Sebrae: para você empreender" (Google Play) / "Sebrae: Apoio para seu negócio" (App Store) | App Android e iOS (iOS 15.1+, 174,4 MB) | Fluxo de caixa e finanças para MEI, DAS-MEI, apoio à abertura e gestão de MEI, cursos e consultorias, eventos, diagnósticos, Perfil da Empresa no Google, posts com IA, calculadora de valuation. Desde a versão 5.0.40 (2024) cita a "Planejadora" | **Play:** 4,1 · 8,77 mil avaliações · 1 mi+ downloads · atualizado em **19/10/2026**. **App Store:** 3,9 · 621 avaliações · versão 5.0.49 de "20 de out." (a página não mostra o ano). Em 2025: 3,9 mi atendimentos, 743 mil usuários ativos, 880 mil+ downloads | Não encontrado em fonte oficial. Indícios de que é preciso conta: avaliação de 2021 cita cadastro e recuperação de senha, e o rótulo de privacidade da App Store lista nome, e-mail e ID de usuário [I] | [P] Play: https://play.google.com/store/apps/details?id=br.com.sebrae.napalmadamao · App Store: https://apps.apple.com/br/app/sebrae/id1482839375 · Agência Sebrae, 02/03/2026: https://agenciasebrae.com.br/inovacao-e-tecnologia/aplicativo-do-sebrae-soma-quase-4-milhoes-de-atendimentos-em-2025/ |
| **Fluxo de Caixa Online** ("Fluxo de Caixa - Sebrae"; a Agência Sebrae chama de "Fluxo de Caixa descomplicado") | Web (PWA "Fluxo Caixa Sebrae") | Receitas e despesas com categoria e subcategoria. Situações: a vencer, vence hoje, vencido, pago, recebido. Várias contas (corrente, poupança, cartão). Saldo atual, anterior e em caixa. Relatórios com exportação em PDF e envio por link, e-mail ou WhatsApp. **"Relatório mensal das receitas brutas"** e **"Relatório consolidado para a DASN MEI"**. Atalhos para Calculadora, Planejadora e Emissor de notas. Segundo a Agência Sebrae: saldo atual e projetado, apoio à emissão do DAS, relatórios automáticos por e-mail | Lançada em maio/2020 pelo Sebrae-SP com o Sebrae Nacional. Divulgada de novo em 02/01/2026 | **Login obrigatório** [I]: o código da página usa autenticação Keycloak e pede "Cadastrar nova empresa" | [P] https://fluxocaixa.sebrae.com.br/ · Agência Sebrae, 02/01/2026: https://agenciasebrae.com.br/?p=36734 · [I] análise do código público da página em 03/11/2026 |
| **Planejadora Sebrae** ("Planejadora Financeira Empresarial") | Web | Planejamento financeiro, projeção de fluxo de caixa, capital de giro, simulação de financiamento, capacidade de pagamento antes de pegar crédito. Ligada ao Programa Acredita | Matéria de 16/04/2025 | Não confirmado. Um trecho de busca do "Guia Planejadora" fala em e-mail e senha; o PDF original redireciona e não foi lido | [P] https://planejadora.sebrae.com.br/ · https://agenciasebrae.com.br/cultura-empreendedora/tem-dificuldade-na-gestao-financeira-da-empresa-a-planejadora-sebrae-pode-ajudar-a-resolver-seus-problemas/ |
| **Calculadora Sebrae** | Web | "Simulador financeiro" ("Equilibre as finanças…"). Simuladores específicos: não encontrado | Não encontrado | Login [I] (Keycloak e seleção de empresa no código) | [P] https://calculadora.sebrae.com.br/ |
| **Planilha "Fluxo de Caixa Simplificado - MEI"** (Sebrae RS) | Planilha Excel/Google Sheets, ou impressa | Abas Saídas, Entradas e Saldo. Contas a pagar fixas (aluguel, luz, água, DAS-MEI, pró-labore em 4 partes) e variáveis (insumos, revenda). Entradas **por dia da semana e por forma de pagamento (crédito, débito, Pix, dinheiro)**, totais semanais e mensais | Arquivo de maio/2025 | Download direto, sem login | [P] https://conhecimento.sebraers.com.br/wp-content/uploads/2025/05/MEI_Fluxo-de-Caixa_Simplificado.xlsx · apresentação: https://conhecimento.sebraers.com.br/wp-content/uploads/2025/05/Financas-sem-misterio-Fluxo-de-Caixa-Como-controlar-e-planejar-as-financas-do-seu-negocio.pdf |
| **Planilhas Sebrae/PR** (Fluxo de Caixa; Contas a pagar e receber) | Planilha | Receitas, despesas e saldo mensal previsto | Não encontrado | CPF e senha do Sebrae/PR para baixar | [P] https://sebraepr.com.br/planilhas/fluxo-de-caixa/ |
| **Precifique** (Sebrae/PR) | Web | Formação de preço em 4 passos: custos fixos e variáveis, margem, impostos, sazonalidade, preço sugerido. Atende serviços (cita "cortar cabelo"). Taxa de cartão não aparece | Não encontrado | Tem "Acessar conta/Cadastrar-se"; não ficou claro se é obrigatório | [P] https://sebraepr.com.br/precifique |
| **Qipu** (histórico) | App e web de terceiros | Nasceu como parceria Sebrae + Buscapé (notícia antiga). Hoje é produto comercial (ver §2) | Ver §2 | Ver §2 | [S] https://www.baguete.com.br/noticias/sebrae-app-focado-em-microempreendedores |

### 1.2 Qual é, provavelmente, "o app financeiro do Sebrae"

É o **App Sebrae**, no módulo **Fluxo de Caixa**. Ele é o único **app de celular** do Sebrae Nacional que se anuncia
nas lojas com "controle de fluxo de caixa e finanças para MEI". O próprio Sebrae RS o indica como a ferramenta para
quem quer sair do caderno, ao lado do site fluxocaixa.sebrae.com.br e da planilha simplificada. A tela de fluxo de caixa
do app e o site parecem ser o mesmo produto: mesmo nome, mesmo público, e o site se instala como app (PWA). Mas isso é
inferência [I]; não está documentado.

### 1.3 Limitações reais para esta usuária

| Limitação | Evidência | Por que pesa para ela |
|---|---|---|
| **Genérico, não é de salão** | Público declarado: MEI, ME e EPP. Multiempresa, plano de contas com categorias e subcategorias, várias contas bancárias. Não encontrado: preço por serviço, custo de insumo por atendimento, líquido por forma de pagamento, fiado por cliente [P][I] | Ela precisa de "atendimento → quanto sobrou", não de contabilidade |
| **App de tudo um pouco** | Cursos, eventos, DAS, posts com IA, valuation, Perfil no Google, comunidade [P] | Mais telas e mais atrito para quem nunca registrou nada |
| **Precisa de conta e de internet** | Login via Keycloak e "cadastrar empresa" no site [I]. Dados no servidor do Sebrae [I] | Atrito no primeiro uso. O edital do projeto proíbe mandar dados da parceira a serviços não autorizados (DISCOVERY §3) |
| **Problemas de confiabilidade e uso já documentados pelo Sebrae** | Pesquisa qualitativa do Sebrae-SP com usuários, 08/2020: recorrência abaixo da desejada; usuários com "caderninho" em paralelo; lançamentos que "sumiam"; dados que não apareciam em outro aparelho; não dava para lançar mês passado; suporte que não resolveu; análises que ninguém usava; abandono [P] | São exatamente os riscos de hábito dela. Ressalva: é de 2020 e pode ter sido corrigido. Não há avaliação pública mais nova |
| **Avaliações recentes do app** | Play, 07/2024: texto cortado e letras pequenas no celular (436 marcaram "útil"). App Store, 06/2024: app travando e gastando dados móveis [P] | Público maduro: legibilidade importa |
| **Privacidade** | Rótulo da App Store: localização, contato, identificadores e "outros dados" usados para **rastrear** o usuário [P] | Dados financeiros de pessoa física junto com rastreamento |
| **O que ele tem de bom** | Gratuito, marca confiável, DAS-MEI no app, relatório no formato do Relatório Mensal de Receitas Brutas e consolidado para a DASN [P][I] | Útil como **complemento**, não como ferramenta do dia a dia |

---

## 2. Concorrentes e alternativas no Brasil

Coleta em 03/11/2026 nas páginas oficiais de preço e na Google Play (nota · nº de avaliações · downloads ·
"Atualizado em"). Preços mudam com frequência; todos são [P], salvo indicação.

### 2(a) Gestão de salão / agenda

| Nome | Preço (plano mais barato) | Foco | Serve p/ quem trabalha sozinha? | O que resolve para ela | O que **não** resolve | Loja (Play) | Fonte |
|---|---|---|---|---|---|---|---|
| **Trinks** | 1–2 profissionais: R$ 110/mês no mensal, R$ 76/mês no anual (correspondência deduzida pela ordem das abas). 5 dias grátis | Agenda + gestão + pagamentos (Stone) | Sim (faixa 1–2) | Agenda online, fluxo de caixa, relatórios | Fiado, separar casa × salão e DAS: não encontrados. Custo fixo alto para a renda dela | Trinks Profissional 4,8 · 6 mil · 500 mil+ · 28/10/2026 | https://negocios.trinks.com/planos/ |
| **Avec** (ex-SalãoVIP) | 1–2 profissionais: R$ 99,90/mês no mensal, R$ 88,90 no anual | Agenda + gestão + Avec Pay | Sim | Caixa, entradas e saídas, comanda, comissões | Fiado e DAS: não encontrados. Pagamento e NF são add-ons | Avec PRO 3,7 · 867 · 100 mil+ · 22/10/2026 | https://negocios.avec.app/avec-planos |
| **Booksy** | R$ 99,99/mês + impostos (+R$ 20 por agenda extra). 1 semana grátis | Agenda + marketplace | Sim | Agendamento 24h, lembretes, marketing | Caixa, contas, fiado e DAS: não aparecem | Booksy Biz 4,8 · 31,8 mil · 1 mi+ · 02/11/2026 | https://biz.booksy.com/pt-br/precos |
| **Gendo** | Básico (1 profissional, **sem financeiro**): R$ 49,98/mês, ou R$ 39,90/mês no anual. Essencial (com financeiro): R$ 99,86/mês, ou R$ 69,90/mês no anual. 7 dias grátis | Agenda + lembrete por WhatsApp | Sim ("para quem trabalha sozinho ou em dupla") | Caixa, contas a pagar e receber no Essencial | DAS: não encontrado. O financeiro só vem no plano mais caro | 4,8 · 5 mil+ downloads · 27/10/2026 | https://www.gendo.app/br/planos |
| **AgendaPro** | Plano Individual: US$ 9/mês (página /br em espanhol e em dólar) | Agenda (América Latina) | Sim | Caixa e relatórios simples | Preço em dólar. Fiado e DAS: não encontrados | 100 mil+ · 28/10/2026 | https://agendapro.com/br/planes |
| **Simples Agenda** | 1 profissional: R$ 59,90/mês, ou R$ 39,90/mês no anual. **35 dias grátis** | Agenda + financeiro | Sim | Fluxo de caixa, contas a pagar e receber (com parcelas), resumo por forma de pagamento | DAS: não encontrado. Mais completo do que ela precisa | 4,3 · 80 · 10 mil+ · 26/08/2026 | https://www.simplesagenda.com.br/site/ |
| **Salon Soft** | Ideal: R$ 59,90/mês, ou R$ 49,90/mês no anual (só agenda: R$ 29,90). 7 dias grátis | Agenda + caixa | Sim | **"Controle de fiados"** explícito, comandas, caixa | DAS: não encontrado. Mensalidade | 4,8 · 2,16 mil · 500 mil+ · 14/10/2026 | https://www.salonsoft.com.br/ |
| **AppBeleza / AppBarber** | 1 profissional: R$ 79,90/mês, ou R$ 55,90/mês no anual. 30 dias grátis | Agenda | Sim | Caixa do dia, relatórios financeiros | Fiado e DAS: não encontrados | AppBeleza PRO 4,5 · 61 · 10 mil+ · 30/09/2026 | https://www.appbeleza.com.br/ |
| **Belasis** | Lite "a partir de R$ 99/mês" | Agenda + CRM | Sim | Cobrança de sinal | A página se contradiz sobre o financeiro estar ou não no Lite | 4,8 · 978 · 50 mil+ · 29/06/2026 | https://www.belasis.com.br/precos |

### 2(b) Financeiro / MEI / bancos e maquininhas

| Nome | Preço | Foco | O que resolve para ela | O que **não** resolve | Loja (Play) | Fonte |
|---|---|---|---|---|---|---|
| **App "MEI" (Receita Federal)** | Grátis | Obrigações fiscais | DAS (emitir e ver situação), DASN, situação no SIMEI | **Não tem** registro de entradas e saídas, preço, fiado nem lembretes | 4,9 · 328 mil · 10 mi+ · 23/07/2026 | https://play.google.com/store/apps/details?id=br.gov.fazenda.receita.mei |
| **Meu MEI Digital** (Portal do Empreendedor) | Grátis | Portal do MEI | Consulta e atualização do Relatório Mensal de Receitas Brutas, débitos, CCMEI | Não é controle do dia a dia | 3,2 · 369 · 100 mil+ · 06/07/2026 | https://play.google.com/store/apps/details?id=br.gov.memp.portaldoempreendedor |
| **MEI Fácil** (grupo Neon) | Grátis | Serviços do MEI + conta | DAS, DASN, CCMEI | **App em descontinuação**; os serviços foram para a "Área MEI" do app Neon. Exige trocar de banco | Neon 4,8 · 1,42 mi · 50 mi+ · 30/10/2026 | https://neon.com.br/mei-facil |
| **Conta Azul** | Plano MEI (Essencial): R$ 179,90/mês no anual ou R$ 269,90/mês no trimestral. Sem plano mensal | ERP | Entradas e saídas, conciliação, cobrança, NF | Caro, linguagem contábil, sem nada específico de salão | 4,8 · 3,06 mil · 100 mil+ · 02/11/2026 | https://contaazul.com/planos/ |
| **Nibo** | Light: R$ 208/mês no mensal | ERP para empresas de serviço e contadores | Contas a pagar e receber, NFS-e | Sem plano MEI; caro | 4,5 · 414 · 100 mil+ · 24/08/2026 | https://www.nibo.com.br/empresa/planos-e-precos |
| **Mobills** | Grátis + Premium R$ 99,90/ano | Finanças **pessoais** | Receitas e despesas, lembretes, orçamento | Não separa PJ; sem fiado, sem preço, sem DAS | 4,2 · 293 mil · 10 mi+ · 20/10/2026 | https://www.mobills.com.br/pricing/ |
| **Organizze** | A partir de R$ 29,90/mês no anual. 7 dias grátis | Finanças **pessoais** | Lançamentos, categorias, alertas; aceita cadastrar uma "conta PJ" | Sem plano grátis; nada de salão | 4,6 · 57,1 mil · 1 mi+ · 16/10/2026 | https://www.organizze.com.br/planos/ |
| **Qipu** | ERP MEI: R$ 18,90/mês. App grátis de vendas e despesas | ERP e contabilidade de MEI | Contas, fluxo de caixa, **controle de DAS e lembretes**, NFS-e | Mensalidade; genérico | 3,8 · 13,1 mil · 500 mil+ · 20/10/2026 | https://qipu.com.br/erp-gestao-financeira/ |
| **Nubank PJ** | Conta sem mensalidade. Tap to Pay: débito 0,89%, crédito 3,09% | Conta PJ + cobrança | **Assistente de Cobranças** (Pix ou boleto, lembretes, pendentes e vencidos: serve para fiado) | **Exige CNPJ** e trocar de banco | 4,8 · 5,98 mi · 100 mi+ · 30/10/2026 | https://nubank.com.br/empresas/solucoes-para-cobranca/assistente-de-cobrancas |
| **InfinitePay** | Conta grátis. Maquininha "Plano Inicial" (≤ R$ 20 mil/mês, D+1): débito 1,37%, crédito 3,15%, 12x 12,40%. Pix 0% | Pagamentos + conta | Contas PF e PJ no mesmo app, gestão de cobrança com aviso no WhatsApp, agenda online grátis com sinal, calculadora de taxas | Prende ao ecossistema do fornecedor; sem visão de lucro por serviço | 4,9 · 1,06 mi · 10 mi+ · 29/10/2026 | https://www.infinitepay.io/taxas · https://www.infinitepay.io/gestao-de-cobranca |
| **Mercado Pago** | Conta grátis. Point Mini (novos usuários): débito 1,69%, crédito 3,86%, 12x 20,39% (promoção de 0,74% por 30 dias ou até R$ 5 mil). Sistema de gestão: R$ 79/mês | Pagamentos + PDV | Frente de caixa, controle do dinheiro em espécie | Feito para varejo; o sistema de gestão é pago | 4,9 · 15,1 mi · 100 mi+ · 02/11/2026 | https://www.mercadopago.com.br/ferramentas-para-vender/maquininhas-point/point-mini |
| **PagBank (PagVendas)** | App grátis. Tap On: débito 0,88%, crédito 3,14%, 12x 13,74% (fora da promoção) | Pagamentos + PDV | **PagVendas aceita "fiado" como forma de pagamento**, fluxo de caixa, cálculo do repasse das taxas | Prende ao ecossistema do fornecedor | PagVendas 4,7 · 44,2 mil · 5 mi+ · 26/10/2026 | https://pagbank.com.br/para-seu-negocio/pagvendas/ |
| **Cora** | Conta PJ grátis | Conta PJ + cobrança | Fluxo de caixa, cobranças (pendentes e vencidas), NFS-e | **Exige CNPJ** e trocar de banco | 4,8 · 109 mil · 5 mi+ · 29/10/2026 | https://www.cora.com.br/ |
| **Ton** (Stone) | Conta grátis. Maquininha "a partir de" 0,57% (promoção, conforme volume) | Pagamentos + Área MEI | **Área MEI grátis: gerar e pagar DAS, lembrete antes do vencimento**, DASN | Taxas para volume baixo não ficaram visíveis (tabela em JS) | 4,3 · 529 mil · 10 mi+ · 23/10/2026 | https://www.ton.com.br/MEI-PJ |

### 2(c) Leitura do mercado

- **Ninguém junta tudo de forma simples para a profissional que trabalha sozinha.** As peças existem soltas. Fiado
  aparece em Salon Soft e PagVendas, e cobrança de pendentes em Nubank PJ, Cora e InfinitePay. Lembrete de DAS está em
  Ton, Qipu e Neon. Separar PF e PJ é possível em InfinitePay e nos bancos PJ. Agenda existe em todos os apps de salão.
- **Os apps de salão são de agenda.** O financeiro, quando existe, é caixa e comissão de equipe, cobra R$ 40–110/mês e
  costuma estar no plano mais caro.
- **As soluções de bancos e maquininhas são gratuitas, mas pedem migração** de conta ou maquininha, e algumas exigem
  CNPJ. Pelo edital, o projeto **não pode recomendar produto financeiro** (DISCOVERY §3). O relatório pode citá-las
  como contexto de mercado, sem indicação.

---

## 3. Regras do MEI vigentes em 2026 (fontes oficiais)

| Item | Regra em 2026 | O que já está previsto para mudar | Fonte |
|---|---|---|---|
| **Limite de faturamento** | **R$ 81.000/ano.** Quem abre no meio do ano tem limite de R$ 6.750 × meses de atividade. Se passar até 20%, paga o "DAS de excesso" e sai do SIMEI no ano seguinte. Se passar mais de 20%, o desenquadramento é retroativo a janeiro | **LC 238/2026 (21/10/2026):** R$ 110 mil em 2027 e R$ 140 mil a partir de 2028. Até **2 empregados**. Perdão das dívidas federais do MEI constituídas até 13/10/2026, desde que pague o DAS em dia nos 6 primeiros meses de vigência (a partir de 01/01/2027) | [P] Receita, Perguntas e Respostas MEI (29/04/2025): https://www8.receita.fazenda.gov.br/SimplesNacional/Arquivos/manual/PerguntaoMEI.pdf · [P] Senado, PLP 186/2026 → LC 238/2026: https://www25.senado.leg.br/web/atividade/materias/-/materia/175969 · [S] Fenacon, 22/10/2026: https://fenacon.org.br/noticias/sancionada-lei-que-amplia-limite-de-faturamento-do-mei/ |
| **Cabeleireiro e manicure: serviço com ISS?** | **Sim.** É o item 6.01 da lista da LC 116/2003 ("barbearia, cabeleireiros, manicuros, pedicuros e congêneres"). O MEI paga a parcela fixa de ISS | — | [P] https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm |
| **Valor do DAS-MEI (serviços)** | **R$ 86,05/mês**: INSS de 5% do salário mínimo (R$ 1.621 → R$ 81,05) + ISS de R$ 5,00. Comércio/indústria: R$ 82,05. Comércio e serviços: R$ 87,05. Vale desde a competência de janeiro/2026 | Muda todo ano com o salário mínimo. Em 2027 entram CBS e IBS (ver Reforma) | [P] Res. CGSN 140/2018, art. 101 · [P] Decreto 12.797/2025 (salário mínimo de R$ 1.621): https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/D12797.htm · [S] valores consolidados: https://www.opovo.com.br/noticias/economia/2026/01/02/contribuicao-mensal-do-mei-sobe-para-rs-8105-em-2026.html. Obs.: uma nota de 05/01/2026 (CRCMA) usou mínimo de R$ 1.627 e chegou a R$ 86,35; o decreto oficial fixou R$ 1.621 |
| **Vencimento do DAS** | **Dia 20 do mês seguinte** ao da receita. Sem expediente bancário, vai para o **dia útil seguinte** | — | [P] Res. CGSN 140/2018, art. 40, caput e §3º (texto consolidado): https://guiatributario.net/wp-content/uploads/2026/08/resolucao140.pdf (reprodução; original em normas.receita.fazenda.gov.br, idAto 92278) |
| **Relatório Mensal das Receitas Brutas** | **Obrigatório manter.** Preencher até o dia 20 do mês seguinte, no modelo do **Anexo X** da Res. CGSN 140/2018, com as notas de compras e de vendas emitidas anexadas. **Não é enviado**: só se apresenta se o Fisco pedir | **Revogado a partir de 01/01/2027** pela Res. CGSN 190/2026, que revoga os incisos I e II do art. 106. No lugar entra a obrigação de emitir documento fiscal nas vendas e serviços | [P] Res. 140, art. 106, I · [P] PerguntaoMEI, item 3.6 · [P] Res. CGSN 190/2026, art. 8º, XXIX: https://www.normaslegais.com.br/legislacao/Resolucao-cgsn-190-2026.htm (reprodução) |
| **Nota fiscal** | Dispensada para consumidor pessoa física. **Obrigatória** para tomador com CNPJ, via NFS-e de padrão nacional | **2027:** o MEI passa a dever emitir documento fiscal em todas as vendas e serviços (Res. CGSN 190, novo art. 106). Mas o **Decreto 13.140/2026, art. 2º**, permite usar a **DASN-SIMEI como documento fiscal** nas vendas e serviços ao consumidor final, regulado pela Res. CGSN 195/2026 com efeitos em 2027 | [P] Res. 140, art. 106 · [P] Decreto 13.140/2026 (DOU de 21/10/2026, cópia): https://static.poder360.com.br/uploads/2026/10/Decreto-MEI-.pdf · [S] https://www.reformatributaria.com/governo/decretos-de-lula-dispensam-nanoempreendedor-de-cnpj-e-mei-de-documentos-fiscais-em-vendas-leia-os-documentos/ |
| **DASN-SIMEI (declaração anual)** | Até o **último dia de maio**, com a receita bruta do ano anterior. O prazo não muda se cair em fim de semana. A de 2025 venceu em 31/05/2026; a próxima (ano-calendário 2026) vence em **31/05/2027**. Atraso gera multa (MAED) | Em 2027 passa a poder servir de documento fiscal para vendas a pessoa física (ver acima) | [P] PerguntaoMEI, item 3.9 (base: Res. 140, art. 109) |
| **Ocupações de salão permitidas** | CNAE **9602-5/01 (cabeleireiros, manicure e pedicure)** é a classificação do MEI cabeleireiro(a) [P]. Também há 9602-5/02 (estética). Os nomes exatos das ocupações do Anexo XI (por exemplo "Cabeleireiro(a) independente", "Manicure/pedicure independente", "Depilador(a)", "Maquiador(a)") **não puderam ser conferidos na fonte primária**: a página do gov.br e a base de normas da Receita carregam por JavaScript | A lista muda por resolução do CGSN | [P] Sebrae, "Ideia de Negócio MEI - Cabeleireiro(a)" (nov/2025): https://bibliotecas.sebrae.com.br/chronus/ARQUIVOS_CHRONUS/IDEIAS_DE_NEGOCIO/PDFS/ideia-de-negocio_mei--cabelereiroa.pdf · lista oficial: https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/atividades-permitidas (conteúdo não lido) |
| **Salão-parceiro (Lei 13.352/2016)** | Vale para cabeleireiro, barbeiro, esteticista, manicure, pedicure, depilador e maquiador. O salão-parceiro recebe tudo, retém a sua cota-parte e os tributos da profissional, e repassa o restante. A cota da profissional **não entra na receita bruta do salão**. A profissional-parceira **pode ser MEI**. O contrato precisa ser escrito e homologado pelo sindicato. Sem contrato, há vínculo de emprego | **Não se aplica hoje** (ela trabalha sozinha, em casa). Passa a valer se ela alugar cadeira, atender dentro de outro salão ou trouxer parceira | [P] https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/lei/l13352.htm |

### 3.1 Reforma Tributária (CBS/IBS): o que muda para o MEI e quando

| Quando | O que acontece com o MEI | Fonte |
|---|---|---|
| **2026** | Optantes do Simples Nacional, MEI incluído, **não recolhem** as alíquotas de teste (CBS 0,9% e IBS 0,1%). O DAS segue igual | [S] https://www.reformatributaria.com/empresas-do-simples-nacional-nao-estao-obrigados-as-aliquotas-teste-de-ibs-cbs-em-2026/ (o texto da LC 214/2025 no Planalto não pôde ser lido nesse trecho) |
| **2027–2028** | O DAS ganha parcelas fixas de **CBS R$ 0,994** e **IBS R$ 0,006**. ICMS (R$ 1,00) e ISS (R$ 5,00) continuam. A tabela oficial soma R$ 7,00 para as quatro parcelas, além do INSS. Leitura provável para MEI só de serviços: ISS R$ 5,00 + CBS R$ 0,994 + IBS R$ 0,006 (a composição por tipo de atividade precisa ser conferida no Anexo XIII oficial) [I]. Fim do Relatório Mensal; obrigação de documento fiscal, com a DASN-SIMEI valendo para vendas a pessoa física | [P] Res. CGSN 190/2026, Anexo Único (novo Anexo XIII da Res. 140), efeitos a partir de 01/01/2027 |
| **2029** | ICMS R$ 0,90 · ISS R$ 4,50 · CBS R$ 1,00 · IBS R$ 0,20 | idem |
| **2030** | ICMS R$ 0,80 · ISS R$ 4,00 · CBS R$ 1,00 · IBS R$ 0,40 | idem |
| **2031** | ICMS R$ 0,70 · ISS R$ 3,50 · CBS R$ 1,00 · IBS R$ 0,60 | idem |
| **2032** | ICMS R$ 0,60 · ISS R$ 3,00 · CBS R$ 1,00 · IBS R$ 0,80 | idem |
| **2033 em diante** | ICMS e ISS deixam de existir. **CBS R$ 1,00 + IBS R$ 2,00 = R$ 3,00**, além do INSS | idem |
| **"Nanoempreendedor"** | É a pessoa física com receita abaixo de 50% do limite do MEI **que não aderiu ao MEI**. Não é contribuinte de IBS/CBS. Pelo Decreto 13.140/2026 fica dispensado de CNPJ e de documento fiscal eletrônico na esfera federal. **Ela é MEI, então não é nanoempreendedora**, a menos que saia do MEI | [P] LC 214/2025, art. 26, IV: https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm · [P] Decreto 13.140/2026, art. 1º |

**O que isso muda para o app:** pouco no dinheiro (centavos no DAS) e muito no **registro**. A partir de 2027, ter a
receita de cada atendimento registrada fica ainda mais útil, porque a DASN-SIMEI passa a cumprir papel de documento
fiscal. O valor do DAS precisa ser **configurável por ano**.

---

## 4. Taxas de maquininha e Pix (para o app calcular o líquido)

### 4.1 Taxas típicas em 2026 (páginas oficiais, plano de quem fatura pouco)

| Fornecedor / plano | Débito | Crédito à vista | Parcelado 12x | Recebimento | Fonte |
|---|---|---|---|---|---|
| InfinitePay, Plano Inicial (≤ R$ 20 mil/mês), Visa/Master | 1,37% | 3,15% | 12,40% | D+1, com antecipação das parcelas incluída | [P] https://www.infinitepay.io/taxas |
| InfinitePay, mesmo plano, Elo/Amex | 2,58% | 4,91% | 13,41% | D+1 | idem |
| InfinitePay, plano "Na hora" (todas as bandeiras) | 2,29% | 5,49% | 18,29% | D+0 | idem |
| Mercado Pago Point Mini (novo usuário; a taxa varia com as vendas do mês) | 1,69% | 3,86% | 20,39% | Não informado na página | [P] https://www.mercadopago.com.br/ferramentas-para-vender/maquininhas-point/point-mini |
| Tap to Pay no celular (Nubank PJ / Mercado Pago Point Tap / PagBank Tap On) | 0,88–0,89% | 3,09–3,14% | 12,38–13,74% | Varia | [P] páginas dos fornecedores (§2b) |
| Promoções de entrada (Mercado Pago, PagBank, Ton) | 0–0,74% | 0–0,74% | — | Só por 30 dias ou até R$ 1,5–5 mil em vendas | [P] idem |

**Regras de fundo (BCB):** a tarifa de intercâmbio (parte da taxa que vai para o banco emissor do cartão) tem teto de
**0,5%** no débito e **0,7%** no pré-pago (Res. BCB 246/2022). O restante da taxa (MDR) é livre e muda por faixa de
faturamento, prazo e bandeira. [P] https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20BCB&numero=246

**Prazo de recebimento:** "na hora" (D+0) ou "1 dia útil" (D+1) embutem a antecipação e custam mais. O crédito sem
antecipação cai em ~30 dias, e no parcelado cada parcela cai a cada 30 dias. [P] InfinitePay, página de taxas.
Uma média de mercado oficial de MDR para 2025–2026: **não encontrada**. O último dado do BCB visto é de 2019: MDR médio
de 2,30% no crédito e 1,21% no débito. [S] relato do Relatório de Economia Bancária.

### 4.2 Pix para MEI

| Pergunta | Resposta | Fonte |
|---|---|---|
| Pix é grátis para o MEI? | **Enviar: sim.** É proibido cobrar da pessoa natural, **inclusive empresário individual (MEI)**, por envio com finalidade de transferência ou compra. **Receber "transferência": grátis.** **Receber "compra": pode ser tarifado**, a critério do banco | [P] Res. BCB 19/2020, arts. 3º e 4º: https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20BCB&numero=19 |
| Quando o Pix recebido conta como "compra"? | Pagador pessoa física: por **aproximação**, **QR Code dinâmico** ou Pix Cobrança; ou por chave/QR estático **a partir do 31º Pix recebido no mês**. Pagador empresa: por QR (estático ou dinâmico) ou aproximação. Conta usada **só para fins comerciais**, se o contrato disser, também | [P] Regulamento Pix (Res. BCB 1/2020), arts. 87-A e 87-B, com redação da Res. BCB 482/2025 |
| Impacto para ela | Com ~12 clientes por semana (~50 por mês), ela pode passar de 30 Pix recebidos no mês. A partir do 31º, o banco **pode** cobrar. Se cobra ou não, depende da tabela de tarifas de cada banco [I] | — |
| Pix por aproximação | Começou em **28/02/2025**, via carteira digital (Google Pay primeiro). Para o recebedor, conta como "compra" | [S] documento do BCB de 26/02/2025 (cópia): https://static.poder360.com.br/2025/02/pix-por-aproximacao-26fev2025.pdf · [P] Res. BCB 482/2025 (art. 87-B) |
| Pix Automático | Débitos recorrentes autorizados pelo pagador. Entrou no regulamento pela Res. BCB 402/2024 e foi lançado em **16/06/2025**. Sempre conta como "compra" para o recebedor PJ. Pode servir a pacotes mensais (por exemplo, escova semanal) | [P] Res. BCB 1/2020, art. 87-B, II, c · [S] https://acionista.com.br/pix-automatico-e-lancado-pelo-bc-nesta-terca/ |

### 4.3 Fórmula do líquido (para o app)

```
líquido do atendimento = valor cobrado × (1 − taxa% do meio de pagamento)
  taxa% = 0 para dinheiro; 0 para Pix (ou a tarifa do banco, se houver);
  débito / crédito à vista / crédito parcelado = a taxa que ELA informa da maquininha dela
  (configurável, com data, porque muda por faixa e promoção)
prazo: guardar a data prevista em que o dinheiro cai (D+0, D+1 ou D+30) para o caixa não "mentir"
```

---

## 5. Dados e estatísticas citáveis (para o relatório acadêmico)

| Tema | Dado | Fonte exata (título, órgão, data) | URL |
|---|---|---|---|
| **Sobrevivência do MEI (a mais recente)** | Probabilidade de o MEI seguir ativo (Kaplan-Meier): 77,1% em 1 ano · 65,3% em 2 · 55,7% em 3 · 47,6% em 4 · **41,5% em 5 anos**. MEI de **serviços**: **39,6%** em 5 anos. 34,4% dos MEIs abertos foram baixados; o tempo mediano até a baixa foi de **8 meses e 23 dias** | Sebrae (UGE), *Relatório Técnico: Sobrevivência das empresas mercantis brasileiras (2021-2025)*, Brasília, 18/03/2026. Base: CNPJ da RFB; sobrevivência = CNPJ ativo | https://datasebrae.com.br/wp-content/uploads/2026/03/Relatorio-tecnico-Sobrevivencia-das-empresas-mercantis-brasileiras-2021-2025.pdf |
| Sobrevivência do MEI no **RJ** | MEI no RJ: 79,2% em 1 ano, 68,0% em 2, 58,0% em 3 (entre as maiores do país) | idem, Tabela 13 | idem |
| **Mortalidade e causas** (edição anterior) | 29% dos MEIs fecham em até 5 anos (serviços: 26,6%; RJ: 23%). Causas citadas: pandemia (>40%), **falta de capital de giro (22%)**, poucas vendas ou clientes (20%). 34% acham que crédito teria evitado o fechamento | Sebrae, *Sobrevivência de Empresas (2020)*. Matéria da Agência Sebrae de 16/06/2021 (RFB + pesquisa de campo) | https://agenciasebrae.com.br/economia-e-politica/tres-em-cada-10-mei-fecham-as-portas-em-ate-cinco-anos-de-atividade-no-brasil |
| **Misturar finanças** (MEI) | **63% dos MEIs** usam a conta pessoal para pagar despesas da empresa (ME 54%, EPP 51%; total 60%). 6.126 entrevistas, 07/12/2022 a 20/01/2023 | Sebrae, *Hábitos de Uso de Produtos Financeiros*, 2ª ed. Agência Sebrae, 22/03/2023 | https://agenciasebrae.com.br/dados/tres-a-cada-cinco-empresarios-ja-pagaram-despesas-da-empresa-com-sua-conta-pessoa-fisica/ |
| Misturar finanças (todos os pequenos negócios, 2025) | 61% pagam despesas da empresa com a conta pessoal (serviços: 62%). Forma de controle: planilha 30%, **caderno 25%**, app 20%, contador 13%, **sem controle 10%**. Recorte por MEI: não informado | Sebrae, *Hábitos Financeiros dos Pequenos Negócios*. Agência Sebrae, 07/01/2026 | https://agenciasebrae.com.br/cultura-empreendedora/61-dos-empreendedores-brasileiros-fazem-pagamentos-da-empresa-com-a-conta-pessoal/ |
| **Sem controle financeiro** (MEI) | 33% não registram os gastos e 39% não registram as receitas. 50% anotam gastos em caderno; só 21% usam meio digital. ~50% não registram o pró-labore. 34% olham o saldo no máximo 1 vez por mês. 68% não têm previsão de saldo para o mês seguinte. 77% nunca fizeram curso de finanças. 1.000 entrevistas por telefone, 17 a 26/04/2018 | Sebrae, *Educação Financeira do MEI*, maio/2018. Republicado pelo BCB no *Relatório de Cidadania Financeira* 2018 | https://datasebrae.com.br/wp-content/uploads/2018/05/Educa%C3%A7%C3%A3o_Financeira_MEI_2018_FINAL.pdf · https://www.bcb.gov.br/Nor/relcidfin/docs/art9_educacao_finanaceira_MEIs.pdf |
| **Fiado** | **42% dos MEIs vendem fiado**; desses, **86% já tiveram problema para receber** | idem (Sebrae 2018, P11–P12) | idem |
| **Setor de beleza: gestão** | 980 negócios (CNAE 9602-5/01 e 9602-5/02; 94,3% MEI), set/2021: **76,6% trabalham sozinhos**. Controle financeiro: **41,9% em agendas e cadernos**, 28,1% "não controla de forma muito rigorosa", 15,0% planilha, 11,1% sistema. Maior dificuldade financeira: **separar gastos pessoais dos da empresa (29,2%)** e capital de giro (23,8%). Preço: 46,0% calculam custo + margem; 38,9% "só vão atualizando" | Sebrae, *Beleza & Estética: Relatório de Pesquisa 2021* (DataSebrae) | https://datasebrae.com.br/wp-content/uploads/2020/10/Relat%C3%B3rio-BELEZA-v2.pdf |
| **Tamanho do setor** (IBGE) | "Cabeleireiros e outras atividades de tratamento de beleza" é a **atividade com mais MEIs**: **9,0% em 2022 (~1,3 mi)**, e nessa atividade 88,7% das ocupações são de MEI. Em 2021: 9,1% (~1,2 mi). RJ tem a maior proporção de MEI sobre os ocupados formais (26,0% em 2021; 24,5% em 2022). *Estatística experimental* | IBGE, *Estatísticas dos Cadastros de Microempreendedores Individuais* (ref. 2021, divulgada em 04/10/2023; ref. 2022, divulgada em 21/08/2024). Edição de 2023 ou posterior: **não encontrada** | https://agenciagov.ebc.com.br/noticias/202310/em-2021-brasil-tinha-13-2-milhoes-de-microempreendedores-individuais-1 · [S] https://www.correiobraziliense.com.br/economia/2024/08/6924950-ibge-brasil-gerou-15-milhao-de-microempreendedores-individuais-em-um-ano.html (o site do IBGE bloqueou a leitura automática) |
| Tamanho do setor (Receita, via Sebrae) | CNAE "Cabeleireiros, manicure e pedicure": **1.045.964 MEIs** (6,2% de todos os MEIs, 1º lugar), posição de 02/05/2026 | Observatório Sebrae Bahia, *Relatório Universo MEI e MPE – Abril 2026* (fonte: RFB/Simples Nacional) | https://datasebrae.com.br/wp-content/uploads/2025/02/RELATORIO-UNIVERSO-MEI-e-MPE-Abril-2026-Brasil-Nordeste-Bahia-e-Unidades-Regionais.pdf |

> **Cuidado com o relatório Universo MEI de julho/2026:** ele mostra o total de MEIs caindo de 16,9 mi para 3,36 mi.
> O próprio texto atribui a queda a um "reprocessamento… com a exclusão dos inativos, inadimplentes etc.". Não use
> esse número de julho como tamanho do setor sem explicar a mudança de base.
> Um número de "45% dos MEIs não separam as contas" (imprensa, set/2025) **não teve a fonte primária achada**: não usar.

---

## 6. Educação financeira gratuita e método de preço do Sebrae

### 6.1 Educação financeira oficial gratuita (citável)

| Recurso | De quem | Formato | Fonte |
|---|---|---|---|
| **Caderno de Educação Financeira, Conteúdo Básico** (versão 2026, 2ª ed. revisada) | Banco Central (Depef) | PDF, 98 p. Trata de orçamento, **despesas sazonais** (aperto no início do ano) e **reserva de emergência** | [P] https://www.bcb.gov.br/content/cidadaniafinanceira/documentos_cidadania/Cuidando_do_seu_dinheiro_Gestao_de_Financas_Pessoais/caderno_cidadania_financeira.pdf |
| **Gestão de Finanças Pessoais** | BCB + Enap, na Escola Virtual de Governo | Curso online de 20 h | [P] https://www.escolavirtual.gov.br/curso/170 (listado pelo Meu Bolso em Dia) |
| **Meu Bolso em Dia** | Febraban, por acordo de cooperação com o BCB (lançado em nov/2021) | Plataforma com diagnóstico gratuito, trilhas, cursos e planilhas | [P] https://meubolsoemdia.com.br/Materias/cursos-gratuitos-sobre-financas-pessoais |
| **Preço de vendas para beleza** | Sebrae (curso online) | **3 h, gratuito.** Precificação aplicada a salão, estética e cosméticos | [P] https://loja.sebrae.com.br/preco-de-vendas-para-beleza-1-372000069337 |
| **Como controlar o fluxo de caixa** | Sebrae (curso online) | **10 h, gratuito** (Agência Sebrae, 02/01/2026) | [P] https://agenciasebrae.com.br/?p=36734 |
| **Finanças sem mistério: Fluxo de Caixa** | Sebrae RS (palestra, maio/2025) | Exemplo de uma barbearia MEI na garagem de casa: **lucro no mês, mas caixa negativo quase o mês todo**, por concentração de contas na 1ª semana e falta de capital de giro e reserva. Diz que **pró-labore é despesa fixa, não lucro** | [P] https://conhecimento.sebraers.com.br/wp-content/uploads/2025/05/Financas-sem-misterio-Fluxo-de-Caixa-Como-controlar-e-planejar-as-financas-do-seu-negocio.pdf |

### 6.2 Como o Sebrae manda calcular o preço de um serviço

O Sebrae não publica uma fórmula única "oficial" para salão. Os materiais encontrados convergem em **custo direto ×
markup**, com o markup cobrindo despesas sobre a venda (taxa de cartão, impostos, comissão), custos fixos e lucro:

1. **Markup (Sebrae RS, 2025, primária):** `Markup = 1 / (1 − %despesas de comercialização/100)` e
   `Preço de venda = Custo × Markup`. Também traz a margem de contribuição, `MC = Preço − (Custo + Despesas de venda)`,
   e o ponto de equilíbrio, `PE(R$) = Custos e despesas fixas / (%MC/100)`. Entre as despesas fixas lista **pró-labore
   e DAS-MEI**. [P] https://conhecimento.sebraers.com.br/wp-content/uploads/2025/09/28.08.25-Formacao-de-preco-para-vender-mais-no-fim-de-ano-Deivid-Genro.pdf
2. **Markup divisor clássico (Comunidade Sebrae/PR, 2021, secundária):** `Markup = 100 / [100 − (CVP + CVV + CF + L)]`,
   com todos em % do preço: custo variável de produção, custo variável de venda, custos fixos e lucro desejado.
   Exemplo do artigo: 100/(100−77) = 4,35. [S] https://sebraepr.com.br/comunidade/artigo/preco-de-venda-como-calcular
3. **Serviço por hora (Sebrae/PR, primária):** somar os custos mensais fixos e variáveis, estimar as **horas de serviço
   vendáveis por mês**, dividir custos por horas e somar a margem. O resumo é "custo + margem + mercado".
   [P] https://sebraepr.com.br/?p=205371
4. **MEI sem funcionário (Sebrae Nacional/MS, cartilha de 2025):** valor da hora × horas do serviço; incluir o
   **DAS (uma vez no mês)**, materiais, transporte e equipamentos; somar a margem de lucro.
   [P] https://sebrae.com.br/content/dam/portal-sebrae/na/midias/documentos/pdfs/ebook_precificacao-mei-contrata-brasil.pdf
5. **Lucratividade do salão (Comunidade Sebrae/PR, 2020, secundária):** receita − custos variáveis (insumos, **taxa de
   cartão**, impostos, comissões) = margem de contribuição; − custos fixos = resultado; lucro% = resultado ÷ receita.
   [S] https://sebraepr.com.br/comunidade/artigo/o-seu-salao-de-beleza-e-lucrativo

**Síntese para o app** [I] (é a nossa leitura do método, não uma fórmula literal do Sebrae):

```
custo fixo por hora   = (custos fixos do salão no mês + pró-labore desejado + DAS) ÷ horas atendidas no mês
custo direto          = insumos usados no serviço (por dose/aplicação) + custo fixo por hora × duração (h)
preço sugerido        = custo direto ÷ (1 − taxa do cartão% − margem%)        ← markup divisor
sobra real do serviço = preço × (1 − taxa do meio de pagamento usado) − custo direto
```

*Exemplo ilustrativo com números inventados (não são da parceira):* fixos do salão R$ 316 + pró-labore R$ 2.500,
dividido por 80 h, dá **R$ 35,20/h**. Serviço de 1,5 h com R$ 18 de insumos: custo direto = 18 + 52,80 = **R$ 70,80**.
Com crédito à vista a 3,15% e margem de 15%: preço = 70,80 ÷ 0,8185 = **R$ 86,50**. Se o insumo subir 20% com o dólar
(R$ 21,60), o custo vai a R$ 74,40 e o preço sugerido a R$ 90,90. É esse "e se" que ela pediu no debriefing.

---

## 7. Implicações para o app

1. **Não indicar o App Sebrae como solução principal; usá-lo como complemento.** Ele é genérico (MEI/ME/EPP), faz de
   tudo, pede conta e internet, e a pesquisa do próprio Sebrae (2020) registrou abandono e volta ao caderno. Vale indicar
   os **cursos gratuitos** do Sebrae (preço para beleza, 3 h; fluxo de caixa, 10 h) e os **apps oficiais** (App MEI da
   Receita) para o DAS e a DASN. Construir um app próprio se justifica pelo foco no salão e pelas restrições do edital.
2. **O registro de atendimento é o coração do app: 1 tela, menos de 10 s.** Serviço, valor e forma de pagamento; o app
   calcula sozinho o **líquido** (§4.3), com taxas que ela informa e pode atualizar. Com 33–39% dos MEIs sem registro
   nenhum (Sebrae 2018), o atrito decide se o hábito pega.
3. **Fiado como recurso de primeira classe.** "A receber" por cliente, com data combinada, aviso de vencido e um texto
   pronto para ela **copiar** no WhatsApp; o app não envia nada sozinho. 42% dos MEIs vendem fiado e 86% desses já
   tiveram problema (Sebrae 2018).
4. **Separar casa × salão sem exigir conta PJ.** Um "envelope" do salão e uma **retirada/pró-labore** registrada como
   despesa fixa (Sebrae RS). Mostrar quanto ela **pode** tirar para casa. É a maior dificuldade financeira do setor de
   beleza (29,2%) e 63% dos MEIs misturam as contas.
5. **Reserva e sazonalidade visíveis.** Meta de reserva para atravessar **janeiro e fevereiro** e para repor
   equipamento (secador, babyliss), em vez de crédito de curto prazo. O BCB trata despesas sazonais e reserva de
   emergência como prevenção de dívida, e a falta de capital de giro é a principal causa de fechamento citada pelo
   Sebrae (22%).
6. **Preço por serviço com o método do Sebrae e simulação "e se".** Insumo por dose, tempo, custo fixo por hora,
   taxa de cartão e margem. Simulação de alta do insumo (dólar) e de troca de fornecedor, entre até 3, para ela ver o
   efeito na sobra antes de decidir. Atende o pedido explícito do debriefing.
7. **Obrigações do MEI como lembretes, não como emissão.** Lembrar o DAS no dia 20 (R$ 86,05 em 2026; valor
   configurável por ano), somar o faturamento do ano contra o limite (R$ 81 mil em 2026, R$ 110 mil em 2027) e gerar um
   **resumo mensal de receitas** que serve ao Relatório Mensal (2026) e à DASN-SIMEI (até 31/05/2027). Emitir DAS ou
   nota fica com os apps oficiais.
8. **Offline primeiro, sem login, dados no aparelho, com backup que ela controla.** O edital (§7.1 e §8.2) e a LGPD
   pedem isso, e a perda de dados foi o principal motivo de abandono da ferramenta do Sebrae em 2020. Exportação simples
   (PDF ou planilha) para mostrar a um contador ou ao Sebrae.
9. **Evitar:** cadastro obrigatório, jargão contábil (DRE, plano de contas, conciliação), dezenas de categorias,
   telas de superapp, letra pequena (público maduro; reclamação recorrente na Play) e **qualquer recomendação de
   produto financeiro ou maquininha**. O edital proíbe; o app descreve as taxas que ela já paga.
10. **Não construir agenda** (o WhatsApp já resolve e o mercado cobra R$ 40–110/mês só por isso) nem integração
    bancária. Medir o sucesso pelo **hábito**: registros por semana e semanas seguidas de uso, com teste em **dados
    fictícios** (edital §8.1). O critério de "deu certo" é ela fechar o mês sabendo quanto sobrou e quanto pode tirar
    para casa.

---

## 8. Lacunas (não encontrado)

- Login do App Sebrae (gov.br, CPF ou conta Sebrae): **não encontrado em fonte oficial**. Só há indícios [I].
- Lista oficial do Anexo XI (nomes exatos das ocupações de beleza): **não lida na fonte primária** (páginas dinâmicas).
- Texto da LC 214/2025 sobre a dispensa do teste de 2026 para o Simples: **não lido no Planalto**. Fonte usada: [S].
- MDR médio oficial do BCB para 2025–2026: **não encontrado**.
- IBGE, Estatísticas dos Cadastros de MEI com referência 2023 ou posterior: **não encontrado**.
- Composição exata do DAS de 2027 para MEI só de serviços (se a CBS e o IBS do Anexo XIII valem para todos):
  **conferir** no texto oficial da Res. CGSN 190/2026 no DOU.
- Calculadora "de serviços de beleza" citada em artigo da Comunidade Sebrae/PR: o link leva a um **site de terceiro**,
  não do Sebrae.

---

## Fontes (acesso em 03/11/2026)

**Sebrae: ferramentas e conteúdo**
1. Google Play, "Sebrae: para você empreender": https://play.google.com/store/apps/details?id=br.com.sebrae.napalmadamao
2. App Store, "Sebrae: Apoio para seu negócio": https://apps.apple.com/br/app/sebrae/id1482839375
3. Agência Sebrae, "Aplicativo do Sebrae soma quase 4 milhões de atendimentos em 2025" (02/03/2026): https://agenciasebrae.com.br/inovacao-e-tecnologia/aplicativo-do-sebrae-soma-quase-4-milhoes-de-atendimentos-em-2025/
4. Agência Sebrae, "App Sebrae traz praticidade para empreendedores" (09/05/2023): https://agenciasebrae.com.br/inovacao/app-sebrae-traz-praticidade-para-empreendedores/
5. Sebrae, Fluxo de Caixa Online: https://fluxocaixa.sebrae.com.br/
6. Agência Sebrae, "Ano novo, empresa nova: cinco cursos e ferramentas online do Sebrae…" (02/01/2026): https://agenciasebrae.com.br/?p=36734
7. Agência Sebrae, Planejadora Sebrae (16/04/2025): https://agenciasebrae.com.br/cultura-empreendedora/tem-dificuldade-na-gestao-financeira-da-empresa-a-planejadora-sebrae-pode-ajudar-a-resolver-seus-problemas/
8. Planejadora Sebrae: https://planejadora.sebrae.com.br/
9. Calculadora Sebrae: https://calculadora.sebrae.com.br/
10. Sebrae-SP / Data Sebrae, "As MPEs e a Gestão Financeira: Pesquisa Fluxo de Caixa" (ago/2020): https://datasebrae.com.br/wp-content/uploads/2020/10/Pesquisa-Fluxo-de-Caixa-compactado.pdf
11. Sebrae RS, "Finanças sem mistério: Fluxo de Caixa" (mai/2025): https://conhecimento.sebraers.com.br/wp-content/uploads/2025/05/Financas-sem-misterio-Fluxo-de-Caixa-Como-controlar-e-planejar-as-financas-do-seu-negocio.pdf
12. Sebrae RS, planilha "MEI Fluxo de Caixa Simplificado": https://conhecimento.sebraers.com.br/wp-content/uploads/2025/05/MEI_Fluxo-de-Caixa_Simplificado.xlsx
13. Sebrae/PR, Planilha Fluxo de Caixa: https://sebraepr.com.br/planilhas/fluxo-de-caixa/
14. Sebrae/PR, Precifique: https://sebraepr.com.br/precifique
15. Sebrae/PR, "Como calcular preço de vendas de serviços": https://sebraepr.com.br/?p=205371
16. Sebrae RS, "Formação de preço para vender mais no fim de ano" (ago/2025): https://conhecimento.sebraers.com.br/wp-content/uploads/2025/09/28.08.25-Formacao-de-preco-para-vender-mais-no-fim-de-ano-Deivid-Genro.pdf
17. Sebrae, "Precificação: a chave para o sucesso nas vendas com o Contrata+Brasil" (2025): https://sebrae.com.br/content/dam/portal-sebrae/na/midias/documentos/pdfs/ebook_precificacao-mei-contrata-brasil.pdf
18. Comunidade Sebrae/PR, "Preço de venda como calcular" (25/01/2021): https://sebraepr.com.br/comunidade/artigo/preco-de-venda-como-calcular
19. Comunidade Sebrae/PR, "O seu salão de beleza é lucrativo?" (09/09/2020): https://sebraepr.com.br/comunidade/artigo/o-seu-salao-de-beleza-e-lucrativo
20. Sebrae, curso "Preço de vendas para beleza": https://loja.sebrae.com.br/preco-de-vendas-para-beleza-1-372000069337
21. Sebrae, "Ideia de Negócio MEI - Cabeleireiro(a)" (nov/2025): https://bibliotecas.sebrae.com.br/chronus/ARQUIVOS_CHRONUS/IDEIAS_DE_NEGOCIO/PDFS/ideia-de-negocio_mei--cabelereiroa.pdf
22. Baguete, "Sebrae: app focado em microempreendedores" (Qipu, notícia antiga): https://www.baguete.com.br/noticias/sebrae-app-focado-em-microempreendedores

**Dados e estatísticas**
23. Sebrae, "Relatório Técnico: Sobrevivência das empresas mercantis brasileiras (2021-2025)" (18/03/2026): https://datasebrae.com.br/wp-content/uploads/2026/03/Relatorio-tecnico-Sobrevivencia-das-empresas-mercantis-brasileiras-2021-2025.pdf
24. Agência Sebrae, "Três em cada 10 MEI fecham as portas em até cinco anos…" (16/06/2021): https://agenciasebrae.com.br/economia-e-politica/tres-em-cada-10-mei-fecham-as-portas-em-ate-cinco-anos-de-atividade-no-brasil
25. Agência Sebrae, "Três a cada cinco empresários já pagaram despesas da empresa com sua conta pessoa física" (22/03/2023): https://agenciasebrae.com.br/dados/tres-a-cada-cinco-empresarios-ja-pagaram-despesas-da-empresa-com-sua-conta-pessoa-fisica/
26. Agência Sebrae, "61% dos empreendedores brasileiros fazem pagamentos da empresa com a conta pessoal" (07/01/2026): https://agenciasebrae.com.br/cultura-empreendedora/61-dos-empreendedores-brasileiros-fazem-pagamentos-da-empresa-com-a-conta-pessoal/
27. Data Sebrae, "Educação Financeira do MEI" (mai/2018): https://datasebrae.com.br/wp-content/uploads/2018/05/Educa%C3%A7%C3%A3o_Financeira_MEI_2018_FINAL.pdf
28. Banco Central, "Educação financeira dos microempreendedores individuais" (Relatório de Cidadania Financeira, 2018): https://www.bcb.gov.br/Nor/relcidfin/docs/art9_educacao_finanaceira_MEIs.pdf
29. Data Sebrae, "Beleza & Estética: Relatório de Pesquisa 2021": https://datasebrae.com.br/wp-content/uploads/2020/10/Relat%C3%B3rio-BELEZA-v2.pdf
30. Observatório Sebrae Bahia, "Relatório Universo MEI e MPE – Abril 2026": https://datasebrae.com.br/wp-content/uploads/2025/02/RELATORIO-UNIVERSO-MEI-e-MPE-Abril-2026-Brasil-Nordeste-Bahia-e-Unidades-Regionais.pdf
31. Observatório Sebrae Bahia, "Relatório Universo MEI e MPE – Julho 2026": https://datasebrae.com.br/wp-content/uploads/2026/07/RELATORIO-UNIVERSO-MEI-e-MPE-Julho-2026-Brasil-Nordeste-Bahia-e-Unidades-Regionais.pdf
32. Agência Gov / IBGE, "Em 2021, Brasil tinha 13,2 milhões de microempreendedores individuais" (04/10/2023): https://agenciagov.ebc.com.br/noticias/202310/em-2021-brasil-tinha-13-2-milhoes-de-microempreendedores-individuais-1
33. Poder360, "Cabeleireiros representam a maior parcela de MEIs do país, diz IBGE" (04/10/2023): https://www.poder360.com.br/poder-empreendedor/cabeleireiros-representam-a-maior-parcela-de-meis-do-pais-diz-ibge/
34. Correio Braziliense, "IBGE: Brasil gerou 1,5 milhão de microempreendedores individuais em um ano" (21/08/2024): https://www.correiobraziliense.com.br/economia/2024/08/6924950-ibge-brasil-gerou-15-milhao-de-microempreendedores-individuais-em-um-ano.html
35. IBGE, Agência de Notícias, "Em 2022, Brasil tinha 14,6 milhões de microempreendedores individuais" (acesso bloqueado por proteção anti-robô): https://agenciadenoticias.ibge.gov.br/pt/agencia-noticias/41046-em-2022-brasil-tinha-14-6-milhoes-de-microempreendedores-individuais.html

**Legislação e regras do MEI**
36. Receita Federal, "Perguntas e Respostas MEI e Simei" (atualizado em 29/04/2025): https://www8.receita.fazenda.gov.br/SimplesNacional/Arquivos/manual/PerguntaoMEI.pdf
37. Resolução CGSN nº 140/2018, texto consolidado (reprodução, ago/2026): https://guiatributario.net/wp-content/uploads/2026/08/resolucao140.pdf
38. Resolução CGSN nº 190/2026 (reprodução): https://www.normaslegais.com.br/legislacao/Resolucao-cgsn-190-2026.htm
39. Contábeis, "Reforma Tributária MEI: o que muda em 2027" (21/08/2026): https://www.contabeis.com.br/artigos/78949/reforma-tributaria-mei-o-que-muda-em-2027-nas-regras/
40. Decreto nº 12.797/2025 (salário mínimo de 2026): https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/decreto/D12797.htm
41. O Povo, "Contribuição mensal do MEI sobe para R$ 81,05 em 2026" (02/01/2026): https://www.opovo.com.br/noticias/economia/2026/01/02/contribuicao-mensal-do-mei-sobe-para-rs-8105-em-2026.html
42. Senado Federal, PLP 186/2026 → LC 238/2026: https://www25.senado.leg.br/web/atividade/materias/-/materia/175969
43. Fenacon, "Sancionada lei que amplia limite de faturamento do MEI" (22/10/2026): https://fenacon.org.br/noticias/sancionada-lei-que-amplia-limite-de-faturamento-do-mei/
44. Agência Brasil, "Senado aprova aumento de limite e perdão de dívida para MEIs" (15/10/2026): https://agenciabrasil.ebc.com.br/politica/noticia/2026-10/senado-aprova-aumento-de-limite-e-perdao-de-divida-para-meis
45. Decreto nº 13.140/2026 (DOU de 21/10/2026, cópia): https://static.poder360.com.br/uploads/2026/10/Decreto-MEI-.pdf
46. ReformaTributaria.com, decretos e Res. CGSN 195/2026: https://www.reformatributaria.com/governo/decretos-de-lula-dispensam-nanoempreendedor-de-cnpj-e-mei-de-documentos-fiscais-em-vendas-leia-os-documentos/
47. ReformaTributaria.com, "Empresas do Simples Nacional não estão obrigadas às alíquotas teste de IBS/CBS em 2026": https://www.reformatributaria.com/empresas-do-simples-nacional-nao-estao-obrigados-as-aliquotas-teste-de-ibs-cbs-em-2026/
48. Lei Complementar nº 214/2025: https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm
49. Lei Complementar nº 116/2003 (lista de serviços, item 6.01): https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm
50. Lei nº 13.352/2016 (salão-parceiro): https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/lei/l13352.htm
51. gov.br, MEI, "Ocupações Permitidas": https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/atividades-permitidas

**Pagamentos e Pix**
52. Banco Central, Resolução BCB nº 1/2020 (Regulamento Pix; versão consolidada): https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20BCB&numero=1
53. Banco Central, Resolução BCB nº 19/2020 (tarifas do Pix): https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20BCB&numero=19
54. Banco Central, Resolução BCB nº 246/2022 (teto de intercâmbio): https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20BCB&numero=246
55. Agência Sebrae, "Saiba quando seu pequeno negócio pode ser tarifado ao usar o Pix" (26/06/2023): https://agenciasebrae.com.br/?p=14404
56. BCB, nota sobre o Pix por aproximação (26/02/2025, cópia): https://static.poder360.com.br/2025/02/pix-por-aproximacao-26fev2025.pdf
57. Acionista, "Pix Automático é lançado pelo BC": https://acionista.com.br/pix-automatico-e-lancado-pelo-bc-nesta-terca/
58. InfinitePay, Taxas: https://www.infinitepay.io/taxas
59. Mercado Pago, Point Mini: https://www.mercadopago.com.br/ferramentas-para-vender/maquininhas-point/point-mini

**Concorrentes** (páginas de preço e lojas)
60. Trinks: https://negocios.trinks.com/planos/
61. Avec: https://negocios.avec.app/avec-planos
62. Booksy: https://biz.booksy.com/pt-br/precos
63. Gendo: https://www.gendo.app/br/planos
64. AgendaPro: https://agendapro.com/br/planes
65. Simples Agenda: https://www.simplesagenda.com.br/site/
66. Salon Soft: https://www.salonsoft.com.br/
67. AppBeleza: https://www.appbeleza.com.br/ · AppBarber: https://www.appbarber.com.br/
68. Belasis: https://www.belasis.com.br/precos
69. App MEI (Receita Federal), Google Play: https://play.google.com/store/apps/details?id=br.gov.fazenda.receita.mei
70. Meu MEI Digital, Google Play: https://play.google.com/store/apps/details?id=br.gov.memp.portaldoempreendedor
71. Neon / MEI Fácil: https://neon.com.br/mei-facil
72. Conta Azul: https://contaazul.com/planos/
73. Nibo: https://www.nibo.com.br/empresa/planos-e-precos
74. Mobills: https://www.mobills.com.br/pricing/
75. Organizze: https://www.organizze.com.br/planos/
76. Qipu: https://qipu.com.br/erp-gestao-financeira/
77. Nubank, Assistente de Cobranças: https://nubank.com.br/empresas/solucoes-para-cobranca/assistente-de-cobrancas
78. InfinitePay, Gestão de Cobrança: https://www.infinitepay.io/gestao-de-cobranca
79. PagBank, PagVendas: https://pagbank.com.br/para-seu-negocio/pagvendas/
80. Cora: https://www.cora.com.br/
81. Ton, MEI/PJ: https://www.ton.com.br/MEI-PJ

**Educação financeira**
82. Banco Central, "Caderno de Educação Financeira – Conteúdo Básico" (versão 2026): https://www.bcb.gov.br/content/cidadaniafinanceira/documentos_cidadania/Cuidando_do_seu_dinheiro_Gestao_de_Financas_Pessoais/caderno_cidadania_financeira.pdf
83. Meu Bolso em Dia, "Cursos online e gratuitos sobre finanças pessoais" (atualizado em 18/06/2024): https://meubolsoemdia.com.br/Materias/cursos-gratuitos-sobre-financas-pessoais
84. Escola Virtual de Governo, curso "Gestão de Finanças Pessoais" (BCB): https://www.escolavirtual.gov.br/curso/170
