import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { buildFromFiles } from './content-build-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { runtime } = buildFromFiles({ rootDir, write: false });
await import(`${pathToFileURL(path.join(rootDir, 'js', 'core', 'runtime-engine.js')).href}?audit=${Date.now()}`);
const engine = globalThis.EntreSabiosRuntimeEngine;

const DEVELOPED_FORMATS = new Set(['microtexto', 'reflexao_curta', 'citacao_longa']);
const GRIEF_SUPPORT_FUNCTIONS = new Set(['recognition', 'presence', 'contemplation']);
const GRIEF_SUPPORT_TONES = new Set(['acolhedor', 'introspectivo', 'contemplativo', 'poetico']);
const INTENSITIES = ['fraca', 'moderada', 'intensa'];
const RUNS_PER_SEQUENCE = 100;

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    snapshot: () => Object.fromEntries(values),
  };
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function countBy(items, getKey) {
  return Object.fromEntries([...items.reduce((counts, item) => {
    const key = getKey(item) || 'sem_valor';
    counts.set(key, (counts.get(key) || 0) + 1);
    return counts;
  }, new Map())].sort(([a], [b]) => a.localeCompare(b, 'pt-BR')));
}

function maximumStreak(items, getKey) {
  let maximum = items.length ? 1 : 0;
  let current = maximum;
  for (let index = 1; index < items.length; index += 1) {
    current = getKey(items[index]) === getKey(items[index - 1]) ? current + 1 : 1;
    maximum = Math.max(maximum, current);
  }
  return maximum;
}

function selectSequence(state, count = RUNS_PER_SEQUENCE, { storage = createMemoryStorage(), recreateAt = null } = {}) {
  let selector = engine.createSelector({ version: runtime.contentVersion, contents: runtime.contents, storage });
  const selections = [];
  for (let index = 0; index < count; index += 1) {
    if (recreateAt === index) {
      selector = engine.createSelector({ version: runtime.contentVersion, contents: runtime.contents, storage });
    }
    const result = selector.select(state, { firstResponse: index === 0 });
    if (!result) break;
    const content = result.content;
    selections.push({
      index: index + 1,
      id: content.id,
      textKey: normalize(content.finalText),
      author: content.displayedAuthor || content.author || 'Entre Sábios',
      authorKey: normalize(content.displayedAuthor || content.author || 'Entre Sábios'),
      format: content.displayType,
      level: result.level,
      placement: content.placement,
      editorialFunction: content.editorialFunction,
      tone: content.tone,
      riskTags: content.riskTags || [],
      hardExclusions: content.hardExclusions || [],
      exactAvoidanceRelaxed: result.exactAvoidanceRelaxed,
      authorAvoidanceRelaxed: result.authorAvoidanceRelaxed,
    });
  }
  return { selections, storage, recent: selector.getRecentSelections() };
}

function sequenceMetrics(selections, eligibleAuthors = 0, eligibleCount = 0, developedEligible = 0) {
  const repeatedInsideWindow = [];
  const repeatedTextInsideWindow = [];
  for (let index = 0; index < selections.length; index += 1) {
    const recent = selections.slice(Math.max(0, index - 12), index);
    if (recent.some((item) => item.id === selections[index].id)) repeatedInsideWindow.push(selections[index].index);
    if (recent.some((item) => item.textKey === selections[index].textKey)) repeatedTextInsideWindow.push(selections[index].index);
  }
  const authorCounts = countBy(selections, (item) => item.author);
  const dominantAuthorCount = Math.max(0, ...Object.values(authorCounts));
  const developedCount = selections.filter((item) => DEVELOPED_FORMATS.has(item.format)).length;
  const cycleSeen = new Set();
  let prematureCycleRepeats = 0;
  let completedCycles = 0;
  for (const selection of selections) {
    if (eligibleCount > 0 && cycleSeen.size >= eligibleCount) {
      cycleSeen.clear();
      completedCycles += 1;
    }
    if (cycleSeen.has(selection.id)) prematureCycleRepeats += 1;
    cycleSeen.add(selection.id);
  }
  return {
    generated: selections.length,
    ids: selections.map((item) => item.id),
    repeatedIdInside12: repeatedInsideWindow.length,
    repeatedTextInside12: repeatedTextInsideWindow.length,
    prematureCycleRepeats,
    completedCycles,
    eligibleAtBestLevel: eligibleCount,
    immediateIdRepeats: selections.filter((item, index) => index > 0 && item.id === selections[index - 1].id).length,
    maximumAuthorStreak: maximumStreak(selections, (item) => item.authorKey),
    maximumFormatStreak: maximumStreak(selections, (item) => item.format),
    dominantAuthorShare: selections.length ? Number((dominantAuthorCount / selections.length).toFixed(4)) : 0,
    authorDominanceViolation: eligibleAuthors >= 5 && dominantAuthorCount / selections.length > 0.35,
    authorFrequency: authorCounts,
    formatFrequency: countBy(selections, (item) => item.format),
    levelFrequency: countBy(selections, (item) => String(item.level)),
    developedFormatFrequency: selections.length ? Number((developedCount / selections.length).toFixed(4)) : 0,
    developedTargetApplicable: developedEligible >= 3,
    exactAvoidanceRelaxations: selections.filter((item) => item.exactAvoidanceRelaxed).length,
    authorAvoidanceRelaxations: selections.filter((item) => item.authorAvoidanceRelaxed).length,
  };
}

