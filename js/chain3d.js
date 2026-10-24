// Chain 3D: one long steel chain on a fixed, full-viewport canvas behind the page.
// The hero and the two .separator bands are transparent "windows" onto it; every
// other section has its own background and hides it. The chain loops around the
// hero title, then runs down the page and crosses each band as the camera follows
// the scroll. Loaded as a module on the home page only. If WebGL or the CDN import
// fails, <html> loses `has-3d` and the hero and bands fall back to the photo.

const root   = document.documentElement;
const stage  = document.getElementById('chain-stage');
const canvas = document.getElementById('chain-canvas');
const hero   = document.getElementById('hero');
const bands  = [...document.querySelectorAll('.separator')];

function fallback() {
  root.classList.remove('has-3d');
  if (stage) stage.remove();
}

async function init() {
  if (!stage || !canvas || !hero || !root.classList.contains('has-3d')) return fallback();

  let THREE;
  try {
    THREE = await import('three');
  } catch (e) {
    return fallback();
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch (e) {
    return fallback();
  }

  const { MathUtils } = THREE;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // The camera always looks straight down -z from DIST; only its x/y move.
  const DIST   = 20;
  const scene  = new THREE.Scene();
  scene.fog    = new THREE.Fog(0x0e0e0d, DIST - 8, DIST + 16);
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const tanHalfFov = Math.tan(MathUtils.degToRad(camera.fov / 2));

  // ── REFLECTIONS ──
  // Polished steel looks silver, not white, because it mirrors a mostly dark room with
  // a few hard light sources: grey body, crisp bright streaks along the edges. This
  // builds that jewellery-photo studio in code (no HDR download) and bakes it into an
  // environment map. Panel colours above 1 act as bright HDR lights.
  function studioEnvironment() {
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(
      new THREE.BoxGeometry(24, 24, 24),
      new THREE.MeshBasicMaterial({ color: 0x3a3a3a, side: THREE.BackSide })
    ));
    const panel = (w, h, x, y, z, intensity) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(intensity, intensity, intensity), side: THREE.DoubleSide })
      );
      m.position.set(x, y, z);
      m.lookAt(0, 0, 0);
      env.add(m);
    };
    panel(16, 1.4, 0, 9, 3, 7);       // long strip overhead: the main highlight
    panel(1.2, 14, -9, 1, 4, 4.5);    // tall strip at the left
    panel(1.0, 12, 9, -1, -3, 2.2);   // dimmer strip at the right, behind
    panel(18, 11, 1, 2, 11, 1.3);     // big soft box in front: faces toward the camera read light silver
    panel(14, 14, 0, -10, 0, 0.6);    // faint bounce from below, like the white paper
    return env;
  }

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studioEnvironment(), 0.02).texture;
  pmrem.dispose();

  // A small, sharp key adds the pin-point glints real steel shows
  const key = new THREE.DirectionalLight(0xffffff, 0.8);
  key.position.set(-3, 7, 9);
  scene.add(key);

  // ── LINK GEOMETRY ──
  // A chain link is a tube swept along a "stadium": two straights joined by half circles.
  const LINK_STRAIGHT = 0.55;
  const LINK_RADIUS   = 0.34;
  const WIRE          = 0.13;

  class StadiumCurve extends THREE.Curve {
    getPoint(t, target = new THREE.Vector3()) {
      const L = LINK_STRAIGHT, r = LINK_RADIUS;
      const arc = Math.PI * r;
      let s = t * (2 * L + 2 * arc);
      if (s < L) return target.set(-L / 2 + s, r, 0);
      s -= L;
      if (s < arc) { const a = Math.PI / 2 - s / r; return target.set(L / 2 + r * Math.cos(a), r * Math.sin(a), 0); }
      s -= arc;
      if (s < L) return target.set(L / 2 - s, -r, 0);
      s -= L;
      const a = -Math.PI / 2 - s / r;
      return target.set(-L / 2 + r * Math.cos(a), r * Math.sin(a), 0);
    }
  }

  const linkGeo = new THREE.TubeGeometry(new StadiumCurve(), 64, WIRE, 12, true);
  const steel = new THREE.MeshStandardMaterial({
    color: 0xc4c7ca, // a touch cool, like stainless steel
    metalness: 1,
    roughness: 0.26,
    envMapIntensity: 1,
  });

  // Distance between link centres when neighbouring wires touch.
  const PITCH     = 2 * (LINK_STRAIGHT / 2 + LINK_RADIUS) - 2.2 * WIRE;
  const MAX_LINKS = 600;

  const chain = new THREE.InstancedMesh(linkGeo, steel, MAX_LINKS);
  chain.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  chain.frustumCulled = false; // instances are culled by hand in layoutLinks()
  chain.count = 0;
  scene.add(chain);

  // ── PATH ──
  // Built from the live layout, so each band's stretch of chain sits where the
  // camera will be when that band is centred on screen.
  const PARALLAX = reduceMotion.matches ? 1 : 0.75; // chain scrolls slower than the page
  const FRAME_SAMPLES = 2048;
  let path, pathLength, frames, pxToWorld = 1;

  const docTop = el => el.getBoundingClientRect().top + window.scrollY;
  const cameraYFor = scroll => -scroll * pxToWorld * PARALLAX;

  function buildPath() {
    const vw = stage.clientWidth, vh = stage.clientHeight;
    const aspect = vw / vh;
    const V = 2 * DIST * tanHalfFov;  // world height of the viewport at z = 0
    const W = (V * aspect) / 2;       // world half-width at z = 0
    pxToWorld = V / vh;

    // Hero: an open necklace around the title. Laid back on wide screens, closer to
    // face-on on tall ones so it frames the title instead of crossing it.
    const wide = MathUtils.clamp((aspect - 0.5) / 0.8, 0, 1);
    const tilt = MathUtils.lerp(-0.45, -1.0, wide);
    const R = MathUtils.clamp(W * 0.85, V * 0.28, V * 0.6);
    const ring = deg => {
      const a = MathUtils.degToRad(deg);
      return new THREE.Vector3(R * Math.cos(a), R * Math.sin(a) * Math.cos(tilt), R * Math.sin(a) * Math.sin(tilt));
    };

    const pts = [new THREE.Vector3(W * 1.3, V * 0.9, -4)]; // comes in from above, off the top right
    for (let deg = 10; deg <= 290; deg += 40) pts.push(ring(deg));
    pts.push(new THREE.Vector3(R * 0.55, -V * 0.7, R * 0.4)); // drops out under the hero

    // Bands: the chain hangs across each one like a real chain, clear of the phrase in
    // the middle. It passes at the same depth as the front of the hero necklace, so the
    // links read the same size in all three windows. (side) is where it enters,
    // (edge)/(mid) its height at the band's sides and centre as a fraction of the band.
    // Offsets are scaled by the depth so the drape fills the band on screen.
    // On narrow screens the first drape sags deeper so it clears a full-width phrase.
    const z = -R * Math.sin(tilt); // depth of the necklace's nearest point
    const crossings = [
      { side: -1, edge: MathUtils.lerp(-0.2, 0.1, wide), mid: MathUtils.lerp(-0.42, -0.34, wide) }, // under the phrase
      { side:  1, edge: 0.5, mid: 0.25 },                                                          // above it
    ];
    bands.forEach((band, i) => {
      const { side, edge, mid } = crossings[i % crossings.length];
      const y = cameraYFor(docTop(band) + band.offsetHeight / 2 - vh / 2);
      const s = (DIST - z) / DIST;
      const b = band.offsetHeight * pxToWorld * s;
      const halfW = W * 1.1 * s;
      const sag = t => y + b * (mid + (edge - mid) * t * t); // parabola: mid at t = 0, edge at |t| = 1
      pts.push(new THREE.Vector3(side * W * 1.7, y + V * 0.6, z - 4));
      [1, 0.5, 0, -0.5, -1].forEach(t => pts.push(new THREE.Vector3(side * t * halfW, sag(t), z)));
      pts.push(new THREE.Vector3(-side * W * 1.7, y - V * 0.6, z - 4));
    });

    const last = pts[pts.length - 1];
    pts.push(new THREE.Vector3(last.x * 0.5, last.y - V, -6)); // trails off below

    path = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    pathLength = path.getLength();
    frames = path.computeFrenetFrames(FRAME_SAMPLES, false);
  }

  // ── LINKS ──
  // Links slide along the path by `flow`. Offsetting the first link by a multiple of
  // two pitches keeps each link's orientation (flat / upright) as it travels.
  const m = new THREE.Matrix4();
  const p = new THREE.Vector3();
  const xAxis = new THREE.Vector3(), yAxis = new THREE.Vector3(), zAxis = new THREE.Vector3();
  let flow = 0;

  function layoutLinks() {
    const camX = camera.position.x, camY = camera.position.y;
    const start = MathUtils.euclideanModulo(flow, 2 * PITCH) - 2 * PITCH;
    let n = 0;
    for (let i = 0; n < MAX_LINKS; i++) {
      const s = start + i * PITCH;
      if (s > pathLength) break;
      if (s < 0) continue;
      const u = s / pathLength;
      path.getPointAt(u, p);
      // Skip links outside the view (with a margin for their size).
      const halfH = (DIST - p.z) * tanHalfFov + 1.5;
      if (Math.abs(p.y - camY) > halfH || Math.abs(p.x - camX) > halfH * camera.aspect + 1.5) continue;
      const k = Math.round(u * FRAME_SAMPLES);
      xAxis.copy(frames.tangents[k]);
      yAxis.copy(i % 2 ? frames.binormals[k] : frames.normals[k]);
      zAxis.crossVectors(xAxis, yAxis);
      m.makeBasis(xAxis, yAxis, zAxis).setPosition(p);
      chain.setMatrixAt(n++, m);
    }
    chain.count = n;
    chain.instanceMatrix.needsUpdate = true;
  }

  // ── RENDER ──
  // The chain responds to scrolling only, never to the pointer.
  // - The camera follows an eased copy of the scroll position, so the view glides
  //   after the page and settles instead of jumping with every wheel step.
  // - Scrolling pulls the links along the chain like a hand hauling it: the pull
  //   takes hold almost at once, and when it stops the heavy chain keeps sliding a
  //   moment and coasts to a halt. Scrolling up pulls it back.
  const SCROLL_EASE = 0.6;   // s: camera covers ~63% of a scroll jump in this time
  const PULL        = 0.35;  // links travel this fraction of the scrolled distance along the chain
  const PULL_GRIP   = 0.08;  // s: how quickly a pull takes hold
  const PULL_COAST  = 0.5;   // s: how long the chain keeps sliding after the pull stops
  const DRIFT       = 0.22;  // world units/s the chain creeps on its own

  let smoothScroll = window.scrollY;
  let lastScroll = smoothScroll;
  let pullSpeed = 0;

  function draw() {
    camera.position.set(0, cameraYFor(smoothScroll), DIST);
    layoutLinks();
    renderer.render(scene, camera);
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (dt <= 0) return;

    const scroll = window.scrollY;
    smoothScroll += (scroll - smoothScroll) * (1 - Math.exp(-dt / SCROLL_EASE));

    const target = ((scroll - lastScroll) / dt) * pxToWorld * PULL;
    lastScroll = scroll;
    const tau = Math.abs(target) > Math.abs(pullSpeed) ? PULL_GRIP : PULL_COAST;
    pullSpeed += (target - pullSpeed) * (1 - Math.exp(-dt / tau));

    flow += (DRIFT + pullSpeed) * dt;
    draw();
  }

  // Jump straight to the real scroll position (when nothing was animating it).
  function syncScroll() {
    smoothScroll = lastScroll = window.scrollY;
    pullSpeed = 0;
  }

  // Only render while a window onto the chain is on screen.
  const showing = new Set();
  let running = false;

  function updateLoop() {
    const shouldRun = showing.size > 0 && !document.hidden && !reduceMotion.matches;
    if (shouldRun === running) return;
    running = shouldRun;
    if (running) {
      last = performance.now();
      syncScroll();
      renderer.setAnimationLoop(frame);
    } else {
      renderer.setAnimationLoop(null);
    }
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => e.isIntersecting ? showing.add(e.target) : showing.delete(e.target));
    updateLoop();
  });
  [hero, ...bands].forEach(el => io.observe(el));

  // With reduced motion there is no loop: redraw only when the page scrolls.
  let drawPending = false;
  window.addEventListener('scroll', () => {
    if (running || drawPending || showing.size === 0) return;
    drawPending = true;
    requestAnimationFrame(() => { drawPending = false; syncScroll(); draw(); });
  }, { passive: true });

  function resize() {
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
    camera.aspect = stage.clientWidth / stage.clientHeight;
    camera.updateProjectionMatrix();
    buildPath();
    if (!running) { syncScroll(); draw(); }
  }

  // Band positions move when fonts, images or the viewport change size.
  let resizeTimer = null;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  }).observe(document.body);
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', updateLoop);
  reduceMotion.addEventListener('change', updateLoop);

  resize();
  updateLoop();

  requestAnimationFrame(() => stage.classList.add('is-ready'));
}

init();
