# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static showcase website for "Black & White by Joel Soto", a lifestyle brand selling jewelry and apparel. No build tools or package manager.

**Live URL:** `https://dajozu2513.github.io/black-and-white-joel`

## Development

No build or compile step. Open `index.html` directly in a browser, or serve locally:

```bash
# Node (custom server — handles all asset paths correctly)
node .claude/server.js

# npx serve (serves from project root)
npx serve . -l 8080
```

The Node server (`.claude/server.js`) serves the project root on port 8081 and is the preferred option since it resolves all relative paths correctly.

## Architecture

Structure is split across three files: `index.html` (markup), `css/styles.css` (all styles), `js/main.js` (all behaviour). No bundler — browsers load them directly.

**Files:**
```
index.html               — markup only; links css/styles.css and js/main.js
css/styles.css           — all styles, including animations and responsive rules
js/main.js               — all interactivity (intro, parallax, carousel, modal)
articles/                — standalone brand editorial pages (see Article pages below)
pictures/
  background/            — chain.JPG (hero + separator parallax), horizontal.JPG, vertical.JPG
  products/              — 9 product images (Void, Star, Monolith, Static,
                           Together, Meridian, Heart, Echo, Snake)
og.jpg                   — Open Graph / Twitter Card share image
```

**HTML structure (top-to-bottom):**
1. `#intro-screen` — Full-screen branded splash; fades out after 2 s then is removed from DOM
2. `<header id="site-header">` — Fixed nav; gains `.scrolled` class when `scrollY > 60px`
3. `#hero` — Full-viewport hero; `chain.JPG` background via `#hero-bg`
4. Pillars section — Three brand statements with `.observe-fade` scroll animation
5. Separator — Parallax divider (`#separator-bg-wrap`) using `chain.JPG`
6. `#coleccion` — 9-slide product carousel with product modal
7. Separator 2 (`#separator2-bg-wrap`) — second parallax divider, own headline
8. Articles section — grid of 3 cards linking to standalone pages in `articles/`
9. `<footer>` — Brand name and copyright

**Article pages (`articles/*.html`):** standalone HTML documents, one per editorial piece (`el-acero-como-lenguaje.html`, `la-cadena-como-objeto.html`, `negro-sobre-blanco.html`). Each reuses the same header/footer markup and `css/styles.css` (referenced as `../css/styles.css` since they live one level deep) but has no `js/main.js` — no carousel/parallax/modal on these pages. `<body class="page-article">` scopes article-only styles. Adding a new article means: create the HTML file following the existing pattern, and add a matching `.article-card` link in the `articles-section` of `index.html`.

**JavaScript (`js/main.js`):**
- Intro: removes `#intro-screen` after 2 s fade-out via `setTimeout`
- `updateParallax()` — `translateY` offsets on `#hero-bg` (35%) and `#separator-bg` (30%)
- `goTo(n)` — carousel navigation (prev/next buttons, dot nav, touch swipe ≥ 40 px, keyboard arrows); also triggers `.slide-name-animate` CSS class swap for name transition
- Two `IntersectionObserver` instances: `.observe-fade` (12% threshold) and `.observe-reveal` (30% threshold) for scroll-driven animations
- `openModal(name, imgSrc)` / `closeModal()` — product detail modal; closes on overlay click or Escape key
- `PRODUCTS` object — keyed by product name, holds `desc` (Spanish copy) and `wa` (pre-encoded WhatsApp URL)

**CSS custom properties** (defined on `:root`):
- `--bg`, `--surface`, `--ink`, `--ink-mid`, `--ink-light`, `--border`, `--radius`
- `--font-display` (Cormorant Garamond), `--font-body` (Montserrat) via Google Fonts

## Content

- Language: Spanish (`lang="es"`, locale `es_CR`)
- 9 products: Void, Star, Monolith, Static, Together, Meridian, Heart, Echo, Snake
- Each product has a unique poetic description stored in the `PRODUCTS` JS object
- WhatsApp CTA links to `wa.me/50660062513` with a pre-filled message per product
- Clicking a product image or name opens a modal with image, description, and WhatsApp button
