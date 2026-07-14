import fs from 'node:fs';
import path from 'node:path';

export const EXPECTED = Object.freeze({
  schemaVersion: '1.1.0',
  contentVersion: 'definitiva-2.1',
  historical: 344,
  active: 283,
  removed: 60,
  moved: 1,
  nucleus: 64,
  contextual: 151,
  general: 68,
  pending: 20,
});

export const ACTIVE_STATUSES = new Set([
  'ATIVO_NUCLEO',
  'ATIVO_CONTEXTUAL',
  'ATIVO_GERAL',
  'ATIVO_REFERENCIA_PENDENTE',
]);

export const REQUIRED_INSECURITY_IDS = Object.freeze([
  'ANT-INS-001',
  'ANT-INS-002',
  'ANT-INS-003',
  'ANT-INS-004',
  'ANT-INS-005',
  'ANT-INS-006',
  'batch02-quote-040',
  'batch04-quote-038',
  'ES-INS-VERGONHA-001',
]);

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

export function isActive(content) {
  return content.publicationEnabled === true && ACTIVE_STATUSES.has(content.status);
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function countBy(items, selector) {
  return Object.fromEntries([...items.reduce((map, item) => {
    const key = selector(item);
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map())].sort(([a], [b]) => String(a).localeCompare(String(b), 'pt-BR')));
}

function duplicateValues(values) {
  const counts = countBy(values, (value) => value);
  return Object.entries(counts).filter(([, count]) => count > 1).map(([value]) => value);
}

export function calculateMasterTruth(master) {
  const contents = master.contents || [];
  const active = contents.filter(isActive);
  return {
    historical: contents.length,
    active: active.length,
    removed: contents.filter((content) => content.status === 'REMOVIDO').length,
    moved: contents.filter((content) => content.status === 'MOVER_PARA_TEXTOS').length,
    quarantine: contents.filter((content) => content.status === 'QUARENTENA_DOCUMENTAL').length,
    nucleus: active.filter((content) => content.placement === 'nucleo').length,
    contextual: active.filter((content) => content.placement === 'contextual').length,
    general: active.filter((content) => content.placement === 'geral').length,
    pending: active.filter((content) => content.status === 'ATIVO_REFERENCIA_PENDENTE').length,
    duplicateIds: duplicateValues(contents.map((content) => content.id)),
    duplicateActiveTexts: duplicateValues(active.map((content) => normalizeText(content.finalText))),
    activeWithNullPlacement: active.filter((content) => !content.placement).map((content) => content.id),
    activeWithEmptyIntensity: active.filter((content) => !content.suitableIntensities?.length).map((content) => content.id),
    activeWithNullGender: active.filter((content) => !content.authorGender).map((content) => content.id),
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function validateMaster(master) {
  const truth = calculateMasterTruth(master);
  assert(master.schemaVersion === EXPECTED.schemaVersion, `schemaVersion incompatível: ${master.schemaVersion}`);
  assert(master.contentVersion === EXPECTED.contentVersion, `contentVersion incompatível: ${master.contentVersion}`);
  for (const key of ['historical', 'active', 'removed', 'moved', 'nucleus', 'contextual', 'general', 'pending']) {
    assert(truth[key] === EXPECTED[key], `${key}: esperado ${EXPECTED[key]}, encontrado ${truth[key]}`);
  }
  assert(truth.quarantine === 0, `quarentena inesperada: ${truth.quarantine}`);
  assert(truth.duplicateIds.length === 0, `IDs duplicados: ${truth.duplicateIds.join(', ')}`);
  assert(truth.duplicateActiveTexts.length === 0, 'Existem textos ativos exatamente duplicados.');
  assert(truth.activeWithNullPlacement.length === 0, `Ativos sem placement: ${truth.activeWithNullPlacement.join(', ')}`);
  assert(truth.activeWithEmptyIntensity.length === 0, `Ativos sem intensidade: ${truth.activeWithEmptyIntensity.join(', ')}`);
  assert(truth.activeWithNullGender.length === 0, `Ativos sem gênero: ${truth.activeWithNullGender.join(', ')}`);
  assert(master.summary?.historicalTotal === truth.historical, 'Resumo histórico diverge dos registros.');
  assert(master.summary?.activeTotal === truth.active, 'Resumo de ativos diverge dos registros.');
  assert(master.summary?.activeByPlacement?.nucleo === truth.nucleus, 'Resumo de núcleos diverge dos registros.');
  assert(master.summary?.activeByPlacement?.contextual === truth.contextual, 'Resumo de contextuais diverge dos registros.');
  assert(master.summary?.activeByPlacement?.geral === truth.general, 'Resumo de gerais diverge dos registros.');
  const status = master.finalizationStatus || {};
  assert(status.literaryCurationFrozen === true, 'Curadoria literária não está congelada.');
  assert(status.structuralValidationPassed === true, 'Validação estrutural do mestre não foi aprovada.');
  assert(status.selectionSimulationPassed === true, 'Simulação editorial do mestre não foi aprovada.');
  assert(status.dataReadyForWebsiteIntegration === true, 'Mestre não está liberado para integração.');
  assert(status.websiteIntegrationVerified === false, 'Mestre não deve declarar a interface verificada antes da integração.');

  const active = master.contents.filter(isActive);
  const insecurity = active.filter((content) => content.associations?.some(
    (association) => association.feeling === 'inseguranca' && association.placement === 'nucleo',
  ));
  assert(insecurity.length === 9, `Insegurança deveria possuir 9 núcleos; possui ${insecurity.length}.`);
  for (const id of REQUIRED_INSECURITY_IDS) {
    const content = insecurity.find((item) => item.id === id);
    assert(content, `Núcleo obrigatório de Insegurança ausente: ${id}`);
    assert(content.publicationEnabled === true, `Núcleo de Insegurança não publicável: ${id}`);
    assert(content.suitableIntensities.includes('fraca'), `Núcleo de Insegurança incompatível com intensidade fraca: ${id}`);
  }
  return truth;
}

function compactContent(content) {
  return {
    id: content.id,
    finalText: content.finalText,
    displayType: content.displayType,
    attributionType: content.attributionType,
    author: content.author,
    displayedAuthor: content.displayedAuthor,
    inspirationSource: content.inspirationSource || null,
    primaryFeeling: content.primaryFeeling,
    secondaryFeeling: content.secondaryFeeling,
    associations: content.associations || [],
    placement: content.placement,
    editorialFunction: content.editorialFunction,
    secondaryFunction: content.secondaryFunction,
    suitableIntensities: content.suitableIntensities,
    tone: content.tone,
    themes: content.themes || [],
    riskTags: content.riskTags || [],
    hardExclusions: content.hardExclusions || [],
    status: content.status,
    publicationEnabled: true,
    filterGender: content.filterGender || content.authorGender || 'neutral',
    source: {
      title: content.source?.title || '',
      status: content.source?.status || '',
    },
  };
}

export function buildRuntime(master) {
  const truth = validateMaster(master);
  const feelings = master.catalog.feelings
    .filter((feeling) => feeling.selectable !== false)
    .map(({ id, label }) => ({ id, label }));
  const contents = master.contents.filter(isActive).map(compactContent).sort((a, b) => a.id.localeCompare(b.id, 'pt-BR'));
  const byFeeling = Object.fromEntries(feelings.map(({ id }) => [id, contents.filter((content) =>
    content.associations.some((association) => association.feeling === id)).length]));
  return {
    schemaVersion: master.schemaVersion,
    contentVersion: master.contentVersion,
    generatedFrom: 'entre_sabios_acervo_mestre_final.json',
    summary: {
      activeTotal: truth.active,
      nucleusTotal: truth.nucleus,
      contextualTotal: truth.contextual,
      generalTotal: truth.general,
      referencePendingTotal: truth.pending,
      byFeeling,
    },
    feelings,
    contents,
  };
}

export function serializeRuntime(runtime) {
  return `${JSON.stringify(runtime)}\n`;
}

export function serializeRuntimeScript(runtime) {
  return `(function exposeEntreSabiosRuntime(root) { root.EntreSabiosEmbeddedRuntime = ${JSON.stringify(runtime)}; })(typeof window !== 'undefined' ? window : globalThis);\n`;
}

export function buildFromFiles({ rootDir, write = true } = {}) {
  const masterPath = path.join(rootDir, 'entre_sabios_acervo_mestre_final.json');
  const runtimePath = path.join(rootDir, 'data', 'entre_sabios_runtime.json');
  const runtimeScriptPath = path.join(rootDir, 'data', 'entre_sabios_runtime.js');
  const master = readJson(masterPath);
  const runtime = buildRuntime(master);
  const serialized = serializeRuntime(runtime);
  const serializedScript = serializeRuntimeScript(runtime);
  if (write) {
    fs.mkdirSync(path.dirname(runtimePath), { recursive: true });
    fs.writeFileSync(runtimePath, serialized, 'utf8');
    fs.writeFileSync(runtimeScriptPath, serializedScript, 'utf8');
  }
  return { master, runtime, serialized, serializedScript, masterPath, runtimePath, runtimeScriptPath };
}
