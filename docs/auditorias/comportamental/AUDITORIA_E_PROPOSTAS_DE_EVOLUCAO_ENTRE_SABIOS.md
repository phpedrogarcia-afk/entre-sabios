# Auditoria técnica e propostas de evolução — Entre Sábios

Data da análise: 14 de julho de 2026
Natureza deste arquivo: diagnóstico e recomendações; nenhuma proposta aqui está automaticamente autorizada para implementação.

## 1. Resumo executivo

O Entre Sábios possui uma base editorial e técnica valiosa: fonte única de acervo, sentimento principal explícito, segurança para estados vulneráveis, autoria rastreável, sínteses humanas, motivação opcional, filas persistentes e uma suíte ampla de regressão. O projeto não precisa ser reconstruído.

O problema central do algoritmo atual não é falta de conteúdo. É a forma como ele define e percorre o conjunto disponível. O seletor escolhe sempre o melhor nível emocional e reinicia esse nível quando sua fila acaba. Ele não progride para conteúdos contextuais ainda seguros e diretamente associados ao mesmo sentimento principal. Isso produz a sensação de andar em círculos.

Exemplo reproduzido no navegador real:

- Autoconhecimento moderado, com Confusão e Insegurança;
- quatro conteúdos de núcleo foram exibidos;
- a quinta escolha repetiu `curated-44`;
- ainda existiam 39 conteúdos contextuais seguros e não vistos associados a Autoconhecimento;
- considerando todos os níveis seguros, ainda existiam 136 alternativas.

O problema dos “textos que não aparecem” é diferente. O acervo ativo possui 283 conteúdos, mas sua composição visual é muito concentrada:

| Formato | Quantidade | Participação aproximada |
| --- | ---: | ---: |
| Frase | 255 | 90,1% |
| Citação curta | 18 | 6,4% |
| Reflexão curta | 5 | 1,8% |
| Microtexto | 4 | 1,4% |
| Citação longa | 1 | 0,4% |

Portanto, existem duas decisões separadas:

1. corrigir a circulação para aproveitar melhor o acervo já disponível;
2. depois, decidir editorialmente se o site deve ter mais microtextos e reflexões curtas.

Alterar pesos de formato não resolve uma escassez de formato. Da mesma forma, criar textos novos não corrige uma fila que reinicia cedo. Misturar os dois problemas foi uma das causas dos ciclos de correção anteriores.

## 2. Como o algoritmo funciona hoje

O fluxo real é:

```text
estado escolhido pelo usuário
  → publicação e status
  → intensidade
  → exclusões rígidas
  → segurança editorial
  → nível de associação emocional
  → compatibilidade dos secundários
  → preferência da síntese
  → preferência motivacional
  → fila do melhor nível
  → bloqueio recente de ID e texto
  → proximidade textual e conceito
  → trajetória editorial
  → formato e autoria
  → escolha
```

Os níveis atuais são:

1. associação de núcleo com o sentimento principal;
2. associação contextual com o sentimento principal;
3. associação de núcleo com sentimentos secundários;
4. associação contextual com sentimentos secundários;
5. conteúdo geral.

A hierarquia é correta como ordem de prioridade. O problema é tratá-la como exclusividade permanente. Enquanto existir qualquer conteúdo no nível 1, somente esse nível participa da fila. Quando todos os seus itens já apareceram, o motor reconstrói a mesma fila e repete, em vez de avançar para o nível 2 do mesmo principal.

## 3. Constatações comprovadas

### 3.1 Repetição precoce por reinício rígido do melhor nível

Nos 42 estados formados por 14 sentimentos e três intensidades, sem secundários:

- o conjunto do melhor nível varia de 1 a 9 conteúdos;
- a mediana é somente 4;
- 24 dos 42 estados possuem no máximo 4 conteúdos no melhor nível;
- Culpa possui somente 1 conteúdo de núcleo nas três intensidades, embora possua 9 contextuais na intensidade fraca, 10 na moderada e 2 na intensa.

Assim, o comportamento circular não é uma exceção. Ele é consequência previsível da política atual.

Reproduções reais:

| Contexto | Primeira repetição | Itens do núcleo percorridos | Contextuais seguros do mesmo principal ainda não vistos |
| --- | ---: | ---: | ---: |
| Autoconhecimento + Confusão + Insegurança, moderada | 5ª escolha | 4 | 39 |
| Luto + Saudade, intensa | 9ª escolha | 8 | 2 |
| Falta de propósito + Confusão, moderada | 4ª escolha | 3 | 11 |

