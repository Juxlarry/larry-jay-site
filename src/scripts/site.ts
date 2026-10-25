// Runs on every page: theme toggle, smooth scrolling, sticky-bar state and active nav links.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string) => [...document.querySelectorAll<T>(s)];
export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* theme toggle (the saved choice is applied in <head> before paint) */
const root = document.documentElement;
$('#theme')?.addEventListener('click', () => {
  const dark = root.dataset.theme
    ? root.dataset.theme === 'dark'
    : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  try { localStorage.setItem('lj-theme', root.dataset.theme); } catch {}
});

/* smooth scrolling, kept in sync with ScrollTrigger */
let lenis: Lenis | null = null;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis!.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
$$<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href')!;
    const target = id === '#top' ? document.body : document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target as HTMLElement, { offset: id === '#top' ? 0 : -72 });
    else target.scrollIntoView();
    history.replaceState(null, '', id === '#top' ? location.pathname : id);
  }),
);
// Arriving from another page with a hash: land below the sticky bar.
if (location.hash) {
  const t = document.querySelector(location.hash);
  if (t) setTimeout(() => (lenis ? lenis.scrollTo(t as HTMLElement, { offset: -72, immediate: true }) : t.scrollIntoView()), 50);
}

/* sticky bar gets a border once the page scrolls */
const top = $('.top');
ScrollTrigger.create({ start: 8, end: 'max', onToggle: (s) => top?.classList.toggle('scrolled', s.isActive) });

/* highlight the section currently in view (top links and dock) */
function track(selector: string, attr: 'aria-current') {
  const items = $$<HTMLAnchorElement>(selector);
  items.forEach((a) => {
    const sec = a.dataset.sec === 'top' ? $('#top') : document.getElementById(a.dataset.sec || '');
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec, start: 'top 45%', end: 'bottom 45%',
      onToggle: (s) => {
        if (s.isActive) { items.forEach((x) => x.removeAttribute(attr)); a.setAttribute(attr, 'true'); }
        else if (selector === '.links a') a.removeAttribute(attr);
      },
    });
  });
}
if ($('#top')) { track('.links a', 'aria-current'); track('.dock a.ic', 'aria-current'); }
