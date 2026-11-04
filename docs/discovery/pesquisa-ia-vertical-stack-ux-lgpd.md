# Pesquisa de discovery: IA vertical, stack do MVP, UX para baixa literacia e LGPD

- **Data:** 2026-11-03
- **Contexto:** app financeiro simples para uma microempreendedora (salão de beleza de bairro, MEI, trabalha sozinha, usa celular e WhatsApp, pouca familiaridade com controle financeiro). Projeto acadêmico de extensão. Regras do edital: dados reais da parceira **não** podem ir para ferramentas de IA nem serviços não autorizados; o protótipo é testado com dados fictícios.
- **Método:** fontes primárias sempre que possível (texto original dos fundos, WebKit/MDN/web.dev, documentação oficial de GitHub, Supabase, Apple e Google, Planalto, ANPD, gov.br, Cetic.br, BCB/Sebrae). Marcações usadas:
  - **[secundária]**: só encontrei fonte secundária (imprensa, escritório de advocacia, blog).
  - **[interpretação]**: inferência nossa a partir das fontes, não afirmação da fonte.
  - **[a verificar]**: ponto em aberto que precisa de checagem ou teste.
- **Aviso:** este documento não é parecer jurídico. Os pontos de LGPD devem ser validados com a coordenação do projeto e com o encarregado ou a assessoria jurídica da universidade.

---

## 0. Resumo executivo

1. A tese que o usuário chamou de "artigo da Sequoia sobre IA vertical" corresponde principalmente a **"Services: The New Software"**, de Julien Bek (Sequoia, 5 mar. 2026). Nele estão o par **copilot e autopilot** e a ideia de **vender o trabalho, não a ferramenta**. O texto apoia-se em **"Generative AI's Act o1"** (Huang e Grady, out. 2024), que trouxe *service-as-a-software* e preço por resultado. Não achei texto da Sequoia com o enquadramento "systems of record vs. systems of action". Esse enquadramento aparece na Foundation Capital.
2. Para um salão de uma pessoa só, o "trabalho" que se pode vender é sobretudo o que segue regras e pode ser conferido. São as **obrigações do MEI** (Relatório Mensal de Receitas Brutas, DAS, DASN-SIMEI, limite de R$ 81 mil, NFS-e para clientes PJ) e o **fechamento do mês**. Precificação e compras são **julgamento**: o app ajuda, mas a decisão fica com ela.
3. **Stack recomendada para hoje:** PWA *local-first* (Vite + Preact/TS + IndexedDB + service worker) publicado no **GitHub Pages**, sem backend, sem analytics e sem IA. É a única das três opções que vai para produção hoje, a custo zero, sem tirar dados do aparelho, o que é compatível com o edital. O esqueleto que já está em `app/` (Vite, Preact, idb-keyval, vite-plugin-pwa) segue esse caminho.
4. **Riscos principais da opção (a):**
   - **Perda de dados.** Acontece se ela trocar ou perder o celular, limpar os dados do site ou tiver os dados despejados pelo navegador. Mitigação: instalar na Tela de Início, chamar `navigator.storage.persist()` e oferecer backup exportável com lembrete.
   - **Instalação manual no iPhone.** O Safari do iOS não tem `beforeinstallprompt`, então o app precisa de uma tela de instruções ilustrada.
   - **Mesma origem no GitHub Pages.** Todos os sites de projeto em `usuario.github.io` compartilham a mesma origem e, portanto, o mesmo armazenamento. Por isso convém usar uma organização ou um domínio dedicado.
5. **LGPD:** quando a parceira anota dados de clientes no app, ela é a **controladora** desses dados. O Guia da ANPD dá o exemplo da profissional liberal que guarda dados de pacientes no próprio computador. Como MEI, ela é **agente de pequeno porte** (Res. CD/ANPD 2/2022): não precisa de encarregado, mas precisa de um canal para os titulares. Mesmo sem servidor, vale publicar um **aviso de privacidade curto** em linguagem simples (art. 9º da LGPD). Ele é obrigatório se o app um dia for para as lojas. Com nuvem e IA, quatro coisas passam a contar: o papel de operador e de suboperador, a base legal (com consentimento específico para recursos opcionais), as cláusulas-padrão da ANPD para transferência internacional (Res. 19/2024) e o precedente ANPD × Meta (2024) sobre treinar IA com legítimo interesse.

---

## 1. Sequoia e IA vertical

### 1.1 Artigos da Sequoia identificados

| # | Título exato | Autor(es) | Data (byline) | URL |
|---|---|---|---|---|
| S1 | **Services: The New Software** | Julien Bek | 5 mar. 2026 | https://sequoiacap.com/article/services-the-new-software/ |
| S2 | **Generative AI's Act o1** (subtítulo na página: *The Agentic Reasoning Era Begins*) | Sonya Huang e Pat Grady | 9 out. 2024 | https://sequoiacap.com/article/generative-ais-act-o1 |
| S3 | **Generative AI's Act Two** | Sonya Huang e Pat Grady | 20 set. 2023 | https://www.sequoiacap.com/article/generative-ai-act-two/ |
| S4 | AI Ascent 2026 (resumo do evento) | Team Sequoia | 8 mai. 2026 | https://sequoiacap.com/article/ai-ascent-2026 |

Observações:
- Nos metadados, as páginas da Sequoia mostram "Oct 31, 2026", que parece ser data de rastreio ou atualização. Usei a data do byline.
- O S4 é só um resumo do evento (2026 como "o ano dos agentes"). Tem pouca substância sobre IA vertical e entra aqui apenas como contexto.
- **"Copilots vs. autopilots"** é a moldura central do S1. O S2 já descrevia o padrão de começar como copilot e "conquistar" o modo autopilot.
- **"Systems of record vs. systems of action"**: não encontrei esse enquadramento em texto da Sequoia. O mais próximo é a Foundation Capital (ver 1.3).

### 1.2 Teses centrais (síntese)

1. **Vender o trabalho, não a ferramenta.** Na era da nuvem vendia-se software por assento. Na era da IA vende-se trabalho por resultado (S2). Para Bek (S1), a próxima empresa de US$ 1 trilhão será uma empresa de software que vende serviços. Vender o trabalho concluído também faz cada avanço dos modelos virar vantagem, e não ameaça.
2. **O mercado-alvo é o orçamento de mão de obra e serviços.** O S2 compara um mercado de serviços na casa dos trilhões com os cerca de US$ 350 bi do software em nuvem. O S1 estima o gasto com serviços em cerca de 6 vezes o gasto com software. Exemplo de Bek: um software de contabilidade custa perto de US$ 10 mil/ano, e o contador que fecha os livros custa perto de US$ 120 mil.
3. **Copilot × autopilot (S1).** O copilot vende uma ferramenta ao profissional, que continua responsável pelo resultado (Harvey para escritórios de advocacia). O autopilot vende o resultado direto ao comprador final (Crosby vendendo o NDA pronto) e disputa o orçamento de trabalho desde o início.
4. **Inteligência × julgamento (S1).** "Inteligência" é trabalho que segue regras e pode ser conferido. "Julgamento" exige experiência e gosto. O autopilot funciona melhor onde a parcela de inteligência é alta. A engenharia de software foi a primeira área a mudar, e Bek espera o mesmo nas outras profissões.
5. **Entrar pelo que já é terceirizado (S1).** Uma tarefa terceirizada mostra três coisas: o cliente aceita execução externa, existe uma linha de orçamento que pode ser substituída e ele já compra resultado. Trocar um fornecedor é simples. Trocar funcionários é reorganizar a empresa.
6. **O julgamento de hoje vira a inteligência de amanhã (S1).** Ao acumular dados próprios sobre bons julgamentos, o autopilot sobe na cadeia de valor, e copilots e autopilots tendem a convergir. O ponto de partida decide quem conquista primeiro os clientes e os dados.
7. **O direito ao piloto automático se conquista (S2).** Muitas empresas começam como copilot, com um humano no circuito. Modos de falha "graciosos", como passar o caso para um humano, facilitam a implantação.
8. **O valor da aplicação está na "arquitetura cognitiva" (S2).** A camada de aplicação combina vários modelos com roteamento, recuperação de informação, guardrails e lógica de domínio. Os laboratórios de modelos não devem dominar os workflows desorganizados de cada vertical. Isso responde à crítica de que esses apps seriam "só wrappers".
9. **O raciocínio rende mais onde a resposta pode ser conferida (S2).** Exemplos: código, matemática, ciência. Para nós, isso inclui somas fiscais, conciliação e prazos.
10. **Defesas competitivas: workflow e rede contam mais que dados (S3, 2023).** O S3 considera que as "defesas por dados" estão em terreno frágil e que workflows e redes de usuários são mais duráveis. Os primeiros apps de sucesso foram verticalmente integrados. Existe uma tensão com a tese 6 (2026). **[interpretação]** Lendo os dois juntos: o dado só vira defesa quando é capturado dentro do workflow que o usuário já usa todo dia.
11. **Retenção é a prova de valor (S3).** O DAU/MAU mediano dos apps de IA generativa era de cerca de 14%. O produto precisa ser útil todos os dias.
12. **Resolver o problema de ponta a ponta, com várias modalidades e foco em execução (S3).** O modelo é só um componente da solução. Os produtos passam do humano no circuito para sistemas agênticos que executam.
13. **Distribuição de alta confiança e preço por resultado (S2).** A venda passa a ser de cima para baixo, com muito contato e muita confiança. Num mundo assim deixa de existir "assento". A Sierra cobra por atendimento resolvido.
14. **Os incumbentes enfrentam o dilema do inovador (S1, S2).** Vender o trabalho significa cortar o próprio cliente; um software para contadores, por exemplo, teria de substituir o contador. Isso abre espaço para empresas que nascem autopilot. O S2 cita o Day.ai, um CRM que se monta sozinho a partir do e-mail e da agenda, como exemplo de produto nativo de IA.
15. **2025 foi dos copilots; 2026 é a tentativa de virar autopilot (S1).**

