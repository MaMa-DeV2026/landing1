(function () {
  'use strict';

  const SUPPORTED_LANGUAGES = ['fa', 'en'];
  const DEFAULT_LANGUAGE = 'fa';
  const STORAGE_KEY = 'mamad_dev_language';
  const RTL_LANGUAGES = ['fa', 'ar', 'he', 'ur'];

  let currentLanguage = DEFAULT_LANGUAGE;
  let translations = {};
  let isInitialized = false;

  async function loadTranslations(lang) {
    try {
      const response = await fetch(`./locales/${lang}.json`);
      if (!response.ok) throw new Error(`Failed to load ${lang}.json: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`[i18n] Error loading ${lang}:`, error);
      return null;
    }
  }

  async function initializeTranslations() {
    const promises = SUPPORTED_LANGUAGES.map(lang => loadTranslations(lang));
    const results = await Promise.all(promises);
    SUPPORTED_LANGUAGES.forEach((lang, index) => {
      translations[lang] = results[index];
    });
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  function translate(key, params = {}) {
    const translation = getNestedValue(translations[currentLanguage], key);
    if (translation === undefined) {
      console.warn(`[i18n] Missing translation: ${key} for ${currentLanguage}`);
      return key;
    }
    if (typeof translation !== 'string') return translation;
    let result = translation;
    Object.entries(params).forEach(([param, value]) => {
      result = result.replace(new RegExp(`{{${param}}}`, 'g'), value);
    });
    return result;
  }

  function t(key, params = {}) {
    return translate(key, params);
  }

  function getLanguage() {
    return currentLanguage;
  }

  function getDirection(lang) {
    return RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
  }

  function isRTL() {
    return getDirection(currentLanguage) === 'rtl';
  }

  async function setLanguage(lang) {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      console.error(`[i18n] Unsupported language: ${lang}`);
      return false;
    }
    if (lang === currentLanguage) return true;
    if (!translations[lang]) {
      const translation = await loadTranslations(lang);
      if (!translation) return false;
      translations[lang] = translation;
    }
    currentLanguage = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('[i18n] Could not save to localStorage');
    }
    updateDOM();
    window.dispatchEvent(new CustomEvent('languagechange', {
      detail: { language: lang, direction: getDirection(lang) }
    }));
    return true;
  }

  function updateMeta() {
    document.title = t('meta.title');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = t('meta.description');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = t('meta.ogTitle');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = t('meta.ogDescription');
  }

  function updateDOM() {
    const direction = getDirection(currentLanguage);
    const html = document.documentElement;

    html.setAttribute('lang', currentLanguage);
    html.setAttribute('dir', direction);
    document.body.setAttribute('dir', direction);
    document.body.setAttribute('lang', currentLanguage);

    updateMeta();

    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translated = translate(key);
      if (translated === undefined || translated === null) return;
      const attr = element.getAttribute('data-i18n-attr');
      if (attr) {
        element.setAttribute(attr, String(translated));
      }
      if (!attr || element.hasAttribute('data-i18n-text')) {
        element.textContent = String(translated);
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translated = translate(key);
      if (translated !== undefined) {
        element.setAttribute('placeholder', String(translated));
      }
    });

    updateLanguageSwitcher();
  }

  function updateLanguageSwitcher() {
    const switcher = document.querySelector('.lang-switcher');
    if (switcher) {
      switcher.textContent = t('language.switchTo');
      switcher.setAttribute('aria-label', t('language.ariaSwitchTo'));
    }
  }

  function createLanguageSwitcher() {
    if (document.querySelector('.lang-switcher')) return;

    const button = document.createElement('button');
    button.className = 'lang-switcher';
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', t('language.ariaSwitchTo'));
    button.textContent = t('language.switchTo');

    button.addEventListener('click', () => {
      const newLang = currentLanguage === 'fa' ? 'en' : 'fa';
      setLanguage(newLang);
    });

    const nav = document.querySelector('.nav');
    if (nav) {
      nav.appendChild(button);
    }
  }

  async function init() {
    if (isInitialized) return;

    let savedLang = null;
    try {
      savedLang = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      console.warn('[i18n] Could not read from localStorage');
    }

    if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
      currentLanguage = savedLang;
    } else {
      const browserLang = navigator.language || navigator.userLanguage;
      const shortLang = browserLang.split('-')[0];
      if (SUPPORTED_LANGUAGES.includes(shortLang)) {
        currentLanguage = shortLang;
      }
    }

    await initializeTranslations();
    updateDOM();
    createLanguageSwitcher();
    isInitialized = true;
  }

  window.i18n = {
    t,
    translate,
    setLanguage,
    getLanguage,
    getDirection,
    isRTL,
    SUPPORTED_LANGUAGES,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
