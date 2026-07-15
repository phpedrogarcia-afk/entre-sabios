# Propostas de síntese — Fase 10, lote 2

Status editorial: **aprovadas pelo usuário e ativadas no catálogo `1.1.0`**.

- Versão da proposta: `1.1.0-proposta-lote-02`.
- Versão ativada após aprovação: `1.1.0`.
- Data da proposta: 14 de julho de 2026.
- Proponente editorial: Codex (OpenAI).
- Revisor humano responsável pela decisão: Pedro — aprovado em 14 de julho de 2026.
- Catálogo ativo após aprovação: `1.1.0`, com 29 pares direcionais e uma tríade revisada.
- Acervo preservado: `definitiva-2.1`, com 283 conteúdos ativos.

Estas descrições são textos de interface. Não são citações, diagnósticos, conselhos terapêuticos nem reflexões principais. As oito descrições foram incluídas em `js/data/emotional-syntheses.js` somente após aprovação explícita.

## Critério de prioridade

O inventário contém 182 pares direcionais possíveis entre os 14 sentimentos. Vinte e um já possuem perfil específico e 161 ainda usam fallback. O lote 2 prioriza pares que:

1. possuem ao menos dois conteúdos do acervo associados aos dois sentimentos;
2. envolvem um principal vulnerável ou uma tensão editorialmente relevante;
3. permitem escrever as duas direções sem apagar o sentimento principal;
4. podem ser revisados em um lote pequeno, sem expansão automática.

Oito pares cumprem esses critérios: quatro relações bidirecionais, com duas ou três coocorrências reais no acervo para cada direção.

## Descrições propostas

### 1. Ansiedade + Autoconhecimento

- Chave: `ansiedade__autoconhecimento`.
- Descrição: **Talvez a urgência de entender o que acontece dentro de você esteja fazendo cada dúvida parecer algo que precisa ser resolvido antes do tempo.**
- Temas internos: `antecipacao`, `observacaoDeSi`, `necessidadeDeControle`.
- Sinais existentes preferidos: temas `ansiedade`, `autoconhecimento`, `observacao`; funções `recognition`, `grounding`, `inquiry`; tons `acolhedor`, `contemplativo`.
- Confiança proposta: média.
- Ambiguidade proposta: média.
- Justificativa: mantém a antecipação ansiosa no centro e usa o autoconhecimento como campo onde a urgência por explicações aparece.
- Coocorrências no acervo: 3.

### 2. Autoconhecimento + Ansiedade

- Chave: `autoconhecimento__ansiedade`.
- Descrição: **Talvez olhar para si esteja revelando uma mente que se adianta aos acontecimentos e procura certezas antes de conseguir apenas observar o que sente.**
- Temas internos: `observacaoDeSi`, `antecipacao`, `necessidadeDeCerteza`.
- Sinais existentes preferidos: temas `autoconhecimento`, `observacao`, `ansiedade`, `clareza`; funções `inquiry`, `clarification`, `grounding`.
- Confiança proposta: média.
- Ambiguidade proposta: média.
- Justificativa: mantém a investigação de si no centro; a ansiedade acrescenta antecipação e dificuldade de observar sem concluir depressa.
- Coocorrências no acervo: 3.

### 3. Insegurança + Amor

- Chave: `inseguranca__amor`.
- Descrição: **Talvez a dúvida sobre o próprio valor esteja ficando mais intensa justamente onde existe o desejo de ser visto, acolhido e amado sem precisar provar que merece isso.**
- Temas internos: `imagemDeSi`, `necessidadeDeValidacao`, `vulnerabilidadeAfetiva`.
- Sinais existentes preferidos: temas `inseguranca`, `autoimagem`, `amor`, `vinculo`; funções `recognition`, `inquiry`; tons `acolhedor`, `contemplativo`.
- Confiança proposta: alta.
- Ambiguidade proposta: média.
- Justificativa: mantém a autoimagem insegura no centro e apresenta o amor como contexto de exposição e desejo de acolhimento, sem afirmar dependência afetiva.
- Coocorrências no acervo: 3.

### 4. Amor + Insegurança

