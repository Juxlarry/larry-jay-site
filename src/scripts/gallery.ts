// Screenshot galleries: thumbnails swap the large image with a short crossfade.
import { gsap } from 'gsap';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll<HTMLElement>('[data-shots]').forEach((fig) => {
  const img = fig.querySelector<HTMLImageElement>('.shot-main img')!;
  const cap = fig.querySelector('figcaption')!;
  const buttons = [...fig.querySelectorAll<HTMLButtonElement>('.thumbs button')];
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const swap = () => { img.src = b.dataset.src!; img.alt = b.dataset.alt!; cap.textContent = b.dataset.cap!; };
      if (reduce) return swap();
      gsap.to(img, { opacity: 0, duration: 0.15, onComplete: () => { swap(); gsap.to(img, { opacity: 1, duration: 0.25 }); } });
    }),
  );
});
