/* ============================================================
   For Meenu Baba — interactivity
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- 1. Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        }
      });
    },
    { threshold: 0.25 }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------- 2. Scroll progress bar + hide hint ---------- */
  const progressBar = document.getElementById('progressBar');
  const scrollHint = document.getElementById('scrollHint');

  const onScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + '%';

    if (scrollTop > 80) {
      scrollHint.style.opacity = '0';
    } else {
      scrollHint.style.opacity = '1';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 3. Falling rose petals ---------- */
  const petalLayer = document.getElementById('petals');
  const petalChars = ['🌹', '🌸', '🌷', '🥀'];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function spawnPetal() {
    if (reduceMotion) return;
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = petalChars[Math.floor(Math.random() * petalChars.length)];

    const left = Math.random() * 100;
    const size = 0.9 + Math.random() * 1.4;
    const duration = 7 + Math.random() * 7;
    const drift = (Math.random() * 160 - 80).toFixed(0) + 'px';

    petal.style.left = left + 'vw';
    petal.style.fontSize = size + 'rem';
    petal.style.animationDuration = duration + 's';
    petal.style.setProperty('--drift', drift);
    petal.style.opacity = 0.5 + Math.random() * 0.5;

    petalLayer.appendChild(petal);
    setTimeout(() => petal.remove(), duration * 1000 + 500);
  }

  if (!reduceMotion) {
    // initial scatter
    for (let i = 0; i < 6; i++) {
      setTimeout(spawnPetal, i * 600);
    }
    setInterval(spawnPetal, 1400);
  }

  /* ---------- 4. Question buttons -> celebration ---------- */
  const yesBtn = document.getElementById('yesBtn');
  const maybeBtn = document.getElementById('maybeBtn');
  const burst = document.getElementById('burst');

  function celebrate() {
    const chars = ['❤️', '🌹', '💕', '🌸', '✨', '💞'];
    for (let i = 0; i < 60; i++) {
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
    if (question) {
      question.innerHTML = msg;
    }
  }

  if (yesBtn) {
    yesBtn.addEventListener('click', () =>
      answer('Then today it is. 🌹<br /><span class="accent">A fresh start, together.</span>')
    );
  }
  if (maybeBtn) {
    maybeBtn.addEventListener('click', () =>
      answer('Always means always. 💞<br /><span class="accent">I\'m all in, Meenu Baba.</span>')
    );
  }
});
