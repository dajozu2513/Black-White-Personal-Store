# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static showcase website for "Black & White by Joel Soto", a lifestyle brand selling handmade steel jewelry. Vanilla HTML/CSS/JS — no framework, build step, package manager, linter, or tests.

**Live URL:** `https://dajozu2513.github.io/black-and-white-joel` (GitHub Pages; absolute `og:url`/`og:image` meta tags in `index.html` point here). `render.yaml` also defines a Render static-site deploy of the repo root from `main`.

## Development

```bash
node .claude/server.js    # serves project root at http://localhost:8081 (preferred)
npx serve . -l 8080       # alternative
```

`index.html` can also be opened directly from disk. `.claude/launch.json` defines matching preview configs (node on 8081; `npx serve` and Python `http.server` on 8080).

`.claude/server.js` is minimal: it doesn't strip query strings (`styles.css?v=2` → 404), and its MIME map only covers html/css/js/jpg/jpeg/png. If you add SVG, WebP or font files, extend that map, or they will be served as `application/octet-stream`.
## Architecture

`index.html` (markup + its translation dictionary), `css/styles.css` (all styles), `js/i18n.js` (language switching), `js/main.js` (home-page behaviour), `js/chain3d.js` (3D chain, ES module). Script order on the home page matters: `i18n.js` → inline `BWI18N.init({...})` → `main.js` → `chain3d.js` (module).

### 3D chain (`js/chain3d.js`)

One long steel chain drawn with Three.js `0.183.0`, loaded from jsdelivr through the `<script type="importmap">` in `index.html`'s `<head>` (no npm). It lives on a single fixed, full-viewport canvas (`#chain-stage`, `z-index: -1`) behind the whole home page. The hero and the two `.separator` bands are transparent "windows" onto it; every other section has an opaque background and covers it. **A new home-page section without a background will show the chain behind it**, and a section that fades its own opacity in will flash black.

- The chain is built in code: one `TubeGeometry` link swept along a stadium curve, drawn with an `InstancedMesh` along a `CatmullRomCurve3`, lit by `studioEnvironment()`: a dark room with a few bright HDR strip lights and a soft front box, built in code and baked with `PMREMGenerator` (no HDR or model files). That contrast is what makes it read as silver steel like the product photos; the earlier evenly lit `RoomEnvironment` made it look white. Tune the look with the panel intensities, the room colour, `roughness` and `toneMappingExposure`. Every other link uses the curve's binormal instead of its normal, so neighbours interlock.
- `buildPath()` builds the curve from the live layout: an open necklace around the hero title, then a drape across each band (sagging under the first band's phrase, above the second's). Both drapes pass at the depth of the necklace's nearest point (`z = -R * sin(tilt)`), so the links read the same size in all three windows; the owner asked for that. Each band's stretch sits at the camera height that band will have when it is centred on screen (`cameraYFor`). It is rebuilt on resize and whenever `document.body` changes size (fonts and images loading move the bands). Shape, depth and sag adapt to the viewport aspect so the chain clears the text on phones.
- The camera follows an eased copy of the scroll position (`smoothScroll`, time constant `SCROLL_EASE`) at 0.75× (parallax), so it glides after the page instead of tracking each wheel step; the owner asked for a calm, slow response. It deliberately ignores the pointer and device orientation (the owner disliked that). Links slide along the path (`flow`) on their own (`DRIFT`), and scrolling hauls them along like pulling the chain by hand: `pullSpeed` follows the raw scroll velocity × `PULL`, taking hold fast (`PULL_GRIP`) and coasting to a stop after the scroll ends (`PULL_COAST`). Scrolling up pulls it back. The owner wants this to feel like the chain is being pulled. Only links inside the view are written to the instance buffer each frame.
- The render loop runs only while the hero or a band is on screen and the tab is visible. With `prefers-reduced-motion` there is no loop and no parallax: it redraws on scroll only.
- Fallback: an inline `<head>` script adds `has-3d` to `<html>` when WebGL and modules are available and the page isn't on `file://`. CSS then hides the hero/band photos from the first paint. If the dynamic import or `WebGLRenderer` fails, `chain3d.js` removes `has-3d` and the stage, and the photos come back. Opening `index.html` from disk therefore always shows the photos.

