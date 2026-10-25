-- Guestbook for larry.jay
-- Run this once in Supabase > SQL Editor.
--
-- How it works:
--   * Visitors submit notes through /api/notes, which checks the anti-spam token and inserts
--     the note with approved = false using the server-only service role key.
--   * The public (anon) key can only READ notes you've approved. It cannot insert, edit or delete.
--   * To approve a note: Supabase > Table Editor > notes > tick "approved".

create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  message     text not null check (char_length(message) between 1 and 180),
  signature   text not null default '' check (char_length(signature) <= 40),
  color       text not null default 'paper' check (color in ('gold', 'paper', 'ink', 'mint')),
  sticker     text not null default 'hand-waving'
              check (sticker in ('hand-waving', 'rocket-launch', 'lightning', 'soccer-ball', 'coffee', 'heart', 'star')),
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists notes_approved_created_idx on public.notes (approved, created_at desc);

alter table public.notes enable row level security;

drop policy if exists "Anyone can read approved notes" on public.notes;
create policy "Anyone can read approved notes"
  on public.notes for select
  to anon, authenticated
  using (approved = true);

-- No insert/update/delete policies on purpose: only the server (service role) writes.