### 1.3 Leituras complementares de peso

- **Bessemer: "Part I: The future of AI is vertical"** (3 set. 2024). https://www.bvp.com/atlas/part-i-the-future-of-ai-is-vertical
  Apps verticais nativos de LLM atacam tarefas caras, repetitivas e baseadas em linguagem. Os de workflows de apoio (back-office) encontram menos resistência e dão ROI maior. Os números citados: cerca de 80% do ACV do SaaS vertical tradicional, cerca de 400% de crescimento ao ano e cerca de 65% de margem bruta. A série tem quatro partes, e a Part IV traz dez princípios de defensabilidade.
- **a16z: "Vertical SaaS: Now with AI Inside"** (Angela Strange e James da Costa, 20 set. 2024). https://a16z.com/vertical-saas-now-with-ai-inside/
  Descreve uma terceira onda: nuvem, depois nuvem com fintech, depois IA. O exemplo é a **Mindbody, software para estúdios de fitness e beleza**: agendamento online, depois pagamentos e folha, depois IA assumindo marketing, atendimento e finanças. Compara US$ 313 bi de gasto com software com US$ 10,5 tri de gasto com mão de obra nos EUA (2022) e estima que o *take rate* pode subir de 2 a 10 vezes. É o paralelo mais direto com um salão.
- **a16z: "'AI Inside' Opens New Markets for Vertical SaaS"** (2 dez. 2024). https://a16z.com/vsaas-vertical-saas-ai-opens-new-markets/
  Nichos com **baixa receita por funcionário** (lavanderias, por exemplo) combinam com **agentes que automatizam o administrativo**. Nichos com alta receita por funcionário combinam com copilots. Um salão de bairro de uma pessoa está no extremo "baixa receita": ela mesma é o back-office.
- **YC Lightcone: "Vertical AI Agents Could Be 10X Bigger Than SaaS"** (22 nov. 2024). https://www.youtube.com/watch?v=ASABxNenD_U
  **[secundária]** Não assisti ao vídeo. Pelos resumos, a tese é que agentes verticais podem superar o SaaS porque automatizam também parte do trabalho humano, e não só o software.
- **Foundation Capital: "A System of Agents brings service as software to life"** (data não confirmada na página). https://foundationcapital.com/system-of-agents/
  Defende que os sistemas de registro (como CRMs) dependem de digitação manual e ficam incompletos. Os agentes devem ficar **onde o dado nasce**: capturam a informação não estruturada, agem e registram depois. É a fonte mais próxima do par "system of record × system of action".

### 1.4 Tradução para o nosso caso: finanças de salão/MEI como IA vertical

**Onde a parceira está no mapa.** Ela trabalha sozinha, tem baixa receita por pessoa e não tem back-office. O "orçamento de trabalho" que podemos disputar é:
- **o tempo dela**, gasto anotando, somando e lembrando prazos;
- **o prejuízo evitado**: multa ou juros por DAS ou DASN atrasados e o susto de estourar o limite do MEI;
- **o que ela talvez pague hoje** a contador, despachante ou um parente que ajuda. **[a verificar]** com a própria parceira, porque não encontrei dado confiável sobre quantos MEIs pagam contador.

Dados de contexto. Na pesquisa Sebrae de 2018, publicada pelo BCB:
- 50% dos MEIs anotam pagamentos em caderno e só 21% usam computador;
- 39% não controlam a receita todo dia e 33% não controlam a despesa;
- 77% nunca fizeram curso de gestão financeira;
- 50% às vezes ficam sem saber como pagarão as contas;
- 42% vendem fiado.

Na Pulso Sebrae de 2026, 82% dos pequenos negócios usam o **WhatsApp** como principal canal de comunicação e vendas.

**Inteligência × julgamento no salão** (tese S1-4):

| Tarefa | Tipo | Por quê |
|---|---|---|
| Somar receitas do mês e preencher o Relatório Mensal de Receitas Brutas | Inteligência | Regra pública, resultado conferível. O gov.br orienta preencher até o dia 20 do mês seguinte e guardar o documento. |
| Acompanhar o faturamento acumulado contra o limite (R$ 81.000/ano, LC 123/2006, art. 18-A §1º) | Inteligência | Soma e limiar. O PLP 108/2021, que aumentaria o limite, seguia pendente em jul. 2026 **[secundária]**. |
| Lembrar e gerar o DAS; montar a DASN-SIMEI (até o último dia de maio) | Inteligência | Calendário fixo; a DASN é a soma dos relatórios mensais. |
| Emitir NFS-e quando o cliente é PJ | Inteligência | Obrigatória para MEI no Emissor Nacional desde 1º set. 2023 em serviços para PJ; dispensada para PF, salvo pedido do cliente **[secundária]**. |
| Classificar gastos a partir de comprovante, mensagem ou extrato | Inteligência (com erro) | Dá para conferir e corrigir. Bom candidato a copilot primeiro, autopilot depois. |
| Quanto cobrar por um serviço | Julgamento | Depende do mercado local, da clientela e da estratégia. Fica como copilot: mostrar custos e margem. |
| Comprar estoque, abrir agenda no domingo, pegar empréstimo, investir | Julgamento | Fora do autopilot. Investir e pegar crédito ficam fora do escopo (ver limites abaixo). |

**Entrada pela terceirização** (tese S1-5). A cunha mais plausível é **"obrigações do MEI em dia"**. É trabalho de regras, conferível, com custo de erro visível (multa e desenquadramento) e às vezes já terceirizado. Depois viriam o **fechamento do mês** e, por último, o **julgamento** (precificação).

**Escada de copilot a autopilot proposta:**

