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
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lb.classList.remove('open');
  document.body.style.overflow = '';
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
  '.show-preview-grid img, .show-thumbs img, .about-img, .strip-track img'
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

/* ── SECTION PARALLAX ─── */
const parallaxMap = new Map();
document.querySelectorAll('.show-preview-grid').forEach(el => parallaxMap.set(el, false));

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

/* ── CAMPUS CAR SPOTTING ─── */
const CLOUD_NAME = 'ddud73mxv';
const UPLOAD_PRESET = 'Campus Spotting';

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
  document.body.style.overflow = 'hidden';
}
function closeSpotModal() {
  spotModalOverlay.classList.remove('open');
  document.body.style.overflow = '';
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
