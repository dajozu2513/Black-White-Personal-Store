# Black & White by Joel Soto

Static showcase website for **Black & White**, a brand of exclusive, handmade jewelry and design accessories. Built with vanilla HTML, CSS, and JavaScript — no frameworks or build tools.

---

## Technologies

- HTML5 / CSS3 / JavaScript (ES6+)
- Google Fonts: Cormorant Garamond + Montserrat
- GitHub Pages (deploy)

## Structure

```
index.html               — main markup
css/styles.css           — global styles, animations, and responsive design
js/main.js               — interactivity (intro, parallax, carousel, modal)
articles/                — brand editorial articles
pictures/
  background/            — hero and parallax divider images
  products/               — 9 product images
og.jpg                    — Open Graph / Twitter Card image
```

## Sections

1. **Intro screen** — full-screen brand splash, dismissed after 2 s
2. **Fixed header** — gains `.scrolled` class after 60 px of scroll
3. **Hero** — full-viewport section with parallax on `chain.JPG`
4. **Pillars** — three brand statements with on-scroll animation
5. **Divider** — parallax separator
6. **Collection** — carousel of 9 products with a detail modal and WhatsApp CTA
7. **Footer** — brand name and copyright

## Run Locally

```bash
# Option 1 — included Node server (resolves all asset paths)
node .claude/server.js
# Access at http://localhost:8081

# Option 2 — npx serve
npx serve . -l 8080
```

`index.html` can also be opened directly in the browser.

## Products

Void · Star · Monolith · Static · Together · Meridian · Heart · Echo · Snake

Each product has a poetic description in Spanish and a pre-configured WhatsApp link.

---

Developed by **Joel Soto** — Costa Rica
