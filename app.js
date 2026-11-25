const stage = document.querySelector('main');
const panorama = document.querySelector('#panorama');
const selector = document.querySelector('#period');
const periods = [...selector.options].map(option => option.value);
const hour = new Date().getHours();
const current = hour < 6 || hour >= 21 ? 'night' : hour < 10 ? 'dawn' : hour < 18 ? 'day' : 'sunset';

function selectPeriod(period) {
  if (!periods.includes(period)) return;
  selector.value = period;
  panorama.src = 'assets/' + period + '.png';
  stage.style.setProperty('--sky-image', 'url("' + panorama.src + '")');
  stage.style.setProperty('--workshop-image', 'url("assets/workshop-' + period + '.png")');
}

function frameScene() {
  const { width, height } = stage.getBoundingClientRect();
  const isMobile = width <= 600;
  const scale = isMobile
    ? Math.max(width / 1672, height / 2500)
    : Math.max(width / 1672, height / 2400);
  const sceneWidth = 1672 * scale;
  const sceneHeight = 2941 * scale;
  const foreground = isMobile ? Math.min(height * .14, 104) : 0;
  stage.style.setProperty('--foreground', foreground + 'px');
  const skyFraction = .62;
  const extraSky = isMobile ? Math.max(0, height * 1.12 - sceneHeight * skyFraction) : 0;
  const skyBlendStart = extraSky + sceneHeight * .682;
  const skyBlendEnd = extraSky + sceneHeight * .74;
  stage.style.setProperty('--sky-blend-start', skyBlendStart + 'px');
  stage.style.setProperty('--sky-blend-end', skyBlendEnd + 'px');
  stage.style.setProperty('--extended-image-height', (skyBlendStart / skyFraction) + 'px');
  stage.style.setProperty('--scene-width', sceneWidth + 'px');
  stage.style.setProperty('--sky-height', extraSky + 'px');
  stage.style.setProperty('--landscape-height', sceneHeight + 'px');
  stage.style.setProperty('--home-bottom', '0px');
  stage.style.setProperty('--travel', Math.max(0, sceneHeight + extraSky + foreground - height) + 'px');
}

const sectionBadges = {"shop": "shop-header-back.png", "workshop": "workshop-header-back.png"};
let lastSection = 'shop';
function syncView(moveFocus) {
  const route = location.hash.slice(1);
  const inside = route === 'shop' || route === 'workshop';
  stage.classList.toggle('is-shop', route === 'shop');
  stage.classList.toggle('is-workshop', route === 'workshop');
  stage.classList.toggle('inside', inside);
  if (inside) {
    lastSection = route;
    const badge = document.querySelector('#sectionTitle');
    badge.src = 'assets/' + sectionBadges[route];
    badge.alt = route.toUpperCase();
    document.querySelector('#shopScreen').setAttribute('aria-label', badge.alt);
  }
  for (const [id, hidden] of [['homeScreen', inside], ['shopScreen', !inside]]) {
    const section = document.getElementById(id);
    section.inert = hidden;
    section.setAttribute('aria-hidden', String(hidden));
  }
  document.title = 'MUSIC CRAFT | ' + (inside ? route.toUpperCase() : 'Inicio');
  if (moveFocus) {
    const target = inside ? '.return-strip' : '.road-sign[href="#' + lastSection + '"]';
    document.querySelector(target).focus({preventScroll:true});
  }
}

selectPeriod(current);
frameScene();
syncView(false);
selector.addEventListener('change', () => selectPeriod(selector.value));
document.addEventListener('musiccraft:scenechange', e => selectPeriod(e.detail?.period));
window.addEventListener('resize', frameScene);
window.addEventListener('hashchange', () => syncView(true));