- Chave: `amor__inseguranca`.
- Descrição: **Talvez o desejo de se aproximar esteja convivendo com o receio de não ser suficiente ou de precisar esconder partes de si para preservar o vínculo.**
- Temas internos: `vinculo`, `vulnerabilidadeAfetiva`, `imagemDeSi`.
- Sinais existentes preferidos: temas `amor`, `vinculo`, `inseguranca`, `autoimagem`; funções `recognition`, `inquiry`.
- Confiança proposta: alta.
- Ambiguidade proposta: média.
- Justificativa: mantém o vínculo afetivo no centro e trata a insegurança como receio de inadequação diante da proximidade.
- Coocorrências no acervo: 3.

### 5. Culpa + Tristeza

- Chave: `culpa__tristeza`.
- Descrição: **Talvez o peso do que você acredita ter feito, deixado de fazer ou não conseguido evitar esteja se transformando também em tristeza.**
- Temas internos: `responsabilidade`, `autojulgamento`, `sofrimento`.
- Sinais existentes preferidos: temas `culpa`, `responsabilidade`, `reparacao`, `tristeza`, `autocompaixao`; funções `recognition`, `contemplation`.
- Confiança proposta: alta.
- Ambiguidade proposta: média.
- Justificativa: mantém a responsabilidade percebida no centro, sem confirmar condenação, e reconhece a tristeza como efeito possível desse peso.
- Coocorrências no acervo: 2.

### 6. Tristeza + Culpa

- Chave: `tristeza__culpa`.
- Descrição: **Talvez a tristeza esteja mais pesada porque, além da dor, existe a sensação de que você deveria ter agido, sentido ou escolhido de outro modo.**
- Temas internos: `sofrimento`, `autojulgamento`, `responsabilidade`.
- Sinais existentes preferidos: temas `tristeza`, `acolhimento`, `culpa`, `autocompaixao`; funções `recognition`, `contemplation`.
- Confiança proposta: alta.
- Ambiguidade proposta: média.
- Justificativa: mantém a tristeza no centro e apresenta a culpa como cobrança dirigida a si, sem aumentar culpabilização.
- Coocorrências no acervo: 2.

### 7. Falta de propósito + Esperança

- Chave: `falta_de_proposito__esperanca`.
- Descrição: **Talvez a direção ainda não esteja clara, mas alguma possibilidade começa a parecer digna de atenção, mesmo sem oferecer certeza sobre o caminho inteiro.**
- Temas internos: `sentido`, `direcao`, `possibilidade`.
- Sinais existentes preferidos: temas `sentido`, `proposito`, `esperanca`, `continuidade`; funções `clarification`, `inquiry`, `contemplation`.
- Confiança proposta: alta.
- Ambiguidade proposta: baixa.
- Justificativa: mantém a ausência de direção no centro e limita a esperança a uma abertura discreta, sem promessa ou cobrança por superação.
- Coocorrências no acervo: 2.

### 8. Esperança + Falta de propósito

- Chave: `esperanca__falta_de_proposito`.
- Descrição: **Talvez exista uma abertura para continuar procurando, embora o sentido ainda não tenha tomado uma forma clara ou definitiva.**
- Temas internos: `possibilidade`, `continuidade`, `sentido`.
- Sinais existentes preferidos: temas `esperanca`, `continuidade`, `sentido`, `proposito`; funções `recognition`, `contemplation`, `inquiry`.
- Confiança proposta: alta.
- Ambiguidade proposta: baixa.
- Justificativa: mantém a possibilidade no centro e reconhece que ela pode existir antes de uma direção definida, sem converter esperança em otimismo obrigatório.
- Coocorrências no acervo: 2.

## Demais prioridades

### Prioridade B — coocorrência real, aguardando lotes futuros

Os 22 pares abaixo possuem uma coocorrência no acervo, mas não recebem descrição neste lote:

`amor__autoconhecimento`, `amor__solidao`, `ansiedade__confusao`, `ansiedade__falta_de_proposito`, `ansiedade__inseguranca`, `autoconhecimento__amor`, `confusao__ansiedade`, `confusao__medo`, `confusao__tristeza`, `esperanca__medo`, `esperanca__tristeza`, `falta_de_proposito__ansiedade`, `inseguranca__ansiedade`, `luto__medo`, `luto__solidao`, `medo__confusao`, `medo__esperanca`, `medo__luto`, `solidao__amor`, `solidao__luto`, `tristeza__confusao`, `tristeza__esperanca`.

### Prioridade C — sem coocorrência no acervo

Os 131 pares restantes não têm conteúdo associado simultaneamente aos dois sentimentos. Eles devem continuar usando fallback cauteloso até existir evidência editorial para priorizá-los.

### Tríades

