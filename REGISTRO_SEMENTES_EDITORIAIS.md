# Registro permanente de sementes editoriais — Entre Sábios

## Autoridade e finalidade

- **Versão:** 1.0.0
- **Estado:** ativo; aguardando entradas
- **Autoridade:** Constituição Editorial Canônica e `DEC-033`
- **Registro estruturado canônico:** `registro_sementes_editoriais.json`
- **Acervo publicado canônico:** `entre_sabios_acervo_mestre_final.json`
- **Runtime:** `data/entre_sabios_runtime.*`, sempre derivado do mestre e nunca usado como fila

Este registro é a porta de entrada intermediária para todo conteúdo novo recebido pelo Entre Sábios. Uma semente preservada aqui não está aprovada, não recebeu ID definitivo, não integra o acervo-mestre, não participa do runtime e não está autorizada para publicação.

## Fluxo obrigatório

`DESCOBERTA → REGISTRO DA REDAÇÃO → REGISTRO DA ORIGEM → INVESTIGAÇÃO DOCUMENTAL → CLASSIFICAÇÃO → AVALIAÇÃO EDITORIAL → AVALIAÇÃO DE SEGURANÇA → COMPARAÇÃO COM O ACERVO → PROPOSTA DE FORMATO → DECISÃO HUMANA → PACOTE DE INTEGRAÇÃO → APLICAÇÃO TÉCNICA SEPARADA`

Nenhuma etapa posterior é presumida. Aprovação humana para preparação técnica ainda não autoriza integração, rebuild, publicação ou ação de Git.

## Princípios permanentes

1. Preservar exatamente a redação recebida, inclusive erros, pontuação, aspas, idioma, capitalização e formatação relevante.
2. Separar fonte de descoberta de fonte documental.
3. Separar autoria alegada, autoria comprovada, obra, tradição, tradução, adaptação, inspiração e curadoria.
4. Não atribuir conteúdo ao Entre Sábios ou ao editor-chefe sem decisão humana explícita de autoria.
5. Não usar afinidade temática como prova de autoria ou inspiração.
6. Não criar conteúdo para preencher quantidade, sentimento, autor ou formato.
7. Preservar incertezas como incertezas; não completar lacunas por inferência.
8. Manter cada mudança de estado no histórico da semente.
9. Comparar com acervo ativo, removidos, protegidos, sementes, traduções e linhagens antes de recomendar integração.
10. Tratar recomendação da IA como proposta, nunca como decisão humana.

## Escopo da porta de entrada

Tipos reconhecidos:

- `ENTRADA-A`: livro ou obra;
- `ENTRADA-B`: vídeo ou áudio;
- `ENTRADA-C`: imagem ou card;
- `ENTRADA-D`: site ou página;
- `ENTRADA-E`: rede social;
- `ENTRADA-F`: conteúdo fornecido pelo editor-chefe;
- `ENTRADA-G`: texto que o editor-chefe declarou explicitamente ter escrito;
- `ENTRADA-H`: sugestão criada com auxílio de IA;
- `ENTRADA-I`: conteúdo tradicional;
- `ENTRADA-J`: recuperação histórica, normalmente encaminhada ao protocolo próprio;
- `ENTRADA-X`: origem imediata indeterminada.

Fornecimento por Pedro comprova apenas a proveniência interna da entrada. Não comprova autoria, autenticidade, obra, tradição nem direitos.

## Preflight de cada lote

Antes de registrar entradas, conferir `AGENTS.md`, `PADRAO_EDITORIAL_ENTRE_SABIOS.md`, `DECISIONS.md`, `PROJECT_STATUS.md`, `NUCLEO_PRESERVACAO_EDITORIAL.md`, a documentação do mestre e o contrato de geração do runtime. Registrar branch, commit, data e horário, alterações rastreadas e não rastreadas, versões, totais, arquivos de entrada existentes, convenção temporária, quantidade recebida e origem declarada. Contradições são registradas e bloqueiam integração; não são resolvidas por valores inventados.

## Convenção dos códigos temporários

- Formato: `SEMENTE-AAAA-MM-NNN`.
- A sequência é mensal, decimal e preenchida com três dígitos.
- O próximo número deve ser calculado somente a partir do registro canônico e conferido contra todas as sementes existentes.
- O código temporário não reserva nem antecipa um ID do acervo.
- Nenhum código é criado enquanto não houver conteúdo efetivamente recebido.

## Limites de lote

Processar no máximo:

- 10 frases breves;
- 5 microtextos ou reflexões;
- 3 citações longas;
- 3 contos;
- 5 vídeos ou fontes de descoberta;
- ou 8 itens mistos.

Excedentes recebem o marcador `AGUARDANDO PRÓXIMO LOTE` sem avaliação antecipada.

## Detecção de processo editorial existente

Antes de criar uma linhagem, pesquisar IDs, texto exato, fragmentos distintivos, relatórios, lotes, minutas, decisões, protegidos, removidos e sementes. Quando já houver processo, registrar:

