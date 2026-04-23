/* ─────────────────────────────────────────────────────────
   Yale Car Club — script.js
───────────────────────────────────────────────────────── */

/* ── NAV: scrolled state ─── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── NAV: dropdown click toggle ─── */
document.querySelectorAll('.nav-dropdown-trigger').forEach(btn => {
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const parent = btn.closest('.nav-dropdown');
    const isOpen = parent.classList.contains('is-open');
    document.querySelectorAll('.nav-dropdown.is-open').forEach(d => {
      d.classList.remove('is-open');
      d.querySelector('.nav-dropdown-trigger').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      parent.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    if (e.key === 'Escape') {
      btn.closest('.nav-dropdown').classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
});
document.addEventListener('click', () => {
  document.querySelectorAll('.nav-dropdown.is-open').forEach(d => {
    d.classList.remove('is-open');
    d.querySelector('.nav-dropdown-trigger').setAttribute('aria-expanded', 'false');
  });
});

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

/* ── SCROLL REVEAL (multi-variant, staggered) ─── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
  const siblings = Array.from(el.parentNode.children).filter(c =>
    c.classList.contains('reveal') || c.classList.contains('reveal-left') ||
    c.classList.contains('reveal-right') || c.classList.contains('reveal-scale')
  );
  const idx = siblings.indexOf(el);
  if (!el.style.transitionDelay) el.style.transitionDelay = `${idx * 0.09}s`;
  revealObserver.observe(el);
});

/* ── HERO PARALLAX ─── */
const heroPhoto = document.querySelector('.hero-photo');
if (heroPhoto) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.3) {
      heroPhoto.style.transform = `scale(1.06) translateY(${y * 0.12}px)`;
    }
  }, { passive: true });
}

/* ── STAT COUNTER ─── */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function animateCount(el, target, duration = 1400) {
  const start = target - 6;
  const t0 = performance.now();
  (function tick(now) {
    const p = Math.min((now - t0) / duration, 1);
    el.textContent = Math.round(start + (target - start) * easeOutCubic(p));
    if (p < 1) requestAnimationFrame(tick);
  })(performance.now());
}
const statObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animateCount(entry.target, parseInt(entry.target.dataset.count, 10));
    statObserver.unobserve(entry.target);
  });
}, { threshold: 0.6 });
document.querySelectorAll('.stat-number[data-count]').forEach(el => statObserver.observe(el));

/* ── LIGHTBOX ─── */
const lb = document.createElement('div');
lb.className = 'lightbox';
lb.innerHTML = `<button class="lightbox-close" aria-label="Close">&times;</button>
                <img class="lightbox-img" src="" alt="" />`;
document.body.appendChild(lb);
const lbImg = lb.querySelector('.lightbox-img');

function openLightbox(src, alt) {
  lbImg.src = src;
  lbImg.alt = alt || '';
  lb.classList.add('open');
  document.documentElement.classList.add('no-scroll');
}
function closeLightbox() {
  lb.classList.remove('open');
  document.documentElement.classList.remove('no-scroll');
  setTimeout(() => { lbImg.src = ''; }, 300);
}
lb.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

function attachLightbox(img) {
  img.style.cursor = 'zoom-in';
  img.addEventListener('click', () => {
    const src = img.src || img.dataset.src;
    if (src) openLightbox(src, img.alt);
  });
}
document.querySelectorAll(
  '.show-mini-strip img, .about-img, .strip-track img'
).forEach(attachLightbox);

/* ── SHOW COVERAGE: expand + deferred img load ─── */
document.querySelectorAll('.show-expand-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const gallery = document.getElementById(btn.dataset.target);
    const isOpen = gallery.classList.contains('open');
    gallery.classList.toggle('open');
    btn.classList.toggle('expanded');

    if (!isOpen) {
      gallery.querySelectorAll('img[data-src]').forEach(img => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        attachLightbox(img);
      });
    }

    const textEl = btn.querySelector('.show-expand-text');
    const total = parseInt(btn.dataset.count, 10) + 4;
    textEl.textContent = isOpen ? `See All ${total} Photos` : 'Collapse Gallery';
    if (!isOpen) gallery.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});

/* ── PHOTO STRIP: pause on hover ─── */
const stripTrack = document.querySelector('.strip-track');
if (stripTrack) {
  stripTrack.addEventListener('mouseenter', () => stripTrack.style.animationPlayState = 'paused');
  stripTrack.addEventListener('mouseleave', () => stripTrack.style.animationPlayState = 'running');
}

