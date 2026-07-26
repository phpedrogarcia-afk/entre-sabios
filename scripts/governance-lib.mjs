import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_FILES = Object.freeze([
  'AGENTS.md',
  'DECISIONS.md',
  'DOCUMENTACAO_ENTRE_SABIOS.md',
  'PROJECT_STATUS.md',
  'REGISTRO_PROBLEMAS_RECORRENTES.md',
]);

const REQUIRED_AGENT_SECTIONS = Object.freeze([
  '## Barreira de contradições',
  '## Tratamento de problemas recorrentes',
  '## Hierarquia das fontes de verdade',
]);

const STALE_STATUS_MARKERS = Object.freeze([
  'aguarda aprovação da Fase 8',
  'aguarda aprovação e decisão Git separada',
]);

export function inspectGovernance(rootDir) {
  const errors = [];
  const warnings = [];
  const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

  for (const relativePath of REQUIRED_FILES) {
    if (!fs.existsSync(path.join(rootDir, relativePath))) {
      errors.push(`Arquivo de governança ausente: ${relativePath}.`);
    }
  }
  if (errors.length) return { errors, warnings, decisionCount: 0 };

  const agents = read('AGENTS.md');
  const decisions = read('DECISIONS.md');
  const status = read('PROJECT_STATUS.md');

  for (const section of REQUIRED_AGENT_SECTIONS) {
    if (!agents.includes(section)) errors.push(`AGENTS.md não contém a seção obrigatória: ${section}.`);
  }
  for (const command of ['npm run test:changed', 'npm run verify', 'npm run check:deploy']) {
    if (!agents.includes(command)) errors.push(`AGENTS.md não referencia o comando obrigatório: ${command}.`);
  }

  const matches = [...decisions.matchAll(/^### DEC-(\d{3}) — /gm)];
  const ids = matches.map((match) => Number(match[1]));
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) errors.push('DECISIONS.md contém IDs duplicados.');
  ids.forEach((id, index) => {
    if (index > 0 && id <= ids[index - 1]) errors.push(`DEC-${String(id).padStart(3, '0')} está fora de ordem.`);
  });

  const decisionBlocks = decisions.split(/^### /gm).filter((block) => /^DEC-\d{3}\b/.test(block));
  const allowedStates = new Set(['vigente', 'em revisão', 'substituída', 'regredida']);
  for (const block of decisionBlocks) {
    const id = block.match(/^DEC-\d{3}/)?.[0] ?? 'DEC desconhecida';
    const state = block.match(/^- \*\*Estado:\*\*\s*([^.;\r\n]+)/m)?.[1]?.trim();
    if (!state) errors.push(`${id} não declara Estado.`);
    else if (!allowedStates.has(state)) errors.push(`${id} usa estado inválido: ${state}.`);
  }

  for (const marker of STALE_STATUS_MARKERS) {
    if (status.includes(marker)) errors.push(`PROJECT_STATUS.md contém marcador obsoleto: “${marker}”.`);
  }
  if (!status.includes('Relatórios de fases são evidências históricas')) {
    warnings.push('PROJECT_STATUS.md deveria reafirmar que relatórios são evidências históricas.');
  }
  if (!decisions.includes('DEC-020')) errors.push('A decisão do preflight assistido por IA não está registrada.');

  return { errors, warnings, decisionCount: ids.length };
}
