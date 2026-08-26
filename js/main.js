  // ── INTRO SCREEN ──
  const introScreen = document.getElementById('intro-screen');
  if (sessionStorage.getItem('introSeen')) {
    introScreen.remove();
  } else {
    sessionStorage.setItem('introSeen', '1');
    setTimeout(() => {
      introScreen.classList.add('fade-out');
      setTimeout(() => introScreen.remove(), 1000);
    }, 2000);
  }

  // ── HEADER SCROLL ──
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  // ── PARALLAX ──
  const heroBg = document.getElementById('hero-bg');

  let rafPending = false;
  function updateParallax() {
    heroBg.style.transform = `translateY(${window.scrollY * 0.35}px)`;
    rafPending = false;
  }
  window.addEventListener('scroll', () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(updateParallax);
    }
  }, { passive: true });
  updateParallax();

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

  // ── CAROUSEL ──
  const slides = document.querySelectorAll('.slide');
  const dots   = document.querySelectorAll('.dot');
  const counter = document.getElementById('counter');
  let current = 0;

  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    counter.textContent = (current + 1) + ' / ' + slides.length;
    const nameEl = slides[current].querySelector('.slide-name');
    nameEl.classList.remove('slide-name-animate');
    void nameEl.offsetWidth;
    nameEl.classList.add('slide-name-animate');
  }

  document.getElementById('prev').addEventListener('click', () => goTo(current - 1));
  document.getElementById('next').addEventListener('click', () => goTo(current + 1));
  dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.index)));

  // Touch swipe
  let tx = 0;
  const track = document.getElementById('carousel-track');
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = tx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(current + (diff > 0 ? 1 : -1));
  }, { passive: true });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

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

  function openModal(name, imgSrc) {
    if (!PRODUCTS[name]) return;
    currentProduct = name;
    modalImg.src = imgSrc;
    modalImg.alt = name;
    renderModal(name);
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.addEventListener('bw-lang-change', () => {
    if (currentProduct && modal.classList.contains('open')) renderModal(currentProduct);
  });

  document.getElementById('modalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  document.querySelectorAll('.slide-img-wrap, .slide-name').forEach(el => {
    el.addEventListener('click', () => {
      const slide = el.closest('.slide');
      const name  = slide.querySelector('.slide-name').textContent.trim();
      const img   = slide.querySelector('img').src;
      openModal(name, img);
    });
  });
