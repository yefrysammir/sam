/* Final unified script: carga data.json, parallax, sticky publicaciones, PTR, theme, menu, SW */

const root = document.documentElement;
const body = document.body;

// Elements
const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');
const themeToggle = document.getElementById('themeToggle');

const navbar = document.getElementById('navbar');
const usernameTop = document.getElementById('usernameTop');
const verifiedTop = document.getElementById('verifiedTop');

const coverImg = document.getElementById('cover');
const avatarImg = document.getElementById('avatar');
const fullNameEl = document.getElementById('fullName');
const usernameHero = document.getElementById('username');
const verifiedHero = document.getElementById('verifiedHero');
const bioEl = document.getElementById('bio');

const infoLeft = document.getElementById('infoLeft');
const infoRight = document.getElementById('infoRight');

const muro = document.getElementById('muro');
const scroller = document.getElementById('muroScroll'); // exists in HTML
const ptr = document.getElementById('ptr');
const ptrText = document.getElementById('ptrText');
const ptrSpinner = document.getElementById('ptrSpinner');
const postsEl = document.getElementById('posts');

// theme init
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') body.classList.add('dark');
themeToggle && themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark');
  localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
  themeToggle.textContent = body.classList.contains('dark') ? 'light_mode' : 'dark_mode';
});

// side menu
menuBtn && menuBtn.addEventListener('click', () => {
  sideMenu.classList.add('open'); overlay.hidden = false; overlay.classList.add('show');
});
overlay && overlay.addEventListener('click', () => {
  sideMenu.classList.remove('open'); overlay.hidden = true; overlay.classList.remove('show');
});

