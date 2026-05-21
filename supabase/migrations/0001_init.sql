-- Matmatic Phase 1 schema. Leads + saved calculations. RLS scoped to anon.

create extension if not exists "uuid-ossp";

create table public.leads (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create table public.mat_calculations (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  art_w numeric not null,
  art_h numeric not null,
  border_kind text not null check (border_kind in ('symmetric', 'asymmetric')),
  border_symmetric numeric,
  border_top numeric,
  border_right numeric,
  border_bottom numeric,
  border_left numeric,
  overlap numeric not null,
  reveal numeric,
  outer_w numeric not null,
  outer_h numeric not null,
  created_at timestamptz not null default now()
);

create index mat_calculations_session_idx on public.mat_calculations (session_id);

alter table public.leads enable row level security;
alter table public.mat_calculations enable row level security;

-- Anon clients can insert leads (email signup) but cannot read.
create policy "leads insert anon" on public.leads for insert to anon with check (true);

-- Anon clients can insert calculations.
create policy "calc insert anon" on public.mat_calculations for insert to anon with check (true);
