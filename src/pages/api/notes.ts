// POST /api/notes: receives a guestbook note, checks the anti-spam token,
// and stores it as unapproved. Runs as a Vercel serverless function.
import type { APIRoute } from 'astro';
import { MAX_MESSAGE, MAX_SIGNATURE, isColour, isSticker } from '../../lib/guestbook';

export const prerender = false;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const serviceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  const turnstileSecret = import.meta.env.TURNSTILE_SECRET_KEY;
  if (!url || !serviceKey) return json(503, { error: "The wall isn't connected yet." });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return json(400, { error: 'Send the note as JSON.' }); }

  const message = String(body.message ?? '').trim();
  const signature = String(body.signature ?? '').trim();
  if (!message) return json(400, { error: 'Write a note first.' });
  if (message.length > MAX_MESSAGE) return json(400, { error: `Keep your note under ${MAX_MESSAGE} characters.` });
  if (signature.length > MAX_SIGNATURE) return json(400, { error: `Keep your signature under ${MAX_SIGNATURE} characters.` });
  const color = isColour(body.color) ? body.color : 'paper';
  const sticker = isSticker(body.sticker) ? body.sticker : 'hand-waving';

  // Anti-spam check. Required in production; skipped locally if no secret is set.
  if (turnstileSecret) {
    const form = new FormData();
    form.append('secret', turnstileSecret);
    form.append('response', String(body.token ?? ''));
    try { form.append('remoteip', clientAddress); } catch {}
    const verify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const result = (await verify.json()) as { success?: boolean };
    if (!result.success) return json(400, { error: "We couldn't confirm you're human. Refresh the page and try again." });
  } else if (import.meta.env.PROD) {
    return json(503, { error: "The wall isn't accepting notes yet." });
  }

  const res = await fetch(`${url}/rest/v1/notes`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'content-type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ message, signature, color, sticker, approved: false }),
  });
  if (!res.ok) return json(502, { error: "Your note didn't save. Try again in a moment." });
  return json(201, { ok: true });
};
