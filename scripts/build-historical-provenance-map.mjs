import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const masterRelative = 'entre_sabios_acervo_mestre_final.json';
const auditRelative = 'docs/AUDITORIA_PROVENIENCIA_COMPLETA_2026-07-18.json';
const nucleusRelative = 'NUCLEO_PRESERVACAO_EDITORIAL.md';
const patchRelative = 'curadoria-rigida-3.1/0001-Integra-curadoria-r-gida-de-microtextos.patch';
const jsonRelative = 'docs/INVENTARIO_HISTORICO_MAPA_PROVENIENCIA_2026-07-22.json';
const markdownRelative = 'docs/INVENTARIO_HISTORICO_MAPA_PROVENIENCIA_2026-07-22.md';
const checkOnly = process.argv.includes('--check');
const inventoryCutoff = '2026-07-23T00:00:00Z';
const inventoryBranch = 'agent/finaliza-loop-estabilizacao';
const inventoryCommit = '7876aa46f264a327442aa01e6f169ea333ac6ddf';

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function stableCounts(values) {
  const counts = {};
  for (const value of values) {
    const key = value === null || value === undefined || value === '' ? '(ausente)' : String(value);
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right, 'pt-BR')));
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function changedFields(before, after) {
  if (!before) return ['entrada posterior à linha de base Git localizada'];
  const fields = [
    ['texto', before.finalText, after.finalText],
    ['autoria exibida', before.displayedAuthor, after.displayedAuthor],
    ['atribuição', before.attributionType, after.attributionType],
    ['fonte', JSON.stringify(before.source || null), JSON.stringify(after.source || null)],
    ['tipo', before.displayType, after.displayType],
    ['status', before.status, after.status],
    ['publicação', before.publicationEnabled === true, after.publicationEnabled === true],
    ['sentimentos', JSON.stringify(before.feelings || []), JSON.stringify(after.feelings || [])],
  ];
  return fields.filter(([, left, right]) => left !== right).map(([field]) => field);
}

function provisionalProvenance(record) {
  if (record.current.source?.status === 'verified') return 'P4 — origem documental parcialmente sustentada';
  if (record.current.source || record.current.inspirationSource) return 'P3 — origem documental alegada';
  if (record.lineage.baseline.present || record.provenance.evidenceLocations.length) return 'P2 — proveniência interna conhecida';
  return 'P1 — apenas presença atual conhecida';
}

function historicalStability(record, currentContent) {
  if (!record.current.publicationEnabled || record.current.status === 'REMOVIDO') return 'E5 — removido ou inativo';
  const changes = changedFields(record.lineage.baseline.present ? baselineById.get(record.id) : null, currentContent);
  if (changes.length === 0) return 'E1 — estável';
  if (record.lineage.changeLog.length || record.lineage.changeReason) return 'E2 — alterado de forma rastreável';
  return 'E3 — alterado sem justificativa individual localizada';
}

function listFiles(startRelative, matcher) {
  const start = path.join(rootDir, startRelative);
  if (!fs.existsSync(start)) return [];
  const result = [];
  const visit = (absolutePath) => {
    for (const entry of fs.readdirSync(absolutePath, { withFileTypes: true })) {
      const child = path.join(absolutePath, entry.name);
      if (entry.isDirectory()) visit(child);
      else {
        const relative = path.relative(rootDir, child).replaceAll('\\', '/');
        if (matcher(relative)) result.push(relative);
      }
    }
  };
  visit(start);
  return result.sort((left, right) => left.localeCompare(right, 'pt-BR'));
}

function gitHistory() {
  const output = execFileSync('git', [
  'log', '--all', `--before=${inventoryCutoff}`, '--format=%H%x09%ad%x09%an%x09%s', '--date=short', '--', masterRelative,
  ], { cwd: rootDir, encoding: 'utf8' }).trim();
  if (!output) return [];
  return output.split(/\r?\n/).map((line) => {
    const [commit, date, author, ...subject] = line.split('\t');
    return { commit, date, author, subject: subject.join('\t') };
  });
}

function gitMasterAt(commit) {
  try {
    return JSON.parse(execFileSync('git', ['show', `${commit}:${masterRelative}`], {
      cwd: rootDir,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    }));
  } catch {
    return null;
  }
}

function markdownTable(object) {
  return Object.entries(object).map(([key, value]) => `| ${key} | ${value} |`).join('\n');
}

function compactChangeEntries(value, contentId, source, trail = [], result = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => compactChangeEntries(entry, contentId, source, [...trail, index], result));
    return result;
  }
  if (!value || typeof value !== 'object') return result;
  if (value.contentId === contentId) {
    result.push({
      source,
      path: trail.join('.'),
      changeType: value.changeType || null,
      field: value.field || null,
      reason: typeof value.reason === 'string' ? value.reason : null,
      sourceDecision: typeof value.sourceDecision === 'string' ? value.sourceDecision : null,
    });
    return result;
  }
  for (const [key, child] of Object.entries(value)) {
    if (typeof child === 'object' && child !== null) compactChangeEntries(child, contentId, source, [...trail, key], result);
  }
  return result;
}