Conclusão: a frase repetida pode ser antiga dentro da fila ativa e, ao mesmo tempo, existirem alternativas seguras no contexto emocional permitido.

### 3.2 “Elegível” possui dois significados conflitantes

Os relatórios anteriores chamaram de “conjunto elegível” apenas os candidatos do melhor nível. Para a experiência do usuário, elegível significa qualquer conteúdo seguro, adequado à intensidade e relacionado ao sentimento principal antes de uma repetição.

Essa diferença semântica permitiu que os testes declarassem “ciclo completo” mesmo quando somente três ou quatro itens tinham sido vistos.

Recomendação: formalizar dois termos diferentes:

- `eligibleCandidates`: todos os conteúdos que passaram pelos filtros rígidos;
- `activeTierCandidates`: conteúdos do nível atualmente priorizado.

Uma repetição só deve ser declarada inevitável depois de explicar o estado dos dois conjuntos.

### 3.3 Janela recente menor que o histórico persistente

O motor mantém até 120 escolhas em `recentSelections`, mas o bloqueio forte usa somente as 12 últimas.

Consequências:

- uma frase da 13ª posição para trás deixa de ser classificada como repetição recente;
- o diagnóstico pode registrar `repeatAllowed: false` para um ID já exibido na mesma sessão;
- a fila pode estar correta segundo a janela de 12 e ainda parecer repetitiva para uma pessoa.

Não se recomenda simplesmente mudar 12 para 120. A política correta deve distinguir:

- bloqueio recente forte;
- ciclo ainda não percorrido;
- conteúdo visto na sessão;
- conteúdo visto em sessões anteriores;
- repetição inevitável depois do esgotamento.

### 3.4 O relaxamento consulta a fila parcial, não todo o conjunto seguro

Quando todos os itens restantes da fila estão bloqueados pela janela recente, o motor relaxa a proteção. A decisão é feita sobre `queuedCandidates`, que representa somente o restante da fila ativa.

Antes de relaxar, deveria existir uma prova explícita de que não há alternativa segura e ainda não vista:

- no restante da fila;
- no nível principal seguinte;
- no conjunto completo permitido pela política editorial.

### 3.5 Filas persistidas não possuem versão própria de algoritmo

As filas usam a versão do conteúdo `definitiva-2.1`. Mudanças na estrutura ou na política do seletor não criam necessariamente uma versão nova da fila.

Risco: uma fila criada por uma política antiga pode sobreviver a uma atualização do algoritmo e ser restaurada como se fosse compatível.

Recomendação: separar:

- `contentVersion`;
- `selectorSchemaVersion`;
- opcionalmente `rotationPolicyVersion`.

Somente estruturas incompatíveis devem ser invalidadas. Favoritos, tema e outros dados do usuário não devem ser apagados.

### 3.6 Fila restaurada não recebe novos candidatos até esvaziar

Uma fila persistida é filtrada pelos IDs ainda elegíveis, mas não é complementada com novos candidatos elegíveis enquanto permanecer não vazia.

Isso pode acontecer depois de:

- atualização do runtime;
- mudança de metadados;
- alteração de segurança;
- evolução da síntese ou da motivação;
- migração parcial de armazenamento.

Recomendação: reconciliar a fila restaurada com o conjunto atual, preservando a ordem restante e acrescentando somente os IDs novos ainda não vistos.

### 3.7 Duplo clique produz duas seleções

No Chrome real:

- clique lento: uma seleção;
- três cliques rápidos concorrentes: uma seleção observada;
- duplo clique: duas seleções consecutivas.

O histórico foi gravado entre as duas seleções, mas o usuário vê apenas a segunda. Uma reflexão é consumida sem ser lida e a fila avança duas posições.

Recomendação: trava curta e síncrona na ação de gerar, liberada depois de histórico e interface estarem atualizados. Essa trava deve proteger apenas a transação de seleção, sem introduzir atraso perceptível.

### 3.8 Históricos paralelos aumentam ambiguidade

Existem ao menos quatro conceitos de histórico:

- histórico global do seletor runtime;
- histórico por contexto do seletor;
- `caixaSabedoriaHistoricoVisto`, com até 600 IDs;
- `entreSabiosHistoricoContextual`, legado;
- além do histórico navegável da interface.