| Nível | Capacidade | Modo | Dados e tecnologia | LGPD e edital |
|---|---|---|---|---|
| 0 (MVP) | Registrar entrada e saída em até 3 toques; resumo do dia e do mês; **Relatório Mensal pronto para imprimir ou compartilhar**; barra do limite do MEI; lembretes dentro do app (DAS dia 20 **[secundária]**, DASN em maio) | Ferramenta que já entrega um resultado (o relatório) | Só no aparelho (IndexedDB) | Nada sai do aparelho: compatível com o edital |
| 1 | **Captura onde o dado nasce**: foto do comprovante, voz, texto colado do WhatsApp ou compartilhado para o app. O app sugere o lançamento e ela confirma | Copilot | Ideal: OCR e voz no próprio aparelho. Comprovantes de Pix trazem nome e CPF parcial de terceiros, então extrair só valor, data e categoria e descartar a imagem | Se usar IA ou API externa, exige autorização e base legal (ver §4.5) |
| 2 | **Fechamento mensal automático**: relatório, conferência e alertas de caixa ("esta semana sai mais do que entra") e de limite (80% do teto) | Autopilot de regras, com confirmação | Regras determinísticas. Um modelo é dispensável aqui | Local, ou nuvem com consentimento |
| 3 | **Obrigações MEI no piloto automático**: DAS gerado via API Integra MEI (SERPRO/Receita); DASN pré-preenchida; NFS-e para PJ via API do Emissor Nacional | Autopilot com aprovação de 1 toque | Integra Contador/Integra MEI exige certificado e-CNPJ ou **procuração eletrônica no e-CAC** e é cobrado por consumo **[secundária; preços na Loja Serpro, a verificar]** | Tratamento em nome dela (operador), com contrato e aviso. Pagar continua sendo ação dela |
| 4 | **Precificação assistida**: custo de produto por serviço, tempo, DAS e margem → "para sobrar R$ X, este serviço precisa custar pelo menos R$ Y" | Copilot (julgamento) | Dados dela; benchmarks agregados e anonimizados de outros salões só com consentimento | Benchmark exige anonimização real; ver o precedente ANPD × Meta |

**Para ser "AI-native", o app deve se alimentar sozinho em vez de pedir digitação** (S2, exemplo Day.ai; Foundation Capital, "onde o dado nasce"). No nosso caso o dado nasce no Pix recebido, na maquininha, no WhatsApp e no comprovante.

**Limites de "não é consultoria financeira"** **[interpretação; validar com assessoria jurídica]**:
- **Descrever, não prescrever.** Mensagens como "Sobrou R$ 820 este mês" ou "Faltam R$ 9.000 para o limite do MEI" são descritivas. Evitar "invista em…" ou "pegue empréstimo em…". A consultoria de valores mobiliários é atividade regulada pela CVM (Resolução CVM 19/2021) **[secundária]**.
- **Obrigações legais podem ser automatizadas** porque seguem regras públicas (gov.br e Receita), mas sempre com confirmação dela antes de enviar ou pagar.
- **Precificação é sugestão** feita com os números dela. A decisão é sempre dela, e o app mostra a conta usada ("como calculei").
- **Não se apresentar como contabilidade.** Contabilidade é profissão regulamentada. Usar "organiza seus números e obrigações do MEI" e, quando fizer sentido, indicar contador ou Sebrae.
- **Modo de falha gracioso** (S2): diante de qualquer dúvida, o app pergunta ou desfaz, e não decide sozinho.

**WhatsApp como canal** (cuidado). A Meta mudou os termos da WhatsApp Business Solution, com anúncio em out. 2025 e vigência a partir de 15 jan. 2026, para barrar *AI providers* que distribuem assistentes de uso geral. Bots ligados ao negócio de uma empresa continuam permitidos, segundo a Meta (TechCrunch). No Brasil, o CADE determinou a suspensão cautelar dessa regra no início de 2026 **[secundária]**, e não acompanhei o desfecho. Consequências para nós: um bot do próprio app, que só registra lançamentos dela, se encaixa no uso de negócio. Mesmo assim há risco de plataforma, custo por mensagem e a Meta passa a ser operadora, com transferência internacional. Alternativa local: o **Web Share Target**, pelo qual um PWA instalado recebe o que a usuária "compartilha" de outro app. O MDN o marca como experimental e não Baseline, e não confirmei o suporte por navegador **[a verificar]**.

---

## 2. Stack do MVP: três opções para publicar em produção hoje

Premissas: um desenvolvedor, `gh` CLI autenticado, nenhuma conta Vercel, Netlify ou Cloudflare, e prazo de horas a poucos dias.

### 2.1 Fatos de plataforma que decidem a escolha (2026)

**Instalação no iPhone**
- No iOS e iPadOS 26, todo site adicionado à Tela de Início abre como web app por padrão. A pessoa pode desligar a opção "Abrir como App Web" (WebKit, WWDC25).
- O Safari do iOS **não** suporta `beforeinstallprompt` (Can I use), e o evento não é Baseline (MDN). Não dá para mostrar um botão "Instalar" nativo, então é preciso uma tela com o passo a passo "Compartilhar → Adicionar à Tela de Início", com imagens.
- Desde o iOS 16.4, navegadores de terceiros com o entitlement necessário podem oferecer "Adicionar à Tela de Início" pelo menu Compartilhar (WebKit, fev. 2023).
- **[secundária]** No iOS, o web app instalado tem armazenamento separado da aba do Safari. Se ela testar no Safari e depois instalar, os dados não vão junto. Consequência: instalar antes de começar a usar, ou oferecer exportar e importar.

**Instalação no Android**
- Chrome, Edge e Samsung Internet disparam `beforeinstallprompt` quando o PWA atende aos critérios de instalação: manifest com nome, ícones de 192 e 512 px, `start_url` e `display` standalone ou similar (Chrome e Lighthouse).
- No Android, o PWA é instalado como WebAPK ou atalho, conforme o navegador (web.dev).

**Armazenamento, despejo e a regra dos 7 dias**
- **Cotas (Safari 17+):** até 60% do disco por origem nos navegadores. Um web app da Tela de Início tem a mesma cota do navegador (WebKit, ago. 2023). `localStorage` tem limite de 5 MiB, então usar IndexedDB (MDN).
- **`navigator.storage.persist()`:** o WebKit concede o pedido com base em heurísticas, como estar aberto como web app da Tela de Início. Uma origem em modo persistente pode ficar fora do despejo, e a ordem de despejo segue a regra do menos usado recentemente (WebKit, 2023). No Chrome a concessão é automática e silenciosa, conforme engajamento, instalação, favorito ou permissão de notificação. No Firefox aparece um pedido de permissão (web.dev; MDN).
- **Regra dos 7 dias (ITP):** com a prevenção de rastreamento ligada, o Safari apaga o armazenamento criado por script de uma origem que passou 7 dias de uso do navegador sem interação com aquele site. Isso inclui IndexedDB, LocalStorage, registros de Service Worker e caches (WebKit, 2020; MDN).
- **E no PWA instalado?** Segundo o WebKit (2020), web apps da Tela de Início não fazem parte do Safari: têm a própria contagem de dias de uso, que zera a cada uso real do app. O WebKit diz que não espera que os dados próprios desses apps sejam apagados e trataria isso como bug grave.
- **Lacuna:** nem o WebKit (2023) nem o MDN documentam se `persist()` isenta da regra dos 7 dias. Na prática, um PWA instalado e usado com regularidade está protegido, mas não existe garantia formal. Por isso o backup exportável é obrigatório.
- **[a verificar em teste]** Não encontrei documentação oficial sobre o que acontece com os dados quando a pessoa remove o ícone da Tela de Início. Assumir que tudo é apagado.

**Notificações push**
- No iOS e iPadOS 16.4+, Web Push funciona **só para web apps adicionados à Tela de Início**. O pedido de permissão precisa vir de um toque da pessoa. Também existe a Badging API (WebKit, fev. 2023).
- **[interpretação]** Web Push sempre precisa de um servidor que envie a mensagem. Num MVP sem backend não há push: os lembretes aparecem quando ela abre o app.

**Backup e exportação**
- A Web Share API aceita arquivos (`files`). Exige HTTPS e um toque do usuário; use `navigator.canShare({ files })` antes (MDN).
- Com isso ela pode mandar o backup para o próprio WhatsApp, e-mail ou Arquivos. Avisar que o arquivo de backup contém os dados financeiros dela.

**Hospedagem no GitHub Pages**
- Gratuito para repositórios **públicos** no GitHub Free. Repositório privado exige plano pago (GitHub Docs).
- Limites: site de até 1 GB e cerca de 100 GB/mês de banda (limite flexível) (GitHub Docs).
- **Usos proibidos:** o Pages não serve como hospedagem gratuita de negócio online ou SaaS comercial, nem para transações sensíveis como envio de senhas ou números de cartão (GitHub Docs). Para o MVP acadêmico serve; para virar produto pago, migrar.
- O GitHub registra o IP de quem visita o site, mesmo sem login (GitHub Docs). Isso precisa constar no aviso de privacidade.
- **Mesma origem:** a origem é protocolo, host e porta; o caminho não conta, e cada origem tem armazenamento separado (MDN). Todos os sites de projeto em `usuario.github.io/*` compartilham a mesma origem, ou seja, o mesmo IndexedDB e o mesmo localStorage.
  - **Recomendação:** publicar numa **organização dedicada** (site em `org.github.io`, que a pessoa cria pela web) ou num domínio próprio. Se não der, usar nomes de banco com prefixo e escopo de service worker restrito.