`CONTEÚDO JÁ POSSUI PROCESSO EDITORIAL`

O registro deve apontar o ID, relatório, lote, minuta, decisão e estado atual. Não criar semente concorrente nem reprocessar automaticamente lote 01, conteúdos protegidos, itens do mestre, decisões vigentes, restaurações históricas ou textos que já possuam minuta.

## Proteção solicitada pelo editor-chefe

Quando Pedro pedir explicitamente preservação, registrar:

`PROTEÇÃO EDITORIAL SOLICITADA PELO EDITOR-CHEFE`

Isso impede descarte, substituição e reescrita automática, mas não confirma autoria, direitos, segurança, integração ou publicação.

## Regras específicas por origem

### Vídeo e áudio

Registrar URL, canal, título, data, duração, início e fim do trecho, texto narrado, transcrição disponível, autor e obra alegados, descrição, referências fornecidas, narrador, tradução, adaptação aparente, imagem ou personagem e conclusão acrescentada pelo canal. Verificar se a fala pertence ao autor, personagem ou narrador e se houve tradução livre, resumo, acréscimo ou perda de contexto. Legenda automática não é prova e OCR ou transcrição em massa não é autorizado.

### Canal Corvo Seco

Registrar como `FONTE DE DESCOBERTA EDITORIAL`, preservando vídeo, título, URL, trecho, obra alegada, motivo de interesse e data. O canal não é presumido como fonte primária, autor, tradutor ou representante integral da obra; a fonte original deve ser procurada.

### Imagem, card e rede social

Registrar texto, aspas, autor e obra exibidos, perfil ou local, data, design, legenda, comentários de origem e variantes encontradas. Um nome em imagem não comprova autoria. Pesquisar redação exata, fragmentos distintivos, variantes, idioma original, obra alegada e circulação anterior.

### Conteúdo fornecido ou escrito por Pedro

`ENTRADA-F` significa somente `Fornecido pelo editor-chefe`. Usar `ENTRADA-G` apenas quando Pedro declarar explicitamente que escreveu o texto. Quando ele não conhecer a origem, registrar `Origem documental não identificada` sem descartar nem atribuir automaticamente.

### Conteúdo com auxílio de IA

Registrar ferramenta ou agente, data, prompt ou contexto disponível, finalidade, revisão humana, alterações humanas, aprovação individual, motivo de preservação, atribuição pública proposta e estado documental. Escrita fluente, utilidade estatística ou imitação de autor não autorizam avanço. A IA não decide que o conteúdo passa a ser autoria do Entre Sábios.

## Ficha obrigatória de cada semente

Cada registro deve conter, sem preencher lacunas por inferência:

- identificação temporária, data, pessoa fornecedora, tipo e texto integral;
- título e contexto recebidos;
- fonte de descoberta, URL, canal/perfil, publicação, página ou horário;
- alegações recebidas de autoria, obra, tradição, tradução e inspiração;
- observações do editor-chefe, motivo de interesse, tema ou sentimento sugerido, formato imaginado e proteção solicitada;
- proveniência interna e documental separadas;
- pesquisa, evidências favoráveis, evidências contrárias e limitações;
- classificação documental, confiança e afirmações sustentadas ou não sustentadas;
- avaliação editorial e teste sem o nome do autor;
- comparação com o acervo e relação de linhagem;
- adequação emocional, função, posição, intensidade e associações apenas como propostas;
- avaliação de segurança, gravidade, contexto e necessidade de suspensão;
- direitos e bloqueios de uso;
- formato recomendado;
- estado, recomendação da IA e decisão humana;
- proteção, autorização para preparação técnica e histórico completo.

## Investigação documental

Priorizar fontes primárias, arquivos institucionais, edições reconhecidas, estudos acadêmicos e fontes editoriais confiáveis. Sites de frases, cards, vídeos e respostas anteriores de IA não são prova principal. Para vídeos, distinguir obra, autor, personagem, narrador, canal, tradução, adaptação, resumo e acréscimos do produtor.

Resultados documentais possíveis devem reutilizar o vocabulário vigente: citação verificada, tradução identificável, passagem autêntica com contexto necessário, adaptação documentada, paráfrase documentada, inspiração demonstrável, texto tradicional sustentado, autoria não identificada, proveniência indeterminada, atribuição contradita, fabricação comprovada ou caso conflitante.

`Inspirado em` exige passagem ou conceito específico, relação explicável, transformação substancial, redação claramente diferente e decisão consciente. Afinidade temática isolada nunca basta.

## Avaliações obrigatórias

### Editorial

Avaliar força conceitual, especificidade, desenvolvimento, clareza, ressonância, honestidade emocional, necessidade, redundância, qualidade literária, adequação ao projeto e independência do nome famoso. Autenticidade não implica qualidade; anonimato não implica rejeição.

### Comparação

Classificar como único, complementar, relacionado, parcialmente redundante, fortemente redundante, duplicata, mesma linhagem ou conflito não resolvido.

