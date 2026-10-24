# Black & White by Joel Soto

Static showcase website for **Black & White by Joel Soto**, a brand of exclusive, handmade jewelry and design accessories. Built with vanilla HTML, CSS, and JavaScript — no frameworks or build tools.

The site is bilingual: Spanish by default, with an **ES / EN** toggle in the header.

---

## Technologies

- HTML5 / CSS3 / JavaScript (ES6+)
- Three.js 0.183.0 (via import map from jsdelivr, home-page hero only)
- Google Fonts: Cormorant Garamond + Montserrat
- GitHub Pages (deploy); `render.yaml` also defines a Render static-site deploy

## Structure

```
index.html               — home page markup + its ES/EN dictionary
css/styles.css           — global styles, animations, and responsive design
js/i18n.js               — language switching (ES/EN), shared by all pages
js/main.js               — home-page interactivity (intro, title animation, collection grid, modal)
js/chain3d.js            — 3D steel chain behind the home page (Three.js, loaded from a CDN)
js/article.js            — article pages: reading progress and paragraph reveal
articles/                — brand editorial articles (bilingual)
pictures/
  background/            — hero and divider fallback images (horizontal + vertical)
  products/              — 9 product images
og.jpg                   — Open Graph / Twitter Card image
```

## Sections

1. **Intro screen** — full-screen brand splash, dismissed after 2 s (shown once per browser tab)
2. **Fixed header** — brand, tagline and ES/EN toggle; gains `.scrolled` class after 60 px of scroll
3. **Hero** — full-viewport black window onto a 3D steel chain that runs behind the whole page: here it loops around a letter-by-letter title (no button, so visitors scroll through the page). Without WebGL (or when opened from disk) the hero and dividers show the photo background instead (`horizontal.JPG`, or `vertical.JPG` on portrait screens)
4. **Pillars** — three brand statements with on-scroll animation
5. **Divider** — black band where the chain hangs below a phrase
6. **Collection** — all 9 products in a 3×3 grid whose photos line up into one black-and-white pattern; names on hover, a detail modal and WhatsApp CTA
7. **Divider** — second black band, the chain draped above a phrase
8. **Articles** — an editorial index of the three articles, one row each between thin rules; in supporting browsers the page cross-fades and the card title morphs into the article heading
9. **Footer** — brand name and copyright

## Languages

Spanish copy is written directly in the HTML. English comes from a dictionary in each page's inline `BWI18N.init({ es, en })` script. Elements that get translated carry a `data-i18n`, `data-i18n-html` or `data-i18n-aria` attribute. The chosen language is saved in `localStorage` (`bw-lang`) and carries over between the home page and the articles.

## Articles

- **El acero como lenguaje** / *Steel as Language* — `articles/el-acero-como-lenguaje.html`
- **La cadena como objeto** / *The Chain as Object* — `articles/la-cadena-como-objeto.html`
- **Negro sobre blanco** / *Black on White* — `articles/negro-sobre-blanco.html`

## Run Locally

```bash
# Option 1 — included Node server
node .claude/server.js
# Access at http://localhost:8081

# Option 2 — npx serve
npx serve . -l 8080
```

`index.html` can also be opened directly in the browser, but the 3D hero needs a local server (ES modules don't load from `file://`), so the photo shows instead.

## Products

Void · Star · Monolith · Static · Together · Meridian · Heart · Echo · Snake

Each product has a poetic description in Spanish and English and a pre-configured WhatsApp link whose message follows the selected language.

---

Developed by **Joel Soto** — Costa Rica