const masterText = read(masterRelative);
const master = JSON.parse(masterText);
const auditText = read(auditRelative);
const audit = JSON.parse(auditText);
const nucleusText = read(nucleusRelative);
const patchText = fs.existsSync(path.join(rootDir, patchRelative)) ? read(patchRelative) : '';
const runtimeJsonText = read('data/entre_sabios_runtime.json');
const runtimeJsText = read('data/entre_sabios_runtime.js');
const runtime = JSON.parse(runtimeJsonText);

const history = gitHistory();
const oldestMasterCommit = history.at(-1) || null;
const baselineMaster = oldestMasterCommit ? gitMasterAt(oldestMasterCommit.commit) : null;
const baselineById = new Map((baselineMaster?.contents || []).map((content) => [content.id, content]));
const auditById = new Map(audit.records.map((record) => [record.id, record]));
const currentIds = new Set(master.contents.map((content) => content.id));

if (master.contents.length !== 351) throw new Error(`Inventário exige 351 IDs históricos; encontrados ${master.contents.length}.`);
if (audit.records.length !== 351 || auditById.size !== 351) throw new Error('Dossiê A–J não cobre exatamente os 351 IDs históricos.');
if (runtime.contents.length !== 257) throw new Error(`Runtime esperado com 257 ativos; encontrados ${runtime.contents.length}.`);

const evidencePaths = [
  'AGENTS.md',
  'DECISIONS.md',
  'DOCUMENTACAO_ENTRE_SABIOS.md',
  'MATRIZ_AUTORIDADE_HISTORICOS.md',
  nucleusRelative,
  'PADRAO_EDITORIAL_ENTRE_SABIOS.md',
  'PROJECT_STATUS.md',
  'REGISTRO_PROBLEMAS_RECORRENTES.md',
  auditRelative,
  'docs/AUDITORIA_PROVENIENCIA_ACERVO_LOTE_01.md',
  'docs/AUDITORIA_PROVENIENCIA_COMPLETA_2026-07-18.md',
  'docs/ARQUIVO_REJEITADOS_ANTOLOGIA_IA.md',
  'docs/ARQUIVO_REJEITADOS_ORIGINAIS_IA_SEM_BASE.md',
  'docs/RESULTADO_PENEIRA_IA_ACERVO_2026-07-18.md',
  ...listFiles('docs/auditoria-proveniencia-lotes', (relative) => relative.endsWith('.md')),
  ...listFiles('js/data/quotes', (relative) => relative.endsWith('.js')),
  patchRelative,
].filter((relative, index, array) => array.indexOf(relative) === index && fs.existsSync(path.join(rootDir, relative)));

const evidence = evidencePaths.map((relative) => ({ relative, text: read(relative) }));
const protectedIds = new Set(
  [...nucleusText.matchAll(/\b(?:NP|TXT|batch)\-[A-Za-z0-9À-ÿ-]+\b/g)].map((match) => match[0]),
);
const patchIds = new Set(
  [...patchText.matchAll(/^\+.*?"id"\s*:\s*"([^"]+)"/gm)]
    .map((match) => match[1])
    .filter((id) => /^TXT-[A-Z]{3}-\d{3}$/.test(id)),
);

