  // ── INTRO SCREEN ──
  const introScreen = document.getElementById('intro-screen');
  if (sessionStorage.getItem('introSeen')) {
    introScreen.remove();
  } else {
    sessionStorage.setItem('introSeen', '1');
    // Hero entrance animations wait (paused in CSS) until the splash starts fading
    document.body.classList.add('intro-pending');
    setTimeout(() => {
      introScreen.classList.add('fade-out');
      document.body.classList.remove('intro-pending');
      setTimeout(() => introScreen.remove(), 1000);
    }, 2000);
  }

  // ── HERO TITLE: split into letters for the staggered entrance ──
  const heroTitle = document.querySelector('.hero-title');
  let charIndex = 0;
  function splitChars(node) {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        [...child.textContent].forEach(ch => {
          const span = document.createElement('span');
          span.className = 'char';
          span.setAttribute('aria-hidden', 'true');
          span.style.setProperty('--i', charIndex++);
          span.textContent = ch === ' ' ? ' ' : ch;
          frag.appendChild(span);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        splitChars(child);
      }
    });
  }
  splitChars(heroTitle);
  heroTitle.classList.add('is-split');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // ── HEADER SCROLL ──
  const header = document.getElementById('site-header');
  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader(); // a reload can restore the page mid-scroll

  // ── PARALLAX ──
  const heroBg = document.getElementById('hero-bg');

  const separators = [...document.querySelectorAll('.separator')].map(el => ({ el, bg: el.querySelector('.separator-bg') }));
  const scrollProgress = document.querySelector('.scroll-progress');

  let rafPending = false;
  function updateParallax() {
    const vh = window.innerHeight;
    heroBg.style.transform = `translateY(${window.scrollY * 0.35}px)`;

    // Separator photos drift slower than the page and ease out of a slight zoom
    if (!reduceMotion.matches) {
      separators.forEach(({ el, bg }) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (vh - r.top) / (vh + r.height); // 0 entering at the bottom → 1 leaving at the top
        bg.style.transform = `translate3d(0, ${(p - 0.5) * r.height * 0.3}px, 0) scale(${1.1 - p * 0.1})`;
      });
    }

    const max = document.documentElement.scrollHeight - vh;
    scrollProgress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    rafPending = false;
  }
  window.addEventListener('scroll', () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(updateParallax);
    }
  }, { passive: true });
  updateParallax();

  // ── PILLAR ICONS: outlines draw in, solid shapes fade in after (see CSS) ──
  document.querySelectorAll('.pillar-icon').forEach(svg => {
    svg.querySelectorAll('circle, rect, path, polygon').forEach(shape => {
      if (shape.getAttribute('stroke') !== 'none') {
        shape.style.setProperty('--len', Math.ceil(shape.getTotalLength()) + 1);
        shape.classList.add('draw');
      } else {
        shape.classList.add('fill');
      }
    });
  });

  // ── FADE-IN ON SCROLL ──
  const fadeEls = document.querySelectorAll('.observe-fade');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  fadeEls.forEach(el => io.observe(el));

  // ── TITLE REVEAL ON SCROLL ──
  const revealEls = document.querySelectorAll('.observe-reveal');
  const ioReveal = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        ioReveal.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  revealEls.forEach(el => ioReveal.observe(el));

  // ── PRODUCT MODAL ──
  const PRODUCTS = {
    'Void':     {
      es: { desc: 'El eslabón más honesto que existe, sin ruido ni adornos. Solo la forma en su estado más puro. Existir así de claro es casi un acto de rebeldía.', waText: 'Hola, tengo interés en la cadena *Void*. Quisiera una pieza: ' },
      en: { desc: 'The most honest link there is, no noise or ornament. Just form in its purest state. Existing this clearly is almost an act of rebellion.', waText: "Hi, I'm interested in the *Void* chain. I'd like to order a piece: " }
    },
    'Star':     {
      es: { desc: 'Pequeña, constante, imposible de ignorar. Lleva esa misma tensión del universo que no necesita volumen para hacerse sentir.', waText: 'Hola, tengo interés en la cadena *Star*. Quisiera una pieza: ' },
      en: { desc: "Small, constant, impossible to ignore. It carries the same tension as the universe, one that never needs volume to make itself felt.", waText: "Hi, I'm interested in the *Star* chain. I'd like to order a piece: " }
    },
    'Monolith': {
      es: { desc: 'Hay cosas que no piden permiso para existir. Esta cadena es una de ellas. Sólida, sin disculpas, sin necesidad de explicación.', waText: 'Hola, tengo interés en la cadena *Monolith*. Quisiera una pieza: ' },
      en: { desc: "Some things don't ask permission to exist. This chain is one of them. Solid, unapologetic, needing no explanation.", waText: "Hi, I'm interested in the *Monolith* chain. I'd like to order a piece: " }
    },
    'Static':   {
      es: { desc: 'El momento exacto antes de que todo tenga sentido o deje de tenerlo. Esa frecuencia entre el orden y el caos, hecha acero.', waText: 'Hola, tengo interés en la cadena *Static*. Quisiera una pieza: ' },
      en: { desc: 'The exact moment before everything starts making sense, or stops. That frequency between order and chaos, made steel.', waText: "Hi, I'm interested in the *Static* chain. I'd like to order a piece: " }
    },
    'Together': {
      es: { desc: 'Dos hilos que no se buscan, se encuentran. No se necesitan para existir, pero juntos dicen algo que ninguno puede decir solo.', waText: 'Hola, tengo interés en la cadena *Together*. Quisiera una pieza: ' },
      en: { desc: "Two threads that don't seek each other out, they meet. Neither needs the other to exist, but together they say something neither can say alone.", waText: "Hi, I'm interested in the *Together* chain. I'd like to order a piece: " }
    },
    'Meridian': {
      es: { desc: 'La línea que separa lo conocido de lo que aún no tiene nombre. Precisa, inevitable, imposible de ignorar.', waText: 'Hola, tengo interés en la cadena *Meridian*. Quisiera una pieza: ' },
      en: { desc: 'The line that separates what is known from what has no name yet. Precise, inevitable, impossible to ignore.', waText: "Hi, I'm interested in the *Meridian* chain. I'd like to order a piece: " }
    },
    'Heart':    {
      es: { desc: 'No el corazón que siente. El que resiste. El que sigue latiendo aunque nadie lo vea, aunque nadie lo escuche.', waText: 'Hola, tengo interés en la cadena *Heart*. Quisiera una pieza: ' },
      en: { desc: 'Not the heart that feels. The one that endures. The one that keeps beating even when no one sees it, even when no one hears it.', waText: "Hi, I'm interested in the *Heart* chain. I'd like to order a piece: " }
    },
    'Echo':     {
      es: { desc: 'Lo que dijiste ya no está pero su forma permanece. Cada eslabón repite al anterior sin agotarse, sin olvidar.', waText: 'Hola, tengo interés en la cadena *Echo*. Quisiera una pieza: ' },
      en: { desc: "What you said is gone, but its shape remains. Every link repeats the last one, never tiring, never forgetting.", waText: "Hi, I'm interested in the *Echo* chain. I'd like to order a piece: " }
    },
    'Snake':    {
      es: { desc: 'No rastrea. Fluye. Lleva consigo algo antiguo que todavía no tiene nombre, y probablemente nunca lo necesite.', waText: 'Hola, tengo interés en la cadena *Snake*. Quisiera una pieza: ' },
      en: { desc: "It doesn't crawl. It flows. It carries something ancient that still has no name, and probably never will need one.", waText: "Hi, I'm interested in the *Snake* chain. I'd like to order a piece: " }
    }
  };

  const modal     = document.getElementById('productModal');
  const modalImg  = document.getElementById('modalImg');
  const modalName = document.getElementById('modalName');
  const modalDesc = document.getElementById('modalDesc');
  const modalBtn  = document.getElementById('modalBtn');

  let currentProduct = null;

  function renderModal(name) {
    const p = PRODUCTS[name];
    if (!p) return;
    const lang = window.BWI18N ? window.BWI18N.getLang() : 'es';
    const copy = p[lang] || p.es;
    modalName.textContent = name;
    modalDesc.textContent = copy.desc;
    modalBtn.href         = 'https://wa.me/50660062513?text=' + encodeURIComponent(copy.waText);
  }

  let closeTimer = null;

  function openModal(name, sourceImg) {
    if (!PRODUCTS[name]) return;
    clearTimeout(closeTimer);
    currentProduct = name;
    modalImg.src = sourceImg.src;
    modalImg.alt = name;
    renderModal(name);
    modal.classList.remove('is-closing');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // FLIP: start the modal image where the grid photo sits, then let it fly into place.
    if (reduceMotion.matches) return;
    const from = sourceImg.getBoundingClientRect();
    const to   = modalImg.getBoundingClientRect();
    modalImg.animate([
      { transformOrigin: 'top left',
        transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})` },
      { transformOrigin: 'top left', transform: 'none' }
    ], { duration: 750, easing: 'cubic-bezier(0.16,1,0.3,1)' });
  }

  function closeModal() {
    if (!modal.classList.contains('open') || modal.classList.contains('is-closing')) return;
    modal.classList.add('is-closing');
    closeTimer = setTimeout(() => {
      modal.classList.remove('open', 'is-closing');
      document.body.style.overflow = '';
    }, reduceMotion.matches ? 0 : 350);
  }

  document.addEventListener('bw-lang-change', () => {
    if (currentProduct && modal.classList.contains('open')) renderModal(currentProduct);
  });

  document.getElementById('modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  document.querySelectorAll('.product').forEach(product => {
    product.addEventListener('click', () => {
      const name = product.querySelector('.product-name').textContent.trim();
      openModal(name, product.querySelector('img'));
    });
  });