### Emocional e segurança

Avaliar sentimento principal, associações contextuais, intensidade, trajetória, função, riscos e exclusões sem inflar relações por palavras compartilhadas. Examinar culpa, moralização, diagnóstico, promessa de cura, pressão por superação, romantização da dor ou morte, responsabilização da vítima, passividade, superioridade espiritual, abandono de cuidado profissional, invalidação, simplificação de luto ou trauma, conselho prematuro, confronto humilhante e positividade forçada. Não reescrever automaticamente para mitigar risco.

### Direitos

Registrar domínio público, tradução protegida, adaptação, texto contemporâneo, direitos indeterminados, uso externo pendente e necessidade de autorização. Direitos pendentes permitem preservação e análise interna, mas bloqueiam publicação externa.

## Formatos recomendáveis

Citação breve; citação breve com contexto opcional; citação longa contextualizada; microtexto; reflexão curta; conto filosófico; texto tradicional; conteúdo valioso com proveniência pendente; semente documental; arquivo histórico; ou rejeitado. Uma mudança de formato depende de texto final e decisão humana próprios.

## Estados válidos

`RECEBIDA`, `PRESERVADA`, `EM INVESTIGAÇÃO DOCUMENTAL`, `DOCUMENTAÇÃO PENDENTE`, `EM AVALIAÇÃO EDITORIAL`, `EM REVISÃO DE SEGURANÇA`, `BLOQUEADA POR DIREITOS`, `BLOQUEADA POR DIVERGÊNCIA`, `PROTEGIDA PARA DECISÃO`, `PRONTA PARA DECISÃO HUMANA`, `APROVADA PARA PREPARAÇÃO TÉCNICA`, `REJEITADA` e `ARQUIVADA`.

Somente decisão humana explícita pode produzir os três últimos estados decisórios. Mesmo `APROVADA PARA PREPARAÇÃO TÉCNICA` não autoriza integração.

## Recomendações possíveis da IA

`N-A` avançar para decisão humana de integração; `N-B` avançar com correção documental; `N-C` avançar como citação contextualizada; `N-D` avançar como microtexto ou reflexão; `N-E` preservar com proveniência pendente; `N-F` investigar novamente; `N-G` manter como semente; `N-H` bloquear por segurança; `N-I` bloquear por direitos; `N-J` arquivar; `N-K` recomendar rejeição editorial; `N-X` encaminhar decisão humana complexa.

Uma recomendação nunca equivale a aprovação.

## Autonomia e bloqueios

A IA pode registrar, preservar, pesquisar, comparar, detectar duplicata exata, classificar incerteza, avaliar qualidade e risco, propor formato e decisão e bloquear publicação automática. Pode arquivar tecnicamente duplicata exata somente quando nenhuma informação exclusiva se perder e o histórico mínimo permanecer.

Autoria não comprovada, direitos pendentes, origem indeterminada, inspiração não demonstrada, contexto perdido, possível fabricação, conteúdo valorizado, risco emocional e conflito de linhagem permitem bloqueio ou pedido de investigação, mas não rejeição definitiva automática.

Integração, publicação, autoria institucional, publicação anônima, adoção de texto com IA, reescrita, adaptação, mudança substancial de formato, rejeição ou remoção de protegido, aceitação de risco, definição jurídica e criação de ID definitivo exigem decisão humana.

Arquivo ilegível, conteúdo vazio, spam, propaganda, duplicata exata sem informação nova, autoria inventada comprovada, material fora de escopo ou perigoso permitem recomendação de bloqueio técnico. Mesmo assim, preservar registro mínimo, motivo e histórico; não gerar substituto.

## Histórico imutável

Cada transição registra data, estado anterior, estado novo, ação, responsável, evidência e observação. Texto recebido, alegações, fonte inicial, investigação anterior, decisões rejeitadas e versões nunca são sobrescritos silenciosamente.

## Revisão humana

Quando houver evidência suficiente, apresentar texto, origem, comprovações, lacunas, qualidade, riscos, formato e recomendação, com estas escolhas: aprovar para preparação técnica; manter como semente; preservar com proveniência pendente; solicitar nova investigação; arquivar; rejeitar; alterar a recomendação; ou declarar incerteza.

## Pacote posterior e separação técnica

Somente após decisão humana, outro pacote poderá propor ID definitivo, texto final, tipo, autoria pública e interna, fonte, formato, sentimentos, intensidades, placement, funções, riscos, exclusões, proteção, publicação, histórico e aprovação. A aplicação desse pacote é uma tarefa técnica separada.

## Garantias operacionais

O trabalho nesta fila não edita o mestre, não gera runtime, não altera algoritmo ou interface, não publica, não cria substitutos, não cria ID definitivo e não executa commit, push ou merge. Cada lote termina depois do registro, investigação, relatório e apresentação para decisão humana.

## Estado atual

Nenhuma semente foi recebida no lote inaugural. A fila permanece ativa e vazia até a chegada de conteúdo real.