const records = master.contents.map((content) => {
  const auditRecord = auditById.get(content.id);
  if (!auditRecord) throw new Error(`ID sem registro no dossiê A–J: ${content.id}.`);
  const baseline = baselineById.get(content.id) || null;
  const evidenceLocations = evidence
    .filter((source) => source.text.includes(content.id))
    .map((source) => source.relative);
  const changeLog = [
    ...compactChangeEntries(master.changeLog, content.id, 'changeLog'),
    ...compactChangeEntries(master.priorChangeLog, content.id, 'priorChangeLog'),
  ];
  const firstKnownLayer = baseline
    ? `master Git ${oldestMasterCommit.commit.slice(0, 7)} (${oldestMasterCommit.date})`
    : evidenceLocations.some((relative) => relative.startsWith('js/data/quotes/'))
      ? 'base legada js/data/quotes'
      : patchIds.has(content.id)
        ? 'patch curadoria-rigida-3.1'
        : 'mestre local não consolidado no Git';
  const unresolved = [];
  if (auditRecord.category === 'B') unresolved.push('edição, página, redação ou tradução conclusiva');
  if (auditRecord.category === 'C') unresolved.push('autoria individual da tradição');
  if (auditRecord.category === 'D' && content.source?.status !== 'verified') unresolved.push('texto-base ou referência documental completa');
  if (auditRecord.category === 'G') unresolved.push('autoria humana ou vínculo individual com obra, passagem ou tradição');
  if (protectedIds.has(content.id)) unresolved.push('decisão individual do editor-chefe para alteração de proteção');
  return {
    id: content.id,
    textHash: sha256(content.finalText || ''),
    current: {
      publicationEnabled: content.publicationEnabled === true,
      status: content.status,
      displayType: content.displayType,
      attributionType: content.attributionType,
      displayedAuthor: content.displayedAuthor,
      inspirationSource: content.inspirationSource || null,
      source: content.source || null,
    },
    lineage: {
      legacyIds: content.legacyIds || [],
      derivedFromId: content.derivedFromId || null,
      duplicateOf: content.duplicateOf || null,
      historicalOrigin: content.historicalOrigin || null,
      originalCollection: content.originalCollection || null,
      changeType: content.changeType || null,
      changeReason: content.changeReason || null,
      previousValues: content.previousValues || null,
      changeLog,
      baseline: baseline ? {
        present: true,
        textHash: sha256(baseline.finalText || ''),
        status: baseline.status,
        publicationEnabled: baseline.publicationEnabled === true,
        attributionType: baseline.attributionType,
        displayedAuthor: baseline.displayedAuthor,
      } : { present: false },
    },
    provenance: {
      auditCategory: auditRecord.category,
      relationship: auditRecord.relationship,
      artificialEvidence: auditRecord.artificialEvidence,
      sustainingPassage: auditRecord.sustainingPassage,
      decisionAlreadyRecorded: auditRecord.decision,
      confidence: auditRecord.confidence,
      protected: protectedIds.has(content.id),
      firstKnownLayer,
      evidenceLocations,
      unresolved,
    },
  };
});

for (const record of records) {
  record.provenance.provisionalGrade = provisionalProvenance(record);
  record.provenance.historicalStability = historicalStability(
    record,
    master.contents.find((content) => content.id === record.id),
  );
}

const currentInventory = master.contents.map((content) => ({
  ...content,
  inventoryFieldsAbsent: Object.keys(content).length === 0 ? ['registro vazio'] : [],
}));

const historicalVersions = history.map((entry, index) => {
  const version = gitMasterAt(entry.commit);
  const previous = history[index + 1] ? gitMasterAt(history[index + 1].commit) : null;
  const ids = new Set((version?.contents || []).map((content) => content.id));
  const previousIds = new Set((previous?.contents || []).map((content) => content.id));
  return {
    ...entry,
    path: masterRelative,
    contentCount: version?.contents?.length ?? null,
    addedIds: [...ids].filter((id) => !previousIds.has(id)),
    removedIds: [...previousIds].filter((id) => !ids.has(id)),
    limitation: version ? null : 'arquivo do mestre indisponível neste commit',
  };
});

const removedContents = records
  .filter((record) => !record.current.publicationEnabled || record.current.status === 'REMOVIDO')
  .map((record) => ({
    id: record.id,
    currentStatus: record.current.status,
    textHash: record.textHash,
    historicalRemovalGrade: record.lineage.changeReason || record.provenance.decisionAlreadyRecorded ? 'R1/R2 — há decisão, motivo ou registro associado' : 'R3 — inativação sem justificativa individual localizada',
    decision: record.provenance.decisionAlreadyRecorded,
    evidence: record.provenance.evidenceLocations,
    limitation: 'O Git disponível não contém transição anterior suficiente para localizar, para cada item, a primeira remoção ou a última versão ativa.',
  }));

const changedIds = records.map((record) => {
  const current = master.contents.find((content) => content.id === record.id);
  const baseline = baselineById.get(record.id) || null;
  const fields = changedFields(baseline, current);
  return {
    id: record.id,
    baselinePresent: Boolean(baseline),
    changedFields: fields,
    changeLog: record.lineage.changeLog,
    declaredChangeType: record.lineage.changeType,
    declaredChangeReason: record.lineage.changeReason,
  };
}).filter((item) => item.changedFields.length > 0);

const lineageGroups = new Map();
for (const record of records) {
  const members = [record.id, ...record.lineage.legacyIds, record.lineage.derivedFromId, record.lineage.duplicateOf].filter(Boolean);
  if (members.length < 2) continue;
  const key = members.slice().sort().join('::');
  lineageGroups.set(key, {
    lineageId: `LIN-${sha256(key).slice(0, 10)}`,
    members,
    activeVersion: record.current.publicationEnabled ? record.id : null,
    evidence: record.provenance.evidenceLocations,
    confidence: 'alta — relação declarada em campo do mestre',
    conflicts: [],
    decisionNeeded: record.provenance.protected ? 'qualquer alteração exige decisão individual' : null,
  });
}
const lineages = [...lineageGroups.values()];