Nem todos participam da decisão. Isso dificulta responder à pergunta “este conteúdo já foi visto?”.

Recomendação: documentar uma matriz de autoridade e, futuramente, remover somente estruturas comprovadamente sem consumidor. Não fazer limpeza antes de testes de compatibilidade e migração.

### 3.9 Equivalência editorial ainda é incompleta

O motor protege:

- mesmo ID;
- mesmo texto normalizado;
- formulação textual muito próxima;
- conceitos derivados principalmente de temas.

O acervo possui `duplicateOf` e `derivedFromId`, mas não há cobertura uniforme de `canonicalContentId`, `sourceFragmentId` e `conceptGroup` em todos os itens.

Assim, traduções, paráfrases e versões da mesma passagem podem parecer repetição sem serem detectadas como equivalentes.

Recomendação: usar primeiro os metadados existentes. Não executar reclassificação automática em massa. Criar uma fila editorial pequena de equivalências comprovadas e expandi-la somente com revisão humana.

## 4. Por que microtextos e reflexões aparecem pouco

É importante separar comprimento literal de formato editorial:

- 280 dos 283 conteúdos possuem até 180 caracteres;
- isso significa que o acervo é majoritariamente curto em extensão;
- porém somente 10 itens são apresentados como formato desenvolvido: 4 microtextos, 5 reflexões curtas e 1 citação longa.

Na prática, “texto” no site significa um bloco desenvolvido, não apenas uma frase com poucos caracteres.

O relatório técnico anterior já reconhecia que nenhum melhor nível emocional possui três formatos desenvolvidos elegíveis. Portanto, a cadência de 20% a 30% foi comprovada principalmente com dados artificiais de teste, não com a composição real do acervo.

Consequências:

- formato não pode circular quando não existe no nível ativo;
- a regra de formato atua tarde demais para corrigir a falta de cobertura;
- aumentar o peso de microtexto escolherá repetidamente os mesmos poucos itens;
- promover formatos gerais sem relação emocional reduzirá a precisão.

### Proposta editorial realista

Depois de estabilizar a repetição:

1. gerar um mapa de cobertura por sentimento, intensidade, placement e formato;
2. identificar lacunas reais, sem inventar textos automaticamente;
3. decidir uma meta editorial mínima por sentimento, por exemplo três formatos desenvolvidos seguros entre núcleo e contextual;
4. selecionar textos já existentes que possam ser corretamente classificados, somente quando a classificação for editorialmente verdadeira;
5. criar novos textos apenas em um projeto editorial separado, com revisão humana e sem atribuição enganosa;
6. validar a circulação usando o acervo real, não apenas fixtures artificiais.

## 5. Arquitetura recomendada para a rotação

Não é necessário substituir o motor. A evolução recomendada é uma política de percurso progressivo.

### 5.1 Ciclo progressivo do sentimento principal

Ordem proposta:

1. percorrer o nível 1 do principal sem repetição;
2. antes de reiniciar o nível 1, percorrer conteúdos seguros e não vistos do nível 2 do mesmo principal;
3. somente depois avaliar níveis dos secundários;
4. usar conteúdo geral apenas quando a política atual permitir;
5. repetir o conteúdo menos recente somente quando o conjunto permitido estiver esgotado.

Isso preserva a prioridade do principal. Não significa misturar núcleo e contextual desde a primeira resposta. Significa usar profundidade primeiro e amplitude depois, antes de repetir.

### 5.2 Barreira global imediatamente antes da escolha

Independentemente da fila contextual, a escolha final deve consultar um livro-caixa global da sessão:

```text
candidatos seguros do nível permitido
  → remover conteúdo atual
  → remover ID/texto/canônico ainda bloqueado
  → se restar candidato, síntese e motivação apenas ordenam esses candidatos
  → se não restar, ampliar para o próximo nível permitido do mesmo principal
  → repetir somente depois de comprovar esgotamento
```

Síntese, motivação, trajetória, formato e autoria nunca devem reintroduzir um item removido por repetição.

### 5.3 Estado explícito do ciclo

O ciclo deveria registrar de forma auditável:

- níveis já percorridos;
- IDs e chaves normalizadas vistos no ciclo;
- nível ativo;
- motivo da progressão de nível;
- motivo do reinício;
- alternativas seguras restantes;
- repetição permitida e justificativa.

Esse estado não precisa aparecer na interface. Deve estar disponível apenas em diagnóstico e testes.

### 5.4 Ordem de decisão sugerida

