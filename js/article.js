// Article pages: reading-progress hairline in the header and paragraphs that
// rise into view. Loaded after the page's BWI18N.init({...}) script.

(function () {
  const progress = document.querySelector('.scroll-progress');
  const body = document.querySelector('.article-body');

  // ── READING PROGRESS: measured across the article text, not the whole page ──
  let rafPending = false;
  function updateProgress() {
    const r = body.getBoundingClientRect();
    const total = r.height - window.innerHeight * 0.6;
    const read = Math.min(Math.max(-r.top + window.innerHeight * 0.4, 0) / Math.max(total, 1), 1);
    progress.style.transform = `scaleX(${read})`;
    rafPending = false;
  }
  window.addEventListener('scroll', () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  // ── PARAGRAPH REVEAL ──
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  body.querySelectorAll('p').forEach(p => {
    p.classList.add('reveal-p');
    io.observe(p);
  });
})();