const batches = Object.entries(Object.groupBy(master.contents, (content) => content.originalCollection || 'sem lote registrado'))
  .map(([id, contents]) => ({
    id,
    quantity: contents.length,
    ids: contents.map((content) => content.id),
    displayTypes: stableCounts(contents.map((content) => content.displayType)),
    authors: stableCounts(contents.map((content) => content.displayedAuthor)),
    evidence: contents.some((content) => patchIds.has(content.id)) ? [patchRelative] : ['entre_sabios_acervo_mestre_final.json'],
    provenanceGrade: contents.some((content) => patchIds.has(content.id)) ? 'L2 — lote parcialmente documentado' : 'L4 — origem do lote indeterminada no histórico Git disponível',
  }));

const normalizedGroups = Object.entries(Object.groupBy(master.contents, (content) => normalizeText(content.finalText)))
  .filter(([, contents]) => contents.length > 1)
  .map(([normalizedText, contents]) => ({
    kind: 'duplicata exata após normalização',
    normalizedText,
    ids: contents.map((content) => content.id),
    evidence: contents.map((content) => content.id),
    decision: 'não remover nem consolidar neste inventário',
  }));

const attributionChanges = changedIds
  .filter((item) => item.changedFields.includes('autoria exibida') || item.changedFields.includes('atribuição') || item.changedFields.includes('fonte'));

const conflicts = [
  ...records.filter((record) => record.provenance.auditCategory === 'B' || record.provenance.auditCategory === 'C' || record.provenance.auditCategory === 'G')
    .map((record) => ({ id: record.id, kind: 'proveniência documental incompleta ou indeterminada', authority: 'mestre atual e dossiê A–J', evidence: record.provenance.evidenceLocations })),
];

const unresolvedCases = records.filter((record) => record.provenance.unresolved.length).map((record) => ({
  id: record.id,
  unresolved: record.provenance.unresolved,
  evidence: record.provenance.evidenceLocations,
}));

const nonMasterArtifacts = [
  ...[...protectedIds]
    .filter((id) => !currentIds.has(id))
    .sort((left, right) => left.localeCompare(right, 'pt-BR'))
    .map((id) => ({
      reference: id,
      kind: 'conteúdo ou linhagem protegida fora do mestre atual',
      evidence: nucleusRelative,
      treatment: 'preservar; investigação e eventual integração exigem decisão individual',
    })),
  ...[...patchIds]
    .filter((id) => !currentIds.has(id) && !protectedIds.has(id))
    .sort((left, right) => left.localeCompare(right, 'pt-BR'))
    .map((id) => ({
      reference: id,
      kind: 'ID presente no patch histórico e ausente do mestre atual',
      evidence: patchRelative,
      treatment: 'registrar como pista histórica; não restaurar automaticamente',
    })),
  {
    reference: 'microtexto “Existe em nós uma coragem...” (sem ID localizado)',
    kind: 'conteúdo fornecido para a Constituição e ainda não localizado no repositório',
    evidence: 'PADRAO_EDITORIAL_ENTRE_SABIOS.md',
    treatment: 'proveniência pendente; não atribuir, publicar, remover ou criar ID automaticamente',
  },
];

const summary = {
  historicalRecords: records.length,
  activeRecords: records.filter((record) => record.current.publicationEnabled).length,
  inactiveRecords: records.filter((record) => !record.current.publicationEnabled).length,
  baselineRecords: baselineMaster?.contents?.length || 0,
  protectedMasterRecords: records.filter((record) => record.provenance.protected).length,
  nonMasterArtifacts: nonMasterArtifacts.length,
  withBaseline: records.filter((record) => record.lineage.baseline.present).length,
  withoutBaseline: records.filter((record) => !record.lineage.baseline.present).length,
  withLegacyEvidence: records.filter((record) => record.provenance.evidenceLocations.some((file) => file.startsWith('js/data/quotes/'))).length,
  withPatchEvidence: records.filter((record) => record.provenance.evidenceLocations.includes(patchRelative)).length,
  withExplicitLineageLink: records.filter((record) => record.lineage.legacyIds.length || record.lineage.derivedFromId || record.lineage.duplicateOf).length,
  unresolvedRecords: records.filter((record) => record.provenance.unresolved.length).length,
};