### Internationalization (ES/EN)

All user-facing copy is bilingual. Spanish is the default and the text hard-coded in the HTML; English comes from a dictionary.

- `js/i18n.js` exposes `window.BWI18N` with `init(dict)` and `getLang()`. Language is persisted in `localStorage['bw-lang']`.
- Each page calls `BWI18N.init({ es: {...}, en: {...} })` in an inline `<script>` with its own dictionary. Keys are page-local (the home page uses `pillar1.title`, `article1.title`, …; article pages use `title`, `p1`…`p6`, …).
- Elements opt in via attributes: `data-i18n` (sets `textContent`), `data-i18n-html` (sets `innerHTML`, used for `<em>` emphasis), `data-i18n-aria` (sets `aria-label`). The special key `pageTitle` sets `document.title`.
- `.lang-opt[data-lang]` buttons in the header switch language; switching dispatches a `bw-lang-change` event on `document`.
- **When editing or adding copy, update both the Spanish markup and both `es`/`en` dictionary entries.**

### Home page (`js/main.js`)

`main.js` runs at the top level with no `DOMContentLoaded` wrapper, so it relies on being the last script in `<body>`.

- `#site-header` gets `.scrolled` after 60 px of scroll. This is only done in `main.js`, so article pages style their header statically through `.page-article #site-header` rules.
- Intro splash `#intro-screen` (logo rises, `.intro-line` hairline draws, tagline spreads) lifts away as a `clip-path` curtain after 2 s, and is skipped entirely on later loads in the same tab (`sessionStorage['introSeen']`). While it shows, `body.intro-pending` pauses the hero's CSS entrance animations so they play as the splash lifts.
- `#site-header .scroll-progress` is a 1 px page-progress hairline, scaled in the same scroll rAF as the parallax.
- The hero title is split into `.char` spans at runtime for the letter-by-letter entrance (the `<h1>` keeps an `aria-label`). The hero deliberately has no call-to-action button: visitors are meant to scroll through the chain rather than jump to the collection.
- Hero photo parallax is JS (`#hero-bg` translateY at 0.35× scroll via rAF); it only matters when the 3D fallback shows the photo.
- The two `.separator` bands: with `has-3d` they are windows onto the 3D chain (`.separator-bg` hidden, a radial `.separator-overlay` darkens only behind the phrase). In the fallback, `.separator-bg` is 36% taller than the band, and the same rAF drifts it and eases it out of a 1.1× zoom as the band crosses the viewport (static with reduced motion); don't go back to `background-attachment: fixed`, iOS ignores it. Either way, `.separator::after` is an animated SVG film-grain layer above the overlay and below the headline (`z-index: 2`).
- Pillar icons draw themselves: `main.js` gives every SVG shape whose `stroke` isn't `"none"` the `.draw` class plus a measured `--len`, and every other shape `.fill`. Solid shapes in a new icon must say `stroke="none"` or they'll be treated as outlines.
- The hero and separator fallbacks use `pictures/background/horizontal.JPG`, swapped for `vertical.JPG` under `@media (orientation: portrait)`. (`chain.JPG` is currently unused.)
- `.observe-fade` / `.observe-reveal` elements get `.visible` via IntersectionObservers (12% / 30% thresholds).
- Collection (`#coleccion`, `.collection-section`): a 3×3 `.collection-grid` of square `.product` buttons showing all nine pieces at once (2 columns under 700 px, with the first piece spanning both). It sits on the light page background between the two black bands, so the page alternates black and white (the owner wants that balance).
  - Every product photo has the same diagonal of white paper and black fabric, so side by side they form one continuous pattern; that is the point of the grid. Names (`.product-name`, lower-left, `mix-blend-mode: difference`) appear on hover and are always shown on touch screens. On a fine pointer the other pieces fade back while one is hovered. Products fade in staggered by their inline `--i`.
  - Each `.product` also has an inline `--zoom` and `--focus`: the photos were shot at different distances, so each is scaled (about chain-width-of-Void ÷ its chain width, capped at 2.4) around the point where its chain crosses the paper/fabric edge, making every chain read at a similar size while the diagonal pattern stays aligned. Void (1) is the reference. The modal still shows the unzoomed photo.
  - History: a carousel (wipe, then a stage with neighbours, outlined big name, counter) was built and dropped because the owner found it busy. If the grid is rejected too, the agreed next option is a typographic index of product names with the photo appearing on hover.
