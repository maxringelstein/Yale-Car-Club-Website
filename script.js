/* ─────────────────────────────────────────────────────────
   Yale Car Club — script.js
───────────────────────────────────────────────────────── */

/* ── NAV: scrolled state ─── */
const nav = document.getElementById('nav');
let lastScroll = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('scrolled', y > 40);
  lastScroll = y;
}, { passive: true });

/* ── MISSION BAR: hide after hero ─── */
const missionBar = document.getElementById('mission-bar');
const heroEl = document.getElementById('hero');
if (missionBar && heroEl) {
  const io = new IntersectionObserver(([entry]) => {
    missionBar.classList.toggle('hidden', !entry.isIntersecting);
  }, { threshold: 0.1 });
  io.observe(heroEl);
}

/* ── MOBILE HAMBURGER ─── */
const hamburger = document.getElementById('hamburger');
const navMobile = document.getElementById('nav-mobile');
hamburger.addEventListener('click', () => navMobile.classList.toggle('open'));

/* ── MOBILE ACCORDION GROUPS ─── */
document.querySelectorAll('.mobile-group-trigger').forEach(btn => {
  btn.addEventListener('click', () => btn.closest('.mobile-group').classList.toggle('open'));
});
navMobile.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navMobile.classList.remove('open'));
});

/* ── DROPDOWN KEYBOARD A11Y ─── */
document.querySelectorAll('.nav-dropdown-trigger').forEach(btn => {
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      btn.setAttribute('aria-expanded', btn.getAttribute('aria-expanded') !== 'true');
    }
  });
});
document.addEventListener('click', e => {
  if (!e.target.closest('.nav-dropdown')) {
    document.querySelectorAll('.nav-dropdown-trigger')
      .forEach(b => b.setAttribute('aria-expanded', 'false'));
  }
});

/* ── SCROLL REVEAL (staggered) ─── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  const siblingIdx = Array.from(el.parentNode.children).indexOf(el);
  el.style.transitionDelay = `${siblingIdx * 0.07}s`;
  revealObserver.observe(el);
});

/* ── HERO PARALLAX (subtle scroll offset) ─── */
const heroPhoto = document.querySelector('.hero-photo');
if (heroPhoto) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      heroPhoto.style.transform = `scale(1.08) translateX(${Math.sin(y * 0.0015) * 1.5}%) translateY(${y * 0.12}px)`;
    }
  }, { passive: true });
}

/* ── STAT COUNTER ANIMATION ─── */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function animateCount(el, target, duration = 1400) {
  const start = target - 6;
  const t0 = performance.now();
  function tick(now) {
    const p = Math.min((now - t0) / duration, 1);
    el.textContent = Math.round(start + (target - start) * easeOutCubic(p));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statCountEls = document.querySelectorAll('.stat-number[data-count]');
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    animateCount(el, parseInt(el.dataset.count, 10));
    statObserver.unobserve(el);
  });
}, { threshold: 0.6 });
statCountEls.forEach(el => statObserver.observe(el));

/* ── SHOW COVERAGE: expand/collapse ─── */
document.querySelectorAll('.show-expand-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const gallery = document.getElementById(btn.dataset.target);
    const isOpen = gallery.classList.contains('open');
    gallery.classList.toggle('open');
    btn.classList.toggle('expanded');
    const textEl = btn.querySelector('.show-expand-text');
    const total = parseInt(btn.dataset.count, 10) + 4;
    textEl.textContent = isOpen ? `See All ${total} Photos` : 'Hide Photos';
    if (!isOpen) gallery.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});

/* ── STRIP: pause on hover ─── */
const stripTrack = document.querySelector('.strip-track');
if (stripTrack) {
  stripTrack.addEventListener('mouseenter', () => stripTrack.style.animationPlayState = 'paused');
  stripTrack.addEventListener('mouseleave', () => stripTrack.style.animationPlayState = 'running');
}

/* ── ACTIVE NAV LINK ─── */
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 130) current = s.id; });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
}, { passive: true });
