# Fôlego — caixa do salão

App para salão de beleza de uma profissional só: anotar o que entrou e o que saiu em segundos, separar o dinheiro
da casa do dinheiro do salão, formar uma reserva ("fôlego") e ver o efeito de uma decisão antes de tomá-la.

**Abrir:** https://folego.sealugue.com/folego/

Nasceu no Projeto de Extensão "Negócio à Prova de Choques: Laboratório de Decisões sob Incerteza e Resiliência
Empresarial" (Administração, Faculdade HUB, 2º semestre de 2026), como parte digital do Kit de Resiliência.

## Princípios

- **Local-first:** sem servidor, sem cadastro, sem analytics. Os dados ficam no aparelho (IndexedDB).
- **Privacidade:** nenhum dado sai do celular; nenhuma IA processa dados de quem usa. Backup por arquivo, sob controle da usuária.
- **Educativo:** as contas mostram efeitos; não é consultoria financeira, contábil ou jurídica.
- **Dados fictícios:** a demonstração usa dados inventados (exigência do edital para testes).

## Funções

Início com "Sobrou no salão" e fôlego · lançar em 3 toques ou escrevendo ("corte 50 pix") · fiado com lembrete no
WhatsApp · reserva com meta · margem por serviço e simulador "E se…?" (desconto, dólar, aumento de preço, indicação) ·
fornecedores · MEI em dia (DAS, limite anual, relatório mensal de receitas) · mensagens prontas · cópia de segurança
e planilha · modo demonstração · letra maior · funciona sem internet (PWA).

## Desenvolvimento

```bash
npm install
npm run dev     # http://localhost:5173/folego/
npm test        # testes da lógica (Vitest)
npm run build   # gera dist/ (BASE=/folego/ por padrão)
```

Stack: Preact + TypeScript + Vite + vite-plugin-pwa + idb-keyval. É um site estático: dá para publicar em qualquer hospedagem de sites estáticos (o fluxo `.github/workflows/deploy.yml` publica no GitHub Pages).