- **Deploy:** com Vite, definir `base: '/<repo>/'` para site de projeto e usar um workflow do GitHub Actions com a fonte "GitHub Actions" nas configurações do Pages (Vite docs). Pelo `gh`, o Pages pode ser ativado com `gh api -X POST repos/{owner}/{repo}/pages -f build_type=workflow` (GitHub REST).

**Supabase (opção b)**
- **Plano gratuito:** 2 projetos ativos, 500 MB de banco, 50 mil usuários ativos por mês, 1 GB de arquivos. O projeto **pausa após 1 semana sem atividade** e **não tem backups automáticos**. O Pro começa em US$ 25/mês (Supabase Pricing).
- Há região **São Paulo (sa-east-1)** e um DPA publicado (Supabase Docs e Legal).

**React Native/Expo (opção c)**
- **Expo (EAS Build):** o plano gratuito dá 30 builds/mês de baixa prioridade, até 15 para iOS (Expo Docs).
- **Apple:** US$ 99 por ano de assinatura. Instituições de ensino credenciadas podem pedir isenção (Apple).
- **Google Play:** taxa única de US$ 25. Contas pessoais criadas após 13 nov. 2023 precisam de **teste fechado com 12 testadores por 14 dias seguidos** antes de pedir produção (Google Play Console Help). Ou seja, publicar na Play Store hoje é impossível.
- As duas lojas exigem política de privacidade no app e na ficha da loja (App Review Guidelines 5.1.1(i); política de Dados do Usuário do Google Play).

### 2.2 Tabela comparativa

| Critério | (a) PWA local-first + GitHub Pages | (b) PWA + Supabase (auth + Postgres) | (c) React Native/Expo |
|---|---|---|---|
| **Tempo até produção hoje (1 dev)** | **Horas** (Vite build + Actions + Pages via `gh`) | 1 a 3 dias (auth, schema, RLS, sync). **Bloqueio:** exige autorização do edital para dados num serviço externo | Dias a semanas. Play Store: 12 testadores × 14 dias. App Store: conta e revisão. APK avulso no Android é possível, mas tem péssima UX e é inseguro para esse público |
| **Custo** | R$ 0 (repositório público, GitHub Free) | R$ 0 no Free (com pausa após 1 semana e sem backup); Pro a partir de US$ 25/mês | US$ 99/ano Apple (isenção possível) + US$ 25 Google; EAS Free 30 builds/mês |
| **Privacidade: os dados ficam no aparelho?** | **Sim.** O GitHub só vê o IP de quem baixa os arquivos estáticos | Não. Ficam no servidor (São Paulo possível; empresa estrangeira; subprocessadores) | Sim, se não houver backend |
| **Compatível com o edital** | **Alta** | Baixa até haver autorização formal | Alta, sem backend |
| **Offline** | **Total** (service worker + IndexedDB) | Exige camada de sincronização e resolução de conflitos | Total |
| **Instalação no iPhone** | Manual (Compartilhar → Tela de Início); no iOS 26 abre como web app por padrão; sem prompt programático | Igual a (a) | App Store ou TestFlight (conta Apple) |
| **Instalação no Android** | Prompt via `beforeinstallprompt` ou menu do navegador | Igual a (a) | Play Store (depois do teste fechado) |
| **Notificações** | Push exige servidor; no iOS só funciona com o app instalado. No MVP, lembretes dentro do app | Push viável com backend | Notificações locais agendadas nativas |
| **Risco de perder dados** | **Médio**: celular perdido ou trocado, limpeza de dados do site, remoção do ícone **[testar]**, despejo. Mitigação: instalar + `persist()` + backup | Baixo para perda; risco de vazamento ou RLS mal configurada; no Free não há backup automático do banco | Médio (aparelho) |
| **Backup e exportação** | Manual: arquivo JSON/CSV via Web Share ou download + importação | No servidor | Manual, ou backup do sistema **[não verificado]** |
| **Complexidade para 1 dev** | **Baixa** | Média a alta | Alta |
| **Caminho para nuvem e IA** | Adicionar sync opcional na Fase 2 sem reescrever (domínio em TS puro) | Já pronto, mas cedo demais para o edital | Melhor para IA no aparelho (Fase 3+) |
| **Veredito** | **Recomendada para hoje** | Fase 2, com consentimento e autorização | Fase 3+, se aparecerem os gatilhos do §6.3 |

### 2.3 Checklist técnico contra perda de dados (opção a)

1. **Instalar antes de usar.** No primeiro acesso, se o app não estiver em modo standalone, mostrar o passo a passo ilustrado para iPhone e Android. Usar `display-mode: standalone` para detectar.
2. **Pedir `navigator.storage.persist()` no primeiro salvamento**, dentro do toque dela e não ao carregar a página (web.dev). Guardar o resultado e mostrar o estado em "Configurações".
3. **Backup em 1 toque:** "Guardar cópia" gera um JSON versionado (`schemaVersion`) e abre o compartilhamento. Junto, um aviso "Última cópia há N dias", com lembrete se passar de 7 dias.
4. **Restaurar:** importar o arquivo, validar o esquema, mostrar uma prévia e só então confirmar.
5. **Migrações de esquema** testadas (Vitest) a cada mudança no modelo.
6. **Sem nada de terceiros em tempo de execução:** sem CDN, Google Fonts ou analytics. Embutir as fontes no app e usar uma CSP restritiva. Nada sai do aparelho.
7. **Origem dedicada** (organização ou domínio próprio) e nomes de banco com prefixo (`salao-real`, `salao-demo`).
8. **Estado de armazenamento visível:** `navigator.storage.estimate()` e `persisted()` numa tela "Seus dados", em linguagem simples.

---

## 3. UX para baixa literacia digital e financeira (Brasil)

### 3.1 Quem é a usuária (dados de contexto)

- **Alfabetismo funcional:** 29% dos brasileiros de 15 a 64 anos são analfabetos funcionais, mesmo patamar de 2018 (Inaf 2024, divulgado em mai. 2025; UNICEF/Ação Educativa).
- **Só celular:** 60% dos usuários de internet acessam a rede apenas pelo celular. 57% de quem tem celular usa plano pré-pago, com pacote de dados limitado; nas classes DE são 69%.
- **Uso no dia a dia:** 92% enviam mensagens instantâneas e 84% usaram Pix em 2024. Só 19% sabem usar fórmula em planilha (TIC Domicílios 2024, Cetic.br).
- **Controle financeiro do MEI:** metade usa caderno e há lacunas de controle diário (Sebrae 2018, via BCB; ver §1.4).
- **Canal:** o WhatsApp é o principal canal de 82% dos pequenos negócios (Pulso Sebrae, abr. 2026).

### 3.2 Recomendações