const statistics = {
  universe: '351 conteúdos do mestre atual; histórico Git e artefatos locais acessíveis nesta árvore de trabalho',
  method: 'comparação por ID, hash e campos entre mestre, dossiê A–J, Núcleo, patch e histórico Git disponível; ausência é mantida como limitação',
  totalCurrent: currentInventory.length,
  totalHistoricalUniqueIds: new Set([...records.map((record) => record.id), ...nonMasterArtifacts.map((item) => item.reference)]).size,
  totalHistoricalUniqueNormalizedTexts: new Set(master.contents.map((content) => normalizeText(content.finalText))).size,
  activeIds: records.filter((record) => record.current.publicationEnabled).length,
  inactiveOrRemovedIds: removedContents.length,
  changedIds: changedIds.length,
  attributionChanges: attributionChanges.length,
  protectedCurrent: records.filter((record) => record.provenance.protected).length,
  protectedOutsideMaster: nonMasterArtifacts.filter((item) => item.kind.includes('protegida')).length,
  externalHistoricalContents: nonMasterArtifacts.length,
  batches: batches.length,
  duplicateGroupsExactNormalized: normalizedGroups.length,
  removalsByTraceability: {
    R1: removedContents.filter((item) => item.historicalRemovalGrade.startsWith('R1')).length,
    R2: 0, R3: removedContents.filter((item) => item.historicalRemovalGrade.startsWith('R3')).length, R4: 0,
    limitation: 'R1 e R2 não são separáveis sem inventar precisão quando há decisão, motivo ou registro, mas não todos os elementos exigidos para rastreabilidade plena.',
  },
  provenanceGrades: Object.assign({ P0: 0, P1: 0, P2: 0, P3: 0, P4: 0, P5: 0, PX: 0 }, stableCounts(records.map((record) => record.provenance.provisionalGrade.split(' — ')[0]))),
  stabilityGrades: Object.assign({ E1: 0, E2: 0, E3: 0, E4: 0, E5: 0, E6: 0 }, stableCounts(records.map((record) => record.provenance.historicalStability.split(' — ')[0]))),
  conflictsOpen: conflicts.length,
  unresolvedCases: unresolvedCases.length,
  limitation: 'Não é possível calcular com precisão remoções por commit, reutilizações e versões intermediárias para todo o acervo porque o histórico Git do mestre disponível é raso.',
};

const fileMap = [
  { path: masterRelative, function: 'fonte canônica do acervo', authority: 'canônica', state: 'ativo', editable: true, preserve: true, risk: 'não editar nesta auditoria' },
  { path: 'data/entre_sabios_runtime.json', function: 'runtime derivado', authority: 'gerada', state: 'ativo', editable: false, preserve: true, risk: 'não é fonte histórica principal' },
  { path: 'data/entre_sabios_runtime.js', function: 'runtime derivado', authority: 'gerada', state: 'ativo', editable: false, preserve: true, risk: 'não é fonte histórica principal' },
  { path: nucleusRelative, function: 'proteção nominal', authority: 'canônica para proteção', state: 'ativo', editable: 'somente decisão individual', preserve: true, risk: 'proteção não implica publicação' },
  { path: 'js/data/quotes/', function: 'base legada de evidência', authority: 'histórica', state: 'legado', editable: false, preserve: true, risk: 'pode conter conteúdo exclusivo' },
  { path: 'js/data/tales-PEDRO.js', function: 'versão paralela de contos', authority: 'paralela', state: 'paralelo', editable: false, preserve: true, risk: 'não carregar nem escolher como ativa sem decisão' },
  { path: 'js/features/tales-PEDRO.js', function: 'versão paralela de interface de contos', authority: 'paralela', state: 'paralelo', editable: false, preserve: true, risk: 'não carregar nem escolher como ativa sem decisão' },
  { path: patchRelative, function: 'patch histórico de curadoria', authority: 'evidência histórica', state: 'histórico', editable: false, preserve: true, risk: 'não aplicar automaticamente' },
];

const output = {
  inventoryVersion: '1.0.0',
  generatedAt: '2026-07-22',
  classification: 'inventário documental; não constitui nova decisão editorial',
  scope: '351 IDs do mestre local, evidências históricas locais, registros protegidos fora do mestre e pista sem ID registrada na Constituição',
  guardrails: [
    'não altera o acervo, runtime, algoritmo, interface, autoria, fonte, status ou metadados',
    'não restaura, remove, suspende, publica ou reclassifica conteúdo',
    'categorias e decisões individuais são reproduzidas do dossiê A–J, não recalculadas',
    'ausência de evidência continua sendo incerteza documentada, nunca prova de fabricação',
  ],
  fingerprints: {
    masterSha256: sha256(masterText),
    runtimeJsonSha256: sha256(runtimeJsonText),
    runtimeJsSha256: sha256(runtimeJsText),
    auditSha256: sha256(auditText),
    patchSha256: patchText ? sha256(patchText) : null,
  },
  authority: [
    { layer: 'comportamento executável', source: masterRelative, role: 'fonte canônica do conteúdo e estado atuais' },
    { layer: 'decisões duradouras', source: 'DECISIONS.md', role: 'autoridade para decisões já aprovadas' },
    { layer: 'estado vivo', source: 'PROJECT_STATUS.md', role: 'estado e pendências atuais' },
    { layer: 'proteção nominal', source: nucleusRelative, role: 'cadastro canônico dos protegidos' },
    { layer: 'evidência individual A–J', source: auditRelative, role: 'classificações e decisões registradas; não recalculadas aqui' },
    { layer: 'histórico', source: 'Git, bases legadas, lotes, relatórios e patch', role: 'pistas e versões; não autorizam aplicação' },
  ],
  gitMasterHistory: history,
  summary,
  auditMetadata: {
    date: '2026-07-22', time: 'não registrada na execução inicial; saída deliberadamente reproduzível', branch: inventoryBranch,
    commit: inventoryCommit,
    masterFile: masterRelative, masterVersion: master.contentVersion, runtimeVersion: runtime.contentVersion || null,
    constitutionDecision: 'DEC-033', limitations: [statistics.limitation, 'Não foi realizado OCR em massa nem pesquisa externa de autoria.'],
  },
  sourceFiles: evidencePaths.map((relative) => ({ path: relative, role: relative.startsWith('data/') ? 'gerada' : relative.includes('PEDRO') ? 'paralela' : 'canônica, histórica ou auxiliar conforme matriz de autoridade' })),
  fileMap,
  currentInventory,
  historicalVersions,
  historicalContents: records,
  removedContents,
  changedIds,
  lineages,
  batches,
  protectedContents: [...protectedIds].map((id) => ({ id, presentInMaster: currentIds.has(id), evidence: nucleusRelative })),
  externalHistoricalContents: nonMasterArtifacts,
  duplicateGroups: normalizedGroups,
  attributionChanges,
  conflicts,
  unresolvedCases,
  statistics,
  distributions: {
    auditCategory: stableCounts(records.map((record) => record.provenance.auditCategory)),
    attributionType: stableCounts(records.map((record) => record.current.attributionType)),
    status: stableCounts(records.map((record) => record.current.status)),
    sourceStatus: stableCounts(records.map((record) => record.current.source?.status)),
    originalCollection: stableCounts(records.map((record) => record.lineage.originalCollection)),
    changeType: stableCounts(records.map((record) => record.lineage.changeType)),
    firstKnownLayer: stableCounts(records.map((record) => record.provenance.firstKnownLayer)),
  },
  nonMasterArtifacts,
  records,
};

