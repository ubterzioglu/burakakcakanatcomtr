create extension if not exists pgcrypto;

create table if not exists site_settings (
  key text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists homepage_sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  order_index integer not null default 0,
  published boolean not null default true,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists ventures (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  order_index integer not null default 0,
  published boolean not null default true,
  featured boolean not null default false,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists timeline_entries (
  id uuid primary key default gen_random_uuid(),
  order_index integer not null default 0,
  published boolean not null default true,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists publications (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  order_index integer not null default 0,
  published boolean not null default true,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  order_index integer not null default 0,
  published boolean not null default true,
  published_at timestamptz,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  order_index integer not null default 0,
  published boolean not null default true,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists lead_submissions (
  id uuid primary key default gen_random_uuid(),
  lead_type text not null check (lead_type in ('partner', 'investor', 'consulting', 'community')),
  name text not null,
  email text not null,
  company text,
  message text not null,
  locale text not null check (locale in ('tr', 'en')),
  status text not null default 'new' check (status in ('new', 'reviewing', 'contacted', 'qualified', 'closed')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table site_settings enable row level security;
alter table homepage_sections enable row level security;
alter table ventures enable row level security;
alter table timeline_entries enable row level security;
alter table publications enable row level security;
alter table insights enable row level security;
alter table media_assets enable row level security;
alter table lead_submissions enable row level security;

drop policy if exists "public can read site settings" on site_settings;
create policy "public can read site settings"
on site_settings for select
using (true);

drop policy if exists "public can read homepage sections" on homepage_sections;
create policy "public can read homepage sections"
on homepage_sections for select
using (published = true);

drop policy if exists "public can read ventures" on ventures;
create policy "public can read ventures"
on ventures for select
using (published = true);

drop policy if exists "public can read timeline entries" on timeline_entries;
create policy "public can read timeline entries"
on timeline_entries for select
using (published = true);

drop policy if exists "public can read publications" on publications;
create policy "public can read publications"
on publications for select
using (published = true);

drop policy if exists "public can read insights" on insights;
create policy "public can read insights"
on insights for select
using (published = true);

drop policy if exists "public can read media assets" on media_assets;
create policy "public can read media assets"
on media_assets for select
using (published = true);

insert into site_settings (key, payload)
values ('primary', '{}'::jsonb)
on conflict (key) do nothing;
