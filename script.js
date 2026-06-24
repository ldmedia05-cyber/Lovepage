/* ============================================================
   For Meenu Baba — deluxe interactivity
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  // lighter particle load on phones for smooth scrolling + battery
  const isSmall = window.matchMedia('(max-width: 600px)').matches;
  const ORB_COUNT = isSmall ? 6 : 14;
  const PETAL_INTERVAL = isSmall ? 2200 : 1400;
  const HEART_INTERVAL = isSmall ? 4200 : 2600;
  const CONFETTI_COUNT = isSmall ? 42 : 80;

  /* ============================================================
     0. Build a layered CSS rose (hero + loader)
     ============================================================ */
  function buildRose(container, scale) {
    // rings: [count, radiusPx, sizePx, lightness%]
    const rings = [
      [1, 0, 46, 30],
      [5, 16, 50, 38],
      [8, 34, 54, 46],
      [12, 56, 58, 55],
      [14, 80, 56, 64],
    ];
    rings.forEach((ring, ri) => {
      const [count, radius, size, light] = ring;
      for (let i = 0; i < count; i++) {
        const petal = document.createElement('span');
        petal.className = 'rose-petal';
        const angle = (360 / count) * i + (ri % 2 ? 12 : 0);
        const w = size * scale;
        const h = size * 1.15 * scale;
        petal.style.width = w + 'px';
        petal.style.height = h + 'px';
        petal.style.marginLeft = -w / 2 + 'px';
        petal.style.marginTop = -h / 2 + 'px';
        petal.style.background =
          `radial-gradient(circle at 50% 80%, hsl(338 72% ${light + 14}%), hsl(338 70% ${light}%) 70%, hsl(340 65% ${light - 10}%))`;
        petal.style.setProperty('--rot', angle + 'deg');
        petal.style.setProperty('--dist', -(radius * scale) + 'px');
        petal.style.animationDelay = (ri * 0.12 + i * 0.015) + 's';
        petal.style.zIndex = 100 - ri;
        container.appendChild(petal);
      }
    });
  }

  const loaderRose = document.getElementById('loaderRose');
  const heroRose = document.getElementById('rose3d');
  if (loaderRose) buildRose(loaderRose, 0.5);
  if (heroRose) buildRose(heroRose, 1);

  // bloom the loader rose immediately
  requestAnimationFrame(() => loaderRose && loaderRose.classList.add('bloomed'));

  /* ============================================================
     1. Preloader -> reveal
     ============================================================ */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('done');
      if (heroRose) heroRose.classList.add('bloomed');
    }, 1400);
  });
  // safety: if load already fired
  setTimeout(() => {
    if (preloader && !preloader.classList.contains('done')) {
      preloader.classList.add('done');
      if (heroRose) heroRose.classList.add('bloomed');
    }
  }, 2600);

  /* ============================================================
     2. Reveal on scroll (+ name letters when message shows)
     ============================================================ */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          if (entry.target.querySelector('#nameLine')) animateName();
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.25 }
  );
  revealEls.forEach((el) => io.observe(el));

  // Animate "MEENU BABA" letter by letter
  let nameDone = false;
  function animateName() {
    const nameLine = document.getElementById('nameLine');
    if (!nameLine || nameDone) return;
    nameDone = true;
    const text = 'MEENU BABA';
    nameLine.innerHTML = '';
    [...text].forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'ltr';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.animationDelay = 0.7 + i * 0.08 + 's';
      nameLine.appendChild(span);
    });
  }

  /* ============================================================
     3. Scroll progress + hint
     ============================================================ */
  const progressBar = document.getElementById('progressBar');
  const scrollHint = document.getElementById('scrollHint');
  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
    scrollHint.style.opacity = scrollTop > 80 ? '0' : '1';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ============================================================
     4. Falling petals
     ============================================================ */
  const petalLayer = document.getElementById('petals');
  const petalChars = ['🌹', '🌸', '🌷', '🥀'];
  function spawnPetal() {
    if (reduceMotion) return;
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = petalChars[Math.floor(Math.random() * petalChars.length)];
    const duration = 7 + Math.random() * 7;
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.fontSize = 0.9 + Math.random() * 1.4 + 'rem';
    petal.style.animationDuration = duration + 's';
    petal.style.setProperty('--drift', (Math.random() * 160 - 80).toFixed(0) + 'px');
    petal.style.opacity = 0.5 + Math.random() * 0.5;
    petalLayer.appendChild(petal);
    setTimeout(() => petal.remove(), duration * 1000 + 500);
  }
  if (!reduceMotion) {
    for (let i = 0; i < 6; i++) setTimeout(spawnPetal, i * 600);
    setInterval(spawnPetal, PETAL_INTERVAL);
  }

  /* ============================================================
     5. Floating background orbs (bokeh)
     ============================================================ */
  const orbs = document.getElementById('orbs');
  if (orbs && !reduceMotion) {
    for (let i = 0; i < ORB_COUNT; i++) {
      const o = document.createElement('span');
      o.className = 'orb';
      const size = 30 + Math.random() * 90;
      o.style.width = size + 'px';
      o.style.height = size + 'px';
      o.style.left = Math.random() * 100 + 'vw';
      o.style.bottom = '-' + size + 'px';
      o.style.animationDuration = 12 + Math.random() * 16 + 's';
      o.style.animationDelay = Math.random() * 10 + 's';
      orbs.appendChild(o);
    }
  }

  /* ============================================================
     6. Floating hearts (background)
     ============================================================ */
  const heartsBg = document.getElementById('heartsBg');
  const heartChars = ['💗', '💕', '💞', '🤍'];
  function spawnHeart() {
    if (reduceMotion) return;
    const h = document.createElement('span');
    h.className = 'heart-float';
    h.textContent = heartChars[Math.floor(Math.random() * heartChars.length)];
    const duration = 9 + Math.random() * 8;
    h.style.left = Math.random() * 100 + 'vw';
    h.style.fontSize = 0.8 + Math.random() * 1.2 + 'rem';
    h.style.animationDuration = duration + 's';
    heartsBg.appendChild(h);
    setTimeout(() => h.remove(), duration * 1000 + 500);
  }
  if (!reduceMotion) setInterval(spawnHeart, HEART_INTERVAL);

  /* ============================================================
     7. Custom cursor glow + petal trail
     ============================================================ */
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && !isTouch && !reduceMotion) {
    let lastTrail = 0;
    document.addEventListener('mousemove', (e) => {
      cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      const now = Date.now();
      if (now - lastTrail > 90) {
        lastTrail = now;
        const t = document.createElement('span');
        t.className = 'trail-petal';
        t.textContent = '🌸';
        t.style.left = e.clientX - 8 + 'px';
        t.style.top = e.clientY - 8 + 'px';
        t.style.fontSize = 0.7 + Math.random() * 0.6 + 'rem';
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 1000);
      }
    });
    document.addEventListener('mousedown', () => (cursorGlow.style.scale = '1.8'));
    document.addEventListener('mouseup', () => (cursorGlow.style.scale = '1'));
  } else if (cursorGlow) {
    cursorGlow.style.display = 'none';
  }

  /* ============================================================
     8. Bouquet: 3D tilt on mouse + sparkles on hover
     ============================================================ */
  const bouquetTilt = document.getElementById('bouquetTilt');
  const bouquet = document.getElementById('bouquet');
  if (bouquetTilt && bouquet && !isTouch && !reduceMotion) {
    bouquetTilt.addEventListener('mousemove', (e) => {
      const rect = bouquetTilt.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      bouquet.style.transform = `rotateY(${px * 18}deg) rotateX(${-py * 18}deg)`;
    });
    bouquetTilt.addEventListener('mouseleave', () => {
      bouquet.style.transform = 'rotateY(0) rotateX(0)';
    });
  }
  const sparkleLayer = document.getElementById('sparkleLayer');
  if (sparkleLayer && !reduceMotion) {
    const sparkle = (rose) => {
      for (let i = 0; i < 4; i++) {
        const s = document.createElement('span');
        s.className = 'spark';
        s.textContent = '✨';
        s.style.left = rose.offsetLeft + (Math.random() * 40 - 10) + 'px';
        s.style.top = rose.offsetTop + (Math.random() * 30 - 10) + 'px';
        s.style.animationDelay = i * 0.05 + 's';
        sparkleLayer.appendChild(s);
        setTimeout(() => s.remove(), 900);
      }
    };
    document.querySelectorAll('.rose').forEach((rose) => {
      // hover on desktop, tap on touch devices
      rose.addEventListener('mouseenter', () => sparkle(rose));
      rose.addEventListener('click', () => sparkle(rose));
    });
  }

  /* ============================================================
     9. Magnetic buttons
     ============================================================ */
  if (!isTouch && !reduceMotion) {
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px) scale(1.06)`;
      });
      btn.addEventListener('mouseleave', () => (btn.style.transform = ''));
    });
  }

  /* ============================================================
     10. Question buttons -> celebration
     ============================================================ */
  const yesBtn = document.getElementById('yesBtn');
  const maybeBtn = document.getElementById('maybeBtn');
  const burst = document.getElementById('burst');
  function celebrate() {
    const chars = ['❤️', '🌹', '💕', '🌸', '✨', '💞', '🌷'];
    for (let i = 0; i < CONFETTI_COUNT; i++) {
      const c = document.createElement('span');
      c.className = 'confetti';
      c.textContent = chars[Math.floor(Math.random() * chars.length)];
      c.style.left = Math.random() * 100 + 'vw';
      c.style.fontSize = 1 + Math.random() * 2 + 'rem';
      c.style.animationDuration = 1.8 + Math.random() * 1.8 + 's';
      c.style.animationDelay = Math.random() * 0.6 + 's';
      burst.appendChild(c);
      setTimeout(() => c.remove(), 4500);
    }
  }
  function answer(msg) {
    celebrate();
    const question = document.querySelector('.question');
    if (question) question.innerHTML = msg;
  }
  if (yesBtn)
    yesBtn.addEventListener('click', () =>
      answer('Then today it is. 🌹<br /><span class="accent">A fresh start, together.</span>')
    );
  if (maybeBtn)
    maybeBtn.addEventListener('click', () =>
      answer('Always means always. 💞<br /><span class="accent">I\'m all in, Meenu Baba.</span>')
    );

  /* ============================================================
     11. Gentle ambient melody (Web Audio — no files needed)
     ============================================================ */
  const musicToggle = document.getElementById('musicToggle');
  let audioCtx = null;
  let melodyTimer = null;
  let playing = false;

  // a soft, looping arpeggio in a warm major key
  const notes = [392.0, 493.88, 587.33, 659.25, 587.33, 493.88]; // G B D E D B
  let noteIdx = 0;

  function playNote(freq) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 1.7);
  }

  function startMusic() {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playing = true;
    musicToggle.classList.add('playing');
    const step = () => {
      playNote(notes[noteIdx % notes.length]);
      noteIdx++;
      melodyTimer = setTimeout(step, 850);
    };
    step();
  }
  function stopMusic() {
    playing = false;
    musicToggle.classList.remove('playing');
    clearTimeout(melodyTimer);
  }
  if (musicToggle) {
    musicToggle.addEventListener('click', () => (playing ? stopMusic() : startMusic()));
  }
});