- Product modal: clicking a `.product` reads its `.product-name` text and looks it up in the `PRODUCTS` object, which is keyed by product name with `{ es: { desc, waText }, en: { desc, waText } }`. The WhatsApp link (`wa.me/50660062513`) is built at render time from `waText`, and the modal re-renders on `bw-lang-change`.
  - The modal is an editorial detail view on the page's paper colour (`--bg`): photo and text side by side (stacked under 760 px), the name in thin spaced capitals, and the WhatsApp link as a plain underlined `.modal-btn` with an arrow, not a filled button. Its photo has the same grayscale treatment as the grid.
  - Opening runs a FLIP animation: the modal image starts over the grid photo and flies into place. The overlay and card therefore animate only their background colour, never `opacity`, or the flying image would fade with them. Closing adds `.is-closing` for a 350 ms fade before `open` is removed.
  - The overlay sits at `z-index: 300` (above the fixed header) and scrolls when the card is taller than the viewport. Product names are the same in both languages and must not get a `data-i18n` attribute. Translating `.product-name` would break the `PRODUCTS` lookup.

**Adding/removing a product** touches several hand-maintained places in `index.html`: a `.product` button in `.collection-grid` (with the next `--i`, a `--zoom`/`--focus` matched to its photo, an empty `alt` and the `.product-name`) — plus a `PRODUCTS` entry in `main.js` whose key exactly matches the `.product-name` text, and the image in `pictures/products/`.

### Article pages (`articles/*.html`)

Standalone documents with `<body class="page-article">` (scopes article-only CSS). They reuse the header/footer markup and reference assets one level up (`../css/styles.css`, `../js/i18n.js`). They load `i18n.js` with their own dictionary, then `js/article.js` (header `.scroll-progress` measured across the article text, and paragraphs that rise in via `.reveal-p`), but not `main.js`. The "← Volver" link goes to `../index.html#lecturas`, the articles section.

### Page transitions

Cross-document View Transitions (`@view-transition { navigation: auto; }` in `styles.css`, only under `prefers-reduced-motion: no-preference`; other browsers just navigate). The old page sinks and fades, the new one rises, and `#site-header` has its own `view-transition-name` so it stays put. Each home-page card title and its article's `<h1>` share an inline `style="view-transition-name: article-<file-slug>"`, so the title morphs between pages. Names must be unique per page.

To add an article: copy an existing article file (change its `<h1>`'s `view-transition-name` to the new slug), then add an `.article-card` link in the `.articles-section` of `index.html` with new `articleN.*` keys in both language dictionaries there and the matching `view-transition-name` on the card's `<h3>`. The `.articles-grid` is an editorial index, not boxed cards: one row per `.article-card` between 1px rules (CSS counter number + category, title and excerpt, "Leer"), stacking under 700 px. Rows fade in staggered by `:nth-child` (up to 3 are styled).

## Styling

Design tokens live on `:root` in `css/styles.css`: `--bg`, `--surface`, `--ink`, `--ink-mid`, `--ink-light`, `--border`, `--radius`, `--font-display` (Cormorant Garamond), `--font-body` (Montserrat). Fonts load from Google Fonts in each page's `<head>`. Motion respects `prefers-reduced-motion` (see the REDUCED MOTION block in `styles.css`); keep new animations inside that contract. Image files use uppercase `.JPG` extensions — keep references case-exact since GitHub Pages is case-sensitive.

## Content

- Default locale Spanish (`lang="es"`, `og:locale` `es_CR`); English via the toggle.
- 9 products: Void, Star, Monolith, Static, Together, Meridian, Heart, Echo, Snake — each with poetic copy in both languages.
