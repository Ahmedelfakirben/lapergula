/* ═══════════════════════════════════════════════════════════════════════════
   La Pergola — Animaciones GSAP + Web Audio API + Canvas
   Inspirado en: Harmonic Fusion (HF) — misma pila tecnológica
═══════════════════════════════════════════════════════════════════════════ */

'use strict';

gsap.registerPlugin(TextPlugin);

/* ── Datos del menú ─────────────────────────────────────────────────────── */
const MENUS = {
  breakfast: {
    title:  'Petits Déjeuners',
    folder: 'Breakfast pergola',
    pages: [
      'Breakfast Menu_Plan de travail 1.svg',
      'Breakfast Menu-02.svg',
    ],
  },
  main: {
    title:  'Menu Principal',
    folder: 'Main pergola',
    pages: [
      'Pergola Menu_Plan de travail 1.svg',
      'Pergola Menu-02.svg',
      'Pergola Menu-03.svg',
      'Pergola Menu-04.svg',
      'Pergola Menu-05.svg',
      'Pergola Menu-06.svg',
      'Pergola Menu-07.svg',
      'Pergola Menu-08.svg',
      'Pergola Menu-09.svg',
      'Pergola Menu-10.svg',
      'Pergola Menu-11.svg',
      'Pergola Menu-12.svg',
    ],
  },
};

/* ── Estado ─────────────────────────────────────────────────────────────── */
let currentMenu  = null;
let currentPage  = 0;
let totalPages   = 0;
let touchStartX  = 0;
let touchStartY  = 0;
let isDragging   = false;

/* ── Referencias DOM ────────────────────────────────────────────────────── */
const $splash       = document.getElementById('splash');
const $splashTitle  = document.getElementById('splash-title');
const $splashLoader = document.getElementById('splash-loader');
const $loaderBar    = document.getElementById('loader-bar');

const $landing      = document.getElementById('landing');
const $viewer       = document.getElementById('viewer');
const $carousel     = document.getElementById('carousel');
const $carouselWrap = document.getElementById('carousel-wrap');
const $thumbBar     = document.getElementById('thumbnail-bar');
const $viewerTitle  = document.getElementById('viewer-title');
const $currentPage  = document.getElementById('current-page');
const $totalPages   = document.getElementById('total-pages');
const $btnPrev      = document.getElementById('btn-prev');
const $btnNext      = document.getElementById('btn-next');

/* ══════════════════════════════════════════════════════════════════════════
   1. CANVAS DE PARTÍCULAS DORADAS
══════════════════════════════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx    = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -999, y: -999 };

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x    = Math.random() * W;
      this.y    = init ? Math.random() * H : H + 10;
      this.size = 0.8 + Math.random() * 2;
      this.speedY = 0.2 + Math.random() * 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = 0;
      this.maxOpacity = 0.3 + Math.random() * 0.4;
      // Alterna entre dorado y turquesa
      this.color = Math.random() > 0.5
        ? `rgba(239,223,156,${this.maxOpacity})`
        : `rgba(1,159,162,${this.maxOpacity * 0.7})`;
      this.life = 0;
      this.maxLife = 180 + Math.random() * 200;
    }
    update() {
      this.life++;
      // Fade in / fade out
      if (this.life < 40) this.opacity = (this.life / 40) * this.maxOpacity;
      else if (this.life > this.maxLife - 40) this.opacity = ((this.maxLife - this.life) / 40) * this.maxOpacity;
      else this.opacity = this.maxOpacity;

      // Atracción suave al ratón
      const dx = mouse.x - this.x, dy = mouse.y - this.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 180) {
        this.x += (dx / dist) * 0.15;
        this.y += (dy / dist) * 0.15;
      }

      this.y -= this.speedY;
      this.x += this.speedX;
      if (this.life >= this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color.replace(/[\d.]+\)$/, `${this.opacity})`);
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ══════════════════════════════════════════════════════════════════════════
   2. TILT 3D EN TARJETAS
══════════════════════════════════════════════════════════════════════════ */
function initCardTilt() {
  document.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotY   =  dx * 12;
      const rotX   = -dy * 8;
      gsap.to(card, {
        rotateX: rotX, rotateY: rotY,
        transformPerspective: 800,
        ease: 'power1.out', duration: 0.3
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1,0.5)' });
    });
  });
}