const markdown = `# Inventário histórico e mapa de proveniência — Entre Sábios

**Data:** 22/07/2026  
**Estado:** concluído como inventário documental; nenhuma aplicação editorial autorizada  
**Base:** ${master.contentVersion}; ${summary.historicalRecords} IDs históricos; ${summary.activeRecords} ativos e ${summary.inactiveRecords} inativos  
**Decisões preservadas:** \`DEC-024\`, \`DEC-029\`, \`DEC-030\`, \`DEC-031\` e \`DEC-033\`

## Escopo e limite

Este mapa reúne o mestre local, o dossiê A–J, o Núcleo de Preservação, o histórico Git disponível, bases legadas, lotes, relatórios de rejeição e o patch de curadoria localizado. Ele não altera nem interpreta novamente as decisões individuais: reproduz o que já está registrado e indica onde cada evidência pode ser encontrada.

Não houve peneira, recuperação, restauração, suspensão, remoção, publicação, reescrita, mudança de autoria, migração de metadados ou modificação do algoritmo. A ausência de evidência continua significando incerteza documentada.

## Fontes e autoridade

| Camada | Fonte | Papel |
| --- | --- | --- |
${output.authority.map((item) => `| ${item.layer} | \`${item.source}\` | ${item.role} |`).join('\n')}

## Resultado de cobertura

| Medida | Total |
| --- | ---: |
${markdownTable(summary)}

O inventário individual completo está em \`${jsonRelative}\`. Cada um dos 351 registros contém estado atual, hash do texto, atribuição e fonte atuais, vínculos de linhagem, presença no mestre Git original, categoria A–J já registrada, evidência de fabricação, passagem sustentadora, decisão anterior, confiança, proteção, camada mais antiga localizada, arquivos de evidência e pendências documentais.

## Camadas históricas localizadas

- O histórico Git disponível contém ${history.length} commit(s) que tocaram diretamente o mestre. O mais antigo localizado é \`${oldestMasterCommit?.commit || 'não localizado'}\`, de ${oldestMasterCommit?.date || 'data não localizada'}, com ${summary.baselineRecords} registros.
- ${summary.withBaseline} IDs atuais já estavam nesse mestre consolidado; ${summary.withoutBaseline} entraram ou foram formalizados depois na árvore de trabalho local.
- ${summary.withLegacyEvidence} IDs possuem ocorrência nas bases legadas de \`js/data/quotes/\`.
- ${summary.withPatchEvidence} IDs aparecem no patch \`${patchRelative}\`.
- ${summary.withExplicitLineageLink} registros possuem \`legacyIds\`, \`derivedFromId\` ou \`duplicateOf\` explícito.
- O dossiê A–J cobre os ${audit.records.length} IDs e permanece a autoridade das categorias; este mapa não as recalcula.

## Proveniência por categoria já registrada

| Categoria | Total |
| --- | ---: |
${markdownTable(output.distributions.auditCategory)}

Categorias B, C, D e G mantêm suas limitações documentais. Categoria G não significa IA. Categoria I continua restrita às confirmações humanas registradas; categoria J permanece rejeição histórica, não prova automática de fabricação.

## Artefatos fora do mestre atual

| Referência | Natureza | Evidência | Tratamento |
| --- | --- | --- | --- |
${nonMasterArtifacts.map((item) => `| ${item.reference.replaceAll('|', '\\|')} | ${item.kind} | \`${item.evidence}\` | ${item.treatment} |`).join('\n')}

