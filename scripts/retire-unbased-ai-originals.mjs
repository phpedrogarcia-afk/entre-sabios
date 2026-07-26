import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const masterPath = path.join(rootDir, 'entre_sabios_acervo_mestre_final.json');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const reviewDate = '2026-07-18';

const targetIds = Object.freeze([
  'Reflexão contemporânea-1',
  'Reflexão contemporânea-2',
  'ES-INS-VERGONHA-001',
  'Reflexão contemporânea-4',
]);

const byId = new Map(master.contents.map((content) => [content.id, content]));
const changed = [];

for (const id of targetIds) {
  const content = byId.get(id);
  if (!content) throw new Error(`Conteúdo sem base autoral ausente: ${id}`);
  if (content.status === 'REMOVIDO' && content.publicationEnabled === false) continue;
  if (!content.publicationEnabled) throw new Error(`${id}: estado não publicável inesperado (${content.status})`);
  if (content.displayedAuthor !== 'Entre Sábios' || content.attributionType !== 'original') {
    throw new Error(`${id}: atribuição inesperada (${content.displayedAuthor}; ${content.attributionType})`);
  }
  if (content.inspirationSource) throw new Error(`${id}: inspiração autoral não pode ser abrangida`);

  content.previousValues = {
    ...(content.previousValues || {}),
    statusBeforeUnbasedAiRemoval: content.status,
    publicationEnabledBeforeUnbasedAiRemoval: content.publicationEnabled,
    placementBeforeUnbasedAiRemoval: content.placement,
    associationsBeforeUnbasedAiRemoval: content.associations,
    primaryFeelingBeforeUnbasedAiRemoval: content.primaryFeeling,
    secondaryFeelingBeforeUnbasedAiRemoval: content.secondaryFeeling,
    attributionBeforeUnbasedAiRemoval: {
      attributionType: content.attributionType,
      author: content.author,
      displayedAuthor: content.displayedAuthor,
      inspirationSource: content.inspirationSource,
      source: content.source,
    },
  };
  content.status = 'REMOVIDO';
  content.publicationEnabled = false;
  content.placement = null;
  content.associations = [];
  content.primaryFeeling = null;
  content.secondaryFeeling = null;
  content.changeType = 'unbased_ai_original_removal';
  content.changeReason = 'Retirado do acervo ativo após confirmação do editor-chefe de que a formulação foi criada por IA sem base autoral e recebeu indevidamente autoria integral do Entre Sábios. ID, texto, texto-base e metadados anteriores permanecem preservados; conteúdos inspirados em autores não são abrangidos.';
  content.humanReviewRequired = false;
  content.lastReviewedAt = reviewDate;
  changed.push(id);
}

const activeStatuses = new Set(['ATIVO_NUCLEO', 'ATIVO_CONTEXTUAL', 'ATIVO_GERAL', 'ATIVO_REFERENCIA_PENDENTE']);
const active = master.contents.filter((content) => content.publicationEnabled === true && activeStatuses.has(content.status));
const countBy = (items, selector) => Object.fromEntries(items.reduce((counts, item) => {
  const key = selector(item);
  counts.set(key, (counts.get(key) || 0) + 1);
  return counts;
}, new Map()));

const feelings = master.catalog.feelings.map((feeling) => feeling.id);
const activeByAssociation = Object.fromEntries(feelings.map((feeling) => [feeling,
  active.filter((content) => content.associations.some((association) => association.feeling === feeling)).length,
]));
const coverageByFeeling = Object.fromEntries(feelings.map((feeling) => {
  const associated = active.filter((content) => content.associations.some((association) => association.feeling === feeling));
  const nucleus = associated.filter((content) => content.associations.some(
    (association) => association.feeling === feeling && association.placement === 'nucleo',
  )).length;
  const contextual = associated.filter((content) => content.associations.some(
    (association) => association.feeling === feeling && association.placement === 'contextual',
  )).length;
  return [feeling, {
    nucleo: nucleus,
    contextual,
    totalAssociations: associated.length,
    eligibleByIntensity: Object.fromEntries(master.catalog.intensities.map((intensity) => [
      intensity.id,
      associated.filter((content) => content.suitableIntensities.includes(intensity.id)).length,
    ])),
  }];
}));

master.contentVersion = 'definitiva-2.3';
master.generatedAt = '2026-07-18T19:00:00-03:00';
master.summary = {
  ...master.summary,
  historicalTotal: master.contents.length,
  activeTotal: active.length,
  removedTotal: master.contents.filter((content) => content.status === 'REMOVIDO').length,
  movedToTextsTotal: master.contents.filter((content) => content.status === 'MOVER_PARA_TEXTOS').length,
  quarantineTotal: master.contents.filter((content) => content.status === 'QUARENTENA_DOCUMENTAL').length,
  referencePendingTotal: active.filter((content) => content.status === 'ATIVO_REFERENCIA_PENDENTE').length,
  activeByPlacement: countBy(active, (content) => content.placement),
  activeByFormat: countBy(active, (content) => content.displayType),
  activeByAttributionType: countBy(active, (content) => content.attributionType),
  activeByAuthor: countBy(active, (content) => content.displayedAuthor),
  activeByTone: countBy(active, (content) => content.tone),
  activeByEditorialFunction: countBy(active, (content) => content.editorialFunction),
  activeByIntensityCombination: countBy(active, (content) => content.suitableIntensities.join('+')),
  activeByPrimaryFeeling: Object.fromEntries(feelings.map((feeling) => [
    feeling,
    active.filter((content) => content.primaryFeeling === feeling).length,
  ])),
  activeByAssociation,
  coverageByFeeling,
  coverageAlerts: {
    lowNucleusCoverage: feelings.filter((feeling) => coverageByFeeling[feeling].nucleo <= 3),
    moderateNucleusCoverage: feelings.filter((feeling) => coverageByFeeling[feeling].nucleo >= 4 && coverageByFeeling[feeling].nucleo <= 5),
    healthyNucleusCoverage: feelings.filter((feeling) => coverageByFeeling[feeling].nucleo >= 6),
  },
};
master.finalizationSummary = structuredClone(master.summary);

for (const id of changed) {
  master.changeLog.push({
    date: reviewDate,
    contentId: id,
    action: 'removed_from_active_unbased_ai_original',
    reason: 'Editor-chefe confirmou criação por IA sem base autoral e rejeitou o crédito integral ao Entre Sábios; inspirações em autores permanecem preservadas.',
  });
}

fs.writeFileSync(masterPath, `${JSON.stringify(master, null, 2)}\n`, 'utf8');
console.info(`Originais artificiais sem base retirados: ${changed.length} alteração(ões), ${targetIds.length} IDs preservados no histórico.`);
