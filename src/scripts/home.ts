// Home page behaviour: hero flow, counters, stacked case studies, workflows, timeline rail,
// the automation tile's mini flow, project tabs and the copy-email button.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { runSteps, bindRunner } from './runner';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
const $ = <T extends Element = HTMLElement>(s: string) => document.querySelector<T>(s)!;
const $$ = <T extends Element = HTMLElement>(s: string) => [...document.querySelectorAll<T>(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- interactions that work with or without motion ---------- */

// Project tabs
$$<HTMLButtonElement>('.tabs button').forEach((b, _, all) =>
  b.addEventListener('click', () => {
    all.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $$('.plist .prow').forEach((r) => { r.hidden = r.dataset.g !== b.dataset.g; });
  }),
);

// Copy email
const copy = $<HTMLButtonElement>('#copy');
copy?.addEventListener('click', async () => {
  const label = copy.querySelector('span:last-child')!;
  try {
    await navigator.clipboard.writeText(copy.dataset.email!);
    label.textContent = 'Copied';
  } catch {
    const r = document.createRange(); r.selectNodeContents($('#email'));
    const sel = getSelection()!; sel.removeAllRanges(); sel.addRange(r);
    label.textContent = 'Selected, press Ctrl+C';
  }
  setTimeout(() => (label.textContent = 'Copy email'), 1800);
});

// Workflows replay on click
$$('.runner').forEach(bindRunner);

/* ---------- motion ---------- */
if (reduce) {
  $('#status').classList.remove('running');
  $('#statusText').textContent = 'Run succeeded';
  $$('.node').forEach((n) => n.classList.add('done'));
} else {
  // Each workflow plays once as its case comes into view
  $$('.runner').forEach((r) =>
    ScrollTrigger.create({ trigger: r.closest('.case')!, start: 'top 60%', once: true, onEnter: () => runSteps(r) }),
  );

  // Sticky stack: the previous case recedes as the next one arrives (desktop only)
  ScrollTrigger.matchMedia({
    '(min-width: 901px)': () => {
      const cards = $$('.case');
      cards.forEach((c, i) => {
        if (i === cards.length - 1) return;
        gsap.to(c, { scale: 0.94, opacity: 0.55, ease: 'none', scrollTrigger: { trigger: cards[i + 1], start: 'top bottom', end: 'top 88px', scrub: true } });
      });
    },
  });

  // Timeline rail draws as you scroll
  gsap.fromTo('#railFill', { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: '#tl', start: 'top 70%', end: 'bottom 70%', scrub: true } });

  // Counters
  $$('.kpi b[data-to]').forEach((b) => {
    const o = { v: 0 }, to = Number(b.dataset.to), suf = b.dataset.suffix || '';
    gsap.to(o, { v: to, duration: 1.4, ease: 'power2.out', delay: 0.9, onUpdate: () => { b.textContent = Math.round(o.v) + suf; } });
  });

  // Mini flow in the automation tile, only while visible
  const ms = $$('#mini .ms'), mc = $$('#mini .mc');
  if (ms.length) {
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4, paused: true });
    tl.add(() => { ms.forEach((x) => x.classList.remove('on')); mc.forEach((x) => x.classList.remove('on')); });
    ms.forEach((m, k) => { tl.add(() => m.classList.add('on'), '+=.45'); if (mc[k]) tl.add(() => mc[k].classList.add('on'), '+=.3'); });
    ScrollTrigger.create({ trigger: '#mini', start: 'top 85%', end: 'bottom top', onToggle: (s) => (s.isActive ? tl.play() : tl.pause()) });
  }

  heroFlow();
}

