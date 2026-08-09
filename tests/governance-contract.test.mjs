import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { inspectGovernance } from '../scripts/governance-lib.mjs';
import { groupsForFiles } from '../scripts/test-routing-lib.mjs';

const rootDir = path.resolve(import.meta.dirname, '..');

test('governança viva permanece consistente', () => {
  const result = inspectGovernance(rootDir);
  assert.deepEqual(result.errors, []);
  assert.ok(result.decisionCount >= 22);
});

test('roteamento relaciona mudanças críticas aos grupos corretos', () => {
  assert.deepEqual(groupsForFiles(['js/core/runtime-engine.js']), ['ranking', 'rotation', 'browser']);
  assert.deepEqual(groupsForFiles(['entre_sabios_acervo_mestre_final.json']), ['state', 'ranking', 'rotation', 'editorial']);
  assert.deepEqual(groupsForFiles(['css/responsive.css']), ['ui', 'browser']);
  assert.deepEqual(groupsForFiles(['DECISIONS.md']), ['governance']);
});

test('verificador rejeita marcador de estado obsoleto', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'entre-sabios-governance-'));
  for (const file of ['AGENTS.md', 'DECISIONS.md', 'DOCUMENTACAO_ENTRE_SABIOS.md', 'PROJECT_STATUS.md', 'REGISTRO_PROBLEMAS_RECORRENTES.md']) {
    fs.copyFileSync(path.join(rootDir, file), path.join(temp, file));
  }
  fs.appendFileSync(path.join(temp, 'PROJECT_STATUS.md'), '\naguarda aprovação da Fase 8\n');
  const result = inspectGovernance(temp);
  assert.ok(result.errors.some((error) => error.includes('marcador obsoleto')));
  fs.rmSync(temp, { recursive: true, force: true });
});

test('decisões aprovadas preservam quatro blocos e registram a trajetória interna', () => {
  const decisions = fs.readFileSync(path.join(rootDir, 'DECISIONS.md'), 'utf8');
  const editorialStandard = fs.readFileSync(path.join(rootDir, 'PADRAO_EDITORIAL_ENTRE_SABIOS.md'), 'utf8');
  const projectStatus = fs.readFileSync(path.join(rootDir, 'PROJECT_STATUS.md'), 'utf8');

  assert.match(decisions, /DEC-008[\s\S]*?\*\*Estado:\*\* substituída[\s\S]*?\*\*Substituída por:\*\* `DEC-025`/);
  assert.match(decisions, /DEC-023[\s\S]*?\*\*Estado:\*\* substituída[\s\S]*?\*\*Substituída por:\*\* `DEC-026`/);
  assert.match(decisions, /DEC-025[\s\S]*?\*\*Estado:\*\* vigente/);
  assert.match(decisions, /DEC-026[\s\S]*?\*\*Estado:\*\* substituída[\s\S]*?\*\*Substituída por:\*\* `DEC-027`/);
  assert.match(decisions, /DEC-027[\s\S]*?\*\*Estado:\*\* substituída[\s\S]*?\*\*Substituída por:\*\* `DEC-034`/);
  assert.match(decisions, /DEC-028[\s\S]*?\*\*Estado:\*\* substituída[\s\S]*?\*\*Substituída por:\*\* `DEC-034`/);
  assert.match(decisions, /DEC-034[\s\S]*?\*\*Estado:\*\* vigente/);

  for (const heading of [
    'O QUE ESSA FRASE QUER DIZER',
    'CONHEÇA O PENSADOR',
    'UMA PERGUNTA',
    'LIVRO RECOMENDADO'
  ]) {
    assert.ok(decisions.includes(heading));
    assert.ok(editorialStandard.includes(heading));
  }

  assert.match(decisions, /a abertura favorece intensidade fraca/);
  assert.match(decisions, /mesmos filtros e no mesmo motor/);
  assert.match(projectStatus, /sem controle público; abertura fraca, progressão moderada/);
  assert.doesNotMatch(projectStatus, /código ainda exige escolha explícita/);
  assert.match(projectStatus, /257 IDs ativos auditados; explicações, perfis, perguntas e livros completos nos 257 conteúdos/);
  assert.match(decisions, /DEC-029 — Antologia do Silêncio sai do acervo ativo por proveniência artificial confirmada/);
  assert.match(decisions, /DEC-030 — Auditoria completa separa ausência de prova de fabricação artificial/);
  assert.match(decisions, /DEC-031 — Crédito integral ao Entre Sábios exige base autoral humana/);
  assert.match(decisions, /a `DEC-031` substitui apenas a preservação automática de originais G sem base autoral/);
  assert.match(projectStatus, /350 IDs classificados individualmente; ativos: A 3, B 15, C 1, D 3, E 76 e G 159/);
  assert.match(projectStatus, /2\.121 de 2\.121 contextos possuem relação substantiva/);
  assert.doesNotMatch(projectStatus, /cobertura universal ainda não auditada nem implementada/);
});