Esses artefatos não recebem ID novo, integração, restauração ou publicação por efeito deste inventário.

## Impressões digitais da versão inventariada

| Arquivo | SHA-256 |
| --- | --- |
| Mestre | \`${output.fingerprints.masterSha256}\` |
| Runtime JSON | \`${output.fingerprints.runtimeJsonSha256}\` |
| Runtime JS | \`${output.fingerprints.runtimeJsSha256}\` |
| Dossiê A–J | \`${output.fingerprints.auditSha256}\` |
| Patch de curadoria | \`${output.fingerprints.patchSha256 || 'ausente'}\` |

## Pendências reveladas, sem aplicação

- ${summary.unresolvedRecords} registros mantêm ao menos uma pendência documental derivada da categoria A–J ou da proteção nominal.
- Conteúdos protegidos fora do mestre permanecem no Núcleo e exigem decisão individual.
- O microtexto “Existe em nós uma coragem...” continua sem ID e sem localização documental no repositório.
- O histórico Git do mestre é raso: somente ${history.length} commit(s) direto(s) foi(ram) localizado(s); bases legadas e o patch complementam a evidência, sem substituí-la.
- A próxima etapa possível é escolher, mediante autorização separada, um lote limitado para investigação de proveniência. Este inventário não escolhe o lote nem inicia a investigação.

## 1. Estado da auditoria

- Branch: \`${output.auditMetadata.branch}\`; commit: \`${output.auditMetadata.commit}\`.
- Constituição confirmada: seção canônica no padrão, \`DEC-033\`, referência operacional em \`AGENTS.md\`, \`DEC-024\` preservada e \`${nucleusRelative}\` presente.
- Escopo: preservação e auditoria interna. Nenhuma decisão individual foi tomada.

## 2. Fontes consultadas

- Canônicas: mestre, decisões, estado vivo, padrão, Núcleo e \`AGENTS.md\`.
- Geradas: runtime JSON e JS, usados somente para comparação por hash e contagem.
- Históricas: Git, patch, bases legadas, dossiê A–J, relatórios e arquivos de rejeição.
- Auxiliares: testes, documentos e arquivos paralelos referidos na lista de evidências do JSON. Não houve OCR em massa nem pesquisa externa nova.

## 3. Estado atual do acervo

| Indicador | Total |
| --- | ---: |
| Itens no mestre | ${statistics.totalCurrent} |
| Ativos | ${statistics.activeIds} |
| Inativos ou removidos | ${statistics.inactiveOrRemovedIds} |
| Protegidos presentes no mestre | ${statistics.protectedCurrent} |
| Sem fonte documental verificada | ${records.filter((record) => record.current.source?.status !== 'verified').length} |

As distribuições por formato, status, atribuição e fonte estão no JSON em \`distributions\`; campos não existentes no mestre não foram preenchidos por inferência.

## 4. Linha temporal do acervo

| Commit | Data | Autor | Mensagem | Itens | Adicionados | Removidos |
| --- | --- | --- | --- | ---: | ---: | ---: |
${historicalVersions.map((item) => `| \`${item.commit.slice(0, 7)}\` | ${item.date} | ${item.author} | ${item.subject} | ${item.contentCount ?? 'indeterminado'} | ${item.addedIds.length} | ${item.removedIds.length} |`).join('\n') || '| — | — | — | Histórico direto do mestre não localizado | — | — | — |'}

## 5. Conteúdos historicamente removidos

Foram registrados ${removedContents.length} itens atualmente inativos ou removidos. Cada caso preserva status, decisão já existente, evidências e grau provisório de rastreabilidade no JSON. A data da primeira remoção e a última versão ativa permanecem indeterminadas quando não há transição correspondente no Git acessível.

## 6. IDs alterados ou reutilizados