/* ── LEADER MINI CARD BIO EXPAND ─── */
document.querySelectorAll('.leader-mini-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const card = btn.closest('.leader-mini-card');
    const bio = card.querySelector('.leader-mini-bio');
    const isOpen = bio.classList.contains('open');
    bio.classList.toggle('open', !isOpen);
    btn.setAttribute('aria-expanded', !isOpen);
  });
});

/* ── SECTION PARALLAX ─── */
const parallaxMap = new Map();
document.querySelectorAll('.show-mini-strip').forEach(el => parallaxMap.set(el, false));

new IntersectionObserver(entries => {
  entries.forEach(e => parallaxMap.set(e.target, e.isIntersecting));
}).observe(...(parallaxMap.size ? [...parallaxMap.keys()] : [document.body]));

window.addEventListener('scroll', () => {
  parallaxMap.forEach((inView, el) => {
    if (!inView) return;
    const rect = el.getBoundingClientRect();
    const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * 0.035;
    el.style.transform = `translateY(${offset}px)`;
  });
}, { passive: true });

/* ── ACTIVE NAV LINK ─── */
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 130) current = s.id; });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
}, { passive: true });

/* ── SECTION COLLAPSE TOGGLE ─── */
document.querySelectorAll('.section-collapse-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const body = document.getElementById(btn.dataset.target);
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !expanded);
    body.classList.toggle('collapsed', expanded);
    btn.querySelector('.collapse-label').textContent = expanded ? 'Expand' : 'Collapse';
  });
});

