// Guestbook: reads approved notes from Supabase (public, read-only key) and posts new
// notes to /api/notes, where they wait for approval.
import { gsap } from 'gsap';
import { MAX_MESSAGE, isColour, isSticker } from '../lib/guestbook';

type Note = { id: string; message: string; signature: string; color: string; sticker: string; created_at: string };

const root = document.getElementById('gb')!;
const icons: Record<string, string> = JSON.parse(document.getElementById('gb-icons')!.textContent || '{}');
const wall = document.getElementById('wall')!;
const form = document.getElementById('form') as HTMLFormElement;
const msg = document.getElementById('gb-msg') as HTMLTextAreaElement;
const sig = document.getElementById('gb-sig') as HTMLInputElement;
const err = document.getElementById('err')!;
const status = document.getElementById('status')!;
const save = document.getElementById('save') as HTMLButtonElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const left = document.getElementById('left')!;
const updateLeft = () => { left.textContent = String(MAX_MESSAGE - msg.value.length); };
msg.addEventListener('input', () => { err.textContent = ''; updateLeft(); });

// Stable slight tilt per note
const tilt = (id: string) => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0; return ((Math.abs(h) % 7) - 3) * 0.8; };
const ago = (iso: string) => {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (!isFinite(s) || s < 0) return '';
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  return d < 30 ? `${d}d ago` : new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
};

function noteEl(n: Note) {
  const el = document.createElement('article');
  const colour = isColour(n.color) ? n.color : 'paper';
  const sticker = isSticker(n.sticker) ? n.sticker : 'hand-waving';
  el.className = `note c-${colour}`;
  el.style.setProperty('--r', `${tilt(n.id)}deg`);
  el.innerHTML = `<span class="i pin" aria-hidden="true">${icons['push-pin'] ?? ''}</span><span class="i stk" aria-hidden="true">${icons[sticker] ?? ''}</span><p></p><div class="by"><b></b><span class="when"></span></div>`;
  el.querySelector('p')!.textContent = String(n.message).slice(0, MAX_MESSAGE);
  el.querySelector('b')!.textContent = String(n.signature || '').slice(0, 40) || 'A visitor';
  el.querySelector('.when')!.textContent = n.created_at ? ` · ${ago(n.created_at)}` : '';
  return el;
}

function setCount(n: number) {
  document.getElementById('count')!.innerHTML = `<b>${n}</b> ${n === 1 ? 'note' : 'notes'} pinned so far`;
}

async function loadWall() {
  const url = root.dataset.url, key = root.dataset.key;
  if (!url || !key) { showEmpty("The wall isn't connected yet. Notes will appear here soon."); return; }
  try {
    const res = await fetch(`${url}/rest/v1/notes?select=id,message,signature,color,sticker,created_at&approved=eq.true&order=created_at.desc&limit=300`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    if (!res.ok) throw new Error(String(res.status));
    const notes = (await res.json()) as Note[];
    setCount(notes.length);
    if (!notes.length) { showEmpty('No notes yet. Yours could be the first one pinned here.'); return; }
    const els = notes.map(noteEl);
    els.forEach((el) => wall.appendChild(el));
    if (!reduce) gsap.from(els, { y: -24, opacity: 0, duration: 0.6, stagger: 0.04, ease: 'back.out(1.4)' });
  } catch {
    showEmpty("The wall couldn't load just now. Refresh to try again.");
  }
}
function showEmpty(text: string) {
  const e = document.createElement('div');
  e.className = 'empty';
  e.textContent = text;
  wall.appendChild(e);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const message = msg.value.trim();
  if (!message) { err.textContent = 'Write a note first.'; msg.focus(); return; }
  const token = (form.querySelector('[name="cf-turnstile-response"]') as HTMLInputElement | null)?.value ?? '';
  save.disabled = true;
  status.textContent = 'Pinning';
  err.textContent = '';
  try {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message,
        signature: sig.value.trim(),
        color: (form.querySelector('input[name="colour"]:checked') as HTMLInputElement)?.value,
        sticker: (form.querySelector('input[name="sticker"]:checked') as HTMLInputElement)?.value,
        token,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Your note didn't send. Try again in a moment.");
    status.textContent = "Thanks! Your note will appear once it's approved.";
    msg.value = ''; sig.value = ''; updateLeft();
  } catch (x) {
    status.textContent = '';
    err.textContent = x instanceof Error ? x.message : "Your note didn't send. Try again in a moment.";
  } finally {
    save.disabled = false;
    (window as unknown as { turnstile?: { reset: () => void } }).turnstile?.reset();
  }
});

loadWall();