Das 1.092 tríades direcionais possíveis, uma possui perfil exato e 1.091 não possuem. Elas continuam usando o par direcional disponível com modificador do segundo sentimento ou o fallback do principal. Nenhuma descrição de tríade foi gerada nesta fase.

## Inventário completo de linha de base dos 161 pares sem perfil

Este inventário registra o estado anterior à ativação do lote. Depois da aprovação, os oito pares da prioridade A passaram a ter perfil específico: restaram 153 pares sem perfil, sendo 22 com uma coocorrência e 131 sem coocorrência.

- `ansiedade` (12): `amor`, `saudade`, `esperanca`, `solidao`, `autoconhecimento`, `confusao`, `inseguranca`, `raiva`, `culpa`, `luto`, `tristeza`, `falta_de_proposito`
- `medo` (11): `saudade`, `esperanca`, `solidao`, `autoconhecimento`, `confusao`, `inseguranca`, `raiva`, `culpa`, `luto`, `tristeza`, `falta_de_proposito`
- `amor` (11): `ansiedade`, `esperanca`, `solidao`, `autoconhecimento`, `confusao`, `inseguranca`, `raiva`, `culpa`, `luto`, `tristeza`, `falta_de_proposito`
- `saudade` (11): `ansiedade`, `medo`, `esperanca`, `solidao`, `autoconhecimento`, `confusao`, `inseguranca`, `raiva`, `culpa`, `tristeza`, `falta_de_proposito`
- `esperanca` (12): `ansiedade`, `medo`, `amor`, `saudade`, `solidao`, `autoconhecimento`, `confusao`, `inseguranca`, `raiva`, `culpa`, `tristeza`, `falta_de_proposito`
- `solidao` (12): `ansiedade`, `medo`, `amor`, `saudade`, `esperanca`, `autoconhecimento`, `confusao`, `inseguranca`, `raiva`, `culpa`, `luto`, `falta_de_proposito`
- `autoconhecimento` (11): `ansiedade`, `medo`, `amor`, `saudade`, `esperanca`, `solidao`, `raiva`, `culpa`, `luto`, `tristeza`, `falta_de_proposito`
- `confusao` (11): `ansiedade`, `medo`, `amor`, `saudade`, `esperanca`, `solidao`, `inseguranca`, `raiva`, `culpa`, `luto`, `tristeza`
- `inseguranca` (12): `ansiedade`, `medo`, `amor`, `saudade`, `esperanca`, `solidao`, `confusao`, `raiva`, `culpa`, `luto`, `tristeza`, `falta_de_proposito`
- `raiva` (12): `ansiedade`, `medo`, `amor`, `saudade`, `esperanca`, `solidao`, `autoconhecimento`, `confusao`, `inseguranca`, `luto`, `tristeza`, `falta_de_proposito`
- `culpa` (12): `ansiedade`, `medo`, `amor`, `saudade`, `esperanca`, `solidao`, `autoconhecimento`, `confusao`, `inseguranca`, `luto`, `tristeza`, `falta_de_proposito`
- `luto` (11): `ansiedade`, `medo`, `amor`, `solidao`, `autoconhecimento`, `confusao`, `inseguranca`, `raiva`, `culpa`, `tristeza`, `falta_de_proposito`
- `tristeza` (12): `ansiedade`, `medo`, `amor`, `saudade`, `esperanca`, `autoconhecimento`, `confusao`, `inseguranca`, `raiva`, `culpa`, `luto`, `falta_de_proposito`
- `falta_de_proposito` (11): `ansiedade`, `medo`, `amor`, `saudade`, `esperanca`, `solidao`, `autoconhecimento`, `raiva`, `culpa`, `luto`, `tristeza`

## Controle de ativação e desativação

O resolvedor atual aceita os estados `proposed`, `reviewed` e `disabled`. Por padrão, somente `reviewed` é apresentado e influencia o desempate. Assim, uma síntese pode ser desativada alterando apenas seu status para `disabled`, sem modificar o motor.

Após a aprovação, a ativação foi realizada em uma alteração separada e mínima:

1. os oito registros foram inseridos no catálogo como `reviewed`;
2. a versão do catálogo foi atualizada para `1.1.0`;
3. cada registro recebeu autoria da proposta, revisor humano, data, versão, fonte e justificativa;
4. as duas direções, o fallback e a possibilidade de `disabled` receberam testes;
5. a suíte integral foi executada antes de qualquer avanço para a Fase 11.
