# 🌐 Internationalization (i18n) System

**Document Version:** 1.0
**Date:** 2024-06-25
**Languages:** Persian (fa), English (en)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [JSON Translation Files](#json-translation-files)
4. [JavaScript API](#javascript-api)
5. [CSS Guidelines](#css-guidelines)
6. [HTML Integration](#html-integration)
7. [SEO Considerations](#seo-considerations)
8. [Adding New Translations](#adding-new-translations)
9. [Testing Checklist](#testing-checklist)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    i18n SYSTEM                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐     ┌──────────────┐                   │
│  │   Browser   │────▶│  localStorage │                   │
│  │  Language   │     │  (persistence)│                   │
│  └──────────────┘     └──────────────┘                   │
│         │                       │                           │
│         ▼                       ▼                           │
│  ┌──────────────────────────────────┐                   │
│  │      Translation Loader           │                   │
│  │   ./locales/{lang}.json          │                   │
│  └──────────────────────────────────┘                   │
│         │                                               │
│         ▼                                               │
│  ┌──────────────────────────────────┐                   │
│  │      DOM Update Engine           │                   │
│  │   - lang attribute              │                   │
│  │   - dir attribute (RTL/LTR)    │                   │
│  │   - data-i18n elements          │                   │
│  └──────────────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
stire/
├── locales/
│   ├── fa.json          # Persian (default)
│   └── en.json          # English
├── js/
│   └── i18n.js         # Translation engine
├── css/
│   └── i18n.css        # RTL/LTR styles
└── index.html           # Updated with i18n includes
```

---

## JSON Translation Files

### Structure

```json
{
  "section": {
    "subsection": "Translated text",
    "withParams": "Hello, {{name}}!"
  }
}
```

### Key Naming Convention

| Pattern | Example | Usage |
|---------|---------|-------|
| `section.subsection` | `hero.title1` | Main content |
| `section.label` | `about.label` | Section labels |
| `section.desc` | `about.desc1` | Descriptions |
| `section.action` | `hero.cta1` | Buttons/CTAs |

---

## JavaScript API

### Functions

```javascript
// Get translation
i18n.t('hero.title1'); // "Professional Quality,"
i18n.t('hero.title2'); // "Fair Price"

// Get current language
i18n.getLanguage(); // 'fa' or 'en'

// Check RTL
i18n.isRTL(); // true for Persian, false for English

// Change language
await i18n.setLanguage('en');
await i18n.setLanguage('fa');

// Get direction
i18n.getDirection('fa'); // 'rtl'
i18n.getDirection('en'); // 'ltr'
```

### Events

```javascript
// Listen for language changes
window.addEventListener('languagechange', (e) => {
  console.log('Language changed to:', e.detail.language);
  console.log('Direction:', e.detail.direction);
});
```

---

## CSS Guidelines

### RTL/LTR Switching

```css
/* Persian styles (default RTL) */
html[lang="fa"] .element {
  direction: rtl;
  text-align: right;
}

/* English styles (LTR) */
html[lang="en"] .element {
  direction: ltr;
  text-align: left;
}
```

### Key Properties to Flip

| Property | RTL | LTR |
|----------|-----|-----|
| `text-align` | `right` | `left` |
| `margin-right` | positive | negative |
| `margin-left` | negative | positive |
| `padding-right` | positive | negative |
| `padding-left` | negative | positive |
| `float` | `right` | `left` |

### Code Blocks (Always LTR)

```css
html[lang="fa"] .code-block,
html[lang="en"] .code-block {
  direction: ltr;
  text-align: left;
}
```

---

## HTML Integration

### Data Attributes

```html
<!-- Simple text translation -->
<span data-i18n="hero.title1">کیفیت حرفه‌ای،</span>

<!-- With attribute translation -->
<a href="#" data-i18n="nav.home" data-i18n-attr="aria-label">خانه</a>

<!-- Placeholders -->
<input type="text" data-i18n-placeholder="name" placeholder="نام">

<!-- Dynamic content -->
<script>
  // Translate on the fly
  element.textContent = i18n.t('hero.subtitle');
</script>
```

### Meta Tags (Dynamic)

```javascript
// Update page title
document.title = i18n.t('meta.title');

// Update meta description
document.querySelector('meta[name="description"]').content = i18n.t('meta.description');
```

---

## SEO Considerations

### Implementation

```javascript
// In i18n.js updateDOM()
function updateMeta() {
  document.title = translate('meta.title');
  document.querySelector('meta[name="description"]').content = translate('meta.description');
  document.querySelector('meta[property="og:title"]').content = translate('meta.title');
}
```

### hreflang Tags

```html
<!-- Add to <head> for bilingual SEO -->
<link rel="alternate" hreflang="fa" href="https://mamadweb.netlify.app/" />
<link rel="alternate" hreflang="en" href="https://mamadweb.netlify.app/en/" />
<link rel="alternate" hreflang="x-default" href="https://mamadweb.netlify.app/" />
```

### URL Structure Options

| Option | URL | Pros | Cons |
|--------|-----|------|------|
| Subdirectory | `/fa/` `/en/` | Best SEO | Requires server config |
| Subdomain | `fa.example.com` | Clean | DNS setup |
| Query param | `?lang=en` | Simple | Weak SEO |
| Content negotiation | HTTP headers | Best UX | Complex |

---

## Adding New Translations

### Step 1: Add to JSON files

```json
// locales/fa.json
{
  "section": {
    "newKey": "متن جدید"
  }
}

// locales/en.json
{
  "section": {
    "newKey": "New text"
  }
}
```

### Step 2: Use in HTML

```html
<span data-i18n="section.newKey">Default text</span>
```

### Step 3: Use in JavaScript

```javascript
const text = i18n.t('section.newKey');
```

---

## Testing Checklist

### Functionality

- [ ] Language switcher appears
- [ ] Click switches between Persian/English
- [ ] localStorage saves preference
- [ ] Page reloads with saved language
- [ ] All sections translate correctly

### RTL/LTR

- [ ] Persian: RTL layout correct
- [ ] English: LTR layout correct
- [ ] Icons flip correctly
- [ ] Forms align correctly
- [ ] Navigation works correctly

### Accessibility

- [ ] Screen reader announces language
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Color contrast maintained

### SEO

- [ ] Meta tags update
- [ ] hreflang tags present
- [ ] Sitemap includes both versions

---

## Browser Support

| Browser | RTL Support |
|---------|------------|
| Chrome 90+ | ✅ Full |
| Firefox 88+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| iOS Safari 14+ | ✅ Full |

---

## Performance

| Metric | Value |
|--------|-------|
| Translation files | ~5KB each |
| i18n.js | ~8KB |
| CSS | ~3KB |
| Total overhead | ~16KB |
| First contentful paint | <1.5s |

---

## Future Enhancements

- [ ] Lazy load translation files
- [ ] Pluralization support
- [ ] Date/time localization
- [ ] Number formatting (Persian numerals)
- [ ] Currency formatting
- [ ] Language detection from URL
- [ ] Browser extension for testing
