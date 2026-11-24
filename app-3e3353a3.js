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
}

function frameScene() {
  const { width, height } = stage.getBoundingClientRect();
  // Keep at least 1200 source pixels in frame, including both ends of the sign.
  const scale = Math.max(width / 1672, Math.min(height / 941, width / 1200));
  const landscapeHeight = 941 * scale;
  const skyHeight = Math.max(2000 * scale, height);
  const bottom = Math.min(0, (height - landscapeHeight) / 2);
  stage.style.setProperty('--scene-width', 1672 * scale + 'px');
  stage.style.setProperty('--sky-height', skyHeight + 'px');
  stage.style.setProperty('--landscape-height', landscapeHeight + 'px');
  stage.style.setProperty('--home-bottom', bottom + 'px');
  stage.style.setProperty('--travel', (skyHeight + landscapeHeight - height + bottom) + 'px');
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