| Tema | Recomendação | Fonte |
|---|---|---|
| **Como essa pessoa lê** | Quem tem baixa literacia lê palavra por palavra, em vez de passar os olhos, e enxerga uma faixa estreita da tela. Contenta-se com a primeira resposta que parece servir e perde elementos fora do fluxo principal. Portanto: **uma coluna**, navegação linear, informação mais importante no topo, pouca rolagem, nada que se mexa ou mude sozinho | NN/g, Nielsen (2005) |
| **Nível de texto** | Telas principais no nível de leitura de **6º ano**; demais telas no de 8º ano. O texto simplificado também melhorou os resultados de quem lê bem | NN/g (2005) |
| **Linguagem simples** | Frases curtas, em ordem direta e voz ativa; palavras comuns; explicar ou trocar jargão; uma ideia por parágrafo; o mais importante primeiro; testar com o público. A lei vale para a administração pública, mas é um bom checklist | Lei 15.263/2025, art. 5º |
| **Vocabulário (nossa proposta)** | "Entrou" e "Saiu" em vez de receita e despesa; "Sobrou" em vez de lucro ou saldo; "Fiado" e "Me devem" em vez de contas a receber; "Imposto do MEI (DAS)" com a sigla depois. Evitar "fluxo de caixa", "DRE" e "conciliação". **[a validar com a parceira]** | Interpretação a partir da Lei 15.263 (incisos IV, V e VIII) |
| **Tamanho de toque** | Mínimo de **1 cm × 1 cm** físico (NN/g). WCAG 2.2, critério 2.5.8 (AA): **24 × 24 px CSS** no mínimo. O governo federal declara **48 × 48 px no celular** (44 × 44 preferível no desktop). **Proposta:** 48 px no mínimo e 56 a 64 px no botão principal ("Entrou dinheiro") | NN/g; W3C; SGD/MGI (respostas ao TCU, nov. 2024) |
| **Fonte** | Fontes sem serifa feitas para tela. O documento do governo cita pelo menos 18 pt, ou 14 pt em negrito. Não fixar altura: respeitar zoom e espaçamento (WCAG 1.4.12). **Proposta:** corpo de 18 px e valores em 28 a 32 px | SGD/MGI (2024); WCAG 1.4.12 |
| **Contraste e alto contraste** | Texto com contraste AA (WCAG 1.4.3) e controles com pelo menos 3:1 (WCAG 1.4.11). Oferecer **"Alto contraste"** e **"Letra maior"** em Configurações, como fazem os portais gov.br | SGD/MGI (2024) |
| **Ícones** | **Ícone sempre acompanhado de texto visível.** Ícones sem rótulo são ambíguos, e dica ao passar o mouse não funciona no toque. Testar os ícones com o público local, porque o que parece óbvio para o designer costuma confundir | NN/g, *Icon Usability*; CGAP, princípios de UI para dinheiro móvel **[secundária]** |
| **Gráfico e voz** | Para usuários iniciantes e com baixa literacia, interface só de texto é muito difícil e leva a erros. Funcionam melhor dicas gráficas, **anotações em voz**, navegação simples e poucos campos para digitar. Uma ajuda consistente também conta | Medhi et al., ToCHI 2011; Medhi, Sagar e Toyama, ITID 2007 |
| **Leitura em voz** | Botão "Ouvir" em cada resumo ("Hoje entrou R$ 350, saiu R$ 80, sobrou R$ 270") usando `speechSynthesis`, que usa as vozes do sistema | MDN, Web Speech API |
| **Ditado ou reconhecimento de voz** | Por padrão, o reconhecimento do navegador **envia o áudio para um serviço externo**. Há um modo no aparelho (`processLocally`), que exige baixar um pacote de idioma e tem suporte limitado. **Conflita com o edital se houver dados reais:** no MVP, só síntese de voz (TTS) | MDN, Web Speech API |
| **Entrada de valores** | Teclado numérico (`inputmode="decimal"`); formatação em R$ enquanto ela digita; botões de valores frequentes (os preços dela); nada de campos obrigatórios além do valor | Interpretação a partir de NN/g e Medhi (poucos campos) |
| **Erros** | Preferir **desfazer** a diálogos de confirmação ("Venda salva · Desfazer" por 10 s); pedir confirmação só em ações irreversíveis (apagar tudo, restaurar backup) | Interpretação (modo de falha gracioso, S2) |
| **Número de passos para registrar uma venda** | **Não achei fonte primária com um número.** Meta proposta: **até 3 toques e menos de 10 s.** (1) "Entrou dinheiro"; (2) valor, ou um toque num preço frequente; (3) forma de pagamento (Pix, dinheiro, cartão, fiado), que salva sozinho. Serviço e cliente ficam como opcionais posteriores | Proposta nossa, a medir no teste de usabilidade |

### 3.3 Princípios de tela inicial (proposta)

- Dois botões grandes: **"Entrou dinheiro"** e **"Saiu dinheiro"**, com ícone e texto.
- Uma frase-resumo do dia ("Hoje sobrou R$ 270"), com o botão Ouvir.
- No máximo um aviso por vez ("Faltam 5 dias para pagar o DAS").
- Sem gráficos na tela inicial. Gráfico de barras simples só em "Meu mês".

---

## 4. LGPD: requisitos mínimos

### 4.1 Quem é quem no MVP local (sem servidor)

- **A parceira (MEI) é controladora** dos dados pessoais que anotar sobre clientes, como nome, telefone e fiado.
  - O Guia Orientativo da ANPD (v2.0, abr. 2022) dá o exemplo da médica, profissional liberal, que guarda dados de pacientes no computador do consultório: ela, pessoa natural, é a controladora. O guia cita empresários individuais como controladores pessoas naturais.
  - A exceção do art. 4º, I, da LGPD (uso particular e **não econômico**) não se aplica, porque o uso é do negócio.
- **[interpretação]** Os dados financeiros da própria MEI também são dados de uma pessoa natural identificável. Não são **dados sensíveis**: o art. 5º, II, não inclui dados financeiros. Ainda assim merecem cuidado.
- **Agente de pequeno porte:** a Res. CD/ANPD 2/2022 inclui o MEI (art. 2º). Na prática:
  - não precisa indicar encarregado, mas deve oferecer **canal de comunicação com o titular** (art. 11);
  - pode fazer registro simplificado (art. 9º) e ter política simplificada de segurança (art. 13);
  - tem prazos em dobro (art. 14);
  - **perde o regime diferenciado em tratamento de alto risco**, que exige ao mesmo tempo um critério geral (larga escala ou impacto significativo) e um específico (tecnologia emergente, decisão automatizada, dados sensíveis, de crianças ou de idosos etc.) (arts. 3º e 4º).
- **A equipe do projeto (desenvolvedores e universidade):** **[interpretação]** se o app não transmite nada, a equipe não trata os dados da parceira. Mesmo assim, o art. 46, §2º, da LGPD manda adotar segurança desde a concepção do produto, e a equipe responde pelo que publica.
- **GitHub** trata o IP de quem acessa o site.
- **[a verificar com a coordenação]** O uso do app pela parceira, no celular dela, com os dados reais dela e sem nada sair do aparelho, parece compatível com o edital ("não enviar a IA ou a serviços não autorizados"). Confirmar por escrito.

### 4.2 Precisa de política de privacidade? E de termos de uso?

- **Aviso de privacidade: sim, recomendado já no MVP.**
  - A LGPD não usa a expressão "política de privacidade", mas exige transparência (art. 6º, VI). O art. 9º garante ao titular informação clara, adequada e ostensiva sobre: (I) finalidade; (II) forma e duração; (III) identificação do controlador; (IV) contato; (V) uso compartilhado; (VI) responsabilidades dos agentes; (VII) direitos do art. 18.
  - Para lojas é **obrigatório**: Apple (diretriz 5.1.1(i)) e Google Play exigem link para a política dentro do app e na ficha da loja.
- **Termos de uso:** a LGPD não exige. São **recomendados** para deixar claros os limites: projeto acadêmico, sem garantia, backup sob responsabilidade dela, não substitui contador, não é aconselhamento financeiro.

### 4.3 O que escrever (modelo em linguagem simples)

> **Seus dados neste app**
> 1. **Onde ficam:** tudo o que você anota fica **só neste celular**. Nós, da equipe do projeto, **não recebemos** nada.
> 2. **Para que serve:** organizar o que entra e sai do seu salão e montar seus relatórios do MEI.
> 3. **Por quanto tempo:** até você apagar. O botão "Apagar tudo" fica em Configurações.
> 4. **Quem mais vê:** ninguém. Para abrir o app, o seu celular baixa os arquivos do GitHub, que registra o endereço de internet (IP) do aparelho. Se você mandar a "cópia de segurança" por WhatsApp ou e-mail, o arquivo passa por esses serviços.
> 5. **Dados das suas clientes:** se anotar nome ou telefone de cliente, quem cuida desses dados é você. Anote só o necessário.
> 6. **Se perder o celular:** sem cópia de segurança, os dados se perdem. Use "Guardar cópia" toda semana.
> 7. **Não é consultoria:** o app mostra contas e prazos. Não dá conselho de investimento nem substitui contador.
> 8. **Fale com a gente:** [nome do projeto, universidade, e-mail do projeto]. **Versão e data:** [x].

Esse texto cobre os incisos I a VII do art. 9º e o canal de comunicação do art. 11 da Res. 2/2022. Deve ser revisado pela coordenação.

