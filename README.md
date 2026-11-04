# Fôlego

App feito no Projeto de Extensão III para um salão de beleza de bairro (Organização Parceira A). Tudo testado
**só com dados fictícios**. É um protótipo acadêmico: sem garantia, sem suporte e sem promessa de uso comercial.

## O que é

O caderno do Kit de Resiliência no celular:

- anota entrada e saída em 3 toques;
- separa o dinheiro da casa do dinheiro do salão;
- mostra a reserva em "dias de fôlego";
- tem o "E se…?", que mostra em reais o efeito de dar desconto ou de um produto subir.

Os dados ficam só no celular de quem usa. Nada vai para a internet nem para IA.

## Onde abrir

<https://folego.sealugue.com/folego/> — abre no celular e instala como app. Tem modo demonstração com dados de
exemplo.

## O que tem aqui

| Pasta | O que tem |
| --- | --- |
| `app/` | código do Fôlego (e a simulação v2 em `app/public/laboratorio/`) |
| `docs/discovery/` | o problema da parceira, nas palavras das fontes, e as pesquisas |
| `docs/produto/PRD.md` | o que o app faz e por quê |
| `docs/arquitetura/ADR-001-stack-local-first.md` | por que os dados ficam só no celular |
| `docs/entrega/GUIA-RAPIDO-FOLEGO.md` | como usar |
| `docs/gauntlet/` | régua e comparação cega com o app do Sebrae |
| `docs/roadmap.md` | possíveis próximos passos do app |
| `docs/continuidade/VISAO-MEI-OS.md` | ideia de próximo passo (construção individual, fora do projeto) |

O relatório do projeto sai pelos canais da faculdade.

## Como rodar

```bash
cd app && npm install && npm run dev
```

Testes: `npm test` dentro de `app/` (156 testes).

## Uso de IA

O código e os documentos foram feitos com ajuda de IA (Claude). O app em si não manda dado nenhum para IA. A
declaração completa de uso de IA está no relatório do projeto.
