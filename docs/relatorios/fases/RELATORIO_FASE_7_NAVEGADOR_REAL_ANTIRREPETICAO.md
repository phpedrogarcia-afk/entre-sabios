# Entre Sábios — Fase 7: validação pós-correção em navegador real

Data: 15 de julho de 2026
Navegador: Google Chrome controlado pela interface real
Aplicação: servidor HTTP local, sem substituição do caminho de eventos da página
Diagnóstico: `?debugEmotional=1`, sem envio de dados externos

## Resultado executivo

A correção de repetição foi confirmada no caminho real da interface. Os testes usaram os controles visíveis de sentimentos, intensidade, motivação, troca do principal, “Encontrar uma reflexão” e “Outra perspectiva”. O diagnóstico foi lido do snapshot JSON criado pela própria aplicação.

Durante a primeira tentativa, o navegador reutilizou versões antigas de `runtime-engine.js` e `script.js`, porque o HTML ainda mantinha os identificadores de cache anteriores à correção. Isso reproduziu uma diferença importante entre a suíte automatizada e a interface real. Os dois marcadores foram atualizados e todas as sequências foram repetidas com os arquivos corrigidos confirmados pela URL dos scripts.

## Regressão de cache encontrada e corrigida

Antes:

- `runtime-engine.js?v=20260714-repetition-diagnostic-2`
- `script.js?v=20260714-repetition-diagnostic-1`

Depois:

- `runtime-engine.js?v=20260715-repetition-fix-1`
- `script.js?v=20260715-repetition-fix-1`

Com a cópia antiga em cache, a sequência principal teve 21 escolhas e 19 IDs distintos. `curated-44` reapareceu nas posições 2 e 15; `batch01-quote-026`, nas posições 3 e 16.

Depois da atualização de cache, a mesma sequência teve:

- 21 seleções;
- 21 IDs distintos;
- 21 textos normalizados distintos;
- nenhuma repetição permitida;
- nenhum erro no console.

## Sequência 1 — Autoconhecimento, Confusão e Insegurança

Fluxo executado:

1. Autoconhecimento como principal;
2. Confusão e Insegurança como secundários;
3. intensidade Moderada;
4. geração inicial e oito outras perspectivas;
5. motivação ligada e quatro perspectivas;
6. motivação desligada;
7. intensidade Intensa e três perspectivas;
8. retorno à intensidade Moderada;
9. Confusão definida explicitamente como principal;
10. retorno explícito a Autoconhecimento;
11. novas perspectivas.

Resultado: 21/21 conteúdos distintos, sem reinício ao alternar motivação, intensidade ou sentimento principal.

## Sequência 2 — Luto e Saudade

Fluxo executado:

- Luto principal, Saudade secundária e intensidade Intensa;
- seis escolhas iniciais;
- motivação ligada;
- três novas escolhas;
- Saudade definida como principal;
- retorno a Luto;
- novas perspectivas.

Resultado:

- 14 escolhas;
- 12 IDs distintos;
- primeira repetição recente na posição 13;
- `repeatAllowed: true`;
- motivo: `exact_avoidance_relaxed_without_safe_unseen_candidate_at_selected_level`;
- oito candidatos do nível bloqueados pela janela recente;
- nenhuma alternativa segura fora da fila;
- nenhum erro no console.

A reaparição na posição 14 já estava fora da janela de 12 conteúdos e ocorreu depois do esgotamento do conjunto compatível.

## Sequência 3 — Falta de propósito

Fluxo executado:

- Falta de propósito principal;
- Confusão secundária;
- intensidade Moderada;
- motivação ligada;
- seis escolhas;
- Confusão removida;
- Insegurança adicionada;
- motivação desligada e ligada novamente;
- cinco novas perspectivas.

Resultado: 11 escolhas, 11 IDs distintos, nenhuma repetição permitida e nenhum erro.

## Conjunto pequeno e repetição inevitável

Foi usada uma segunda origem HTTP local para obter `localStorage` limpo. Em Luto intenso:

- os oito conteúdos de núcleo apareceram primeiro;
- dois conteúdos contextuais apareceram em seguida;
- os 10 primeiros conteúdos foram distintos;
- a primeira repetição ocorreu na posição 11;
- oito candidatos estavam bloqueados pela janela recente;
- não existia alternativa segura restante;
- a repetição foi diagnosticada como inevitável.

## Persistência após recarga

Em uma combinação ampla foram realizadas 15 escolhas. A página foi recarregada de verdade, os mesmos sentimentos foram selecionados novamente e seis novas escolhas foram solicitadas.

Resultado:

- zero sobreposição com os 12 IDs imediatamente anteriores à recarga;
- seis escolhas novas em nível contextual do mesmo principal;
- nenhuma repetição permitida;
- nenhum erro no console.

Uma verificação adicional mostrou que conteúdos só voltam a ficar disponíveis quando saem da janela recente e o conjunto elegível correspondente já foi percorrido.

## Cliques rápidos

Um duplo clique real em “Outra perspectiva” produziu:

- contador antes: 17;
- contador depois: 18;
- exatamente uma nova seleção;
- nenhum erro no console.

A trava de 350 ms está funcionando no navegador, não apenas no teste unitário.

## Mobile e smartphone horizontal

### 390 × 844

- “Outra perspectiva” visível;
- uma ação gerou exatamente uma seleção;
- altura rolável: 2.392 px;
- largura do documento: 375 px;
- nenhum erro no console.

### 844 × 390

- rolagem vertical avançou de 913 px para 1.413 px;
- largura do documento igual à largura útil: 829 px;
- nenhum estouro horizontal;
- rolagem da página funcional.

O viewport temporário foi removido ao terminar.

## Console e dados locais

- carregamento confirmado: acervo `definitiva-2.1`, 283 conteúdos;
- erros de console nas sequências concluídas: 0;
- diagnóstico permaneceu local no navegador;
- `localStorage` foi preservado entre recargas;
- nenhuma limpeza geral de armazenamento foi executada.

## Arquivos modificados nesta fase

- `index.html`: atualização exclusiva dos marcadores de cache de `runtime-engine.js` e `script.js`;
- `RELATORIO_FASE_7_NAVEGADOR_REAL_ANTIRREPETICAO.md`: evidências desta fase.

## Preservação

- acervo e autorias: inalterados;
- síntese e motivação: preservadas;
- “Conheça o pensador”, orientação, livros e compartilhamento: não modificados;
- dependências externas: nenhuma adicionada;
- commit, push e merge: não realizados;
- versão publicada em hospedagem: não alterada nem validada nesta fase, pois a integração Git ainda não foi autorizada.

## Estado de aceite

A correção está aceita no navegador real local, em desktop e mobile. O relatório final antigo não deve mais ser usado isoladamente como prova da antirrepetição; este relatório e o da Fase 6 substituem as afirmações anteriores até a consolidação final.

Ainda permanecem, fora da Fase 7:

1. auditoria da evidência humana dos perfis marcados como `reviewed`;
2. revisão formal das afirmações do relatório final anterior;
3. relatório consolidado da correção;
4. aprovação explícita antes de qualquer integração Git ou validação publicada.