/* ══════════════════════════════════════════════════════════════════════════
   4. INTRO CINEMATOGRÁFICA
══════════════════════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {

  const loaderBarFill = $loaderBar.querySelector('::after') || $loaderBar;
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress = Math.min(progress + Math.random() * 6, 100);
    $loaderBar.style.setProperty('--progress', progress + '%');
    $loaderBar.style.background = `linear-gradient(90deg, #019FA2 ${progress}%, rgba(1,159,162,0.2) ${progress}%)`;
    if (progress >= 100) clearInterval(progressInterval);
  }, 30);

  const splashTl = gsap.timeline({
    onComplete: revealLanding,
  });

  splashTl
    .set($splash, { opacity: 1 })
    .from('.splash-grid', { opacity: 0, duration: 0.4, ease: 'power2.out' })
    .from('.radar-ring', {
      scale: 0, opacity: 0,
      stagger: 0.1, duration: 0.4,
      ease: 'back.out(2)', transformOrigin: 'center center'
    }, '-=0.2')
    .to('.orn-frame', { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, '-=0.1')
    .to('.orn-corner', { strokeDashoffset: 0, stagger: 0.05, duration: 0.3, ease: 'power3.out' }, '-=0.4')
    .to('.orn-circle', { strokeDashoffset: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2')
    .to('.orn-line', { strokeDashoffset: 0, stagger: 0.05, duration: 0.3, ease: 'power2.out' }, '-=0.2')
    .to('.orn-diamond', {
      opacity: 0.7, scale: 1, transformOrigin: 'center',
      stagger: 0.05, duration: 0.3, ease: 'back.out(3)'
    }, '-=0.2')
    .to($splashTitle, {
      duration: 0.8,
      text: { value: 'La Pergola', delimiter: '' },
      ease: 'none',
      onStart: () => { $splashTitle.classList.remove('done'); },
    }, '+=0.05')
    .call(() => { $splashTitle.classList.add('done'); })
    .to($splashLoader, { opacity: 1, duration: 0.3, ease: 'power2.out' }, '+=0.1')
    .to('.orn-diamond', {
      opacity: 1, scale: 1.4,
      stagger: { each: 0.04, yoyo: true, repeat: 1 },
      duration: 0.15, ease: 'power2.inOut'
    }, '+=0.5')
    .to($splash, {
      backgroundColor: 'rgba(1,159,162,0.06)',
      duration: 0.1, yoyo: true, repeat: 1
    }, '-=0.05')
    .to($splash, {
      scale: 1.06, opacity: 0, duration: 0.4, ease: 'power3.in',
    }, '+=0.1')
    .set($splash, { display: 'none' });

  function revealLanding() {
    $landing.classList.add('active');

    const landingTl = gsap.timeline();

    landingTl
      .from('.ornament.top',    { opacity: 0, y: -10, duration: 0.5, ease: 'power2.out' })
      .from('.ornament.bottom', { opacity: 0, y: 10, duration: 0.5, ease: 'power2.out' }, '<')
      .from('.logo-ring', {
        scale: 0, opacity: 0, stagger: 0.05, duration: 0.8,
        ease: 'elastic.out(1,0.6)', transformOrigin: 'center'
      }, '-=0.2')
      .to('#logo-tagline', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3')
      .fromTo('#logo-title', { opacity: 0, scale: 0.8, y: 10 }, {
        opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(2)'
      }, '-=0.1')
      .fromTo('#logo-divider', { opacity: 0, scaleX: 0 }, {
        opacity: 1, scaleX: 1, transformOrigin: 'center', duration: 0.4, ease: 'power3.out'
      }, '-=0.2')
      .to('#logo-subtitle', { opacity: 1, duration: 0.3, ease: 'power2.out' }, '-=0.1')
      .to('#landing-intro', { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.1')
      .fromTo('.menu-cards', { opacity: 0 }, { opacity: 1, duration: 0.01 }, '-=0.1')
      .fromTo('.menu-card', {
        y: 40, opacity: 0, scale: 0.95, rotationX: 10
      }, {
        y: 0, opacity: 1, scale: 1, rotationX: 0, stagger: 0.1, duration: 0.6,
        ease: 'back.out(2)', transformPerspective: 600,
      }, '-=0.1')
      .to('#landing-footer', { opacity: 1, duration: 0.4 }, '-=0.1');

    landingTl.call(initCardTilt);
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   5. NAVEGACIÓN ENTRE PANTALLAS
══════════════════════════════════════════════════════════════════════════ */
function openMenu(type) {
  const menu = MENUS[type];
  if (!menu) return;

  currentMenu = type;
  currentPage = 0;
  totalPages  = menu.pages.length;

  $viewerTitle.textContent = menu.title;
  $totalPages.textContent  = totalPages;

  buildCarousel(menu);

  const tl = gsap.timeline();
  
  // Efecto "Cinematic Dive": la pantalla principal hace zoom hacia adelante y se desenfoca
  tl.to($landing, { 
      opacity: 0, 
      scale: 1.5, 
      filter: 'blur(12px)',
      duration: 0.6, 
      ease: 'power3.in',
      onComplete: () => {
        $landing.classList.remove('active');
        $landing.style.filter = ''; // limpiar
      }
    })
    .set($viewer, { opacity: 0, display: 'flex' })
    .call(() => {
      $viewer.classList.add('active');
      gsap.set($viewer, { perspective: 1200 }); // Configurar perspectiva 3D
      updateCarouselPosition(false);
      updateNavButtons();
      updateThumbnails();
    })
    // El visor aparece
    .to($viewer, { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.1')
    
    // Entran los menús rotando en 3D
    .from('.carousel-page', { 
      rotationY: 45, 
      z: -400, 
      x: 100,
      opacity: 0, 
      stagger: 0.15, 
      duration: 0.8, 
      ease: 'back.out(1.5)',
      transformOrigin: 'left center'
    }, '-=0.2')
    
    // UI elements fade in
    .from('.viewer-header', { y: -40, opacity: 0, duration: 0.4, ease: 'power2.out' }, '-=0.6')
    .from('.nav-btn:not(.hidden)', { scale: 0, opacity: 0, stagger: 0.1, duration: 0.4, ease: 'back.out(2)' }, '-=0.5')
    .from('.thumbnail-bar', { y: 40, opacity: 0, duration: 0.4, ease: 'power2.out' }, '-=0.6');
}

function closeMenu() {
  const tl = gsap.timeline();
  
  // El visor se aleja y se difumina
  tl.to($viewer, { 
      opacity: 0, 
      scale: 0.8, 
      filter: 'blur(10px)',
      duration: 0.5, 
      ease: 'power3.in',
      onComplete: () => {
        $viewer.classList.remove('active');
        $viewer.style.filter = '';
        $viewer.style.transform = '';
        $carousel.innerHTML = '';
        $thumbBar.innerHTML = '';
        currentMenu = null;
      }
    })
    .call(() => {
      $landing.classList.add('active');
      // La pantalla principal vuelve desde el zoom
      gsap.fromTo($landing,
        { opacity: 0, scale: 1.5, filter: 'blur(12px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out', clearProps: 'filter' }
      );
      gsap.fromTo('.menu-card', { y: 20, opacity: 0 }, {
        y: 0, opacity: 1,
        stagger: 0.12, duration: 0.6, ease: 'back.out(1.5)'
      });
      initCardTilt();
    });
}

/* ══════════════════════════════════════════════════════════════════════════
   6. CONSTRUCCIÓN DEL CARRUSEL
══════════════════════════════════════════════════════════════════════════ */
function buildCarousel(menu) {
  $carousel.innerHTML = '';
  $thumbBar.innerHTML = '';

  menu.pages.forEach((filename, idx) => {
    const src = encodeURI(`${menu.folder}/${filename}`) + '?v=2.0';

    const page = document.createElement('div');
    page.className = 'carousel-page';
    page.setAttribute('role', 'tabpanel');
    page.setAttribute('aria-label', `Página ${idx + 1} de ${menu.pages.length}`);
    page.setAttribute('aria-hidden', idx !== 0);

    const wrap = document.createElement('div');
    wrap.className = 'svg-embed';

    const img = document.createElement('img');
    img.src = src;
    img.alt = `${menu.title} — página ${idx + 1}`;
    img.draggable = false;

    wrap.appendChild(img);
    page.appendChild(wrap);
    $carousel.appendChild(page);

    const thumb = document.createElement('button');
    thumb.className = 'thumb-btn' + (idx === 0 ? ' active' : '');
    thumb.setAttribute('role', 'tab');
    thumb.setAttribute('aria-label', `Ir a página ${idx + 1}`);
    thumb.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
    thumb.dataset.index = idx;
    thumb.onclick = () => goToPage(idx);

    const tImg = document.createElement('img');
    tImg.src = src; tImg.alt = '';
    thumb.appendChild(tImg);
    $thumbBar.appendChild(thumb);
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   7. NAVEGACIÓN DE PÁGINAS
══════════════════════════════════════════════════════════════════════════ */
function goToPage(index, animate = true) {
  if (index < 0 || index >= totalPages) return;

  $carousel.querySelectorAll('.carousel-page').forEach((p, i) =>
    p.setAttribute('aria-hidden', i !== index)
  );

  currentPage = index;
  updateCarouselPosition(animate);
  updateNavButtons();
  updateThumbnails();
  scrollThumbIntoView(index);

  gsap.timeline()
    .to($currentPage, { rotationX: -90, opacity: 0, duration: 0.18, ease: 'power2.in' })
    .call(() => { $currentPage.textContent = index + 1; })
    .fromTo($currentPage,
      { rotationX: 90, opacity: 0 },
      { rotationX: 0, opacity: 1, duration: 0.25, ease: 'back.out(2)' }
    );
}

function nextPage() { goToPage(currentPage + 1); }
function prevPage() { goToPage(currentPage - 1); }

function updateCarouselPosition(animate = true, touchOffset = 0) {
  // touchOffset es el desplazamiento en píxeles (- si arrastra a la izquierda, + a la derecha)
  const base = -(currentPage * window.innerWidth);
  gsap.to($carousel, {
    x: base + touchOffset,
    duration: animate ? 0.45 : 0,
    ease: 'power3.out'
  });

  // Calcular el "progreso" actual (ej. 1.5 significa mitad entre página 1 y 2)
  const progress = currentPage - (touchOffset / window.innerWidth);

  const pages = $carousel.querySelectorAll('.carousel-page');
  pages.forEach((page, i) => {
    // Distancia desde la página actual al centro de la pantalla (0 es centrado)
    const dist = i - progress;
    
    // Efecto súper exagerado:
    const scale = Math.max(0.4, 1 - Math.abs(dist) * 0.4); 
    const opacity = Math.max(0.1, 1 - Math.abs(dist) * 0.8);
    const blurAmt = Math.abs(dist) * 12; // Hasta 12px de desenfoque
    
    // Rotación 3D para estilo Coverflow
    let rotY = 0;
    if (dist < -0.01) rotY = 35; // Está a la izquierda, gira hacia la derecha
    else if (dist > 0.01) rotY = -35; // Está a la derecha, gira hacia la izquierda

    gsap.to(page, {
      scale: scale,
      opacity: opacity,
      rotationY: rotY,
      filter: `blur(${blurAmt}px)`,
      duration: animate ? 0.45 : 0,
      ease: 'power3.out'
    });
  });
}

function updateNavButtons() {
  $btnPrev.classList.toggle('hidden', currentPage === 0);
  $btnNext.classList.toggle('hidden', currentPage === totalPages - 1);
}

function updateThumbnails() {
  $thumbBar.querySelectorAll('.thumb-btn').forEach((btn, i) => {
    const active = i === currentPage;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

function scrollThumbIntoView(index) {
  const btn = $thumbBar.querySelector(`.thumb-btn[data-index="${index}"]`);
  if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

/* ══════════════════════════════════════════════════════════════════════════
   8. SWIPE TÁCTIL
══════════════════════════════════════════════════════════════════════════ */
$carouselWrap.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
  isDragging  = true;
}, { passive: true });

$carouselWrap.addEventListener('touchmove', e => {
  if (!isDragging) return;
  const dx = e.touches[0].clientX - touchStartX;
  const dy = Math.abs(e.touches[0].clientY - touchStartY);
  if (Math.abs(dx) > dy + 10) {
    e.preventDefault();
    updateCarouselPosition(false, dx * 0.6);
  }
}, { passive: false });

$carouselWrap.addEventListener('touchend', e => {
  if (!isDragging) return;
  isDragging = false;
  const dx  = e.changedTouches[0].clientX - touchStartX;
  const thr = window.innerWidth * 0.22;
  if (dx < -thr)     nextPage();
  else if (dx > thr) prevPage();
  else               updateCarouselPosition(true);
}, { passive: true });

/* ══════════════════════════════════════════════════════════════════════════
   9. TECLADO
══════════════════════════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (!$viewer.classList.contains('active')) return;
  switch (e.key) {
    case 'ArrowRight': case 'ArrowDown':  e.preventDefault(); nextPage();  break;
    case 'ArrowLeft':  case 'ArrowUp':    e.preventDefault(); prevPage();  break;
    case 'Escape':                                            closeMenu(); break;
  }
});
