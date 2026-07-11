// Dados extraídos de script.js durante a Fase 2 da refatoração segura.
// Não alterar conteúdo editorial nesta fase.
(function initEntreSabiosData(root) {
  const data = root.EntreSabiosData = root.EntreSabiosData || {};

data.shareCardThemes = {
  cream: {
    name: 'Creme',
    page: '#fbf8ef',
    top: '#f8efd7',
    bottom: '#e9dfbd',
    glow: 'rgba(255, 255, 235, 0.7)',
    leaf: 'rgba(125, 150, 91, 0.26)',
    leafDark: 'rgba(88, 119, 74, 0.2)',
    ink: '#282217',
    muted: 'rgba(40, 34, 23, 0.68)',
    stroke: 'rgba(68, 57, 37, 0.15)',
  },
  sage: {
    name: 'Verde',
    page: '#f5f7ec',
    top: '#e3ebcb',
    bottom: '#adbd7c',
    glow: 'rgba(255, 255, 227, 0.72)',
    leaf: 'rgba(75, 112, 68, 0.28)',
    leafDark: 'rgba(54, 84, 52, 0.22)',
    ink: '#292219',
    muted: 'rgba(41, 34, 25, 0.66)',
    stroke: 'rgba(54, 75, 42, 0.17)',
  },
  blue: {
    name: 'Azul',
    page: '#f3f7f4',
    top: '#dce9df',
    bottom: '#a5bec1',
    glow: 'rgba(245, 252, 237, 0.64)',
    leaf: 'rgba(70, 103, 99, 0.24)',
    leafDark: 'rgba(45, 76, 76, 0.2)',
    ink: '#25231d',
    muted: 'rgba(37, 35, 29, 0.65)',
    stroke: 'rgba(45, 76, 76, 0.17)',
  },
};
})(typeof window !== 'undefined' ? window : globalThis);