1. publicação e status;
2. segurança e exclusões rígidas;
3. intensidade;
4. sentimento principal;
5. nível progressivo do principal;
6. barreira global de conteúdo atual e conteúdos ainda bloqueados;
7. equivalência textual e canônica;
8. compatibilidade dos secundários;
9. síntese;
10. motivação;
11. trajetória;
12. diversidade de conceito, autor e formato;
13. escolha final e gravação atômica do histórico.

## 6. Melhorias nos testes

### 6.1 Substituir afirmações otimistas por invariantes verificáveis

Exemplos:

- “não repetiu dentro da fila ativa” é insuficiente;
- o teste deve afirmar que não existia alternativa segura do principal ainda não vista;
- toda repetição deve apresentar prova de esgotamento;
- toda mudança de contexto deve consultar o histórico global anterior;
- toda ação do usuário deve produzir no máximo uma seleção.

### 6.2 Testar o caminho real da interface

Os testes antigos chamam frequentemente `selector.select()` diretamente. Isso protege o motor, mas não cobre:

- listeners;
- duplo clique;
- ordem de atualização da interface;
- recarregamento real;
- scripts em cache;
- `localStorage` real;
- diferença entre conteúdo selecionado e conteúdo efetivamente renderizado.

Recomendação: manter testes unitários rápidos e acrescentar uma camada pequena de testes reais de interface para os contratos críticos.

### 6.3 Testes baseados no acervo real

Fixtures artificiais são úteis para provar uma regra, mas não comprovam cobertura editorial real. Os testes de formato precisam declarar separadamente:

- algoritmo capaz de alternar formatos em um conjunto artificial adequado;
- acervo real com formatos suficientes para cumprir a meta.

Hoje apenas a primeira afirmação é plenamente verdadeira.

### 6.4 Testes de migração

Adicionar cenários com:

- fila de versão antiga;
- fila parcial;
- IDs removidos;
- novos IDs elegíveis;
- histórico anterior à síntese;
- histórico anterior à motivação;
- armazenamento corrompido;
- favoritos preservados durante a migração.

## 7. Melhorias no processo de engenharia

### 7.1 Registro único de problemas

Manter um arquivo de acompanhamento com:

- problema;
- evidência;
- status;
- fase responsável;
- teste que o reproduz;
- commit futuro que o resolve;
- validação em navegador;
- risco restante.

Isso evita que uma nova fase reimplemente uma solução já existente ou declare novamente um problema como concluído.

### 7.2 Definição de pronto mais rígida

Um problema comportamental somente deve ser encerrado quando houver:

1. reprodução real;
2. teste que falha antes;
3. causa concreta;
4. correção mínima;
5. teste passando depois;
6. suíte anterior preservada;
7. validação no navegador e dispositivo relevantes;
8. relatório compatível com a evidência.

### 7.3 Relatórios como evidência, não como autoridade

Relatórios anteriores afirmaram “antirrepetição preservada” porque os testes usavam a definição restrita da fila ativa. Quando a experiência contradiz o relatório, o relatório deve voltar ao estado provisório.

Recomendação: todo relatório informar:

- o que foi realmente observado;
- o que foi apenas simulado;
- quais dispositivos foram usados;
- quais limitações impedem aceite completo.

### 7.4 Higiene de repositório

O diretório atual contém muitas alterações locais e arquivos não rastreados de fases diferentes. Isso aumenta o risco de misturar correções, relatórios e versões paralelas.

Depois que a correção atual for aprovada, recomenda-se uma etapa operacional separada para:

- definir a branch canônica;
- revisar alterações locais por origem;
- manter arquivos `-PEDRO` fora da versão ativa até decisão explícita;
- separar relatórios históricos de arquivos de produção;
- restaurar ou substituir conscientemente `.gitignore` e `README.md`;
- criar commits pequenos por responsabilidade.

Não fazer limpeza destrutiva nem reorganização durante a correção de repetição.

## 8. Melhorias gerais do projeto

### Prioridade alta

1. concluir a correção da rotação progressiva;
2. impedir duas seleções por duplo clique;
3. versionar o esquema das filas;
4. transformar a sequência real em teste permanente;
5. validar desktop e smartphone reais depois da correção;
6. revisar as afirmações do relatório final sobre antirrepetição.

### Prioridade média

