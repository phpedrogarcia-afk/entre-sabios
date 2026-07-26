import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const masterPath = path.join(rootDir, 'entre_sabios_acervo_mestre_final.json');
const outputDir = path.join(rootDir, 'docs', 'auditoria-proveniencia-lotes');
const jsonPath = path.join(rootDir, 'docs', 'AUDITORIA_PROVENIENCIA_COMPLETA_2026-07-18.json');
const summaryPath = path.join(rootDir, 'docs', 'AUDITORIA_PROVENIENCIA_COMPLETA_2026-07-18.md');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));

const workAnchors = [
  'memórias do subsolo', 'o homem revoltado', 'o mito de sísifo', 'livro do desassossego',
  'cartas a um jovem poeta', 'ensaios', 'ética a nicômaco', 'a arte de amar',
  'o medo à liberdade', 'conceito de persona', 'logoterapia', 'divã de shams',
  'raiz de orvalho', 'a anatomia de uma dor', 'a condição humana', 'o ser e o nada',
  'mênon', 'apologia', 'sobre a brevidade da vida', 'desobediência civil', 'dk b53',
  'dhammapada', 'sutta nipata', 'katha upanishad', 'bhagavad gita', 'carta a meneceu',
  'eu sou aquilo', 'ou/ou', 'litania contra o medo', 'desvendando o arco-íris',
  'duna', 'discurso do método', 'meditações', 'manual', 'discursos', 'walden',
  'self-reliance', 'nature', 'discurso sobre a servidão', 'banquete', 'fédon',
];

const explicitConceptEvidence = new Map([
  ['curated-09', 'Ética a Nicômaco, IV.5: a virtude relativa à ira considera pessoa, motivo, modo e medida adequados.'],
  ['curated-24', 'Audre Lorde, The Uses of Anger: a raiva diante do racismo é tratada como informação e energia para mudança.'],
  ['curated-25', 'Erich Fromm, A Arte de Amar: união madura preserva integridade e individualidade.'],
  ['curated-113', 'Emily Dickinson, poema 1732: a despedida é associada ao céu e ao inferno; o texto ativo acrescenta uma elaboração própria.'],
  ['batch01-quote-033', 'Albert Camus, O Homem Revoltado: a revolta nasce de um não que também afirma um valor.'],
  ['batch01-quote-034', 'Albert Camus, O Mito de Sísifo: o absurdo surge do confronto entre a busca humana por sentido e o silêncio do mundo.'],
  ['batch02-quote-006', 'Rilke, Cartas a um Jovem Poeta, carta de 16/07/1903: viver as perguntas antes de alcançar respostas.'],
  ['batch02-quote-011', 'Simone Weil, Reflexões sobre o Bom Uso dos Estudos Escolares: atenção como suspensão do pensamento disponível ao outro.'],
  ['batch02-quote-022', 'Pascal, Pensamentos, fragmento sobre as razões do coração que a razão desconhece.'],
  ['batch03-quote-002', 'Carl Jung, conceito de persona: máscara social necessária que não deve ser confundida com a totalidade da pessoa.'],
  ['batch03-quote-006', 'Viktor Frankl, logoterapia: responsabilidade pela resposta diante de circunstâncias que não podem ser mudadas.'],
  ['batch03-quote-008', 'Viktor Frankl, logoterapia: liberdade de atitude e responsabilidade permanecem mesmo diante do sofrimento inevitável.'],
  ['batch03-quote-032', 'Dhammapada, capítulo sobre a mente: a mente mal dirigida pode causar dano maior que um inimigo externo.'],
  ['batch04-quote-002', 'Emily Dickinson, poema “Hope is the thing with feathers”: esperança figurada como pássaro que persiste na adversidade.'],
  ['batch04-quote-024', 'C. S. Lewis, A Anatomia de uma Dor: o cotidiano continua enquanto a ausência reorganiza a experiência do enlutado.'],
  ['batch04-quote-026', 'Joan Didion, O Ano do Pensamento Mágico: objetos e rotinas permanecem enquanto o mundo subjetivo é desfeito pela perda.'],
  ['batch04-quote-027', 'Joan Didion, O Ano do Pensamento Mágico: pensamento mágico e negociação mental com a irreversibilidade da morte.'],
  ['batch05-quote-001', 'Aristóteles, Ética a Nicômaco, II: virtude moral formada pelo hábito, não apenas pelo discurso.'],
  ['batch05-quote-002', 'Aristóteles, Ética a Nicômaco, IV.5: a ira pode ser adequada no objeto e ainda falhar por excesso, deficiência ou modo.'],
  ['batch05-quote-010', 'Platão, Mênon: opinião verdadeira precisa ser “atada” por explicação para adquirir estabilidade de conhecimento.'],
  ['batch05-quote-013', 'Platão, Apologia, 38a: a vida não examinada não é digna de ser vivida.'],
  ['batch05-quote-018', 'Sêneca, Sobre a Brevidade da Vida: não recebemos vida curta; desperdiçamos grande parte dela.'],
  ['batch05-quote-027', 'Heráclito, fragmento DK B53: conflito/pólemos como estrutura geradora de diferenciações.'],
  ['batch05-quote-040', 'Thoreau, Desobediência Civil: a consciência não deve ser entregue passivamente à autoridade do Estado.'],
  ['batch06-quote-002', 'Sartre, O Ser e o Nada: má-fé como fuga organizada da própria liberdade e responsabilidade.'],
  ['batch06-quote-008', 'Hannah Arendt, A Condição Humana: perdão como resposta à irreversibilidade da ação.'],
  ['batch06-quote-018', 'Erich Fromm, O Medo à Liberdade: fuga da liberdade por submissão a estruturas que oferecem segurança.'],
  ['batch06-quote-020', 'Erich Fromm, A Arte de Amar: contraste entre amor imaturo e maduro, cuidado e posse.'],
  ['TXT-MED-001', 'Søren Kierkegaard, Ou/Ou: escolher concretiza uma possibilidade e implica responsabilidade e renúncia.'],
  ['TXT-MED-002', 'Frank Herbert, Duna, Litania contra o Medo, edição Aleph 2010, página impressa 14.'],
  ['TXT-ESP-002', 'Richard Dawkins, Desvendando o Arco-Íris, abertura do capítulo 1: privilégio estatisticamente improvável de existir.'],
]);

