# Black & White by Joel Soto

Sitio web estático de exhibición para **Black & White**, marca de joyería y accesorios de diseño exclusivo, hecho a mano. Desarrollado con HTML, CSS y JavaScript vanilla — sin frameworks ni herramientas de build.

**Live:** [https://dajozu2513.github.io/black-and-white-joel](https://dajozu2513.github.io/Proyecto-Black-White/)

---

## Tecnologías

- HTML5 / CSS3 / JavaScript (ES6+)
- Google Fonts: Cormorant Garamond + Montserrat
- GitHub Pages (deploy)

## Estructura

```
index.html               — markup principal
css/styles.css           — estilos globales, animaciones y responsive
js/main.js               — interactividad (intro, parallax, carrusel, modal)
articles/                — artículos editoriales de la marca
pictures/
  background/            — imágenes hero y separador parallax
  products/              — 9 imágenes de productos
og.jpg                   — imagen Open Graph / Twitter Card
```

## Secciones

1. **Intro screen** — splash de marca a pantalla completa, se elimina a los 2 s
2. **Header fijo** — gana clase `.scrolled` al bajar 60 px
3. **Hero** — viewport completo con parallax en `chain.JPG`
4. **Pilares** — tres declaraciones de marca con animación on-scroll
5. **Separador** — divider parallax
6. **Colección** — carrusel de 9 productos con modal de detalle y CTA de WhatsApp
7. **Footer** — nombre de marca y copyright

## Correr localmente

```bash
# Opción 1 — servidor Node incluido (resuelve todos los asset paths)
node .claude/server.js
# Acceder en http://localhost:8081

# Opción 2 — npx serve
npx serve . -l 8080
```

También se puede abrir `index.html` directamente en el browser.

## Productos

Void · Star · Monolith · Static · Together · Meridian · Heart · Echo · Snake

Cada producto tiene descripción poética en español y enlace de WhatsApp pre-configurado.

---

Desarrollado por **Joel Soto** — Costa Rica
