// Apply the saved skin before styles load, including when the API is unavailable.
(() => {
  const storageKey = 'language-room-theme';
  const root = document.documentElement;
  const normalize = value => value === 'dark' ? 'dark' : 'light';

  function syncControls() {
    const dark = root.dataset.theme === 'dark';
    const zh = root.lang === 'zh';
    const button = document.getElementById('theme-toggle');
    if (button) {
      const label = zh ? `切换到${dark ? '浅色' : '深色'}皮肤` : `Switch to ${dark ? 'light' : 'dark'} skin`;
      button.textContent = dark ? 'Light' : 'Dark';
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-pressed', String(dark));
      button.title = `${label} · Ctrl+Shift+L`;
    }
    const select = document.getElementById('skin');
    if (select) select.value = root.dataset.theme;
  }

  function apply(value, persist = false) {
    root.dataset.theme = normalize(value);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', root.dataset.theme === 'dark' ? '#171f1c' : '#f7f6f2');
    if (persist) {
      try { localStorage.setItem(storageKey, root.dataset.theme); } catch { /* Skin still works without storage. */ }
      window.dispatchEvent(new CustomEvent('language-room-theme-change',{detail:root.dataset.theme}));
    }
    syncControls();
  }

  let saved;
  try { saved = localStorage.getItem(storageKey); } catch { /* Preserve the light default. */ }
  apply(saved);
  const toggle = () => apply(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
  window.languageRoomTheme={apply:value=>apply(value,false)};

  document.addEventListener('DOMContentLoaded', syncControls);
  new MutationObserver(syncControls).observe(root, { attributes: true, attributeFilter: ['lang'] });
  document.addEventListener('click', event => {
    const button = event.target.closest('#theme-toggle');
    if (button && !button.disabled) {
      toggle();
      if (event.detail > 0) button.blur();
    }
  });
  document.addEventListener('change', event => {
    if (event.target.id === 'skin') apply(event.target.value, true);
  });
  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.isComposing || event.keyCode === 229 || event.repeat || !event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey) return;
    if (event.code !== 'KeyL' && event.key.toLowerCase() !== 'l') return;
    event.preventDefault();
    toggle();
  });
  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) apply(event.newValue);
  });
})();
