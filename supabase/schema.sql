-- ============================================================
-- Storify — Schema Supabase
-- Execute este SQL no editor SQL do seu projeto Supabase
-- ============================================================

-- Extensões necessárias
create extension if not exists "uuid-ossp";

-- ─── PERFIS ──────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  username    text not null unique,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ─── STORIES ─────────────────────────────────────────────────
create table if not exists public.stories (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  frames      jsonb not null default '[]'::jsonb,
  duration    integer not null default 5000,
  views       integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ─── RLS (Row Level Security) ────────────────────────────────
alter table public.profiles enable row level security;
alter table public.stories  enable row level security;

-- Qualquer um pode ler perfis e stories (app público)
create policy "profiles_select" on public.profiles for select using (true);
create policy "stories_select"  on public.stories  for select using (true);

-- Só o próprio usuário pode inserir/editar seus dados
create policy "profiles_insert" on public.profiles for insert with check (true);
create policy "profiles_update" on public.profiles for update using (true);

create policy "stories_insert" on public.stories for insert with check (true);
create policy "stories_update" on public.stories for update using (true);
create policy "stories_delete" on public.stories for delete using (true);

-- ─── ÍNDICES ─────────────────────────────────────────────────
create index if not exists stories_user_id_idx on public.stories(user_id);
create index if not exists stories_created_at_idx on public.stories(created_at desc);

-- ─── DADOS DE DEMONSTRAÇÃO ───────────────────────────────────
insert into public.profiles (id, name, username, avatar_url) values
  ('11111111-1111-1111-1111-111111111111', 'Ana Lima',    'analima',    'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'),
  ('22222222-2222-2222-2222-222222222222', 'Bruno Souza', 'brunosouza', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bruno'),
  ('33333333-3333-3333-3333-333333333333', 'Carla Mendes','carlam',     'https://api.dicebear.com/7.x/avataaars/svg?seed=Carla'),
  ('44444444-4444-4444-4444-444444444444', 'Elena Ramos', 'elenar',     'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena')
on conflict (id) do nothing;

insert into public.stories (user_id, frames, duration, views) values
  (
    '11111111-1111-1111-1111-111111111111',
    '[{"id":"f1","backgroundColor":"linear-gradient(135deg, #667eea 0%, #764ba2 100%)","textElements":[{"id":"t1","content":"Bom dia! ☀️","x":50,"y":40,"fontSize":36,"fontFamily":"Inter","color":"#ffffff","rotation":0,"bold":true,"italic":false}],"stickers":[],"createdAt":"2025-01-01T00:00:00Z"}]',
    5000,
    234
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '[{"id":"f3","backgroundColor":"linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)","textElements":[{"id":"t3","content":"50% OFF hoje! 🔥","x":50,"y":35,"fontSize":42,"fontFamily":"Paytone One","color":"#ffffff","rotation":0,"bold":true,"italic":false}],"stickers":[],"createdAt":"2025-01-01T00:00:00Z"}]',
    7000,
    1890
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '[{"id":"f4","backgroundColor":"linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)","textElements":[{"id":"t4","content":"\"Acredite no processo\"","x":50,"y":40,"fontSize":24,"fontFamily":"Poiret One","color":"#ffffff","rotation":0,"bold":false,"italic":true}],"stickers":[],"createdAt":"2025-01-01T00:00:00Z"}]',
    5000,
    567
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '[{"id":"f5","backgroundColor":"linear-gradient(135deg, #fa709a 0%, #fee140 100%)","textElements":[{"id":"t5","content":"Novo produto! ✨","x":50,"y":40,"fontSize":32,"fontFamily":"Paytone One","color":"#ffffff","rotation":0,"bold":true,"italic":false}],"stickers":[],"createdAt":"2025-01-01T00:00:00Z"}]',
    5000,
    3421
  )
on conflict do nothing;
