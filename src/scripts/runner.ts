// Plays a project's workflow step list. Used on the home page and on case-study pages.
import { gsap } from 'gsap';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const timelines = new WeakMap<HTMLElement, gsap.core.Timeline>();

export function runSteps(card: HTMLElement) {
  const steps = [...card.querySelectorAll<HTMLElement>('.step')];
  const conns = [...card.querySelectorAll<HTMLElement>('.conn i')];
  const status = card.querySelector<HTMLElement>('.foot .st')!;
  timelines.get(card)?.kill();
  steps.forEach((s) => s.classList.remove('done', 'on'));
  if (reduce) { steps.forEach((s) => s.classList.add('done')); status.textContent = 'Succeeded'; return; }
  status.textContent = 'Running';
  gsap.set(conns, { '--p': 0 });
  const tl = gsap.timeline();
  steps.forEach((s, k) => {
    tl.add(() => s.classList.add('on'))
      .fromTo(s, { x: -6 }, { x: 0, duration: 0.25, ease: 'back.out(3)' })
      .add(() => { s.classList.remove('on'); s.classList.add('done'); }, '+=.12');
    if (conns[k]) tl.to(conns[k], { '--p': 1, duration: 0.28, ease: 'power1.inOut' });
  });
  tl.add(() => { status.textContent = 'Succeeded'; });
  timelines.set(card, tl);
}

/** Replay on click or Enter/Space. */
export function bindRunner(card: HTMLElement) {
  card.addEventListener('click', () => runSteps(card));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); runSteps(card); }
  });
}
