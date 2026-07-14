import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { buildFromFiles } from './content-build-lib.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { runtime } = buildFromFiles({ rootDir, write: false });
await import(pathToFileURL(path.join(rootDir, 'js', 'core', 'runtime-engine.js')).href);
const engine = globalThis.EntreSabiosRuntimeEngine;

function createMemoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

function normalize(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

const scenarios = [
  { primaryFeeling: 'ansiedade', secondaryFeelings: [], intensity: 'moderada' },
  { primaryFeeling: 'medo', secondaryFeelings: [], intensity: 'intensa' },
  { primaryFeeling: 'amor', secondaryFeelings: [], intensity: 'fraca' },
  { primaryFeeling: 'inseguranca', secondaryFeelings: [], intensity: 'intensa' },
  { primaryFeeling: 'luto', secondaryFeelings: [], intensity: 'moderada' },
  { primaryFeeling: 'falta_de_proposito', secondaryFeelings: [], intensity: 'fraca' },
];
const storage = createMemoryStorage();
let selector = engine.createSelector({ version: runtime.contentVersion, contents: runtime.contents, storage });
const selections = [];
const seenByContext = new Map();
let prematureCycleRepeats = 0;

for (let index = 0; index < 30; index += 1) {
  if (index === 15) selector = engine.createSelector({ version: runtime.contentVersion, contents: runtime.contents, storage });
  const scenarioIndex = Math.floor(index / 5);
  const state = scenarios[scenarioIndex];
  const contextKey = `${state.primaryFeeling}|${state.secondaryFeelings.slice().sort().join(',')}|${state.intensity}`;
  const seenInContext = seenByContext.get(contextKey) || new Set();
  const inspection = selector.inspect(state, { firstResponse: index % 5 === 0 });
  const result = selector.select(state, { firstResponse: index % 5 === 0 });
  const unseenEligible = inspection.eligibleAtLevel.filter(({ content }) => !seenInContext.has(content.id));
  if (seenInContext.has(result.content.id) && unseenEligible.length > 0) prematureCycleRepeats += 1;
  seenInContext.add(result.content.id);
  seenByContext.set(contextKey, seenInContext);
  selections.push({
    click: index + 1,
    feeling: state.primaryFeeling,
    intensity: state.intensity,
    id: result.content.id,
    textKey: normalize(result.content.finalText),
    author: result.content.displayedAuthor || result.content.author,
    level: result.level,
    conceptKeys: engine.getContentConceptKeys(result.content),
    exactAvoidanceRelaxed: result.exactAvoidanceRelaxed,
    nearDuplicateAvoidanceRelaxed: result.nearDuplicateAvoidanceRelaxed,
    conceptAvoidanceRelaxed: result.conceptAvoidanceRelaxed,
    authorFreshnessRelaxed: result.authorFreshnessRelaxed,
    authorAvoidanceRelaxed: result.authorAvoidanceRelaxed,
  });
}

const repeatedIds = selections.filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) !== index);
const repeatedTexts = selections.filter((item, index, list) => list.findIndex((candidate) => candidate.textKey === item.textKey) !== index);
const consecutiveAuthorRepeats = selections.filter((item, index) => index > 0 && normalize(item.author) === normalize(selections[index - 1].author));
const nearDuplicateRepetitions = selections.filter((item, index, list) => index > 0
  && list.slice(Math.max(0, index - 12), index).some((candidate) => candidate.textKey !== item.textKey
    && engine.areNearDuplicateTexts(candidate.textKey, item.textKey)));
const conceptRepetitions = selections.filter((item, index, list) => item.conceptKeys.length > 0
  && list.slice(Math.max(0, index - 12), index).some((candidate) => (
    item.conceptKeys.some((concept) => candidate.conceptKeys.includes(concept))
  )));
let maximumAuthorStreak = 1;
let currentAuthorStreak = 1;
for (let index = 1; index < selections.length; index += 1) {
  currentAuthorStreak = normalize(selections[index].author) === normalize(selections[index - 1].author)
    ? currentAuthorStreak + 1
    : 1;
  maximumAuthorStreak = Math.max(maximumAuthorStreak, currentAuthorStreak);
}

const report = {
  clicks: selections.length,
  statesTested: scenarios.map((state) => `${state.primaryFeeling}:${state.intensity}`),
  repeatedIds: repeatedIds.length,
  repeatedNormalizedTexts: repeatedTexts.length,
  prematureCycleRepeats,
  nearDuplicateRepetitions: nearDuplicateRepetitions.length,
  conceptRepetitions: conceptRepetitions.length,
  avoidableConceptRepetitions: conceptRepetitions.filter((item) => !item.conceptAvoidanceRelaxed).length,
  consecutiveAuthorRepeats: consecutiveAuthorRepeats.length,
  avoidableConsecutiveAuthorRepeats: consecutiveAuthorRepeats.filter((item) => !item.authorFreshnessRelaxed).length,
  maximumAuthorStreak,
  exactAvoidanceRelaxations: selections.filter((item) => item.exactAvoidanceRelaxed).length,
  nearDuplicateAvoidanceRelaxations: selections.filter((item) => item.nearDuplicateAvoidanceRelaxed).length,
  conceptAvoidanceRelaxations: selections.filter((item) => item.conceptAvoidanceRelaxed).length,
  authorFreshnessRelaxations: selections.filter((item) => item.authorFreshnessRelaxed).length,
  authorAvoidanceRelaxations: selections.filter((item) => item.authorAvoidanceRelaxed).length,
  persistentRecentHistorySize: selector.getRecentSelections().length,
  repeatedContentDetails: repeatedTexts.map(({ click, feeling, intensity, id, author }) => ({ click, feeling, intensity, id, author })),
};

console.info(JSON.stringify(report, null, 2));