### 4.4 Segurança mínima (privacy by design, art. 46)

- Nenhum script, fonte ou analytics de terceiros; CSP restritiva; HTTPS (padrão no GitHub Pages).
- Origem dedicada (ver §2.1).
- Minimização: o cliente é opcional e pode ser um apelido; sem CPF.
- Avisar que o arquivo de backup contém dados. Criptografar o backup com senha é **opcional**: se ela esquecer a senha, perde o backup. Avaliar isso com ela.
- Bloqueio de tela do celular como recomendação no onboarding.

### 4.5 O que muda com nuvem e IA

| Tema | Nuvem opcional (Fase 2) | IA vertical (Fase 3) |
|---|---|---|
| **Papéis** | Empresa ou projeto do app = **controlador** dos dados de conta da usuária. Para os dados das clientes do salão = **operador** (trata em nome da MEI). Provedor de nuvem = **suboperador**; o Guia da ANPD recomenda autorização formal do controlador para subcontratar | Provedor de LLM, OCR ou voz = **suboperador**. Ao contratar IA, o Guia (exemplo 3) trata o fornecedor que segue instruções como operador |
| **Base legal** | Execução de contrato (art. 7º, V) para o serviço pedido; obrigação legal (II) para registros fiscais | Recursos opcionais de IA: **consentimento** específico, destacado e revogável (art. 8º; autorizações genéricas são nulas). **Treinar ou melhorar modelos com dados dela:** evitar legítimo interesse. No caso Meta (2 jul. 2024) a ANPD suspendeu cautelarmente o uso de dados para treinar IA por base legal inadequada, falta de transparência e obstáculos à oposição |
| **Transferência internacional** | Se o provedor processar fora do Brasil: art. 33. Preferir região São Paulo e checar subprocessadores | A maioria dos LLMs processa fora do Brasil: art. 33, com **cláusulas-padrão da ANPD** (Res. CD/ANPD 19/2024), incorporadas sem alteração; o prazo de adaptação terminou em 23 ago. 2025 **[secundária]**. O consentimento específico (art. 33, VIII) existe, mas é frágil |
| **Decisões automatizadas** | — | Art. 20: direito de pedir revisão de decisões tomadas só por tratamento automatizado. Manter humano no circuito e explicar o critério ("como calculei") |
| **Pequeno porte** | Continua, salvo alto risco | Tecnologia emergente é critério **específico** de alto risco. Se houver também larga escala ou impacto significativo, o regime diferenciado acaba (Res. 2/2022, art. 4º) |
| **Documentos** | Aviso v2, termos, contrato ou DPA com o provedor, canal ou encarregado, plano de incidente (Res. 15/2024) | Relatório de Impacto (RIPD) recomendado; registro das operações; política de retenção zero e de "não treinar" com o provedor |
| **Técnica** | Sync opt-in, de preferência com **criptografia de ponta a ponta** (o servidor só guarda dados cifrados) **[interpretação]** | **Minimização:** pseudonimizar nomes antes de enviar; mandar só o necessário (valores e categorias); preferir IA **no aparelho** quando possível (§6.3) |

Contexto regulatório **[secundária, a verificar]**:
- **PL 2338/2023 (marco da IA):** aprovado no Senado em 10 dez. 2024 e em tramitação na Câmara. A votação estava prevista para jun. 2026; não confirmei o desfecho.
- **ANPD:** incluiu IA entre os eixos de fiscalização de 2026 e 2027 (Teletime, jan. 2026).
- **Guia de alto risco:** segundo a Lefosse (set. 2026), o Conselho Diretor da ANPD não aprovou o Guia Orientativo sobre Tratamento de Alto Risco.

### 4.6 Regras do edital, na prática

- Nenhum dado real em ferramentas de IA, **inclusive ferramentas de desenvolvimento** (assistentes de código, chat): nada de colar prints, exportações ou backups reais. Em bugs, reproduzir com o modo demonstração.
- Logs, telemetria e relatórios de erro não podem conter dados reais. Por isso, sem Sentry ou analytics no MVP.
- **[a verificar com a coordenação]** Se os testes de usabilidade com a parceira configuram pesquisa com seres humanos e exigem trâmite ético, e qual termo de participação usar.

---

## 5. Dados fictícios e modo demonstração

**Objetivo:** permitir demonstrar, testar e depurar sem nunca tocar em dado real, e sem risco de misturar os dois.

1. **Separação física**
   - O melhor é uma **origem diferente**: publicar a versão demo em outro site, por exemplo outro repositório publicado numa organização separada, ou um subdomínio quando houver domínio próprio.
   - Se o demo ficar no mesmo app, usar **bancos IndexedDB distintos** (`salao-demo` e `salao-real`), nunca o mesmo banco com uma marcação. O `localStorage` é compartilhado por origem, então não guardar nada sensível ali.
2. **Separação visual:** no modo demo, uma faixa fixa **"MODO DEMONSTRAÇÃO, dados de mentira"** e uma cor de tema diferente. Os arquivos exportados levam "DEMO" no nome e `"demo": true` no JSON.
3. **Separação lógica:** a importação **recusa** um backup demo no banco real e vice-versa. O botão "Começar a usar de verdade" cria o banco real vazio e não copia nada do demo.
4. **Seed determinística:** gerar o cenário com Faker em `pt_BR` (`fakerPT_BR`) e `faker.seed(<n>)`. Fixar a data de referência, porque os métodos de data dependem da data atual, para que testes e demonstrações sejam reproduzíveis (fakerjs.dev).
5. **Cenário verossímil do salão**, montado à mão sobre a seed:
   - serviços (corte, escova, unha, progressiva, sobrancelha) com preços plausíveis;
   - picos às sextas e sábados e em dezembro;
   - formas de pagamento (Pix, dinheiro, cartão, fiado);
   - despesas (produtos, aluguel, luz, internet, DAS);
   - um mês com aperto de caixa e um mês perto do limite, para exercitar os alertas.
6. **Sem identificadores reais:** nada de CPF, CNPJ ou telefone. Usar nomes obviamente fictícios e nunca fotos de pessoas reais.
7. **Não "anonimizar" os dados reais da parceira para fazer o demo.** Anonimizar bem é difícil: a ANPD abriu em 2024 consulta pública sobre um guia de anonimização e pseudonimização, e não confirmei a versão final. **Sintetizar** é mais seguro.
8. **Botão "Recomeçar demonstração"**, que recria a seed, e a mesma seed nos testes automatizados (Vitest).

---

## 6. Recomendação

### 6.1 Stack escolhida e por quê

**PWA local-first**, com Vite + Preact + TypeScript, IndexedDB (idb-keyval ou Dexie) e service worker via vite-plugin-pwa. Deploy pelo GitHub Actions no **GitHub Pages**, numa origem dedicada. Sem backend, sem analytics e sem IA. É o que já está em `app/`.

Por quê:
1. É a única opção que chega a **produção hoje**, com `gh` e custo zero.
2. **Os dados não saem do aparelho**, o que é compatível com o edital e com a LGPD com o mínimo de obrigações.
3. **Funciona offline** e sem gastar o pacote de dados, que é limitado para quem usa pré-pago (TIC 2024).
4. Instala no iPhone e no Android sem loja.
5. **O domínio em TypeScript puro**, separado da interface, pode ser levado para uma futura versão com sync ou para React Native.

Riscos aceitos e mitigação: perda de dados (§2.3), instalação manual no iOS (tela de instruções) e regras do GitHub Pages, que não servem para produto comercial (migrar na Fase 2).

### 6.2 Roadmap em 3 fases

**Fase 1: MVP local-first (dias 0 a 7 para publicar, depois cerca de 4 semanas de uso assistido)**
- **Funcionalidades:**
  - Entrou e Saiu em até 3 toques, com fiado;
  - resumo do dia e do mês com o botão Ouvir;
  - **Relatório Mensal de Receitas Brutas** pronto (para imprimir ou compartilhar);
  - barra do limite do MEI;
  - lembretes dentro do app (DAS, DASN);
  - backup e restauração;
  - modo demonstração;
  - Alto contraste e Letra maior.
- **Métricas de valor** (a tese de retenção do S3):
  - dias com lançamento por semana;
  - tempo mediano para registrar uma venda;
  - percentual de semanas com backup;
  - o relatório mensal foi usado?
  - entrevista qualitativa.