/* ---------- hero: the benefit-claim flow ---------- */
function heroFlow() {
  const nodes = ['#n1', '#n2', '#n3', '#n4', '#n5'].map((s) => $<SVGGElement>(s));
  const wires = ['#w1', '#w2a', '#w2b', '#w3a', '#w3b'].map((s) => $<SVGPathElement>(s));
  const log = $('#log');
  const cities = ['Accra', 'Johannesburg', 'Nairobi', 'Dubai', 'Bangui'];
  let runNo = 4812;

  const setStatus = (running: boolean) => {
    $('#status').classList.toggle('running', running);
    $('#statusText').textContent = running ? 'Flow running' : 'Run succeeded';
  };
  const addLog = (html: string) => {
    const p = document.createElement('p');
    p.innerHTML = `<span class="t">${new Date().toTimeString().slice(0, 8)}</span> ${html}`;
    log.appendChild(p);
    while (log.children.length > 4) log.firstElementChild!.remove();
    gsap.from(p, { opacity: 0, x: -8, duration: 0.35 });
  };
  const glyphs = '01<>/{}#$%&*=+ABCDEFXYZ';
  const scramble = (el: Element) => {
    const f = el.textContent || '', o = { p: 0 };
    return gsap.to(o, {
      p: 1, duration: 1.1, ease: 'power2.out',
      onUpdate() {
        const n = Math.floor(o.p * f.length);
        let s = f.slice(0, n);
        for (let i = n; i < f.length; i++) s += f[i] === ' ' ? ' ' : glyphs[(Math.random() * glyphs.length) | 0];
        el.textContent = s;
      },
      onComplete() { el.textContent = f; },
    });
  };
  wires.forEach((w) => { const L = w.getTotalLength(); w.style.strokeDasharray = String(L); w.dataset.len = String(L); });

  const packet = (id: string, path: string, d: number) => gsap.timeline()
    .set(id, { opacity: 1 })
    .to(id, { duration: d, ease: 'power1.inOut', motionPath: { path, align: path, alignOrigin: [0.5, 0.5] } })
    .to(id, { opacity: 0, duration: 0.15 });
  const act = (n: Element) => gsap.timeline()
    .add(() => n.classList.add('active'))
    .to(n, { scale: 1.04, transformOrigin: '50% 50%', duration: 0.18, yoyo: true, repeat: 1 })
    .add(() => { n.classList.remove('active'); n.classList.add('done'); });

  function runFlow() {
    runNo++;
    nodes.forEach((n) => n.classList.remove('done', 'active'));
    wires.forEach((w) => w.classList.remove('lit'));
    setStatus(true);
    return gsap.timeline()
      .add(() => addLog(`Claim #${runNo} submitted, ${cities[runNo % cities.length]}`))
      .add(act(nodes[0])).add(() => wires[0].classList.add('lit')).add(packet('#pk1', '#w1', 0.5))
      .add(act(nodes[1])).add(() => { addLog('Balance check: within limit'); wires[1].classList.add('lit'); wires[2].classList.add('lit'); })
      .add(packet('#pk2', '#w2a', 0.7), 'b').add(packet('#pk3', '#w2b', 0.7), 'b')
      .add(act(nodes[2]), 'n').add(act(nodes[3]), 'n+=.1')
      .add(() => { addLog('Sent to HR approver, employee notified'); wires[3].classList.add('lit'); wires[4].classList.add('lit'); })
      .add(packet('#pk4', '#w3a', 0.7), 'm').add(packet('#pk5', '#w3b', 0.7), 'm')
      .add(act(nodes[4]))
      .add(() => { addLog(`<span class="ok">Succeeded</span>, added to payroll batch in ${(1.5 + Math.random()).toFixed(1)}s`); setStatus(false); });
  }

  const intro = gsap.timeline();
  intro.from(nodes, { opacity: 0, y: 14, scale: 0.94, transformOrigin: '50% 50%', duration: 0.5, stagger: 0.12, ease: 'back.out(1.6)' }, 0);
  wires.forEach((w, i) => intro.fromTo(w, { strokeDashoffset: Number(w.dataset.len) }, { strokeDashoffset: 0, duration: 0.45 }, 0.35 + i * 0.12));
  $$('.scr').forEach((el, i) => intro.add(scramble(el), 0.1 + i * 0.22));
  intro.add(runFlow(), 1.4);

  let loop: gsap.core.Tween | null = null;
  const startLoop = () => { loop = gsap.delayedCall(5, function cycle() { runFlow().then(() => { loop = gsap.delayedCall(4, cycle); }); }); };
  intro.then(startLoop);
  $('#replay').addEventListener('click', () => { loop?.kill(); runFlow().then(startLoop); });
}
