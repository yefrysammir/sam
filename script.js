/* Main JS: carga data.json, parallax, sticky navbar, pull-to-refresh, theme, side menu */

/* Elements */
const root = document.documentElement;
const body = document.body;
const menuBtn = document.getElementById('menuBtn');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');
const themeToggle = document.getElementById('themeToggle');
const usernameTop = document.getElementById('usernameTop');
const verifiedTop = document.getElementById('verifiedTop');

const coverImg = document.getElementById('cover');
const avatarImg = document.getElementById('avatar');
const fullNameEl = document.getElementById('fullName');
const bioEl = document.getElementById('bio');
const infoLeft = document.getElementById('infoLeft');
const infoRight = document.getElementById('infoRight');

const hero = document.getElementById('hero');
const muro = document.getElementById('muro');
const ptr = document.getElementById('ptr');
const ptrIcon = document.getElementById('ptrIcon');
const ptrText = document.getElementById('ptrText');
const ptrSpinner = document.getElementById('ptrSpinner');
const postsEl = document.getElementById('posts');
const navbar = document.getElementById('navbar');

let theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
if (theme === 'dark') body.classList.add('dark');

/* Utilities */
function escapeHtml(str=''){ return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
function tiempoRelativo(fechaStr){
  const fecha = new Date(fechaStr);
  if (isNaN(fecha)) return fechaStr;
  const ahora = new Date();
  const diff = Math.floor((ahora - fecha)/1000);
  if (diff < 60) return 'Hace un momento';
  if (diff < 3600){ const m = Math.floor(diff/60); return `Hace ${m} min${m===1?'':'s'}`; }
  if (diff < 86400){ const h = Math.floor(diff/3600); return `Hace ${h}h`; }
  const d = Math.floor(diff/86400);
  if (d === 1) return 'Ayer';
  if (d >= 2 && d < 7){ const w = new Intl.DateTimeFormat('es-PE',{weekday:'long'}).format(fecha); return w.charAt(0).toUpperCase()+w.slice(1); }
  if (d < 31) return `${d} días`;
  const ahoraYear = new Date().getFullYear();
  if (fecha.getFullYear() === ahoraYear) return fecha.toLocaleDateString('es-PE',{day:'2-digit',month:'2-digit'});
  return fecha.toLocaleDateString('es-PE',{day:'2-digit',month:'2-digit',year:'2-digit'});
}

/* Social SVGs */
function svgIcon(type){
  const t = (type||'').toLowerCase();
  if (t.includes('instagram')) return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.4"/><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>`;
  if (t.includes('tiktok')) return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 8v8a3 3 0 1 0 3-3V6h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  if (t.includes('facebook')) return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 8h2.5V4.5H15c-2.2 0-4 1.8-4 4v1H9v3h2v7h3v-7h2.1l.9-3H14V8z" fill="currentColor"/></svg>`;
  if (t.includes('discord')) return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 10s1.5-2 4-2 4 2 4 2v4s-1.5 2-4 2-4-2-4-2V10z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.59 13.41a5 5 0 0 1 7.07 0l1.41 1.41a5 5 0 0 1 0 7.07 5 5 0 0 1-7.07 0l-1.41-1.41" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/* Render functions */
function renderProfile(data){
  if (!data.profile) return;
  usernameTop.textContent = data.profile.username ? `@${data.profile.username}` : (data.usuario || '@usuario');
  verifiedTop.style.display = data.profile.verified ? 'inline-flex' : 'none';

  coverImg.src = data.profile.cover || data.portada || '';
  avatarImg.src = data.profile.avatar || data.avatar || '';
  fullNameEl.textContent = data.profile.name || data.nombre || '';
  bioEl.textContent = data.profile.bio || data.descripcion || '';

  // left info: location + website
  infoLeft.innerHTML = '';
  if (data.profile.location){
    const div = document.createElement('div'); div.className = 'info-item';
    div.innerHTML = `<span class="material-symbols-outlined">location_on</span><span>${escapeHtml(data.profile.location)}</span>`;
    infoLeft.appendChild(div);
  }
  if (data.profile.website){
    const a = document.createElement('a'); a.className='info-item'; a.href = data.profile.website; a.target='_blank'; a.rel='noopener noreferrer';
    a.innerHTML = `<span class="material-symbols-outlined">link</span><span>${escapeHtml(data.profile.website.replace(/^https?:\/\//,''))}</span>`;
    infoLeft.appendChild(a);
  }

  // right: socials icons only
  infoRight.innerHTML = '';
  if (data.profile.socials && Array.isArray(data.profile.socials)){
    data.profile.socials.forEach(s=>{
      const a = document.createElement('a'); a.className='social'; a.href = s.url || '#'; a.target='_blank'; a.rel='noopener noreferrer';
      a.innerHTML = svgIcon(s.type || s.label || s.name);
      infoRight.appendChild(a);
    });
  }
}

function renderPosts(posts){
  postsEl.innerHTML = '';
  if (!Array.isArray(posts)) return;
  posts.forEach(p=>{
    const article = document.createElement('article');
    article.className = 'post';
    const fecha = document.createElement('div'); fecha.className='fecha'; fecha.textContent = tiempoRelativo(p.fecha || new Date().toISOString());
    const texto = document.createElement('div'); texto.className='texto'; texto.innerHTML = escapeHtml(p.texto || p.text || '');
    article.appendChild(fecha);
    article.appendChild(texto);
    if (p.imagen || p.image) {
      const img = document.createElement('img'); img.src = p.imagen || p.image; img.alt = ''; article.appendChild(img);
    }
    if (p.video) {
      const video = document.createElement('video'); video.controls = true; video.playsInline = true;
      const src = document.createElement('source'); src.src = p.video; src.type = 'video/mp4';
      video.appendChild(src); article.appendChild(video);
    }
    postsEl.appendChild(article);
  });
}

/* Parallax & sticky navbar logic */
function initScrollEffects(){
  if (!muro) return;
  muro.addEventListener('scroll', () => {
    const y = muro.scrollTop;
    const parallax = y * 0.35;
    coverImg.style.transform = `translateY(${parallax}px)`;

    // hero fade/blur
    const heroH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--hero-h')) || 360;
    const p = Math.min(1, y / Math.max(120, heroH * 0.55));
    hero.style.opacity = `${Math.max(0.0, 1 - p)}`;
    hero.style.filter = `blur(${Math.min(8, p*8)}px)`;

    // navbar scrolled
    if (y > 10) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled');
  }, { passive: true });
}

/* Pull to refresh simple (touch) */
function initPTR(){
  if (!muro) return;
  let startY = 0, pulling = false, pulled = 0;
  const MAX = 120, THRESH = 80;

  muro.addEventListener('touchstart', e => {
    if (muro.scrollTop <= 0) { pulling = true; startY = e.touches[0].clientY; pulled = 0; }
  }, { passive: true });

  muro.addEventListener('touchmove', e => {
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

  muro.addEventListener('touchend', async () => {
    if (!pulling) return;
    pulling = false;
    if (pulled >= THRESH){
      ptr.classList.remove('ready'); ptr.classList.add('loading');
      ptrText.textContent = 'Actualizando…';
      if (ptrSpinner) ptrSpinner.style.display = 'block';
      try { await loadAndRender(); } catch(e){ console.warn(e); }
      setTimeout(()=> {
        ptr.classList.remove('loading');
        ptr.style.height = '0px';
        if (ptrSpinner) ptrSpinner.style.display = 'none';
      }, 350);
    } else {
      ptr.style.height = '0px';
      ptr.classList.remove('ready');
    }
    pulled = 0;
  });
}

/* Theme switch */
themeToggle && themeToggle.addEventListener('click', () => {
  if (body.classList.contains('dark')){ body.classList.remove('dark'); localStorage.setItem('theme','light'); }
  else { body.classList.add('dark'); localStorage.setItem('theme','dark'); }
});

/* Side menu */
menuBtn && menuBtn.addEventListener('click', () => {
  sideMenu.classList.add('open'); overlay.hidden = false; overlay.classList.add('show');
});
overlay && overlay.addEventListener('click', () => {
  sideMenu.classList.remove('open'); overlay.classList.remove('show'); overlay.hidden = true;
});

/* Load data.json and render everything */
async function loadAndRender(){
  try{
    const res = await fetch('data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('No se pudo cargar data.json');
    const data = await res.json();

    // normalize: allow older schema or new profile-based one
    const normalized = {
      profile: data.profile || {
        username: data.usuario || '',
        verified: data.verificado || false,
        name: data.nombre || '',
        bio: data.descripcion || '',
        avatar: data.avatar || '',
        cover: data.portada || '',
        location: data.info && (data.info.ciudad || data.info.location) ? (data.info.ciudad || data.info.location) : (data.location || ''),
        website: data.info && (data.info.web || data.info.sitio) ? (data.info.web || data.info.sitio) : (data.web || ''),
        socials: data.socials || []
      },
      posts: data.publicaciones || data.posts || []
    };

    renderProfile(normalized);
    renderPosts(normalized.posts);
  }catch(err){
    console.error('loadAndRender error', err);
  }
}

/* Service worker registration (simple) */
function registerSW(){
  if ('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW register failed', e));
  }
}

/* Boot */
document.addEventListener('DOMContentLoaded', async () => {
  await loadAndRender();
  initScrollEffects();
  initPTR();
  registerSW();
  // ensure hero CSS var updated
  const heroH = Math.max(220, Math.round(hero.getBoundingClientRect().height || 300));
  document.documentElement.style.setProperty('--hero-h', `${heroH}px`);
});