function getEligibleSummary(state, firstResponse = false) {
  const selector = engine.createSelector({ version: runtime.contentVersion, contents: runtime.contents });
  const inspection = selector.inspect(state, { firstResponse });
  const authors = new Set(inspection.eligibleAtLevel.map(({ content }) => normalize(content.displayedAuthor || content.author)));
  const developed = inspection.eligibleAtLevel.filter(({ content }) => DEVELOPED_FORMATS.has(content.displayType));
  return {
    bestLevel: inspection.bestLevel,
    eligibleAtBestLevel: inspection.eligibleAtLevel.length,
    authorsAtBestLevel: authors.size,
    developedAtBestLevel: developed.length,
    formatsAtBestLevel: countBy(inspection.eligibleAtLevel, ({ content }) => content.displayType),
  };
}

function griefMetrics(intensity) {
  const state = { primaryFeeling: 'luto', secondaryFeelings: [], intensity };
  const firstEligible = getEligibleSummary(state, true);
  const sequenceResult = selectSequence(state);
  const selections = sequenceResult.selections;
  const first = selections[0];
  const supportive = selections.filter((item) => GRIEF_SUPPORT_FUNCTIONS.has(item.editorialFunction));
  return {
    intensity,
    firstEligible,
    firstResponse: first,
    firstResponseSupportive: Boolean(first && (GRIEF_SUPPORT_FUNCTIONS.has(first.editorialFunction) || GRIEF_SUPPORT_TONES.has(first.tone))),
    firstResponseConfrontation: first?.editorialFunction === 'confrontation',
    supportFunctionShare: selections.length ? Number((supportive.length / selections.length).toFixed(4)) : 0,
    confrontationCount: selections.filter((item) => item.editorialFunction === 'confrontation').length,
    actionCount: selections.filter((item) => item.editorialFunction === 'action').length,
    ironicCount: selections.filter((item) => item.tone === 'ironico').length,
    prematureRiskCount: selections.filter((item) => item.riskTags.some((risk) => ['conselho_prematuro', 'pressao_por_superacao', 'moralizacao', 'romantizacao_do_sofrimento', 'abstracao_elevada'].includes(risk))).length,
    sequence: sequenceMetrics(
      selections,
      firstEligible.authorsAtBestLevel,
      firstEligible.eligibleAtBestLevel,
      firstEligible.developedAtBestLevel,
    ),
  };
}

const feelings = runtime.feelings.map((item) => item.id);
const formatDistribution = countBy(runtime.contents, (content) => content.displayType);
const eligibility = {};
for (const feeling of feelings) {
  eligibility[feeling] = {};
  for (const intensity of INTENSITIES) {
    eligibility[feeling][intensity] = getEligibleSummary({ primaryFeeling: feeling, secondaryFeelings: [], intensity });
  }
}

const sequencesByFeeling = {};
for (const feeling of feelings) {
  const state = { primaryFeeling: feeling, secondaryFeelings: [], intensity: 'moderada' };
  const eligible = eligibility[feeling].moderada;
  sequencesByFeeling[feeling] = sequenceMetrics(
    selectSequence(state).selections,
    eligible.authorsAtBestLevel,
    eligible.eligibleAtBestLevel,
    eligible.developedAtBestLevel,
  );
}

const secondaryPriority = [];
for (const primaryFeeling of feelings) {
  for (const secondaryFeeling of feelings) {
    if (primaryFeeling === secondaryFeeling) continue;
    const state = { primaryFeeling, secondaryFeelings: [secondaryFeeling], intensity: 'moderada' };
    const inspection = getEligibleSummary(state, true);
    const first = selectSequence(state, 1).selections[0];
    secondaryPriority.push({
      primaryFeeling,
      secondaryFeeling,
      bestLevel: inspection.bestLevel,
      selectedLevel: first?.level ?? null,
      selectedId: first?.id ?? null,
      primaryDominates: first ? first.level <= 2 : false,
    });
  }
}

const persistedStorage = createMemoryStorage();
const persistenceState = { primaryFeeling: 'tristeza', secondaryFeelings: ['inseguranca'], intensity: 'moderada' };
const persistenceSequence = selectSequence(persistenceState, 100, { storage: persistedStorage, recreateAt: 50 });

const masterPath = path.join(rootDir, 'entre_sabios_acervo_mestre_final.json');
const report = {
  reportType: 'behavioral-baseline',
  generatedAt: new Date().toISOString(),
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: rootDir, encoding: 'utf8' }).trim(),
  branch: execFileSync('git', ['branch', '--show-current'], { cwd: rootDir, encoding: 'utf8' }).trim(),
  masterSha256: crypto.createHash('sha256').update(fs.readFileSync(masterPath)).digest('hex'),
  schemaVersion: runtime.schemaVersion,
  contentVersion: runtime.contentVersion,
  activeContents: runtime.contents.length,
  feelings,
  formatDistribution,
  eligibility,
  sequencesByFeeling,
  grief: Object.fromEntries(INTENSITIES.map((intensity) => [intensity, griefMetrics(intensity)])),
  secondaryPriority: {
    scenarios: secondaryPriority.length,
    failures: secondaryPriority.filter((item) => !item.primaryDominates),
    results: secondaryPriority,
  },
  persistence: {
    state: persistenceState,
    recreatedAt: 50,
    storageKeys: Object.keys(persistedStorage.snapshot()),
    recentHistorySize: persistenceSequence.recent.length,
    sequence: sequenceMetrics(
      persistenceSequence.selections,
      eligibility.tristeza.moderada.authorsAtBestLevel,
      eligibility.tristeza.moderada.eligibleAtBestLevel,
      eligibility.tristeza.moderada.developedAtBestLevel,
    ),
  },
};

const outputFlagIndex = process.argv.indexOf('--output');
if (outputFlagIndex >= 0) {
  const requestedPath = process.argv[outputFlagIndex + 1];
  if (!requestedPath) throw new Error('Informe um caminho após --output.');
  const outputPath = path.resolve(rootDir, requestedPath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.info(outputPath);
} else {
  console.info(JSON.stringify(report, null, 2));
}