// helpers
function escapeHtml(s=''){ return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }
function svgIcon(type){
  const t = (type||'').toLowerCase();
  if (t.includes('instagram')) return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>`;
  if (t.includes('tiktok')) return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 8v8a3 3 0 1 0 3-3V6h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  if (t.includes('facebook')) return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 8h2.5V4.5H15c-2.2 0-4 1.8-4 4v1H9v3h2v7h3v-7h2.1l.9-3H14V8z" fill="currentColor"/></svg>`;
  if (t.includes('discord')) return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 10s1.5-2 4-2 4 2 4 2v4s-1.5 2-4 2-4-2-4-2V10z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.59 13.41a5 5 0 0 1 7.07 0l1.41 1.41a5 5 0 0 1 0 7.07 5 5 0 0 1-7.07 0l-1.41-1.41" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// tiempo relativo
function tiempoRel(fechaStr){
  const f = new Date(fechaStr);
  if (isNaN(f)) return fechaStr;
  const now = new Date();
  const diff = Math.floor((now - f)/1000);
  if (diff < 60) return 'Hace un momento';
  if (diff < 3600) return `Hace ${Math.floor(diff/60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff/3600)}h`;
  const d = Math.floor(diff/86400);
  if (d === 1) return 'Ayer';
  if (d < 7) return new Intl.DateTimeFormat('es-PE',{weekday:'long'}).format(f);
  if (d < 31) return `${d} días`;
  const y = f.getFullYear();
  const nowY = new Date().getFullYear();
  if (y === nowY) return f.toLocaleDateString('es-PE',{day:'2-digit',month:'2-digit'});
  return f.toLocaleDateString('es-PE',{day:'2-digit',month:'2-digit',year:'2-digit'});
}

/* Wait images */
function waitForImages(imgs){
  return Promise.all(imgs.map(img => {
    if (!img) return Promise.resolve();
    if (img.complete) return Promise.resolve();
    return new Promise(res => { img.addEventListener('load', res); img.addEventListener('error', res); });
  }));
}

/* Recalcular alturas (CSS vars) */
function recalcularAlturas(){
  const heroH = Math.max(180, Math.round(document.getElementById('hero').getBoundingClientRect().height || 300));
  const navbarH = Math.max(56, Math.round(navbar.getBoundingClientRect().height || 56));
  root.style.setProperty('--hero-h', `${heroH}px`);
  root.style.setProperty('--navbar-h', `${navbarH}px`);
  // scroller top and padding
  if (scroller){
    scroller.style.top = `${navbarH}px`;
    scroller.style.paddingTop = `${heroH}px`;
  }
}

/* Render profile & posts (normalize both schemas) */
function renderAllFromData(data){
  // normalize
  const profile = data.profile || {
    username: data.usuario || '',
    verified: data.verificado || false,
    name: data.nombre || '',
    bio: data.descripcion || '',
    avatar: data.avatar || '',
    cover: data.portada || '',
    location: data.info && (data.info.ciudad || data.info.location) ? (data.info.ciudad || data.info.location) : (data.location || ''),
    website: data.info && (data.info.web || data.info.sitio) ? (data.info.web || data.info.sitio) : (data.web || ''),
    socials: data.socials || []
  };
  const posts = data.publicaciones || data.posts || [];

  // profile area
  usernameTop && (usernameTop.textContent = profile.username ? `@${profile.username}` : (data.usuario || '@usuario'));
  usernameHero && (usernameHero.textContent = profile.username ? `@${profile.username}` : (data.usuario || '@usuario'));
  if (profile.verified){ verifiedTop && (verifiedTop.style.display='inline-flex'); verifiedHero && (verifiedHero.style.display='inline-flex'); } else { verifiedTop && (verifiedTop.style.display='none'); verifiedHero && (verifiedHero.style.display='none'); }

  coverImg && (coverImg.src = profile.cover || '');
  avatarImg && (avatarImg.src = profile.avatar || '');
  fullNameEl && (fullNameEl.textContent = profile.name || data.nombre || '');
  bioEl && (bioEl.textContent = profile.bio || data.descripcion || '');

  // info left (location & website)
  if (infoLeft){
    infoLeft.innerHTML = '';
    if (profile.location){
      const div = document.createElement('div'); div.className='info-item';
      div.innerHTML = `<span class="material-symbols-outlined">location_on</span><span>${escapeHtml(profile.location)}</span>`;
      infoLeft.appendChild(div);
    }
    if (profile.website){
      const a = document.createElement('a'); a.className='info-item'; a.href = profile.website; a.target='_blank'; a.rel='noopener noreferrer';
      a.innerHTML = `<span class="material-symbols-outlined">link</span><span>${escapeHtml((profile.website+'').replace(/^https?:\/\//,''))}</span>`;
      infoLeft.appendChild(a);
    }
  }

  // socials (icons only)
  if (infoRight){
    infoRight.innerHTML = '';
    (profile.socials || []).forEach(s => {
      const a = document.createElement('a'); a.className='social'; a.href = s.url || '#'; a.target='_blank'; a.rel='noopener noreferrer';
      a.innerHTML = svgIcon(s.type || s.label || s.name || 'web');
      // allow svg to take currentColor; color will change with theme by CSS (inherit)
      infoRight.appendChild(a);
    });
  }

  // posts
  if (postsEl){
    postsEl.innerHTML = '';
    posts.forEach(p=>{
      const article = document.createElement('article'); article.className='post';
      const f = document.createElement('div'); f.className='fecha'; f.textContent = tiempoRel(p.fecha || p.date || new Date().toISOString());
      const t = document.createElement('div'); t.className='texto'; t.innerHTML = escapeHtml(p.texto || p.text || '');
      article.appendChild(f); article.appendChild(t);
      if (p.imagen || p.image){
        const img = document.createElement('img'); img.src = p.imagen || p.image; img.alt = '';
        article.appendChild(img);
      }
      if (p.video){
        const video = document.createElement('video'); video.controls = true; video.playsInline = true;
        const src = document.createElement('source'); src.src = p.video; src.type = 'video/mp4';
        video.appendChild(src); article.appendChild(video);
      }
      postsEl.appendChild(article);
    });
  }
}

/* Scroll effects on scroller (parallax, hero fade, navbar blur) */
let ticking = false;
function onScrollHandler(){
  if (!scroller) return;
  const y = scroller.scrollTop;
  // parallax (move cover up slightly)
  const PARALLAX = 0.35;
  if (coverImg) coverImg.style.transform = `translateY(${Math.round(-y * PARALLAX)}px)`;

  // hero fade/blur
  const heroH = parseInt(getComputedStyle(root).getPropertyValue('--hero-h')) || 360;
  const p = Math.min(1, y / Math.max(120, heroH * 0.55));
  const heroEl = document.getElementById('hero');
  if (heroEl){
    heroEl.style.opacity = `${Math.max(0, 1 - p)}`;
    heroEl.style.filter = `blur(${Math.min(10, p*10)}px)`;
  }

  // navbar blur toggle
  if (y > 12) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled');

  ticking = false;
}
if (scroller){
  scroller.addEventListener('scroll', ()=> {
    if (!ticking){ requestAnimationFrame(onScrollHandler); ticking = true; }
  }, { passive: true });
}

/* Pull to refresh on scroller */
function initPTR(){
  if (!scroller) return;
  let startY = 0, pulling = false, pulled = 0;
  const MAX = 120, THRESH = 80;

  scroller.addEventListener('touchstart', e => {
    if (scroller.scrollTop <= 0){ pulling = true; startY = e.touches[0].clientY; pulled = 0; }
  }, { passive: true });

  scroller.addEventListener('touchmove', e => {
    if (!pulling) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0){
      e.preventDefault();
      pulled = Math.min(MAX, dy);
      ptr.style.height = `${pulled}px`;
      if (pulled >= THRESH){ ptr.classList.add('ready'); ptrText.textContent = 'Suelta para actualizar'; }
      else { ptr.classList.remove('ready'); ptrText.textContent = 'Desliza para actualizar'; }
    }
  }, { passive: false });

  scroller.addEventListener('touchend', async () => {
    if (!pulling) return;
    pulling = false;
    if (pulled >= THRESH){
      ptr.classList.remove('ready'); ptr.classList.add('loading');
      ptrText.textContent = 'Actualizando…';
      if (ptrSpinner) ptrSpinner.style.display = 'block';
      await loadDataAndRender(); // reload data
      setTimeout(()=> {
        ptr.classList.remove('loading'); ptr.style.height = '0px';
        ptrText.textContent = 'Desliza para actualizar';
        if (ptrSpinner) ptrSpinner.style.display = 'none';
      }, 300);
    } else {
      ptr.style.height = '0px';
      ptr.classList.remove('ready');
    }
    pulled = 0;
  });
}

/* Load data.json and render (with normalization) */
async function loadDataAndRender(){
  try{
    const res = await fetch('data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('data.json load failed');
    const data = await res.json();
    renderAllFromData(data);
    // wait images then recalc heights so sticky threshold is correct
    await waitForImages([coverImg, avatarImg]);
    recalcularAlturas();
  }catch(e){
    console.error(e);
  }
}

/* Service worker register (safe) */
function registerSW(){
  if ('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(err => console.warn('sw register failed', err));
  }
}

/* Boot */
document.addEventListener('DOMContentLoaded', async () => {
  // scroller must exist in DOM
  if (!scroller){
    console.error('No existe #muroScroll en el DOM (index.html).');
    return;
  }
  await loadDataAndRender();
  initPTR();
  registerSW();

  // update hero var immediately
  setTimeout(recalcularAlturas, 80);
  window.addEventListener('resize', recalcularAlturas);
});