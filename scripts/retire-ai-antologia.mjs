import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const masterPath = path.join(rootDir, 'entre_sabios_acervo_mestre_final.json');
const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const reviewDate = '2026-07-18';

const targetIds = Object.freeze([
  'ANT-TRI-001', 'ANT-TRI-002', 'ANT-TRI-003', 'ANT-TRI-004', 'ANT-TRI-005', 'ANT-TRI-006', 'ANT-TRI-007',
  'ANT-MICRO-TRI-001',
  'ANT-INS-001', 'ANT-INS-002', 'ANT-INS-003', 'ANT-INS-004', 'ANT-INS-005', 'ANT-INS-006',
  'ANT-CON-001', 'ANT-CON-002', 'ANT-CON-003',
  'ANT-PRO-001', 'ANT-PRO-002', 'ANT-MICRO-PRO-001',
  'ANT-LUT-001', 'ANT-LUT-002', 'ANT-LUT-003', 'ANT-LUT-004', 'ANT-LUT-005',
  'ANT-SOL-001', 'ANT-SOL-002', 'ANT-SOL-003',
]);

const byId = new Map(master.contents.map((content) => [content.id, content]));
const changed = [];

for (const id of targetIds) {
  const content = byId.get(id);
  if (!content) throw new Error(`Conteúdo da Antologia ausente: ${id}`);
  if (content.originalCollection !== 'antologia_do_silencio.pdf') {
    throw new Error(`${id}: coleção original inesperada (${content.originalCollection})`);
  }
  if (content.status === 'REMOVIDO' && content.publicationEnabled === false) continue;
  if (!content.publicationEnabled) throw new Error(`${id}: estado não publicável inesperado (${content.status})`);

  content.previousValues = {
    ...(content.previousValues || {}),
    statusBeforeRemoval: content.status,
    publicationEnabledBeforeRemoval: content.publicationEnabled,
    placementBeforeRemoval: content.placement,
    associationsBeforeRemoval: content.associations,
    primaryFeelingBeforeRemoval: content.primaryFeeling,
    secondaryFeelingBeforeRemoval: content.secondaryFeeling,
    attributionBeforeRemoval: {
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
  content.changeType = 'ai_generated_provenance_removal';
  content.changeReason = 'Retirado do acervo ativo após confirmação do editor-chefe de que a Antologia do Silêncio foi integralmente gerada por IA. ID, texto e metadados anteriores preservados no mestre; nenhuma adaptação recente ou conteúdo baseado em autor foi abrangido.';
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

master.contentVersion = 'definitiva-2.2';
master.generatedAt = '2026-07-18T18:00:00-03:00';
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
    action: 'removed_from_active_ai_generated',
    reason: 'Editor-chefe confirmou que a Antologia do Silêncio foi integralmente gerada por IA; registro histórico preservado.',
  });
}

fs.writeFileSync(masterPath, `${JSON.stringify(master, null, 2)}\n`, 'utf8');
console.info(`Antologia retirada do acervo ativo: ${changed.length} alteração(ões), ${targetIds.length} IDs preservados no histórico.`);
