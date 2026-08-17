# Relatório da Revisão Editorial — Entre Sábios

**Data:** 17 de agosto de 2026 · **Branch de trabalho:** `manus/editorial-entre-sabios-20260817` · **Repositório:** `phpedrogarcia-afk/entre-sabios`

## 1. Escopo e método

O acervo completo do Entre Sábios foi revisado item por item, respeitando as regras do repositório (AGENTS.md, PADRAO_EDITORIAL_ENTRE_SABIOS.md e DEC-032, que define `js/data/tales.js` como fonte editorial dos contos). Foram analisados **33 contos** na fonte `tales.js`, com sincronização imediata das páginas HTML de cada conto modificado, e **12 ensaios** em `ensaios/`. Cada texto recebeu análise individual antes de qualquer intervenção, e cada intervenção foi registrada em arquivo próprio nesta pasta (`analise_*.md` e `patch_*.json`), garantindo reversibilidade e rastreabilidade. O resultado são **44 commits** na branch, um por intervenção significativa.

O princípio condutor foi o definido no briefing: edição literária profunda, nunca padronização. As vozes originais foram preservadas; as intervenções restringiram-se aos padrões de fraqueza identificados em leitura integral — comentários avaliativos sobre a própria obra ("a genialidade do conto está...", "essa é a intuição mais profunda..."), marcadores metalinguísticos ("essa observação é importante", "uma leitura editorial possível"), redundâncias de reexplicação após cenas que já demonstram o ponto, e duas repetições literais de perguntas finais que colidiam com as seções SEO das páginas.

## 2. Contos (33) — classificação completa

| Nível | Contos |
|---|---|
| **C — edição moderada** | A Flecha Envenenada, Nachiketa e Yama, O Anel de Giges, Sísifo, Ícaro, Prometeu, A Árvore Inútil, O Espelho (Machado) |
| **B — microedição** | Mito de Er, A Xícara de Chá, Kisa Gotami, A Carruagem da Mente, O Filho Pródigo, O Bom Samaritano, Os Talentos, O Elefante no Escuro, Nasrudin e a Chave, O Cachorro e a Carroça |
| **A — preservar intacto** | O Mito da Caverna, O Mito de Narciso, O Agricultor e o Cavalo, Dois Monges e a Mulher, A Caixa de Pandora, O Sonho da Borboleta, O Patinho Feio, Davi e Golias, O Navio de Teseu, O Barco Vazio, A Taça Quebrada, O Grande Inquisidor, A Morte de Ivan Ilitch, Jornada do Herói, A Sombra (Jung) |

> Nota de auditoria: a primeira versão deste relatório omitiu três contos de nível A (O Mito de Narciso, A Caixa de Pandora, O Sonho da Borboleta) na tabela; a lista acima cobre os 33. A tabela de textos efetivamente modificados, com commits e linhas, está no arquivo `relacao_textos_modificados.md`.

Os cortes mais significativos incluem a remoção do parágrafo conceitual que explicava o absurdo em *Sísifo*, a eliminação de "A genialidade do conto está na ironia sem grito" e de "Machado mostra como..." em *O Espelho*, a supressão da moral explícita da tríade final de *Prometeu*, e o enxugamento do fecho erudito de *O Cachorro e a Carroça*. Em todos os casos, a cena narrativa e a tese implícita permanecem — o que se retirou foi o ensaio que a prosa já havia feito.

## 3. Ensaios (12) — síntese das intervenções

| Ensaio | Intervenção |
|---|---|
| Buda e o apego | Remoção de explicação redundante após a lista de desejos |
| Chögyam Trungpa e o ego | Remoção do marcador metalinguístico "Essa observação é importante" |
| Dostoiévski e a culpa | Remoção do comentário avaliativo "Talvez esse seja um dos pontos mais profundos do romance" |
| Jung e a sombra | Eliminação da repetição literal da pergunta final (colidia com a seção SEO "Pergunta final") |
| Krishnamurti e o medo | Mesmo ajuste de repetição da pergunta final |
| Nisargadatta Maharaj | Substituição de "Uma leitura editorial possível é que..." por formulação direta |
| Rumi e a solidão | Remoção da redundância de títulos de obras em parágrafos consecutivos |
| Kabir e a busca, Gibran e o amor, Marco Aurélio e a ansiedade, Nietzsche e a falta de propósito, Tilopa e a identidade | Nível A — preservados praticamente intactos |

## 4. Candidatos a destaque editorial

Em leitura global do acervo, cinco textos emergem como os mais fortes por coesão, originalidade de voz e força imagética. A tabela cruza nível de excelência original e resistência à edição (quanto menos a edição precisou tocar, mais a peça é autossuficiente).

| Candidato | Tipo | Justificativa |
|---|---|---|
| **Jung e a sombra (ensaio)** | Ensaio | A melhor peça do acervo: abre em cena concreta (a irritação rápida demais), desenvolve projeção, persona e inteireza com imagens originais ("o que não entra pela porta da consciência costuma entrar pela janela do comportamento"; "uma casa onde alguns cômodos foram trancados") e recusa o próprio rótulo no final. Zero intervenção além de correção de repetição. |
| **Tilopa e a identidade (ensaio)** | Ensaio | "A mente monta um tribunal sem fim e chama isso de autoconhecimento" e "O pensamento pode aparecer sem receber o trono. A emoção pode atravessar sem virar destino." Rigor raro, limites declarados com honestidade. Preservado intacto. |
| **O Grande Inquisidor** | Conto | A peça mais ambiciosa do acervo; tensão teológica bem encenada, sem moral explícita. Preservado intacto. |
| **Kabir e a busca (ensaio)** | Ensaio | "Fácil é buscar Deus nas montanhas; difícil é não mentir na cozinha." Parábola da água carregada e sede; a quaterna dos ritos vivos e mortos é das melhores do acervo. Preservado intacto. |
| **Prometeu (conto)** | Conto | Mesmo após o enxugamento da moral explícita, mantém a tríade especular ("O mesmo fogo que aquece pode destruir...") e a pergunta aberta final. Tornou-se mais forte com a edição. |

## 5. Padrões recorrentes identificados no acervo

A leitura integral revelou cinco hábitos de escrita que, sem comprometer as peças, aparecem em graus variados. Servem como guia para produção futura. Primeiro, o **comentário avaliativo sobre a própria obra** ("a genialidade está", "é a cena mais forte"), que substitui a confiança no texto. Segundo, os **marcadores metalinguísticos** ("essa observação é importante", "o ponto é outro"), que anunciam a relevância em vez de produzi-la. Terceiro, a **reexplicação após cena demonstrativa** — quando a narrativa já prova a tese, o parágrafo que conclui o que foi mostrado duplica o trabalho. Quarto, a **repetição da pergunta final** que colide literalmente com a seção SEO das páginas de ensaio. Quinto, o hábito de **fecho erudito**, em que o último parágrafo se eleva a registro acadêmico, quebrando o tom narrativo que o conto sustentou até ali.

## 6. Estado do repositório

Todos os commits residem na branch `manus/editorial-entre-sabios-20260817`, à frente da `main`, sem conflitos e sem alterações em arquivos fora do escopo editorial. O diff global é de 26 arquivos (25 páginas HTML e `tales.js`), com 69 linhas alteradas e 69 removidas — intervenções cirúrgicas que mantêm o formato original dos arquivos. Os registros analíticos individuais de cada texto (33 contos + 12 ensaios) estão em `auditoria/`, e a relação completa de textos modificados com commits, arquivos e linhas está em `relacao_textos_modificados.md`. Nenhum merge foi realizado e a `main` permanece intacta.
