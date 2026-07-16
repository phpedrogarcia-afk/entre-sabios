import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = fs.readFileSync(path.join(rootDir, 'script.js'), 'utf8');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
const matching = fs.readFileSync(path.join(rootDir, 'js/core/matching.js'), 'utf8');
const runtimeEngine = fs.readFileSync(path.join(rootDir, 'js/core/runtime-engine.js'), 'utf8');
const lockStart = script.indexOf('const REFLECTION_SELECTION_LOCK_MS');
const listenersStart = script.indexOf("generateBtn.addEventListener('click'");
const lockSource = script.slice(lockStart, listenersStart);
const newListenerSource = script.match(/newBtn\.addEventListener\('click',[\s\S]*?\n\}\);/)?.[0] || '';

function createSandbox() {
  let clickHandler = null;
  const scheduled = [];
  const sandbox = {
    generateBtn: { disabled: false },
    newBtn: {
      disabled: false,
      addEventListener(event, handler) {
        assert.equal(event, 'click');
        clickHandler = handler;
      },
    },
    runtimeSelector: {},
    window: {
      setTimeout(callback, delay) {
        scheduled.push({ callback, delay });
      },
    },
  };
  vm.runInNewContext(lockSource, sandbox);
  return {
    sandbox,
    scheduled,
    installNewListener(overrides = {}) {
      Object.assign(sandbox, overrides);
      vm.runInNewContext(newListenerSource, sandbox);
      return clickHandler;
    },
  };
}

test('mouse, teclado e toque passam pelo mesmo listener e pela mesma trava', () => {
  const environment = createSandbox();
  let selections = 0;
  let bells = 0;
  const handler = environment.installNewListener({
    newPhrase() {
      selections += 1;
      return true;
    },
    playSoftBell() {
      bells += 1;
    },
  });

  for (const source of ['mouse', 'keyboard', 'touch']) {
    handler({ type: 'click', source });
    handler({ type: 'click', source: `${source}-duplicated` });
    assert.equal(environment.scheduled.at(-1).delay, 350);
    environment.scheduled.at(-1).callback();
  }

  assert.equal(selections, 3);
  assert.equal(bells, 3);
});

test('a trava cobre a transação inteira e sempre libera os controles', () => {
  const environment = createSandbox();
  const order = [];
  const first = environment.sandbox.runReflectionSelectionAction(() => {
    order.push('read-state', 'select-and-persist', 'update-history', 'render');
    return true;
  });
  const concurrent = environment.sandbox.runReflectionSelectionAction(() => {
    order.push('concurrent-selection');
    return true;
  });

  assert.equal(first, true);
  assert.equal(concurrent, false);
  assert.deepEqual(order, ['read-state', 'select-and-persist', 'update-history', 'render']);
  assert.equal(environment.sandbox.generateBtn.disabled, true);
  assert.equal(environment.sandbox.newBtn.disabled, true);
  environment.scheduled[0].callback();
  assert.equal(environment.sandbox.generateBtn.disabled, false);
  assert.equal(environment.sandbox.newBtn.disabled, false);

  assert.throws(() => environment.sandbox.runReflectionSelectionAction(() => {
    throw new Error('falha controlada');
  }), /falha controlada/);
  assert.equal(environment.sandbox.newBtn.disabled, true);
  environment.scheduled[1].callback();
  assert.equal(environment.sandbox.newBtn.disabled, false);
});

test('botões nativos possuem um único listener de seleção e não criam caminhos paralelos', () => {
  assert.match(html, /<button\s+id="generateBtn"/);
  assert.match(html, /<button\s+id="newBtn"[^>]*type="button"/);
  assert.equal((script.match(/generateBtn\.addEventListener\('click'/g) || []).length, 1);
  assert.equal((script.match(/newBtn\.addEventListener\('click'/g) || []).length, 1);
  assert.doesNotMatch(script, /(generateBtn|newBtn)\.addEventListener\('(touchstart|touchend|pointerdown|pointerup|keydown)'/);
  assert.equal((script.match(/runReflectionSelectionAction\(\(\) =>/g) || []).length, 2);
});

test('persistência do motor e históricos passivos antecedem a renderização', () => {
  const selectSource = runtimeEngine.slice(
    runtimeEngine.indexOf('function select(state, options = {})'),
    runtimeEngine.indexOf('function clear({ includeRecent'),
  );
  assert.ok(selectSource.indexOf('recentSelections.push({') < selectSource.indexOf('persist();'));
  assert.ok(selectSource.indexOf('persist();') < selectSource.indexOf('return {'));

  const pickSource = matching.slice(matching.indexOf('function pickRuntimeContent'));
  assert.ok(pickSource.indexOf('runtimeSelector.select') < pickSource.indexOf('saveViewedStoryKeys();'));
  assert.ok(pickSource.indexOf('saveViewedStoryKeys();') < pickSource.indexOf('return { ...result, state };'));

  const newPhraseSource = script.slice(script.indexOf('function newPhrase()'), script.indexOf('// Compartilhamento como imagem'));
  assert.ok(newPhraseSource.indexOf('pickRuntimeContent') < newPhraseSource.indexOf('history.push(story)'));
  assert.ok(newPhraseSource.indexOf('history.push(story)') < newPhraseSource.indexOf('renderStory(story)'));
});
