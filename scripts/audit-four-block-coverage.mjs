import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const defaultRootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function readJson(rootDir, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'));
}

function loadEditorialData(rootDir) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  for (const relativePath of [
    'js/data/catalogs.js',
    'js/data/editorial-explanations.js',
    'js/data/editorial-guidance.js',
  ]) {
    vm.runInContext(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'), sandbox, { filename: relativePath });
  }
  return sandbox.window.EntreSabiosData;
}

function createBookSandbox(rootDir) {
  const sandbox = { console, window: null };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  for (const relativePath of [
    'js/data/catalogs.js',
    'js/data/books.js',
    'js/data/emotional-taxonomy.js',
    'js/core/normalization.js',
  ]) {
    vm.runInContext(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'), sandbox, { filename: relativePath });
  }
  sandbox.authorBookAliases = sandbox.EntreSabiosData.authorBookAliases;
  const mainScript = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
  vm.runInContext(mainScript.slice(0, mainScript.indexOf('let history')), sandbox, { filename: 'script-book-normalization.js' });
  sandbox.preferenceProfile = { books: {} };
  sandbox.currentIntensity = 'moderada';
  sandbox.history = [];
  vm.runInContext(fs.readFileSync(path.join(rootDir, 'js/core/book-matching.js'), 'utf8'), sandbox, { filename: 'book-matching.js' });
  return sandbox;
}

function createStory(sandbox, content, intensity, primaryFeeling) {
  const normalizedThemes = (content.themes || []).map(sandbox.normalizeTheme);
  return {
    key: content.id,
    inspirationSource: content.inspirationSource,
    displayAuthor: content.displayedAuthor,
    author: content.author,
    rawTags: content.themes,
    temas: content.themes,
    emotionalState: {
      primaryFeeling,
      secondaryFeelings: [],
      feelings: [primaryFeeling],
      intensity,
      rootThemeDefinitions: normalizedThemes.map((theme) => ({ theme })),
    },
  };
}

function hasExactText(entry, content, field) {
  return Boolean(entry
    && entry.finalText === content.finalText
    && String(entry[field] || '').trim());
}

function summarizeBy(records, field) {
  return records.reduce((summary, record) => {
    const key = record[field] || 'sem_valor';
    summary[key] = (summary[key] || 0) + 1;
    return summary;
  }, {});
}

export function auditFourBlockCoverage({ rootDir = defaultRootDir } = {}) {
  const runtime = readJson(rootDir, 'data/entre_sabios_runtime.json');
  const editorialData = loadEditorialData(rootDir);
  const bookSandbox = createBookSandbox(rootDir);
  const explanations = editorialData.editorialExplanations || {};
  const guidance = editorialData.editorialGuidance || {};
  const guidanceContexts = editorialData.editorialGuidanceContexts || {};
  const thinkerProfiles = editorialData.thinkerProfiles || {};
  const editorialProfiles = editorialData.editorialProfiles || {};

  const records = runtime.contents.map((content) => {
    const explanationReady = Boolean(String(content.editorialExplanation || '').trim())
      || hasExactText(explanations[content.id], content, 'explanation');
    const profileKey = content.inspirationSource || content.author;
    const editorialProfile = editorialProfiles[content.id];
    const thinkerProfileReady = hasExactText(editorialProfile, content, 'profile')
      || Boolean(String(thinkerProfiles[profileKey] || '').trim());
    const canonicalRuntimeQuestion = String(content.editorialQuestion || '').trim();
    const guidanceEntry = guidance[content.id];
    const guidanceContext = guidanceContexts[content.id];
    const guidanceExact = Boolean(canonicalRuntimeQuestion) || hasExactText(guidanceEntry, content, 'guidance');
    const canonicalQuestion = Boolean((canonicalRuntimeQuestion && /\?\s*$/.test(canonicalRuntimeQuestion)) || (guidanceExact
      && guidanceEntry.label === 'UMA PERGUNTA'
      && /\?\s*$/.test(String(guidanceEntry.guidance).trim())));
    const allowedFeelings = new Set(guidanceContext?.feelings || []);
    const allowedIntensities = new Set(guidanceContext?.intensities || []);
    const questionContextReady = Boolean(canonicalRuntimeQuestion || (canonicalQuestion
      && (content.primaryFeeling
        ? allowedFeelings.has(content.primaryFeeling)
        : guidanceContext?.universal === true)
      && content.suitableIntensities.every((intensity) => allowedIntensities.has(intensity))));

    const primaryFeelings = content.primaryFeeling
      ? [content.primaryFeeling]
      : runtime.feelings.map((feeling) => feeling.id);
    const bookContexts = [];
    for (const primaryFeeling of primaryFeelings) {
      for (const intensity of content.suitableIntensities) {
        bookSandbox.history = [];
        const recommendation = bookSandbox.recommendBookForStory(
          createStory(bookSandbox, content, intensity, primaryFeeling),
        );
        bookContexts.push({
          primaryFeeling,
          intensity,
          covered: Boolean(recommendation?.book && recommendation.hasSubstantiveRelation),
        });
      }
    }
    const bookCoveredContexts = bookContexts.filter((context) => context.covered).length;
    const uncoveredBookContexts = bookContexts.filter((context) => !context.covered);
    const bookReady = bookContexts.length > 0 && bookCoveredContexts === bookContexts.length;
    const structurallyComplete = explanationReady
      && thinkerProfileReady
      && questionContextReady
      && bookReady;

    return {
      id: content.id,
      primaryFeeling: content.primaryFeeling,
      placement: content.placement,
      explanationReady,
      thinkerProfileReady,
      guidanceExact,
      canonicalQuestion,
      questionContextReady,
      bookReady,
      bookCoveredContexts,
      bookTotalContexts: bookContexts.length,
      uncoveredBookContexts,
      structurallyComplete,
    };
  });

  const total = records.length;
  const count = (field) => records.filter((record) => record[field]).length;
  const missingIds = (field) => records.filter((record) => !record[field]).map((record) => record.id);

  return {
    runtimeVersion: runtime.contentVersion,
    total,
    summary: {
      explanationReady: count('explanationReady'),
      thinkerProfileReady: count('thinkerProfileReady'),
      guidanceExact: count('guidanceExact'),
      canonicalQuestion: count('canonicalQuestion'),
      questionContextReady: count('questionContextReady'),
      bookReady: count('bookReady'),
      bookCoveredContexts: records.reduce((total, record) => total + record.bookCoveredContexts, 0),
      bookTotalContexts: records.reduce((total, record) => total + record.bookTotalContexts, 0),
      bookUncoveredContexts: records.reduce((total, record) => total + record.uncoveredBookContexts.length, 0),
      structurallyComplete: count('structurallyComplete'),
    },
    missing: {
      explanation: missingIds('explanationReady'),
      thinkerProfile: missingIds('thinkerProfileReady'),
      canonicalQuestion: missingIds('canonicalQuestion'),
      questionContext: missingIds('questionContextReady'),
      book: missingIds('bookReady'),
    },
    distribution: {
      byPrimaryFeeling: summarizeBy(records, 'primaryFeeling'),
      byPlacement: summarizeBy(records, 'placement'),
    },
    records,
  };
}

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) {
  const audit = auditFourBlockCoverage();
  const summaryOnly = process.argv.includes('--summary');
  console.log(JSON.stringify(summaryOnly ? {
    runtimeVersion: audit.runtimeVersion,
    total: audit.total,
    summary: audit.summary,
    missingCounts: Object.fromEntries(Object.entries(audit.missing).map(([key, ids]) => [key, ids.length])),
    distribution: audit.distribution,
  } : audit, null, 2));
}