/* ── SHOOTING STAR / ZAP / BURST BACKGROUND ─── */
(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'zap-canvas';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* ── Shooting Star ── */
  class ShootingStar {
    reset() {
      const fromLeft = Math.random() < 0.6;
      this.x = fromLeft ? -40 : Math.random() * canvas.width;
      this.y = fromLeft ? Math.random() * canvas.height * 0.7 : -40;
      this.angle = 0.35 + Math.random() * 0.5;
      this.speed = 5 + Math.random() * 8;
      this.len = 100 + Math.random() * 180;
      this.maxOpa = 0.18 + Math.random() * 0.22;
      this.opacity = 0; this.phase = 'in'; this.alive = true;
    }
    update() {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      if (this.phase === 'in') {
        this.opacity = Math.min(this.maxOpa, this.opacity + 0.025);
        if (this.opacity >= this.maxOpa) this.phase = 'out';
      } else {
        this.opacity -= 0.006;
        if (this.opacity <= 0) this.alive = false;
      }
    }
    draw() {
      const tx = this.x - Math.cos(this.angle) * this.len;
      const ty = this.y - Math.sin(this.angle) * this.len;
      const g = ctx.createLinearGradient(tx, ty, this.x, this.y);
      g.addColorStop(0, `rgba(180,210,255,0)`);
      g.addColorStop(0.6, `rgba(200,225,255,${this.opacity * 0.5})`);
      g.addColorStop(1, `rgba(230,242,255,${this.opacity})`);
      ctx.save();
      ctx.shadowColor = `rgba(100,160,255,${this.opacity * 0.8})`;
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(this.x, this.y);
      ctx.strokeStyle = g; ctx.lineWidth = 1.2; ctx.stroke();
      /* bright head */
      ctx.beginPath(); ctx.arc(this.x, this.y, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,248,255,${this.opacity})`;
      ctx.shadowBlur = 14; ctx.fill();
      ctx.restore();
    }
  }

  /* ── Electric Zap ── */
  class Zap {
    reset() {
      this.x = 80 + Math.random() * (canvas.width - 160);
      this.y = 80 + Math.random() * (canvas.height - 160);
      let x = this.x, y = this.y, a = Math.random() * Math.PI * 2;
      this.segs = [];
      const n = 5 + Math.floor(Math.random() * 8);
      for (let i = 0; i < n; i++) {
        a += (Math.random() - 0.5) * 1.4;
        const l = 14 + Math.random() * 40;
        const nx = x + Math.cos(a) * l, ny = y + Math.sin(a) * l;
        this.segs.push({ x1: x, y1: y, x2: nx, y2: ny, branch: false });
        if (Math.random() < 0.4) {
          const ba = a + (Math.random() - 0.5) * 2.2;
          const bl = l * 0.6;
          this.segs.push({ x1: nx, y1: ny, x2: nx + Math.cos(ba) * bl, y2: ny + Math.sin(ba) * bl, branch: true });
        }
        x = nx; y = ny;
      }
      this.maxOpa = 0.15 + Math.random() * 0.20;
      this.opacity = 0; this.phase = 'in';
      this.hold = 0; this.holdMax = 4 + Math.floor(Math.random() * 10);
      this.alive = true;
    }
    update() {
      if (this.phase === 'in') {
        this.opacity = Math.min(this.maxOpa, this.opacity + this.maxOpa / 2);
        if (this.opacity >= this.maxOpa) this.phase = 'hold';
      } else if (this.phase === 'hold') {
        if (++this.hold >= this.holdMax) this.phase = 'out';
      } else {
        this.opacity -= this.maxOpa / 14;
        if (this.opacity <= 0) this.alive = false;
      }
    }
    draw() {
      ctx.save(); ctx.lineCap = 'round';
      ctx.shadowColor = `rgba(80,140,255,0.6)`; ctx.shadowBlur = 10;
      this.segs.forEach(s => {
        const o = this.opacity * (s.branch ? 0.5 : 1);
        ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2);
        ctx.strokeStyle = `rgba(210,230,255,${o})`;
        ctx.lineWidth = s.branch ? 0.6 : 1.1;
        ctx.stroke();
      });
      /* origin dot */
      ctx.beginPath(); ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(220,240,255,${this.opacity})`; ctx.fill();
      ctx.restore();
    }
  }

  /* ── Spark Burst ── */
  class Burst {
    reset() {
      this.x = 60 + Math.random() * (canvas.width - 120);
      this.y = 60 + Math.random() * (canvas.height - 120);
      const count = 8 + Math.floor(Math.random() * 8);
      this.rays = Array.from({ length: count }, (_, i) => {
        const base = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const len = 18 + Math.random() * 45;
        return { a: base, len, offLen: Math.random() * 0.4 };
      });
      this.maxOpa = 0.18 + Math.random() * 0.22;
      this.opacity = 0; this.phase = 'in';
      this.hold = 0; this.holdMax = 3 + Math.floor(Math.random() * 6);
      this.alive = true;
    }
    update() {
      if (this.phase === 'in') {
        this.opacity = Math.min(this.maxOpa, this.opacity + this.maxOpa / 2);
        if (this.opacity >= this.maxOpa) this.phase = 'hold';
      } else if (this.phase === 'hold') {
        if (++this.hold >= this.holdMax) this.phase = 'out';
      } else {
        this.opacity -= this.maxOpa / 10;
        if (this.opacity <= 0) this.alive = false;
      }
    }
    draw() {
      ctx.save(); ctx.lineCap = 'round';
      ctx.shadowColor = `rgba(80,160,255,0.7)`; ctx.shadowBlur = 12;
      this.rays.forEach(r => {
        const startX = this.x + Math.cos(r.a) * r.len * r.offLen;
        const startY = this.y + Math.sin(r.a) * r.len * r.offLen;
        const endX = this.x + Math.cos(r.a) * r.len;
        const endY = this.y + Math.sin(r.a) * r.len;
        const g = ctx.createLinearGradient(startX, startY, endX, endY);
        g.addColorStop(0, `rgba(220,240,255,${this.opacity})`);
        g.addColorStop(1, `rgba(180,210,255,0)`);
        ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY);
        ctx.strokeStyle = g; ctx.lineWidth = 0.9; ctx.stroke();
      });
      /* center flash */
      ctx.beginPath(); ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,248,255,${this.opacity})`; ctx.fill();
      ctx.restore();
    }
  }

  const pool = [];
  const TYPES = [ShootingStar, ShootingStar, Zap, Zap, Burst];

  function spawnIfNeeded() {
    if (pool.length < 18 && Math.random() < 0.07) {
      const T = TYPES[Math.floor(Math.random() * TYPES.length)];
      const e = new T(); e.reset(); pool.push(e);
    }
  }

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    spawnIfNeeded();
    for (let i = pool.length - 1; i >= 0; i--) {
      pool[i].update(); pool[i].draw();
      if (!pool[i].alive) pool.splice(i, 1);
    }
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ── CAMPUS CAR SPOTTING ─── */
const CLOUD_NAME = 'ddud73mxv';
const UPLOAD_PRESET = 'Campus Spotting';

/* ── DYNAMIC SHOW COVERAGE ─────────────────────────────── */
const LOGO_URL = 'https://res.cloudinary.com/ddud73mxv/image/upload/q_auto,f_auto,w_1200/Logo_ytrxrk';

function buildShowBlock(event) {
  const galleryId = `gallery-${event.folder}`;
  const mini = event.photos.slice(0, 4);
  const full = event.photos.slice(4);

  const miniHtml = mini.map(url =>
    `<img src="${url}" alt="${event.name}" loading="lazy" />`
  ).join('');

  const fullHtml = full.map(url =>
    `<img data-src="${url}" alt="${event.name}" />`
  ).join('');

  const expandBtn = full.length ? `
    <button class="show-expand-btn" data-target="${galleryId}" data-count="${full.length}">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
      <span class="show-expand-text">See All ${event.photos.length} Photos</span>
      <svg class="expand-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>` : '';

  const fullGallery = full.length ? `
    <div class="show-full-gallery" id="${galleryId}">
      <div class="show-full-grid">${fullHtml}</div>
    </div>` : '';

  const block = document.createElement('div');
  block.className = 'show-block reveal';
  block.innerHTML = `
    <div class="show-header-row">
      <div class="show-logo-wrap"><img src="${LOGO_URL}" alt="YCAR" /></div>
      <div class="show-header-info">
        <h3 class="show-name">${event.name}</h3>
        <div class="show-meta-row">
          <span class="show-photo-count">${event.photos.length} photos</span>
        </div>
      </div>
    </div>
    <div class="show-mini-strip">${miniHtml}</div>
    ${fullGallery}
    ${expandBtn}
  `;

  block.querySelectorAll('.show-mini-strip img').forEach(attachLightbox);

  const btn = block.querySelector('.show-expand-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      const gallery = document.getElementById(btn.dataset.target);
      const isOpen = gallery.classList.contains('open');
      gallery.classList.toggle('open');
      btn.classList.toggle('expanded');
      if (!isOpen) {
        gallery.querySelectorAll('img[data-src]').forEach(img => {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          attachLightbox(img);
        });
      }
      const textEl = btn.querySelector('.show-expand-text');
      const total = parseInt(btn.dataset.count, 10) + 4;
      textEl.textContent = isOpen ? `See All ${total} Photos` : 'Collapse Gallery';
      if (!isOpen) gallery.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  return block;
}

function injectRandomPhotos(allPhotos) {
  if (!allPhotos.length) return;
  const shuffled = [...allPhotos].sort(() => Math.random() - 0.5);
  const targets = [
    document.querySelector('.about-img-back'),
    document.querySelector('.about-img-front'),
    document.querySelector('.event-featured-img'),
    ...document.querySelectorAll('.join-photo-grid img'),
  ].filter(Boolean);
  targets.forEach((el, i) => { if (shuffled[i]) el.src = shuffled[i]; });
}

function populateStrip(events) {
  const track = document.getElementById('strip-track');
  if (!track) return;
  const all = events.flatMap(e => e.photos.slice(0, 8).map(url => ({ url, name: e.name })));
  if (!all.length) return;
  const doubled = [...all, ...all];
  track.innerHTML = doubled.map(p =>
    `<img src="${p.url}" alt="${p.name}" loading="lazy" />`
  ).join('');
  track.querySelectorAll('img').forEach(attachLightbox);
}

async function loadEvents() {
  const container = document.getElementById('shows-dynamic');
  if (!container) return;
  try {
    const res = await fetch('/api/events');
    const { events } = await res.json();
    const allPhotos = (events || []).flatMap(e => e.photos);
    populateStrip(events || []);
    injectRandomPhotos(allPhotos);
    container.innerHTML = '';
    if (!events || events.length === 0) {
      container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem 0">No events yet.</p>';
      return;
    }
    events.forEach(ev => {
      const block = buildShowBlock(ev);
      container.appendChild(block);
      revealObserver.observe(block);
      const strip = block.querySelector('.show-mini-strip');
      if (strip) parallaxMap.set(strip, false);
    });
  } catch {
    container.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:2rem 0">Could not load events.</p>';
  }
}
loadEvents();

const campusPhotoGrid  = document.getElementById('campus-photo-grid');
const campusLoading    = document.getElementById('campus-loading');
const campusEmptyState = document.getElementById('campus-empty-state');

async function loadCampusSpots() {
  try {
    const res = await fetch('/api/spots');
    const data = await res.json();
    campusLoading.style.display = 'none';
    if (!data.photos || data.photos.length === 0) {
      campusEmptyState.style.display = 'block';
    } else {
      campusPhotoGrid.style.display = 'grid';
      renderCampusPhotos(data.photos);
    }
  } catch {
    campusLoading.style.display = 'none';
    campusEmptyState.style.display = 'block';
  }
}

function renderCampusPhotos(photos) {
  campusPhotoGrid.innerHTML = '';
  photos.forEach(photo => {
    const item = document.createElement('div');
    item.className = 'campus-photo-item';
    const img = document.createElement('img');
    img.src = photo.url;
    img.alt = photo.caption || 'Campus car spot';
    img.loading = 'lazy';
    attachLightbox(img);
    item.appendChild(img);
    if (photo.caption) {
      const cap = document.createElement('div');
      cap.className = 'campus-photo-caption';
      cap.textContent = photo.caption;
      item.appendChild(cap);
    }
    campusPhotoGrid.appendChild(item);
  });
}

/* modal wiring */
const spotModalOverlay   = document.getElementById('spot-modal-overlay');
const spotModalClose     = document.getElementById('spot-modal-close');
const campusUploadBtn    = document.getElementById('campus-upload-btn');
const spotFileInput      = document.getElementById('spot-file-input');
const spotDropZone       = document.getElementById('spot-drop-zone');
const spotDropIdle       = document.getElementById('spot-drop-idle');
const spotPreviewImg     = document.getElementById('spot-preview-img');
const spotCaptionInput   = document.getElementById('spot-caption-input');
const spotUploadBtn      = document.getElementById('spot-upload-btn');
const spotUploadBtnText  = document.getElementById('spot-upload-btn-text');
const spotStatus         = document.getElementById('spot-status');

let selectedSpotFile = null;

function openSpotModal() {
  spotModalOverlay.classList.add('open');
  document.documentElement.classList.add('no-scroll');
}
function closeSpotModal() {
  spotModalOverlay.classList.remove('open');
  document.documentElement.classList.remove('no-scroll');
  resetSpotModal();
}
function resetSpotModal() {
  selectedSpotFile = null;
  spotFileInput.value = '';
  spotPreviewImg.style.display = 'none';
  spotPreviewImg.src = '';
  spotDropIdle.style.display = 'flex';
  spotCaptionInput.value = '';
  spotUploadBtn.disabled = true;
  spotStatus.textContent = '';
  spotStatus.className = 'spot-status';
  spotUploadBtnText.textContent = 'Upload Photo';
}

campusUploadBtn.addEventListener('click', openSpotModal);
spotModalClose.addEventListener('click', closeSpotModal);
spotModalOverlay.addEventListener('click', e => {
  if (e.target === spotModalOverlay) closeSpotModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && spotModalOverlay.classList.contains('open')) closeSpotModal();
});