- **Fora do escopo:** IA, servidor, push e qualquer integração.

**Fase 2: nuvem opcional, com consentimento (cerca de meses 2 a 4)**
- **Pré-requisitos (bloqueantes):**
  - autorização formal (edital e coordenação);
  - aviso de privacidade v2 e termos;
  - contrato ou DPA com o provedor (e cláusulas-padrão, se houver transferência internacional);
  - canal do titular ou encarregado;
  - RIPD recomendado;
  - plano de incidente.
- **Técnica:**
  - backup e sync **opt-in**, de preferência cifrados de ponta a ponta;
  - Supabase na região São Paulo (ou equivalente nacional), com RLS;
  - login por link mágico ou telefone, sem senha para decorar;
  - exportação continua disponível;
  - Web Push para alertas (no iOS, só com o app instalado);
  - sair do GitHub Pages se virar produto comercial.

**Fase 3: IA vertical e autopilot (cerca de meses 4 a 12)**
- **Copilot primeiro:** captura no ponto de origem (foto do comprovante, voz, WhatsApp ou compartilhamento) → lançamento sugerido → ela confirma. O modelo de negócio pode virar "obrigações do MEI em dia" por mensalidade (preço por resultado, S2).
- **Autopilot de regras:**
  - fechamento mensal automático;
  - DASN pré-preenchida;
  - DAS via Integra MEI, com procuração eletrônica no e-CAC;
  - NFS-e para PJ via API do Emissor Nacional;
  - alertas de caixa e de limite.
  - Sempre com aprovação em 1 toque e desfazer.
- **Copilot de julgamento:** precificação assistida, com "como calculei" e sem aconselhamento financeiro.
- **Dados:**
  - benchmark entre salões só com consentimento e agregação ou anonimização;
  - nada de treinar modelos com os dados delas (precedente Meta);
  - provedores com DPA, cláusulas-padrão, retenção zero e sem treino;
  - pseudonimização antes de qualquer chamada externa.
- **Distribuição de confiança** (S2, alta confiança) **[interpretação]**: parceiros como Sebrae, Salas do Empreendedor e universidade, em vez de mídia paga.

### 6.3 Quando faz sentido ir para nativo (Swift/Kotlin ou React Native)

Gatilhos (basta um forte):
1. **Perda de dados observada no iOS**, mesmo com instalação, `persist()` e uso regular.
2. **Notificações locais agendadas confiáveis sem servidor**, como "amanhã vence o DAS". No PWA isso exige push, e push exige servidor.
3. **IA no aparelho, por privacidade:**
   - no iOS, o *Foundation Models framework* dá acesso nativo, em Swift, ao modelo da Apple no aparelho, mas só em dispositivos com Apple Intelligence;
   - no Android, as *ML Kit GenAI APIs* (Gemini Nano via AICore) rodam no aparelho, mas só em alguns modelos;
   - o ML Kit também tem APIs de visão no aparelho.
   - **[interpretação]** Essas APIs combinam com "foto do comprovante sem mandar para a nuvem", mas é provável que o aparelho da parceira não seja compatível. Verificar o modelo do celular dela.
4. **Integrações do sistema** que o PWA não alcança bem no iOS, como receber compartilhamentos (Web Share Target é experimental) e widgets.
5. **Distribuição pelas lojas**, por confiança e descoberta, quando houver escala e receita para pagar contas e manutenção.

Qual nativo escolher:
- **React Native/Expo**, se o time for de TS/JS e quiser reaproveitar o domínio.
- **Swift ou Kotlin**, se IA no aparelho e integração profunda com o sistema forem o centro do produto.
- Empacotar o PWA (Capacitor, por exemplo) é um atalho para as lojas que **não pesquisei a fundo**. A Apple rejeita apps que são só um site reempacotado (diretriz 4.2).

---

## 7. Lacunas e pontos a verificar

1. **Desfecho do PL 2338/2023** depois de jun. 2026 e do **PLP 108/2021** (limite do MEI) depois de jul. 2026.
2. **Situação do caso CADE × Meta (WhatsApp)** depois de fev. 2026.
3. **iOS:** o que acontece com os dados ao remover o ícone; se `persist()` isenta da regra dos 7 dias; isolamento Safari × app instalado. Testar em aparelho real.
4. **Preço e requisitos atuais da API Integra MEI** (Loja Serpro).
5. **Suporte a Web Share Target e a `processLocally`** por navegador (tabelas do MDN).
6. **Valores exatos do Padrão Digital de Governo** (gov.br/ds): o site não carregou o conteúdo pela ferramenta; usei o documento da SGD de nov. 2024.
7. **Vídeo do YC Lightcone:** não assistido; tese citada a partir de resumos.
8. **Quanto a parceira gasta hoje** com contador, despachante ou ajuda (entrevista), para validar a cunha "obrigações do MEI".

---

## 8. Fontes (acesso em 2026-11-03)

**IA vertical / VC**
1. Julien Bek. *Services: The New Software*. Sequoia Capital, 05/03/2026. https://sequoiacap.com/article/services-the-new-software/
2. Sonya Huang e Pat Grady. *Generative AI's Act o1*. Sequoia Capital, 09/10/2024. https://sequoiacap.com/article/generative-ais-act-o1
3. Sonya Huang e Pat Grady. *Generative AI's Act Two*. Sequoia Capital, 20/09/2023. https://www.sequoiacap.com/article/generative-ai-act-two/
4. Team Sequoia. *AI Ascent 2026*. Sequoia Capital, 08/05/2026. https://sequoiacap.com/article/ai-ascent-2026
5. Bessemer Venture Partners. *Part I: The future of AI is vertical*, 03/09/2024. https://www.bvp.com/atlas/part-i-the-future-of-ai-is-vertical
6. Angela Strange e James da Costa. *Vertical SaaS: Now with AI Inside*. a16z, 20/09/2024. https://a16z.com/vertical-saas-now-with-ai-inside/
7. Angela Strange, James da Costa e a16z Enterprise. *"AI Inside" Opens New Markets for Vertical SaaS*. a16z, 02/12/2024. https://a16z.com/vsaas-vertical-saas-ai-opens-new-markets/
8. Y Combinator (Lightcone). *Vertical AI Agents Could Be 10X Bigger Than SaaS*, 22/11/2024 (vídeo; não assistido). https://www.youtube.com/watch?v=ASABxNenD_U
9. Foundation Capital. *A System of Agents brings service as software to life*. https://foundationcapital.com/system-of-agents/
10. TechCrunch. *WhatsApp changes its terms to bar general-purpose chatbots from its platform*, 18/10/2025. https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform/
11. Startups.com.br. *Cade manda Meta suspender regra que barra chatbots de IA no WhatsApp* [secundária]. https://startups.com.br/negocios/cade-manda-meta-suspender-regra-que-barra-chatbots-de-ia-no-whatsapp/

**Plataforma web / PWA**
12. John Wilander. *Full Third-Party Cookie Blocking and More*. WebKit, 24/03/2020. https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
13. Sihui Liu. *Updates to Storage Policy*. WebKit, 10/08/2023. https://webkit.org/blog/14403/updates-to-storage-policy/
14. Brady Eidson e Jen Simmons. *Web Push for Web Apps on iOS and iPadOS*. WebKit, 16/02/2023. https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
15. WebKit. *News from WWDC25: WebKit in Safari 26 beta*, 09/06/2025. https://webkit.org/blog/16993/news-from-wwdc25-web-technology-coming-this-fall-in-safari-26-beta/
16. MDN. *Storage quotas and eviction criteria*. https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria
17. MDN. *Window: beforeinstallprompt event*. https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event
18. Can I use. *beforeinstallprompt*. https://caniuse.com/mdn-api_window_beforeinstallprompt_event
19. Pete LePage. *Persistent storage*. web.dev. https://web.dev/articles/persistent-storage
20. web.dev. *Learn PWA: Installation*. https://web.dev/learn/pwa/installation
21. Chrome for Developers. *Installable manifest (Lighthouse)*. https://developer.chrome.com/docs/lighthouse/pwa/installable-manifest
22. MDN. *Navigator: share()*. https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
23. MDN. *Same-origin policy*. https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
24. MDN. *Using the Web Speech API*. https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
25. MDN. *share_target (Web app manifest)*. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target

