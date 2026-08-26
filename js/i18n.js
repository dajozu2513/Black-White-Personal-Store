(function () {
  const STORAGE_KEY = 'bw-lang';

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || 'es';
  }

  function setActiveToggle(lang) {
    document.querySelectorAll('.lang-opt').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  function applyDict(dict, lang) {
    const strings = dict[lang] || dict.es;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (strings[key] !== undefined) el.textContent = strings[key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (strings[key] !== undefined) el.innerHTML = strings[key];
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (strings[key] !== undefined) el.setAttribute('aria-label', strings[key]);
    });

    if (strings.pageTitle) document.title = strings.pageTitle;
  }

  window.BWI18N = {
    getLang,
    init(dict) {
      let lang = getLang();
      document.documentElement.lang = lang;
      applyDict(dict, lang);
      setActiveToggle(lang);

      document.querySelectorAll('.lang-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          lang = btn.dataset.lang;
          if (lang === getLang()) return;
          localStorage.setItem(STORAGE_KEY, lang);
          document.documentElement.lang = lang;
          applyDict(dict, lang);
          setActiveToggle(lang);
          document.dispatchEvent(new CustomEvent('bw-lang-change', { detail: { lang } }));
        });
      });
    }
  };
})();
