import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runtime = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'entre_sabios_runtime.json'), 'utf8'));
const synthesisCode = fs.readFileSync(path.join(rootDir, 'js', 'data', 'emotional-syntheses.js'), 'utf8');
const sandbox = { window: { EntreSabiosData: {} } };
vm.runInNewContext(synthesisCode, sandbox);
const catalog = sandbox.window.EntreSabiosData.emotionalSyntheses;
const active = runtime.contents.filter(({ publicationEnabled }) => publicationEnabled);
const intensities = ['fraca', 'moderada', 'intensa'];
const displayTypes = ['frase', 'citacao_curta', 'citacao_longa', 'microtexto', 'reflexao_curta'];

function countBy(items, valueFor) {
  return Object.fromEntries([...items.reduce((map, item) => {
    const key = valueFor(item);
    map.set(key, (map.get(key) || 0) + 1);
    return map;
  }, new Map())].sort(([a], [b]) => a.localeCompare(b, 'pt-BR')));
}

function associatedWith(content, feeling, placement) {
  return content.associations.some((association) => (
    association.feeling === feeling && (!placement || association.placement === placement)
  ));
}

const feelings = Object.fromEntries(runtime.feelings.map(({ id }) => {
  const eligible = active.filter((content) => associatedWith(content, id));
  const coverageByIntensity = Object.fromEntries(intensities.map((intensity) => [
    intensity,
    eligible.filter((content) => content.suitableIntensities.includes(intensity)).length,
  ]));
  const combinations = runtime.feelings
    .map(({ id: secondary }) => {
      if (secondary === id) return null;
      const territory = eligible.filter((content) => associatedWith(content, secondary)).length;
      return { secondary, territory };
    })
    .filter(Boolean)
    .sort((a, b) => a.territory - b.territory || a.secondary.localeCompare(b.secondary, 'pt-BR'));
  return [id, {
    totalEligible: eligible.length,
    nucleus: eligible.filter((content) => associatedWith(content, id, 'nucleo')).length,
    contextual: eligible.filter((content) => associatedWith(content, id, 'contextual')).length,
    formats: Object.fromEntries(displayTypes.map((type) => [
      type,
      eligible.filter((content) => content.displayType === type).length,
    ])),
    editorialFunctions: countBy(eligible, ({ editorialFunction }) => editorialFunction),
    authors: [...new Set(eligible.map(({ displayedAuthor }) => displayedAuthor).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'pt-BR')),
    intensityCoverage: coverageByIntensity,
    priorityCombinations: combinations.slice(0, 5),
    availableBeforeRepeat: Math.min(...Object.values(coverageByIntensity)),
  }];
}));

const specificPairs = Object.keys(catalog.directionalPairs || {}).sort();
const specificTriads = Object.keys(catalog.triadOverrides || {}).sort();
const allPairs = runtime.feelings.flatMap(({ id: primary }) => runtime.feelings
  .filter(({ id }) => id !== primary)
  .map(({ id: secondary }) => `${primary}__${secondary}`));
const fallbackPairs = allPairs.filter((key) => !specificPairs.includes(key)).sort();
const report = {
  generatedAt: new Date().toISOString(),
  contentVersion: runtime.contentVersion,
  synthesis: {
    specificPairs,
    specificTriads,
    fallbackPairs,
    fallbackPolicy: 'Combinações sem síntese específica ficam ocultas na interface.',
  },
  gapsByFeeling: feelings,
};

const outputDir = path.join(rootDir, 'curadoria', 'v2', 'relatorios');
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'matriz_lacunas_v2.json'), `${JSON.stringify(report, null, 2)}\n`);
const lines = [
  '# Matriz de lacunas editoriais V2',
  '',
  `Versão do acervo: \`${runtime.contentVersion}\`. Gerado por \`npm run report:editorial-v2\`.`,
  '',
  `Sínteses específicas: ${specificPairs.length} pares e ${specificTriads.length} tríade(s). Pares dependentes de fallback oculto: ${fallbackPairs.length}.`,
  '',
  '| Sentimento | Elegível | Núcleo | Contextual | Frase | Cit. curta | Cit. longa | Microtexto | Reflexão curta | Antes de repetir |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ...Object.entries(feelings).map(([feeling, row]) => (
    `| ${feeling} | ${row.totalEligible} | ${row.nucleus} | ${row.contextual} | ${row.formats.frase} | ${row.formats.citacao_curta} | ${row.formats.citacao_longa} | ${row.formats.microtexto} | ${row.formats.reflexao_curta} | ${row.availableBeforeRepeat} |`
  )),
  '',
  'Funções, autores, cobertura por intensidade e combinações prioritárias estão no JSON reproduzível ao lado.',
  '',
];
fs.writeFileSync(path.join(outputDir, 'MATRIZ_LACUNAS_V2.md'), `${lines.join('\n')}\n`);
console.log(`Relatórios V2 gerados em ${path.relative(rootDir, outputDir)}.`);
