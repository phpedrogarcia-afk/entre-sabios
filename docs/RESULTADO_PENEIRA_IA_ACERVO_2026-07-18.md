# Resultado da peneira de conteúdo artificial comprovado

**Data:** 18/07/2026  
**Acervo canônico:** `entre_sabios_acervo_mestre_final.json`  
**Versão resultante:** `definitiva-2.2`  
**Decisão aplicável:** `DEC-029`

## Resultado

A única coleção com geração por IA confirmada pelo editor-chefe foi a “Antologia do Silêncio”. Seus 28 IDs foram retirados da publicação e do runtime, sem exclusão histórica. Não foi localizada evidência documental equivalente para outro conteúdo ativo; por isso, nenhum outro texto foi removido por suspeita, estilo ou origem em lote.

Esta conclusão não transforma ausência de prova em certificação de autoria humana. A etapa posterior da auditoria classificou individualmente os 350 IDs e está registrada em `docs/AUDITORIA_PROVENIENCIA_COMPLETA_2026-07-18.json`, com resumo e 14 lotes ativos.

## Antes e depois

| Medida | Antes | Depois |
| --- | ---: | ---: |
| Registros históricos no mestre | 350 | 350 |
| Conteúdos ativos | 289 | 261 |
| Conteúdos removidos | 60 | 88 |
| Itens ativos da Antologia | 28 | 0 |
| Versão do conteúdo | `definitiva-2.1` | `definitiva-2.2` |

O runtime final contém 43 itens de núcleo, 150 contextuais e 68 gerais. Não houve reposição automática.

## Grupos preservados após revisão

| Grupo ativo | Quantidade | Decisão |
| --- | ---: | --- |
| Inspirações baseadas em autores ou tradições | 234 | manter; não remover sem prova de fabricação ou decisão individual; relação conceitual e fonte podem continuar em revisão |
| Citações traduzidas | 18 | manter com o estado documental já registrado; 16 continuam com tradução/referência pendente |
| Texto tradicional | 1 | manter com atribuição tradicional |
| Adaptações/paráfrases | 3 | manter; incluem conteúdo baseado em obra e textos fornecidos/protegidos pelo editor-chefe |
| Originais | 5 | manter conforme determinação editorial; quatro permanecem atribuídos ao Entre Sábios e `TXT-MED-003` continua como autoria não identificada |

Os originais preservados são `ES-INS-VERGONHA-001`, `Reflexão contemporânea-1`, `Reflexão contemporânea-2`, `Reflexão contemporânea-4` e `TXT-MED-003`. As adaptações preservadas são `batch01-quote-014`, `TXT-MED-004` e `TXT-CUL-001`.

## Evidência examinada

- metadados e histórico de mudanças dos 350 registros do mestre;
- runtime ativo e suas classificações de atribuição e fonte;
- documento local da Antologia e sua impressão SHA-256;
- arquivos originais dos lotes de frases disponíveis no Git;
- histórico Git do acervo e dos lotes;
- decisões, estado vivo, padrão editorial e Núcleo de Preservação;
- busca local por registros explícitos de geração automática, IA, ChatGPT ou OpenAI vinculados aos textos.

Os lotes antigos aparecem no histórico como “curadoria confirmada”, mas não registram rascunho humano, ferramenta geradora ou passagem-base para cada item. Isso sustenta investigação futura, não prova categoria H ou I. A origem em lote e a repetição estilística não foram usadas como motivo de retirada.

## Limite editorial conhecido

Com a saída da Antologia, `tristeza` e `falta_de_proposito` não possuem item de núcleo ativo. O seletor continua usando o melhor nível contextual elegível e seguro; não houve alteração do algoritmo para esconder essa lacuna. Um acervo menor foi preferido a qualquer preenchimento artificial.

As categorias B, C e G preservam incertezas documentais reais. Elas são resultados finais honestos desta auditoria, não afirmações de autenticidade nem evidência de IA. Qualquer reclassificação futura dependerá de fonte nova e individual.

## Validação

- runtime reproduzível com 261 ativos e nenhum ID da Antologia;
- 261 de 261 conteúdos ativos com os quatro blocos editoriais completos;
- 2.182 de 2.182 contextos de livros cobertos;
- 281 testes Node aprovados;
- 7 testes de navegador aprovados;
- governança, pacote público, análise estática e conteúdo sincronizados.

Não houve commit, merge, envio ao GitHub ou publicação nesta atualização.
