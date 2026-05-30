// Theme toggle: stores 'light' or 'dark' in localStorage under 'theme'
(function(){
  const THEME_KEY = 'theme';

  function applyTheme(theme){
    try{
      if(theme === 'dark'){
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      localStorage.setItem(THEME_KEY, theme);
    }catch(e){console.error(e)}
  }

  function toggleTheme(){
    const current = localStorage.getItem(THEME_KEY) || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    updateToggleButton();
  }

  function updateToggleButton(){
    const btn = document.getElementById('themeToggle');
    const theme = localStorage.getItem(THEME_KEY) || 'light';
    if(!btn) return;
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.title = theme === 'dark' ? 'Светлая тема' : 'Тёмная тема';
  }

  function init(){
    const saved = localStorage.getItem(THEME_KEY) || 'light';
    applyTheme(saved);
    updateToggleButton();

    document.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('#themeToggle');
      if(btn){
        toggleTheme();
      }
    });

    // Ensure update when components inserted
    document.addEventListener('componentsIncluded', () => setTimeout(updateToggleButton, 50));
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
