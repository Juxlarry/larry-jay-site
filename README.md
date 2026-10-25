# larry.jay

Portfolio site for Lawrence "Larry Jay" Danso, automation and solutions architect.

- **Astro 5**: static pages, no framework runtime in the browser
- **GSAP + Lenis**: animations and smooth scrolling
- **Supabase**: guestbook storage (one table)
- **Cloudflare Turnstile**: stops spam on the guestbook
- **Vercel**: hosting; every push to `main` deploys

## What's where

| Path | What it is |
| --- | --- |
| `src/data/portfolio.json` | **All the content.** Projects, experience, training, certifications, bio. Edit this to update the site. |
| `public/shots/` | Project screenshots (WebP, about 1400px wide) |
| `public/avatar.svg` | The illustrated avatar, also used as the favicon |
| `src/pages/index.astro` | Home page (assembles the sections in `src/components/`) |
| `src/pages/work/[slug].astro` | One case-study page per project with `"featured": true` |
| `src/pages/guestbook.astro` | The guestbook wall |
| `src/pages/api/notes.ts` | Receives guestbook notes (the only server code) |
| `src/scripts/` | Browser behaviour: animation, tabs, galleries, guestbook |
| `src/styles/global.css` | All styles. Colours and fonts are tokens at the top. |
| `supabase/schema.sql` | Guestbook table and access rules |

## Run it locally

Needs Node 20 or newer.

```bash
npm install
cp .env.example .env   # fill in the keys (see below); the site runs without them, the guestbook just shows "not connected"
npm run dev            # http://localhost:4321
```

`npm run build` checks everything compiles before you push.

## One-time setup

### 1. Supabase (guestbook storage)
1. Create a free project at supabase.com.
2. Open **SQL Editor**, paste `supabase/schema.sql`, and run it.
3. From **Project Settings > API**, copy the **Project URL**, the **anon public** key and the **service_role** key.

### 2. Cloudflare Turnstile (spam protection)
1. In the Cloudflare dashboard, open **Turnstile** and add a widget.
2. Add your domains: `localhost` and your Vercel domain (for example `larry-jay.vercel.app`).
3. Copy the **site key** and **secret key**.

Without these keys the guestbook still runs locally, but production refuses notes until they're set.

### 3. Vercel (hosting)
1. Push this folder to a GitHub repo.
2. In Vercel, **Add New > Project**, import the repo. It detects Astro; keep the defaults.
3. Under **Settings > Environment Variables**, add the five keys from `.env.example`.
4. Deploy. Later pushes to `main` deploy automatically, and every branch gets a preview link.
5. If your Vercel address differs from `larry-jay.vercel.app`, update `site` in `astro.config.mjs` (used for link previews and canonical URLs).

## Everyday tasks

**Approve guestbook notes.** Supabase > **Table Editor** > `notes`. New notes arrive with `approved` unticked. Tick it and the note appears on the wall on the next page load. Delete a row to remove a note.

**Edit content.** Change `src/data/portfolio.json`, then push. Things to know:
- `featured: true` gives a project a case-study page and a place in the stacked "Selected work" section.
- `group` decides its tab under Projects: `enterprise`, `client` or `personal`.
- `private: true` shows a "Private" badge. Leave `links` empty for client work.
- `flow` is the step list the workflow animation plays.
- Values starting with `[` (like `[confirm]`) are treated as unfilled and hidden.

**Add screenshots to a project.** Save WebP files in `public/shots/`, then add a `gallery` to the project:

```json
"gallery": [
  { "src": "/shots/cutcraft-preview.webp", "alt": "What the screenshot shows", "caption": "Short caption" }
]
```

A project with a gallery shows screenshots instead of the workflow animation.

**Add a custom domain later.** Vercel > Project > **Settings > Domains**. Then update `site` in `astro.config.mjs` and add the domain to your Turnstile widget.

## Still to add
- Hirivo results screen (score and gap analysis, with an invented CV)
- CutCraft screenshots or live link
