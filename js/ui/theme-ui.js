// Controle visual dos temas Luz do Dia e Floresta Noturna.

const THEME_STORAGE_KEY = 'entreSabiosTheme';

function getSavedTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'night' ? 'night' : 'day';
  } catch (error) {
    return 'day';
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    // Se o navegador bloquear localStorage, a troca visual ainda funciona na sessão atual.
  }
}

function applySiteTheme(theme) {
  const normalizedTheme = theme === 'night' ? 'night' : 'day';
  document.documentElement.dataset.theme = normalizedTheme;
  document.documentElement.style.colorScheme = normalizedTheme === 'night' ? 'dark' : 'light';

  const button = document.getElementById('themeToggleBtn');
  if (!button) return;

  const nightActive = normalizedTheme === 'night';
  button.textContent = nightActive ? '☼' : '☾';
  button.setAttribute('aria-label', nightActive ? 'Ativar Luz do Dia' : 'Ativar Floresta Noturna');
  button.title = nightActive ? 'Ativar Luz do Dia' : 'Ativar Floresta Noturna';
  button.classList.toggle('is-night', nightActive);
}

function toggleSiteTheme() {
  const currentTheme = document.documentElement.dataset.theme === 'night' ? 'night' : 'day';
  const nextTheme = currentTheme === 'night' ? 'day' : 'night';
  applySiteTheme(nextTheme);
  saveTheme(nextTheme);
}

function initThemeToggle() {
  applySiteTheme(getSavedTheme());
  const button = document.getElementById('themeToggleBtn');
  if (button) button.addEventListener('click', toggleSiteTheme);
}
