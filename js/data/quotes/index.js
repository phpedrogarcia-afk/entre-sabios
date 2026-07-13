// Recompõe o banco de frases na mesma ordem original.
(function initEntreSabiosQuotes(root) {
  const data = root.EntreSabiosData = root.EntreSabiosData || {};
  const batches = data.quoteBatches || {};

  data.curatedContentDb = [
    ...(batches.base || []),
    ...(batches.batch01 || []),
    ...(batches.batch02 || []),
    ...(batches.batch03 || []),
    ...(batches.batch04 || []),
    ...(batches.batch05 || []),
    ...(batches.batch06 || []),
    ...(batches.batch07 || []),
    ...(batches.batch08 || []),
  ];
})(typeof window !== 'undefined' ? window : globalThis);