**Hospedagem, backend, lojas, nativo**
26. GitHub Docs. *GitHub Pages limits*. https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
27. GitHub Docs. *What is GitHub Pages?* https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
28. GitHub Docs. *Creating a GitHub Pages site*. https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
29. GitHub REST API. *Create a GitHub Pages site*. https://docs.github.com/en/rest/pages/pages#create-a-github-pages-site
30. Vite. *Deploying a Static Site*. https://vite.dev/guide/static-deploy
31. Supabase. *Pricing*. https://supabase.com/pricing
32. Supabase. *Regions*. https://supabase.com/docs/guides/platform/regions
33. Supabase. *Data Processing Addendum*. https://supabase.com/legal/customer-resources/data-processing-addendum
34. Expo. *Plans and billing*. https://docs.expo.dev/billing/plans/
35. Apple. *Enrollment (Apple Developer Program)*. https://developer.apple.com/programs/enroll/
36. Apple. *App Review Guidelines*. https://developer.apple.com/app-store/review/guidelines/
37. Google Play Console Help. *Register for a developer account (fee)*. https://support.google.com/googleplay/android-developer/answer/6112435
38. Google Play Console Help. *App testing requirements for new personal developer accounts*. https://support.google.com/googleplay/android-developer/answer/14151465
39. Google Play Console Help. *User Data policy*. https://support.google.com/googleplay/android-developer/answer/10144311
40. Apple Developer. *Foundation Models framework*. https://developer.apple.com/foundation-models-framework/
41. Android Developers. *Gemini Nano*. https://developer.android.com/ai/gemini-nano
42. Google for Developers. *ML Kit guides*. https://developers.google.com/ml-kit/guides
43. Faker. *Localization*. https://fakerjs.dev/guide/localization
44. Faker. *Usage (seed)*. https://fakerjs.dev/guide/usage

**UX e contexto Brasil**
45. Jakob Nielsen. *Lower-Literacy Users: Writing for a Broad Consumer Audience*. NN/g, 13/03/2005. https://www.nngroup.com/articles/writing-for-lower-literacy-users/
46. NN/g. *Touch Targets on Touchscreens*. https://www.nngroup.com/articles/touch-target-size/
47. NN/g. *Icon Usability*. https://www.nngroup.com/articles/icon-usability/
48. W3C. *Understanding SC 2.5.8: Target Size (Minimum)*, WCAG 2.2. https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
49. Secretaria de Governo Digital/MGI. *Levantamento de Acessibilidade Digital (TCU), Fase 2, Tema 2: Design e Desenvolvimento, respostas*, 29/11/2024. https://www.gov.br/governodigital/pt-br/plataformas-e-servicos-digitais/auditoria-de-acessibilidade-digital-tcu/respostas-da-sessao-2-2013-design-e-desenvolvimento.pdf
50. Brasil. *Lei nº 15.263, de 14/11/2025 (Política Nacional de Linguagem Simples)*. https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15263.htm
51. Medhi, I. et al. *Designing Mobile Interfaces for Novice and Low-Literacy Users*. ACM ToCHI, 2011. https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/ToCHI2711_Medhi.pdf
52. Medhi, I.; Sagar, A.; Toyama, K. *Text-Free User Interfaces for Illiterate and Semi-Literate Users*. ITID 4(1), 2007. https://ideas.repec.org/a/tpr/itintd/v4y2007i1p37-50.html
53. CGAP. *Smartphones & Mobile Money: Principles for UI/UX Design* (cópia no SlideShare) [secundária]. https://www.slideshare.net/slideshow/smartphones-mobile-money-principles-for-uiux-design-10/66785993
54. UNICEF Brasil. *Analfabetismo funcional não apresenta melhora e alcança 29% dos brasileiros… (Inaf 2024)*. https://www.unicef.org/brazil/comunicados-de-imprensa/analfabetismo-funcional-nao-apresenta-melhora-e-alcanca-29-por-cento-dos-brasileiros-mesmo-patamar-de-2018-aponta-novo-levantamento-do-inaf
55. Cetic.br/NIC.br. *TIC Domicílios 2024: Resumo Executivo*. https://cetic.br/media/docs/publicacoes/2/20250512115624/tic_domicilios_2024_resumo_executivo.pdf
56. Sebrae/BCB. *Educação Financeira dos Microempreendedores Individuais* (Relatório de Cidadania Financeira; dados Sebrae 2018). https://www.bcb.gov.br/Nor/relcidfin/docs/art9_educacao_finanaceira_MEIs.pdf
57. Agência Sebrae. *WhatsApp se consolida nas vendas on-line enquanto Facebook e lojas próprias perdem fôlego*, 16/04/2026. https://agenciasebrae.com.br/dados/whatsapp-se-consolida-nas-vendas-on-line-enquanto-facebook-e-lojas-proprias-perdem-folego/

**LGPD, ANPD, MEI**
58. Brasil. *Lei nº 13.709/2018 (LGPD), texto compilado*. https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
59. ANPD. *Guia Orientativo para Definições dos Agentes de Tratamento de Dados Pessoais e do Encarregado*, v2.0, abr. 2022. https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/Segunda_Versao_do_Guia_de_Agentes_de_Tratamento_retificada.pdf
60. ANPD. *Resolução CD/ANPD nº 2, de 27/01/2022 (agentes de pequeno porte)*. https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022
61. ANPD. *Resolução CD/ANPD nº 19, de 23/08/2024 (transferência internacional e cláusulas-padrão)*. https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024
62. ANPD. *ANPD determina suspensão cautelar do tratamento de dados pessoais para treinamento da IA da Meta*, 02/07/2024. https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-determina-suspensao-cautelar-do-tratamento-de-dados-pessoais-para-treinamento-da-ia-da-meta
63. Mayer Brown. *End of grace period: implementation of Brazil's standard contractual clauses*, 29/08/2025 [secundária]. https://www.mayerbrown.com/pt/insights/publications/2025/08/end-of-grace-period-implementation-of-brazils-standard-contractual-clauses-in-international-transfers-of-personal-data
64. Teletime. *ANPD define 75 fiscalizações para biênio 2026-2027*, 23/01/2026 [secundária]. https://teletime.com.br/23/01/2026/anpd-define-75-fiscalizacoes-para-bienio-2026-2027-confira-prioridades/
65. Lefosse. *Telecomunicações, plataformas digitais, proteção de dados e IA, setembro 2026* [secundária]. https://lefosse.com/noticias/telecomunicacoes-plataformas-digitais-protecao-de-dados-e-inteligencia-artificial-setembro-2026/
66. Teletime. *Motta: votação do PL da IA em junho*, 28/05/2026 [secundária]. https://teletime.com.br/28/05/2026/motta-votacao-pl-da-ia-junho/
67. Okai. *Resolução CVM 19* (resumo) [secundária]. https://okai.com.br/documento/2021-02-25/resolucao-cvm-19
68. Brasil. *Lei Complementar nº 123/2006 (art. 18-A, §1º, limite do MEI)*. https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp123.htm
69. Jornal Contábil. *MEI: o que falta para o novo limite de R$ 130 mil começar a valer* [secundária]. https://jornalcontabil.com.br/noticia/mei-o-que-falta-para-o-novo-limite-de-r-130-mil-comecar-a-valer/amp/
70. gov.br. *Baixar Relatório Mensal de Receitas Brutas (MEI)* (atualizado em 06/02/2026). https://www.gov.br/pt-br/servicos/baixar-relatorio-mensal-de-receitas-brutas
71. Receita Federal. *Perguntas e Respostas MEI e SIMEI* (consultado via resultado de busca). https://www8.receita.fazenda.gov.br/simplesnacional/arquivos/manual/perguntaomei.pdf
72. gov.br/NFS-e. *Perguntas frequentes NFS-e* (consultado via resultado de busca). https://www.gov.br/nfse/pt-br/copy_of_perguntas-frequentes/copy_of_faq-nfs-e
73. SERPRO. *Integra Contador facilita gestão fiscal do setor contábil* (consultado via resultado de busca). https://serpro.gov.br/menu/noticias/noticias-2023/integra-contador-facilita-gestao-fiscal-setor-contabil
