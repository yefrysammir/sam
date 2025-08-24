/* ---------- Elementos ---------- */
const root = document.documentElement;
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
const muro = document.getElementById('muro');   // contenedor fijo
let scroller; // será .muro-scroll (creado en boot)
const ptr = document.getElementById('ptr');
const ptrText = document.getElementById('ptrText');
const ptrSpinner = document.getElementById('ptrSpinner');
const postsEl = document.getElementById('posts');

/* ---------- Tema persistente ---------- */
(function initTheme(){
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') root.setAttribute('data-theme','dark');
  themeToggle.textContent = (root.getAttribute('data-theme') === 'dark') ? 'light_mode' : 'dark_mode';
})();
themeToggle.addEventListener('click', () => {
  const next = (root.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
  if (next === 'dark') root.setAttribute('data-theme','dark'); else root.removeAttribute('data-theme');
  localStorage.setItem('theme', next === 'dark' ? 'dark' : 'light');
  themeToggle.textContent = (next === 'dark') ? 'light_mode' : 'dark_mode';
});

/* ---------- Side menu ---------- */
menuBtn.addEventListener('click', openMenu);
overlay.addEventListener('click', closeMenu);
function openMenu(){ sideMenu.classList.add('open'); overlay.classList.add('show'); overlay.hidden = false; sideMenu.setAttribute('aria-hidden','false'); }
function closeMenu(){ sideMenu.classList.remove('open'); overlay.classList.remove('show'); setTimeout(()=> overlay.hidden = true, 300); sideMenu.setAttribute('aria-hidden','true'); }
document.addEventListener('keydown', (e)=> { if (e.key === 'Escape') closeMenu(); });

/* ---------- Cargar data.json ---------- */
async function cargarDatos(){
  try{
    const res = await fetch('data.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('No se pudo cargar data.json');
    const data = await res.json();

    // header / verified
    usernameTop.textContent = data.usuario || '@usuario';
    verifiedTop.style.display = data.verificado ? 'inline-flex' : 'none';

    // hero content
    coverImg.src = data.portada || '';
    avatarImg.src = data.avatar || '';
    fullNameEl.textContent = data.nombre || '';
    bioEl.textContent = data.descripcion || '';

    // info (left = location/site; right = socials icons only)
    renderInfo(data);

    // posts
    renderPosts(data.publicaciones || []);

    // recalcular alturas y vars
    requestAnimationFrame(recalcularAlturas);
  } catch(err){
    console.error('cargarDatos error', err);
  }
}

/* ---------- Render info (separado) ---------- */
function renderInfo(data){
  infoLeft.innerHTML = '';
  infoRight.innerHTML = '';

  // left: location + site (text + small icon)
  if (data.info){
    if (data.info.ciudad || data.info.location){
      const val = data.info.ciudad || data.info.location;
      const div = document.createElement('div'); div.className = 'info-item';
      div.innerHTML = `${svgLocation()} <span style="font-size:13px; margin-left:6px">${escapeHtml(val)}</span>`;
      infoLeft.appendChild(div);
    }
    if (data.info.web || data.info.sitio || data.info.site){
      const val = data.info.web || data.info.sitio || data.info.site;
      const a = document.createElement('a'); a.className = 'info-item'; a.href = (val.startsWith('http')?val:`https://${val}`); a.target='_blank'; a.rel='noopener noreferrer';
      a.innerHTML = `${svgLink()} <span style="font-size:13px; margin-left:6px">${escapeHtml(val)}</span>`;
      infoLeft.appendChild(a);
    }
  }

  // right: socials (icons only)
  if (Array.isArray(data.socials)){
    data.socials.forEach(s=>{
      const a = document.createElement('a');
      a.className = 'social';
      a.href = s.url || '#';
      a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.title = s.label || s.type || '';
      a.innerHTML = getSocialSVG(s.type);
      infoRight.appendChild(a);
    });
  }
}

/* ---------- SVG icons helpers ---------- */
function getSocialSVG(type){
  const t = (type||'').toLowerCase();
  if (t.includes('instagram')) return svgInstagram();
  if (t.includes('tiktok')) return svgTikTok();
  if (t.includes('facebook')) return svgFacebook();
  if (t.includes('discord')) return svgDiscord();
  if (t.includes('web') || t.includes('site')) return svgLink();
  return svgLink();
}
function svgInstagram(){ return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.5"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>`; }
function svgTikTok(){ return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 8v8a3 3 0 1 0 3-3V6h3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
function svgFacebook(){ return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 8h2.5V4.5H15c-2.2 0-4 1.8-4 4v1H9v3h2v7h3v-7h2.1l.9-3H14V8z" fill="currentColor"/></svg>`; }
function svgDiscord(){ return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 10s1.5-2 4-2 4 2 4 2v4s-1.5 2-4 2-4-2-4-2V10z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
function svgLink(){ return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.59 13.41a5 5 0 0 1 7.07 0l1.41 1.41a5 5 0 0 1 0 7.07 5 5 0 0 1-7.07 0l-1.41-1.41" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
function svgLocation(){ return `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c4.97 0 9 4.03 9 9 0 6-9 11-9 11S3 17 3 11c0-4.97 4.03-9 9-9z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="11" r="2.5" fill="currentColor"/></svg>`; }

/* ---------- Render posts ---------- */
function renderPosts(posts){
  postsEl.innerHTML = '';
  posts.forEach(p=>{
    const article = document.createElement('article');
    article.className = 'post';
    const date = document.createElement('div'); date.className='fecha'; date.textContent = tiempoRelativo(p.fecha || new Date().toISOString());
    const text = document.createElement('div'); text.className='texto'; text.innerHTML = escapeHtml(p.texto || '');
    article.appendChild(date);
    article.appendChild(text);
    if (p.imagen) { const img = document.createElement('img'); img.src = p.imagen; img.alt=''; article.appendChild(img); }
    if (p.video) {
      const video = document.createElement('video'); video.controls = true; video.playsInline = true;
      const src = document.createElement('source'); src.src = p.video; src.type = 'video/mp4';
      video.appendChild(src);
      article.appendChild(video);
    }
    postsEl.appendChild(article);
  });
}

/* ---------- Fecha relativa ---------- */
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

/* ---------- Recalcular alturas y crear scroller interno ---------- */
function recalcularAlturas(){
  requestAnimationFrame(()=>{
    const heroRect = hero.getBoundingClientRect();
    const heroH = Math.max(260, Math.round(heroRect.height));
    const navbarRect = document.getElementById('navbar').getBoundingClientRect();
    const navbarH = Math.max(56, Math.round(navbarRect.height));
    root.style.setProperty('--hero-h', `${heroH}px`);
    root.style.setProperty('--navbar-h', `${navbarH}px`);

    // Si no existe .muro-scroll lo creamos (estructura: #muro > .muro-scroll > ptr + muro-top + posts)
    if (!muro.querySelector('.muro-scroll')){
      const scroll = document.createElement('div');
      scroll.className = 'muro-scroll';
      // move existing ptr, muro-top and posts into it
      const ptrNode = document.getElementById('ptr');
      const muroTop = muro.querySelector('.muro-top');
      const posts = document.getElementById('posts');
      scroll.appendChild(ptrNode);
      scroll.appendChild(muroTop);
      scroll.appendChild(posts);
      muro.appendChild(scroll);
    }

    scroller = muro.querySelector('.muro-scroll');
    // ensure padding-top equals hero height so posts start below hero
    scroller.style.paddingTop = `${heroH}px`;
    // ensure muro top offset equals navbar height
    muro.style.top = `0px`; // muro is fixed to viewport; the scroller handles top offset
  });
}

/* ---------- Scroll effects (attach to scroller) ---------- */
function initScrollEffects(){
  if (!scroller) scroller = muro.querySelector('.muro-scroll');
  const PARALLAX_RATIO = 0.35;
  const thresholdPadding = 8;

  let lastStuck = false;

  scroller.addEventListener('scroll', () => {
    const y = scroller.scrollTop;
    const heroH = parseInt(getComputedStyle(root).getPropertyValue('--hero-h')) || 360;
    const navbarHeight = parseInt(getComputedStyle(root).getPropertyValue('--navbar-h')) || 56;
    const threshold = Math.max(0, heroH - navbarHeight - thresholdPadding);

    // parallax of cover image
    coverImg.style.transform = `translateY(${ - (y * PARALLAX_RATIO) }px)`;

    // opacity & blur
    const p = Math.min(1, y / Math.max(120, heroH * 0.55));
    root.style.setProperty('--hero-opacity', `${1 - p}`);
    root.style.setProperty('--hero-blur', `${Math.min(10, p * 10)}px`);

    // navbar visual change
    const navbar = document.getElementById('navbar');
    if (y > 12) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled');

    // stuck logic: when reaching threshold we hide hero visually (no layout change)
    const stuck = y >= threshold;
    if (stuck && !lastStuck){
      hero.style.opacity = '0';
      hero.style.pointerEvents = 'none';
      lastStuck = true;
    } else if (!stuck && lastStuck){
      hero.style.opacity = '';
      hero.style.pointerEvents = '';
      lastStuck = false;
    }

    // muro-top styling (backdrop blur progressive)
    const muroTop = scroller.querySelector('.muro-top');
    if (muroTop) muroTop.style.backdropFilter = `blur(${Math.min(8, p*8)}px)`;
  }, { passive:true });

  window.addEventListener('resize', recalcularAlturas);
}

/* ---------- Pull to refresh (attached to scroller) ---------- */
function initPullToRefresh(){
  if (!scroller) scroller = muro.querySelector('.muro-scroll');
  const MAX = 110, THRESH = 70;
  let startY=0, pulling=false, pulled=0;

  scroller.addEventListener('touchstart', (e)=> {
    if (scroller.scrollTop <= 0){ pulling = true; startY = e.touches[0].clientY; pulled = 0; }
  }, { passive:true });

  scroller.addEventListener('touchmove', (e)=> {
    if (!pulling) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0){
      e.preventDefault(); // prevent native overscroll
      pulled = Math.min(dy, MAX);
      ptr.style.height = `${pulled}px`;
      // slight visual move of muro-top
      const muroTop = scroller.querySelector('.muro-top');
      if (muroTop) muroTop.style.transform = `translateY(${pulled * 0.12}px)`;
      if (pulled >= THRESH){ ptr.classList.add('ready'); ptrText.textContent = 'Suelta para actualizar'; }
      else { ptr.classList.remove('ready'); ptrText.textContent = 'Desliza para actualizar'; }
    }
  }, { passive:false });

  scroller.addEventListener('touchend', async ()=> {
    if (!pulling) return;
    pulling = false;
    if (pulled >= THRESH){
      ptr.classList.remove('ready'); ptr.classList.add('loading');
      ptrText.textContent = 'Actualizando…';
      ptrSpinner.style.display = 'block';
      try { await cargarDatos(); } catch(e){ console.warn(e); }
      setTimeout(()=> {
        ptr.classList.remove('loading');
        ptr.style.height = '0px';
        const muroTop = scroller.querySelector('.muro-top');
        if (muroTop) muroTop.style.transform = 'translateY(0)';
        ptrText.textContent = 'Desliza para actualizar';
        ptrSpinner.style.display = 'none';
      }, 350);
    } else {
      ptr.classList.remove('ready');
      ptr.style.height = '0px';
      const muroTop = scroller.querySelector('.muro-top');
      if (muroTop) muroTop.style.transform = 'translateY(0)';
    }
    pulled = 0;
  });
}

/* ---------- Service Worker ---------- */
function initSW(){
  if ('serviceWorker' in navigator){
    navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW err', e));
  }
}

/* ---------- Helpers ---------- */
function escapeHtml(str=''){ return String(str).replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); }
function capitalize(s=''){ if (!s) return ''; return s.charAt(0).toUpperCase()+s.slice(1); }

/* ---------- Boot ---------- */
document.addEventListener('DOMContentLoaded', async ()=>{
  await cargarDatos();
  recalcularAlturas();
  // scroller is created inside recalcularAlturas -> wait a tick
  setTimeout(()=>{
    if (!muro.querySelector('.muro-scroll')) recalcularAlturas();
    initScrollEffects();
    initPullToRefresh();
    initSW();
  }, 80);
});