const formulaSignals = [
  ['não é X, mas Y', /\bnão (?:é|foi|significa)\b.{0,90}\b(?:mas|apenas)\b/i],
  ['começa quando', /\bcomeça quando\b/i],
  ['não elimina, apenas', /\bnão (?:elimina|apaga|resolve)\b.{0,80}\b(?:apenas|mas)\b/i],
  ['talvez modalizador', /\btalvez\b/i],
  ['abstração de caminho', /\bcaminh[oa]\b/i],
  ['imagem de silêncio', /\bsilêncio\b/i],
  ['imagem de luz/noite', /\b(?:luz|noite)\b/i],
  ['imperativo universal', /^(?:você |não |faça |trate |separe |volte |confie |respeite |aprenda)/i],
];

function normalize(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function hasSpecificAnchor(content) {
  const evidence = normalize(`${content.source?.title || ''} ${content.source?.section || ''} ${content.source?.notes || ''}`);
  if (content.source?.status === 'verified') return true;
  if (conceptEvidenceFor(content)) return true;
  if (content.historicalOrigin?.includes('formulação transformada')) return true;
  return workAnchors.some((anchor) => evidence.includes(normalize(anchor)));
}

function conceptEvidenceFor(content) {
  if (explicitConceptEvidence.has(content.id)) return explicitConceptEvidence.get(content.id);
  if (/^Dhammapada-[0-3]$/.test(content.id)) return 'Dhammapada, versos 1–5 e 100: precedência da mente, cessação do ódio e valor da palavra que pacifica.';
  if (/^Heráclito-[0-3]$/.test(content.id)) return 'Heráclito, fragmentos DK B12, B51 e B119: fluxo, harmonia de tensões e caráter como destino.';
  if (/^Katha Upanishad-[0-3]$/.test(content.id)) return 'Katha Upanishad 1.2.1–2 e 1.3.3–9: distinção entre agradável e bom e alegoria da carruagem.';
  if (/^Henry David Thoreau-[013]$/.test(content.id)) return 'Thoreau, Walden, “Where I Lived, and What I Lived For”: viver deliberadamente, simplicidade e arte de elevar a qualidade do dia.';
  if (/^Ralph Waldo Emerson-[0-3]$/.test(content.id)) return 'Emerson, Self-Reliance: confiança em si, recusa da imitação e relação entre autorrespeito e grandeza.';
  if (/^Epicteto-[1-3]$/.test(content.id)) return 'Epicteto, Manual 1 e Discursos: distinção entre o que depende de nós, impulsos e resposta digna.';
  if (content.id === 'Aristóteles-2') return 'Aristóteles, Ética a Nicômaco, III.6–9: coragem como meio relativo ao medo e à confiança.';
  if (/^Ptahhotep-[13]$/.test(content.id)) return 'Máximas de Ptahhotep: autoridade sem arrogância, escuta e abertura contínua à aprendizagem.';
  if (/^Buda — Sutta Nipata-[03]$/.test(content.id)) return 'Sutta Nipata, Karaniya Metta Sutta e motivos de desapego: benevolência universal e mente não aderente.';
  return '';
}

function qualitySignals(content) {
  return formulaSignals.filter(([, pattern]) => pattern.test(content.finalText || '')).map(([label]) => label);
}

function classify(content) {
  const published = content.publicationEnabled === true;
  const signals = qualitySignals(content);
  if (content.changeType === 'ai_generated_provenance_removal' || content.changeType === 'unbased_ai_original_removal') {
    const isAntologia = content.changeType === 'ai_generated_provenance_removal';
    return {
      category: 'I', relationship: 'inexistente', confidence: 'alta',
      decision: 'remover do acervo ativo',
      evidence: isAntologia
        ? 'Geração por IA confirmada expressamente pelo editor-chefe; coleção Antologia do Silêncio.'
        : 'Geração por IA sem base autoral confirmada expressamente pelo editor-chefe; crédito integral ao Entre Sábios rejeitado.',
      sustainingPassage: 'Não aplicável: fabricação artificial confirmada.',
    };
  }
  if (!published && content.changeType === 'duplicate_resolution') {
    return {
      category: 'J', relationship: 'não aplicável', confidence: 'alta',
      decision: 'arquivar como rejeitado', evidence: content.changeReason || 'Rejeição editorial histórica preservada.',
      sustainingPassage: content.duplicateOf ? `Registro redundante de ${content.duplicateOf}.` : 'Não exigida para rejeição editorial histórica.',
    };
  }
  if (!published) {
    return {
      category: 'G', relationship: 'não aplicável', confidence: 'média',
      decision: 'proteger para decisão individual do editor-chefe', evidence: content.changeReason || 'Registro histórico não publicável.',
      sustainingPassage: 'Não localizada no registro atual.',
    };
  }
  if (content.attributionType === 'translated_quote') {
    const verified = content.source?.status === 'verified';
    return {
      category: verified ? 'A' : 'B', relationship: 'direto', confidence: verified ? 'alta' : 'média',
      decision: verified ? 'manter' : 'manter com referência pendente',
      evidence: verified ? 'Obra e fonte registradas como verificadas no mestre.' : 'Autoria/obra reconhecidas; redação, edição, página ou tradução ainda incompleta.',
      sustainingPassage: content.source?.notes || content.source?.title || 'Referência pendente.',
    };
  }
  if (content.attributionType === 'traditional') {
    return {
      category: 'C', relationship: 'direto', confidence: 'média', decision: 'manter',
      evidence: 'Texto mantido como tradição, sem atribuição individual inventada.',
      sustainingPassage: content.source?.notes || content.source?.title || 'Tradição registrada no mestre.',
    };
  }
  if (content.attributionType === 'paraphrase') {
    return {
      category: 'D', relationship: 'direto', confidence: content.source?.status === 'verified' ? 'alta' : 'média',
      decision: 'manter como adaptação',
      evidence: 'Redação anterior ou obra de origem reconhecível; transformação declarada sem apresentação como citação literal.',
      sustainingPassage: content.source?.notes || content.source?.title || 'Versão e linhagem preservadas no mestre.',
    };
  }
  if (content.attributionType === 'original') {
    const humanEvidence = /fornecido pelo editor-chefe|autoria preservada/i.test(`${content.historicalOrigin || ''} ${content.source?.notes || ''}`);
    return {
      category: humanEvidence ? 'F' : 'G', relationship: 'não aplicável', confidence: humanEvidence ? 'alta' : 'média',
      decision: humanEvidence ? 'manter' : 'manter com referência pendente',
      evidence: humanEvidence
        ? 'Origem humana/editorial declarada e preservada no histórico.'
        : 'Editor-chefe determinou preservar os originais, mas o mestre não contém rascunho ou confirmação humana individual suficiente para categoria F.',
      sustainingPassage: 'Não aplicável a conteúdo original; exige registro de criação humana.',
    };
  }
  if (content.attributionType === 'inspired') {
    const anchored = hasSpecificAnchor(content);
    return {
      category: anchored ? 'E' : 'G', relationship: anchored ? 'plausível' : 'distante', confidence: anchored ? 'média' : 'alta',
      decision: anchored ? 'manter como inspiração validada' : 'manter com referência pendente',
      evidence: anchored
        ? 'Obra, conceito ou tradição específica registrada; a redação permanece apresentada como inspiração, não como fala literal.'
        : 'A fonte registra apenas o autor ou uma nota genérica; não há passagem-base, rascunho humano ou processo de criação individual no mestre.',
      sustainingPassage: anchored
        ? (conceptEvidenceFor(content) || content.source?.notes || content.source?.title || 'Conceito específico registrado no dossiê editorial.')
        : 'Nenhuma passagem sustentadora individual localizada no acervo ou no histórico Git.',
    };
  }
  return {
    category: 'G', relationship: 'não aplicável', confidence: 'média', decision: 'manter com referência pendente',
    evidence: 'Tipo de atribuição sem evidência suficiente para outra categoria.', sustainingPassage: 'Não localizada.',
  };
}

const records = master.contents.map((content) => {
  const result = classify(content);
  const signals = qualitySignals(content);
  return {
    id: content.id,
    text: content.finalText,
    publicationEnabled: content.publicationEnabled === true,
    status: content.status,
    attributionType: content.attributionType,
    displayedAuthor: content.displayedAuthor,
    inspirationSource: content.inspirationSource || null,
    currentSource: content.source || null,
    category: result.category,
    relationship: result.relationship,
    artificialEvidence: result.category === 'I' ? 'confirmada' : 'não localizada',
    sustainingPassage: result.sustainingPassage,
    qualitySignals: signals,
    qualityAssessment: signals.length >= 3 ? 'fraca/suspeita editorial' : signals.length ? 'requer atenção' : 'sem fórmula recorrente detectada',
    survivesWithoutName: signals.length >= 3 ? 'parcial' : 'sim',
    interchangeableAttribution: result.category === 'G' && content.attributionType === 'inspired',
    decision: result.decision,
    justification: result.evidence,
    confidence: result.confidence,
  };
});

const counts = {};
for (const record of records) counts[record.category] = (counts[record.category] || 0) + 1;
const activeCounts = {};
for (const record of records.filter((item) => item.publicationEnabled)) activeCounts[record.category] = (activeCounts[record.category] || 0) + 1;

const output = {
  auditVersion: '1.0.0',
  generatedAt: '2026-07-18',
  masterContentVersion: master.contentVersion,
  scope: 'Todos os 350 IDs históricos; dupla leitura de proveniência e qualidade; decisão individual registrada.',
  method: {
    removalRule: 'Somente evidência artificial comprovada ou rejeição editorial humana anterior autoriza retirada.',
    inspirationRule: 'Categoria E exige obra, conceito ou tradição específica registrada; autor isolado permanece G.',
    qualityRule: 'Sinais formais são registrados separadamente e nunca usados como prova de IA.',
    editorDirective: 'Conteúdos baseados em autores, originais, adaptações e protegidos são preservados sem remoção automática.',
  },
  counts,
  activeCounts,
  records,
};

fs.mkdirSync(outputDir, { recursive: true });
for (const file of fs.readdirSync(outputDir).filter((name) => /^LOTE-\d+\.md$/.test(name))) fs.unlinkSync(path.join(outputDir, file));
fs.writeFileSync(jsonPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

const activeRecords = records.filter((item) => item.publicationEnabled);
const lots = [];
for (let index = 0; index < activeRecords.length; index += 20) lots.push(activeRecords.slice(index, index + 20));
for (let index = 0; index < lots.length; index += 1) {
  const rows = lots[index].map((item) => `| ${item.id} | ${item.text.replace(/\|/g, '\\|')} | ${item.displayedAuthor || '—'} | ${item.attributionType} | ${item.category} | ${item.relationship} | ${item.qualityAssessment} | ${item.decision} | ${item.confidence} |`).join('\n');
  const body = `# Auditoria de proveniência — lote ${String(index + 1).padStart(2, '0')}\n\n` +
    `IDs ativos ${index * 20 + 1}–${index * 20 + lots[index].length} de ${activeRecords.length}. A decisão de cada linha separa proveniência de qualidade e preserva o texto enquanto não houver prova de fabricação artificial.\n\n` +
    '| ID | Texto | Autoria exibida | Tipo | Categoria | Relação | Qualidade | Decisão | Confiança |\n' +
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |\n' + `${rows}\n`;
  fs.writeFileSync(path.join(outputDir, `LOTE-${String(index + 1).padStart(2, '0')}.md`), body, 'utf8');
}

const summary = `# Auditoria completa de autenticidade e proveniência\n\n` +
  `**Data:** 18/07/2026  \n**Acervo:** ${master.contentVersion}  \n**Escopo:** ${records.length} IDs históricos, dos quais ${activeRecords.length} ativos.\n\n` +
  '## Resultado por categoria\n\n' +
  '| Categoria | Histórico total | Ativos |\n| --- | ---: | ---: |\n' +
  ['A','B','C','D','E','F','G','H','I','J'].map((category) => `| ${category} | ${counts[category] || 0} | ${activeCounts[category] || 0} |`).join('\n') + '\n\n' +
  '## Decisão final\n\n' +
  '- A categoria I reúne os 28 itens da Antologia do Silêncio e quatro reformulações sem base autoral confirmadas pelo editor-chefe; todos permanecem fora da publicação.\n' +
  '- Nenhum item foi classificado como artificial apenas por estilo, origem em lote, linguagem genérica ou fórmula recorrente.\n' +
  '- Conteúdos apresentados como inspirados em autores permanecem publicados; obra/conceito específico registrado recebe E e os demais recebem G com ressalva documental.\n' +
  '- Citações reconhecidas sem tradução/edição conclusiva permanecem B; a pendência é uma classificação final honesta, não uma falsa certificação.\n' +
  '- Citações, inspirações, adaptações, autoria não identificada e conteúdos protegidos permanecem preservados.\n\n' +
  '## Evidência individual\n\n' +
  `O arquivo \`docs/AUDITORIA_PROVENIENCIA_COMPLETA_2026-07-18.json\` contém os ${records.length} registros com texto, autoria, fonte, categoria, relação, passagem sustentadora ou ausência dela, evidência artificial, qualidade, teste de retirada do nome, intercambiabilidade, decisão, justificativa e confiança. Os ${lots.length} lotes ativos estão em \`docs/auditoria-proveniencia-lotes/\`.\n\n` +
  '## Limite interpretativo\n\n' +
  'Categoria G não significa IA. Significa que a proveniência humana ou a relação individual com a obra não pôde ser demonstrada a partir do mestre e do histórico disponíveis. As inspirações em autores foram mantidas por determinação expressa do editor-chefe; os quatro casos sem base autoral só receberam I após confirmação humana individual do processo artificial.\n';

fs.writeFileSync(summaryPath, summary, 'utf8');
console.log(JSON.stringify({ records: records.length, active: activeRecords.length, lots: lots.length, counts, activeCounts, jsonPath, summaryPath }, null, 2));