${changedIds.length} IDs têm diferença em relação à linha de base Git localizada ou entrada posterior a ela. A comparação de texto, autoria, atribuição, fonte, tipo, status, publicação e sentimentos está em \`changedIds\`. Nenhuma reutilização é declarada sem evidência direta.

## 7. Linhagens editoriais

${lineages.length} linhagens explícitas foram montadas somente a partir de \`legacyIds\`, \`derivedFromId\`, \`duplicateOf\`, proteção nominal ou outra relação declarada. Não foram agrupados textos por mera semelhança temática.

## 8. Lotes de integração

${batches.length} agrupamentos foram identificados por \`originalCollection\` ou ausência explícita desse campo. Cada lote informa IDs, formatos, atribuições, evidência e grau L provisório; repetição formal não é prova de geração automática.

## 9. Mudanças de autoria e fonte

${attributionChanges.length} casos apresentam diferença entre a linha de base acessível e o estado atual em autoria, atribuição ou fonte. O relatório apenas aponta os campos; não escolhe qual versão é correta.

## 10. Conteúdos protegidos

O Núcleo contém ${protectedIds.size} referências ou linhagens; ${statistics.protectedCurrent} correspondem a IDs presentes no mestre e ${statistics.protectedOutsideMaster} permanecem fora dele. Divergências, se houver, estão explicitadas em \`protectedContents\`.

## 11. Conteúdos encontrados fora do acervo ativo

${nonMasterArtifacts.length} evidências externas foram preservadas em \`externalHistoricalContents\`, incluindo o microtexto “Existe em nós uma coragem...”, sem ID localizado. Elas são pistas, não restaurações.

## 12. Duplicatas e proximidade textual

Foram encontrados ${normalizedGroups.length} grupos de igualdade após normalização. Não foram produzidos grupos de proximidade semântica, porque isso exigiria julgamento ou investigação adicional.

## 13. Conflitos e inconsistências

${conflicts.length} casos permanecem abertos por proveniência documental incompleta ou indeterminada. A fonte de maior autoridade e as evidências foram registradas no JSON; nenhuma divergência foi resolvida silenciosamente.

## 14. Possíveis perdas editoriais

Os ${removedContents.length} itens inativos/removidos e os ${nonMasterArtifacts.length} artefatos externos formam o conjunto de candidatos à investigação futura. Prioridade, se necessária, deverá ser decidida pelo editor-chefe; este inventário não a converte em aprovação.

## 15. Casos sem justificativa de remoção

Casos sem motivo individual localizado estão assinalados como R3 provisório. Não foram classificados como erro editorial e não geram restauração automática.

## 16. Limitações da auditoria

- Histórico Git direto do mestre disponível é raso; transições individuais podem não estar acessíveis.
- Imagens foram somente registradas quando há caminho ou referência textual; não houve OCR em massa.
- Autoria e fonte externas não foram pesquisadas novamente.
- Relações sem campo ou evidência documental permanecem indeterminadas.

## 17. Próxima etapa recomendada

Após aprovação humana deste relatório, propor um lote-piloto de 8 a 12 casos para **recuperação de possíveis perdas editoriais**, ainda sem aplicar restaurações automaticamente. O lote deve combinar um protegido externo, uma remoção documentada, um caso R3, uma linhagem explícita, um lote parcialmente documentado, uma duplicata normalizada e o microtexto de coragem sem ID, se a localização interna for encontrada.

## 18. Mapa de arquivos e responsabilidades

| Caminho | Função | Autoridade | Estado | Risco |
| --- | --- | --- | --- | --- |
${fileMap.map((item) => `| \`${item.path}\` | ${item.function} | ${item.authority} | ${item.state} | ${item.risk} |`).join('\n')}

## Garantias desta execução

- Nenhum conteúdo foi removido, restaurado, reativado ou suspenso.
- Nenhuma autoria, fonte, ID, texto, tipo, status ou metadado do mestre foi alterado.
- Nenhum runtime foi regenerado; os runtimes foram somente comparados por hash.
- Nenhum algoritmo, interface ou decisão editorial individual foi modificado.
- Os únicos artefatos desta etapa são o relatório, o JSON reproduzível, seu gerador, teste documental e o registro de estado vivo já existentes nesta linha de trabalho.

## Condição de encerramento

A etapa termina com cobertura verificável dos 351 IDs, registro dos artefatos históricos fora do mestre, hashes da versão examinada e separação explícita entre evidência, decisão e aplicação. Recuperação, peneira, metadados, alterações do acervo e publicação permanecem fora do escopo.
`;

const expectedJson = `${JSON.stringify(output, null, 2)}\n`;
const expectedMarkdown = markdown;
const jsonPath = path.join(rootDir, jsonRelative);
const markdownPath = path.join(rootDir, markdownRelative);

if (checkOnly) {
  const currentJson = fs.existsSync(jsonPath) ? fs.readFileSync(jsonPath, 'utf8') : '';
  const currentMarkdown = fs.existsSync(markdownPath) ? fs.readFileSync(markdownPath, 'utf8') : '';
  if (currentJson !== expectedJson || currentMarkdown !== expectedMarkdown) {
    console.error('[inventário] Saídas desatualizadas em relação às fontes atuais.');
    process.exit(1);
  }
  console.log(`[inventário] ${records.length} IDs e ${nonMasterArtifacts.length} artefatos externos conferidos sem escrita.`);
} else {
  fs.writeFileSync(jsonPath, expectedJson, 'utf8');
  fs.writeFileSync(markdownPath, expectedMarkdown, 'utf8');
  console.log(`[inventário] ${records.length} IDs e ${nonMasterArtifacts.length} artefatos externos registrados.`);
}
