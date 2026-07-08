# Instruções para futuro agente de IA: recomendações por preferência coletiva

Objetivo: mostrar menos frases que usuários com sentimentos parecidos rejeitam e mostrar mais frases que usuários parecidos gostam, sem personalizar de forma invasiva.

## Regras de autoria das frases

- Use `quoteType: 'exact'` somente quando a frase for realmente verificável como frase do autor.
- Use `quoteType: 'inspired'` quando for paráfrase, adaptação, leitura editorial ou atribuição comum sem fonte segura.
- Use `quoteType: 'unknown'` ou `quoteType: 'anonymous'` quando a autoria não for conhecida; nesse caso, não atribua a frase a uma pessoa.
- O site deve exibir:
  - `Autor` para `exact`;
  - `Ideia inspirada em Autor` para `inspired`;
  - `Reflexão contemporânea` para `unknown`, `anonymous` ou sem autor confiável.

## Aprendizado coletivo recomendado

Cada feedback deve ser salvo como evento agregado, não como perfil pessoal identificável.

Campos úteis:

- `storyKey`: identificador estável da frase.
- `feedback`: `1` para gostei, `-1` para não gostei.
- `feelingIds`: sentimentos selecionados pelo usuário.
- `intensity`: intensidade escolhida.
- `themes`: temas da frase.
- `author`: autor exibido.
- `quoteType`: `exact`, `inspired`, `unknown` ou `anonymous`.
- `createdAt`: data do evento.

## Como calcular peso coletivo

Para cada frase, calcular pontuação por contexto emocional:

```text
contextKey = sentimentos ordenados + intensidade
score = likes - dislikes
approvalRate = likes / (likes + dislikes)
```

Sugestão de uso:

- Se usuários com o mesmo `contextKey` deram muitos dislikes em uma frase, reduzir a chance dela aparecer para novos usuários com sentimentos parecidos.
- Se usuários com o mesmo `contextKey` deram muitos likes, aumentar a chance dela aparecer.
- Não remover totalmente uma frase por poucos dislikes; usar limite mínimo de eventos.

Exemplo de limites:

- Menos de 5 feedbacks: peso coletivo quase neutro.
- 5 a 20 feedbacks: aplicar peso leve.
- Mais de 20 feedbacks: aplicar peso normal.

## Fórmula simples de recomendação

```text
finalScore =
  selectionScore
  + personalPreferenceScore
  + collectiveContextScore
  - recentlySeenPenalty
```

Onde:

- `selectionScore`: compatibilidade original da frase com sentimentos/temas.
- `personalPreferenceScore`: gosto local do usuário atual, se existir.
- `collectiveContextScore`: reação agregada de usuários parecidos.
- `recentlySeenPenalty`: evita repetir sempre as mesmas frases.

## Cuidados importantes

- Não use nome, e-mail, IP ou identificadores pessoais para recomendação.
- Não deixe uma maioria apagar completamente frases profundas ou difíceis; às vezes uma frase desconfortável é valiosa.
- Para sentimentos intensos como luto, culpa e falta de propósito, reduza o peso de frases muito agressivas se houver rejeição coletiva.
- Para temas como `indiretas`, aplique moderação: frases cortantes podem agradar, mas não devem dominar a experiência.

## Comportamento desejado

- Usuários parecidos recebem frases que historicamente ajudaram pessoas em estado emocional semelhante.
- Frases rejeitadas por muitos usuários no mesmo contexto aparecem menos.
- Frases muito curtidas no mesmo contexto aparecem mais.
- O sistema continua diverso, evitando bolhas e repetição excessiva.

## Trajetória emocional já aplicada no front-end

O algoritmo local passou a considerar uma camada chamada trajetória emocional:

- Intensidade `moderada` ou `intensa`: estratégia de catarse. O sistema favorece frases mais profundas, validadoras ou confrontadoras, porque o usuário provavelmente precisa primeiro se sentir compreendido.
- Intensidade `fraca`: estratégia de transcendência. O sistema favorece frases com saída, ação consciente, aceitação, presente, esperança ou autoconhecimento.

Há regras específicas para:

- `confusão` intensa: caos como desconstrução.
- `culpa`: erro humano, finitude e reparação.
- `solidão` intensa: solidão como potência, não só falta.
- `falta_de_proposito`: criação de sentido e liberdade.

O botão `Outra perspectiva` também aplica um pequeno sinal local de rejeição silenciosa quando o usuário pula a frase em menos de 5 segundos. Isso não é coletivo ainda; apenas ajusta a preferência naquele navegador.

## Próxima etapa técnica

Para transformar isso em aprendizado coletivo real:

1. Criar uma API simples em Flask ou FastAPI.
2. Enviar eventos de feedback para o servidor.
3. Agregar pesos por `contextKey = sentimentos + intensidade`.
4. Retornar ao front-end pesos globais por frase.
5. Somar esses pesos ao `finalScore` local.
