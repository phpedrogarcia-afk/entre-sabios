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

for (let index = 0; index < 30; index += 1) {
  if (index === 15) selector = engine.createSelector({ version: runtime.contentVersion, contents: runtime.contents, storage });
  const scenarioIndex = Math.floor(index / 5);
  const state = scenarios[scenarioIndex];
  const result = selector.select(state, { firstResponse: index % 5 === 0 });
  selections.push({
    click: index + 1,
    feeling: state.primaryFeeling,
    intensity: state.intensity,
    id: result.content.id,
    textKey: normalize(result.content.finalText),
    author: result.content.displayedAuthor || result.content.author,
    level: result.level,
    exactAvoidanceRelaxed: result.exactAvoidanceRelaxed,
    authorAvoidanceRelaxed: result.authorAvoidanceRelaxed,
  });
}

const repeatedIds = selections.filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) !== index);
const repeatedTexts = selections.filter((item, index, list) => list.findIndex((candidate) => candidate.textKey === item.textKey) !== index);
const consecutiveAuthorRepeats = selections.filter((item, index) => index > 0 && normalize(item.author) === normalize(selections[index - 1].author));
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
  consecutiveAuthorRepeats: consecutiveAuthorRepeats.length,
  maximumAuthorStreak,
  exactAvoidanceRelaxations: selections.filter((item) => item.exactAvoidanceRelaxed).length,
  authorAvoidanceRelaxations: selections.filter((item) => item.authorAvoidanceRelaxed).length,
  persistentRecentHistorySize: selector.getRecentSelections().length,
  repeatedContentDetails: repeatedTexts.map(({ click, feeling, intensity, id, author }) => ({ click, feeling, intensity, id, author })),
};

console.info(JSON.stringify(report, null, 2));
