import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const masterPath = path.join(rootDir, 'entre_sabios_acervo_mestre_final.json');
const args = process.argv.slice(2);
const apply = args.includes('--apply');
const inputArg = args.find((arg) => !arg.startsWith('--'));

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

assert(inputArg, 'Informe o caminho de um lote JSON V2.');
const inputPath = path.resolve(rootDir, inputArg);
assert(inputPath.startsWith(path.join(rootDir, 'curadoria', 'v2', 'aprovados') + path.sep),
  'O lote deve estar em curadoria/v2/aprovados/.');

const master = JSON.parse(fs.readFileSync(masterPath, 'utf8'));
const batch = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
assert(typeof batch.batchId === 'string' && batch.batchId.trim(), 'batchId é obrigatório.');
assert(typeof batch.approvedBy === 'string' && batch.approvedBy.trim(), 'approvedBy é obrigatório.');
assert(typeof batch.approvedAt === 'string' && batch.approvedAt.trim(), 'approvedAt é obrigatório.');
assert(Array.isArray(batch.contents) && batch.contents.length > 0, 'contents deve ser um lote não vazio.');

const requiredFields = [
  'id', 'originalText', 'finalText', 'displayType', 'attributionType', 'author',
  'displayedAuthor', 'source', 'associations', 'placement', 'editorialFunction',
  'suitableIntensities', 'tone', 'themes', 'riskTags', 'hardExclusions',
  'status', 'publicationEnabled',
  'editorialExplanation', 'editorialQuestion',
];
const existingIds = new Set(master.contents.map(({ id }) => id));
const batchIds = new Set();
const activeTexts = new Set(master.contents
  .filter(({ publicationEnabled }) => publicationEnabled)
  .map(({ finalText }) => String(finalText).trim().toLocaleLowerCase('pt-BR')));

for (const item of batch.contents) {
  for (const field of requiredFields) {
    assert(Object.hasOwn(item, field), `${item.id || '(sem id)'}: campo obrigatório ausente: ${field}.`);
  }
  assert(typeof item.id === 'string' && item.id.trim(), 'Todo conteúdo precisa de ID.');
  assert(!existingIds.has(item.id), `ID já existe no mestre: ${item.id}.`);
  assert(!batchIds.has(item.id), `ID duplicado no lote: ${item.id}.`);
  assert(typeof item.finalText === 'string' && item.finalText.trim(), `${item.id}: finalText vazio.`);
  assert(typeof item.editorialExplanation === 'string' && item.editorialExplanation.trim(),
    `${item.id}: editorialExplanation vazio.`);
  assert(typeof item.editorialQuestion === 'string' && item.editorialQuestion.trim(),
    `${item.id}: editorialQuestion vazio.`);
  assert(item.source && typeof item.source === 'object' && !Array.isArray(item.source),
    `${item.id}: source deve ser um objeto documental.`);
  assert(typeof item.source.title === 'string' && item.source.title.trim(), `${item.id}: source.title vazio.`);
  assert(typeof item.source.url === 'string' && item.source.url.trim(), `${item.id}: source.url vazio.`);
  assert(Array.isArray(item.associations), `${item.id}: associations deve ser uma lista.`);
  assert(Array.isArray(item.suitableIntensities) && item.suitableIntensities.length > 0,
    `${item.id}: suitableIntensities deve ser informado editorialmente.`);
  const normalizedText = item.finalText.trim().toLocaleLowerCase('pt-BR');
  assert(!activeTexts.has(normalizedText), `${item.id}: texto já existe no acervo ativo.`);
  batchIds.add(item.id);
  activeTexts.add(normalizedText);
}

if (!apply) {
  console.log(`Lote ${batch.batchId} validado: ${batch.contents.length} conteúdo(s). Nenhum arquivo foi alterado.`);
  console.log('Use --apply somente depois da aprovação humana registrada.');
  process.exit(0);
}

master.contents.push(...batch.contents);
if (typeof batch.targetContentVersion === 'string' && batch.targetContentVersion.trim()) {
  master.contentVersion = batch.targetContentVersion.trim();
}
const active = master.contents.filter(({ publicationEnabled }) => publicationEnabled);
const countBy = (items, selector) => Object.fromEntries(items.reduce((counts, item) => {
  const key = selector(item);
  counts.set(key, (counts.get(key) || 0) + 1);
  return counts;
}, new Map()));
const summary = {
  historicalTotal: master.contents.length,
  activeTotal: active.length,
  removedTotal: master.contents.filter(({ status }) => status === 'REMOVIDO').length,
  movedToTextsTotal: master.contents.filter(({ status }) => status === 'MOVER_PARA_TEXTOS').length,
  quarantineTotal: master.contents.filter(({ status }) => status === 'QUARENTENA_DOCUMENTAL').length,
  referencePendingTotal: active.filter(({ status }) => status === 'ATIVO_REFERENCIA_PENDENTE').length,
  activeByPlacement: Object.fromEntries(['nucleo', 'contextual', 'geral'].map((placement) => [
    placement, active.filter((item) => item.placement === placement).length,
  ])),
  activeByFormat: countBy(active, (item) => item.displayType),
  activeByAttributionType: countBy(active, (item) => item.attributionType),
  activeByAuthor: countBy(active, (item) => item.displayedAuthor),
  activeByTone: countBy(active, (item) => item.tone),
  activeByEditorialFunction: countBy(active, (item) => item.editorialFunction),
  activeByIntensityCombination: countBy(active, (item) => item.suitableIntensities.join('+')),
};
master.summary = { ...master.summary, ...summary };
master.finalizationSummary = { ...master.finalizationSummary, ...summary };
master.changeLog = Array.isArray(master.changeLog) ? master.changeLog : [];
master.changeLog.push({
  date: new Date().toISOString().slice(0, 10),
  batchId: batch.batchId,
  approvedBy: batch.approvedBy,
  approvedAt: batch.approvedAt,
  importedContents: batch.contents.map(({ id }) => id),
  source: path.relative(rootDir, inputPath).replaceAll(path.sep, '/'),
});
const pendingMasterPath = `${masterPath}.v2-import-pending`;
const backupMasterPath = `${masterPath}.v2-import-backup`;
fs.writeFileSync(pendingMasterPath, `${JSON.stringify(master, null, 2)}\n`, 'utf8');
try {
  fs.renameSync(masterPath, backupMasterPath);
  try {
    fs.renameSync(pendingMasterPath, masterPath);
    fs.unlinkSync(backupMasterPath);
  } catch (error) {
    if (!fs.existsSync(masterPath) && fs.existsSync(backupMasterPath)) {
      fs.renameSync(backupMasterPath, masterPath);
    }
    throw error;
  }
} finally {
  if (fs.existsSync(pendingMasterPath)) fs.unlinkSync(pendingMasterPath);
}
console.log(`Lote ${batch.batchId} importado no mestre: ${batch.contents.length} conteúdo(s).`);
console.log('Execute npm run build:content e npm run check:content.');