1. criar relatório automatizado de cobertura por sentimento, intensidade, nível e formato;
2. mapear equivalências canônicas comprovadas;
3. consolidar a autoridade dos históricos;
4. testar migração de `localStorage`;
5. criar uma pequena suíte de interação real;
6. auditar perfis marcados como `reviewed` sem prova humana suficiente;
7. validar responsividade em uma matriz mínima: Android vertical/horizontal, iPhone equivalente, tablet e desktop.

### Prioridade editorial futura

1. definir a proporção desejada entre frases e textos desenvolvidos;
2. preencher lacunas de microtextos e reflexões por sentimento em lotes revisados;
3. expandir pares e tríades somente quando houver benefício perceptível;
4. revisar traduções e passagens-base equivalentes;
5. manter origem, autoria e classificação independentes da qualidade literária.

### Ideias úteis, mas não prioritárias agora

- exportação e restauração local de favoritos;
- painel técnico de cobertura do acervo;
- registro de decisões arquiteturais curtas;
- verificação automática de links e dados estruturados na publicação;
- teste visual periódico das páginas de ensaios e contos.

Não recomendo agora:

- IA em tempo real;
- embeddings;
- banco vetorial;
- nova arquitetura completa de sentimentos;
- reclassificação automática do acervo;
- sistema de conta ou sincronização antes de estabilizar a experiência principal;
- novos estilos visuais para resolver um problema de seleção.

## 9. Plano recomendado após este documento

### Etapa A — terminar a correção já iniciada

- Fase 3: teste falho com Autoconhecimento e alternativas contextuais ainda disponíveis;
- Fase 3 adicional: teste de duplo clique;
- Fase 4: confirmar formalmente a causa no reinício do melhor nível;
- Fase 5: implementar progressão mínima do nível 1 para o nível 2 do principal antes de repetir;
- Fase 6: estresse e migração;
- Fase 7: navegador real, incluindo smartphone real.

### Etapa B — cobertura de formatos

- gerar mapa completo;
- definir metas editoriais;
- aprovar um lote pequeno;
- validar circulação real;
- não misturar esta etapa com a correção de repetição.

### Etapa C — redução de débito técnico

- versionar persistência;
- consolidar históricos;
- organizar relatórios e documentação;
- fazer integração Git somente após aprovação.

## 10. Critérios para não voltar a andar em círculos

Antes de iniciar qualquer mudança, responder:

1. O problema foi reproduzido ou é apenas uma hipótese?
2. Existe teste falhando pelo motivo correto?
3. A solução proposta altera a causa ou apenas o sintoma?
4. O acervo possui os dados necessários para a regra funcionar?
5. Outra fase já implementou parte da solução?
6. O teste usa o caminho real ou somente uma função isolada?
7. A definição de “elegível”, “recente”, “novo” e “inevitável” está explícita?
8. O relatório distingue simulação de observação real?
9. A mudança pode desfazer segurança, autoria, trajetória ou responsividade?
10. Existe uma condição clara para encerrar o trabalho?

## 11. Conclusão

O Entre Sábios não precisa de mais complexidade para melhorar. Precisa que a riqueza já existente circule de maneira mais honesta.

A recomendação principal é simples: percorrer primeiro o núcleo, depois os conteúdos contextuais seguros do mesmo sentimento principal, e somente então repetir. Em paralelo, o projeto deve reconhecer que a diversidade de formatos é limitada pelo acervo real e tratá-la como uma decisão editorial separada.

Essa combinação — ciclo progressivo, barreira global auditável, proteção contra ações duplicadas, cobertura real do acervo e critérios de aceite mais rigorosos — oferece a melhor relação entre impacto, risco e esforço, preservando o que o Entre Sábios já faz bem.

---

## Apêndice — elementos que devem ser preservados

- 283 conteúdos ativos e versão `definitiva-2.1` durante a correção atual;
- sentimento principal dominante;
- até dois secundários;
- intensidade;
- segurança editorial;
- síntese humana e direcional;
- motivação opcional;
- autoria, fonte e tipo de atribuição;
- trajetória editorial;
- favoritos e feedback;
- “Conheça o pensador” independente;
- orientação específica quando disponível;
- recomendação de livro independente;
- ausência do botão de copiar;
- compartilhamento pelos três estilos existentes;
- modo claro padrão;
- contos, ensaios e páginas de SEO;
- ausência de IA em produção.

Nenhuma recomendação deste documento autoriza alteração do acervo, do algoritmo ou da interface sem uma aprovação específica posterior.