/* drag-and-drop */
spotDropZone.addEventListener('dragover', e => {
  e.preventDefault();
  spotDropZone.classList.add('drag-over');
});
spotDropZone.addEventListener('dragleave', () => spotDropZone.classList.remove('drag-over'));
spotDropZone.addEventListener('drop', e => {
  e.preventDefault();
  spotDropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) handleSpotFile(file);
});
spotFileInput.addEventListener('change', () => {
  if (spotFileInput.files[0]) handleSpotFile(spotFileInput.files[0]);
});

function handleSpotFile(file) {
  selectedSpotFile = file;
  spotPreviewImg.src = URL.createObjectURL(file);
  spotPreviewImg.style.display = 'block';
  spotDropIdle.style.display = 'none';
  spotUploadBtn.disabled = false;
}

/* client-side compression */
function compressImage(file, maxWidth = 1600, quality = 0.82) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round(height * maxWidth / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/* upload */
spotUploadBtn.addEventListener('click', async () => {
  if (!selectedSpotFile) return;
  spotUploadBtn.disabled = true;
  spotUploadBtnText.textContent = 'Compressing…';

  try {
    const compressed = await compressImage(selectedSpotFile);
    spotUploadBtnText.textContent = 'Uploading…';

    const fd = new FormData();
    fd.append('file', compressed, 'spot.jpg');
    fd.append('upload_preset', UPLOAD_PRESET);
    fd.append('folder', 'campus-spots');
    const caption = spotCaptionInput.value.trim();
    if (caption) fd.append('context', `caption=${caption}`);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: fd
    });
    if (!res.ok) throw new Error('Upload failed');

    spotStatus.textContent = "Photo submitted — it's live on the site!";
    spotStatus.className = 'spot-status success';

    setTimeout(() => {
      closeSpotModal();
      campusEmptyState.style.display = 'none';
      campusPhotoGrid.style.display = 'none';
      campusLoading.style.display = 'flex';
      loadCampusSpots();
    }, 1600);

  } catch {
    spotStatus.textContent = 'Upload failed. Please try again.';
    spotStatus.className = 'spot-status error';
    spotUploadBtn.disabled = false;
    spotUploadBtnText.textContent = 'Upload Photo';
  }
});

loadCampusSpots();
