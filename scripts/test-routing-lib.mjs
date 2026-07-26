import path from 'node:path';

const ORDER = Object.freeze([
  'governance', 'state', 'synthesis', 'motivation', 'ranking', 'rotation', 'editorial', 'ui', 'seo', 'browser', 'stress', 'fast',
]);

const normalize = (filePath) => filePath.replaceAll('\\', '/').replace(/^\.\//, '');

export function groupsForFiles(filePaths) {
  const groups = new Set();

  for (const input of filePaths) {
    const file = normalize(input);
    const name = path.posix.basename(file).toLowerCase();
    const fileGroups = new Set();
    if (/-PEDRO\.[^/]+$/i.test(file) || /^curadoria-rigida-3\.1(?:\/|\.zip$)/i.test(file)) continue;

    if (/^(agents|decisions|project_status|documentacao_entre_sabios|registro_problemas_recorrentes)\.md$/i.test(name)
      || file === 'deploy-manifest.json'
      || /^(scripts\/(check-governance|governance-lib|test-routing-lib|select-tests|check-deploy|deploy-lib|build-deploy-package)|tests\/(governance-contract|deploy-manifest))\./.test(file)) {
      fileGroups.add('governance');
    }

    if (file === 'entre_sabios_acervo_mestre_final.json' || file.startsWith('data/entre_sabios_runtime')) {
      ['state', 'ranking', 'rotation', 'editorial'].forEach((group) => fileGroups.add(group));
    }
    if (/emotional-state|principal-focus|feelings-ui/.test(file)) fileGroups.add('state');
    if (/synthes|color-analogy/.test(file)) fileGroups.add('synthesis');
    if (/motivation|vulnerable/.test(file)) fileGroups.add('motivation');
    if (/runtime-engine|matching|candidate-contract|selection-progression/.test(file)) {
      ['ranking', 'rotation'].forEach((group) => fileGroups.add(group));
    }
    if (/repetition|queue-migration|selection-atomicity/.test(file)) fileGroups.add('rotation');
    if (/repetition-stress|behavioral-selection|selection-atomicity/.test(file)) fileGroups.add('stress');
    if (/editorial|authorship|book|content-runtime|entre_sabios_acervo/.test(file)) fileGroups.add('editorial');
    if (/^(index\.html|script\.js|style\.css|seo\.css)$/.test(file)
      || file.startsWith('css/') || file.startsWith('js/ui/') || file.startsWith('js/features/')
      || /interface|sharing|tale-image|copy-removal|gender-preference/.test(file)) fileGroups.add('ui');
    if (file === 'script.js') ['ranking', 'rotation'].forEach((group) => fileGroups.add(group));
    if (/^(sitemap\.xml|robots\.txt|\.htaccess)$/.test(file)
      || /^(sentimentos|pensadores|contos|ensaios)\//.test(file) || /seo/.test(name)) fileGroups.add('seo');
    if (/^(index\.html|script\.js|style\.css)$/.test(file)
      || file.startsWith('css/') || file.startsWith('data/') || file.startsWith('js/')
      || file.startsWith('tests/browser/') || file === 'playwright.config.mjs') fileGroups.add('browser');

    if ((file.startsWith('js/') || file.startsWith('scripts/') || file.startsWith('tests/')) && !fileGroups.size) {
      fileGroups.add('fast');
    }
    fileGroups.forEach((group) => groups.add(group));
  }

  if (!groups.size) groups.add('governance');
  return ORDER.filter((group) => groups.has(group));
}
