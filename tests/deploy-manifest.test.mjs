import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { inspectDeployManifest } from '../scripts/deploy-lib.mjs';

const rootDir = path.resolve(import.meta.dirname, '..');

test('pacote público contém somente a allowlist e resolve referências locais', () => {
  const result = inspectDeployManifest(rootDir);
  assert.deepEqual(result.errors, []);
  assert.ok(result.files.includes('index.html'));
  assert.ok(result.files.includes('data/entre_sabios_runtime.js'));
});

test('pacote público exclui fontes internas e versões paralelas', () => {
  const { files } = inspectDeployManifest(rootDir);
  const forbidden = files.filter((file) => /(?:^|\/)(?:tests|scripts)(?:\/|$)|entre_sabios_acervo_mestre|RELATORIO_|AUDITORIA_|-PEDRO|\.zip$/i.test(file));
  assert.deepEqual(forbidden, []);
});
