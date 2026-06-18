-- ============================================================
-- GenXPac — Database schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------

create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  shop_name text,
  phone text,
  role text not null default 'client' check (role in ('admin', 'client')),
  approved boolean default false,
  created_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_fr text,
  name_ar text,
  slug text unique not null,
  parent_id uuid references categories(id),
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_fr text,
  name_ar text,
  description_en text,
  description_fr text,
  description_ar text,
  category_id uuid references categories(id),
  brand text,
  tags text[],
  images text[],
  cost_price decimal(10,3),
  selling_price decimal(10,3) not null default 0,
  currency text default 'TND',
  unit text default 'pièce',
  min_order_qty integer default 1,
  stock_status text default 'available' check (stock_status in ('available', 'limited', 'unavailable')),
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists batches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text default 'collecting' check (status in ('collecting', 'confirmed', 'ordered', 'arrived', 'distributed')),
  china_order_date date,
  estimated_arrival date,
  actual_arrival date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists preorders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade not null,
  client_id uuid references profiles(id) on delete cascade not null,
  quantity integer not null check (quantity > 0),
  agreed_price decimal(10,3),
  notes text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'ordered', 'arrived', 'delivered', 'cancelled')),
  batch_id uuid references batches(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  preorder_id uuid references preorders(id) on delete cascade not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

create index if not exists idx_preorders_product on preorders(product_id);
create index if not exists idx_preorders_client on preorders(client_id);
create index if not exists idx_preorders_batch on preorders(batch_id);
create index if not exists idx_messages_preorder on messages(preorder_id);

-- ----------------------------------------------------------------
-- Helper: is the current user an admin? (avoids RLS recursion)
-- ----------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ----------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------
alter table profiles   enable row level security;
alter table categories enable row level security;
alter table products   enable row level security;
alter table preorders  enable row level security;
alter table batches    enable row level security;
alter table messages   enable row level security;

-- Profiles
drop policy if exists "own profile read"  on profiles;
drop policy if exists "own profile update" on profiles;
drop policy if exists "admin read profiles" on profiles;
drop policy if exists "admin update profiles" on profiles;
drop policy if exists "insert own profile" on profiles;
create policy "own profile read"   on profiles for select using (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id);
create policy "admin read profiles" on profiles for select using (public.is_admin());
create policy "admin update profiles" on profiles for update using (public.is_admin());
create policy "insert own profile" on profiles for insert with check (auth.uid() = id);

-- Categories
drop policy if exists "categories read" on categories;
drop policy if exists "categories admin" on categories;
create policy "categories read"  on categories for select using (auth.role() = 'authenticated');
create policy "categories admin" on categories for all using (public.is_admin()) with check (public.is_admin());

-- Products
drop policy if exists "products read approved" on products;
drop policy if exists "products admin" on products;
create policy "products read approved" on products for select using (
  is_published = true and exists (
    select 1 from profiles where id = auth.uid() and approved = true
  )
);
create policy "products admin" on products for all using (public.is_admin()) with check (public.is_admin());

-- Preorders
drop policy if exists "preorders own read" on preorders;
drop policy if exists "preorders own insert" on preorders;
drop policy if exists "preorders own update" on preorders;
drop policy if exists "preorders admin" on preorders;
create policy "preorders own read"   on preorders for select using (auth.uid() = client_id);
create policy "preorders own insert" on preorders for insert with check (
  auth.uid() = client_id and exists (
    select 1 from profiles where id = auth.uid() and approved = true
  )
);
create policy "preorders own update" on preorders for update using (auth.uid() = client_id and status = 'pending');
create policy "preorders admin" on preorders for all using (public.is_admin()) with check (public.is_admin());

-- Batches
drop policy if exists "batches admin" on batches;
create policy "batches admin" on batches for all using (public.is_admin()) with check (public.is_admin());

-- Messages
drop policy if exists "messages read" on messages;
drop policy if exists "messages insert" on messages;
create policy "messages read" on messages for select using (
  auth.uid() = sender_id
  or public.is_admin()
  or exists (select 1 from preorders where id = messages.preorder_id and client_id = auth.uid())
);
create policy "messages insert" on messages for insert with check (auth.uid() = sender_id);

-- ----------------------------------------------------------------
-- Trigger: auto-create profile on signup
-- ----------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------
-- Storage bucket for product images (public read)
-- ----------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public read product images" on storage.objects;
drop policy if exists "admin upload product images" on storage.objects;
create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "admin upload product images" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());

-- ----------------------------------------------------------------
-- Seed categories
-- ----------------------------------------------------------------
insert into categories (name_en, name_fr, name_ar, slug) values
  ('Electronics', 'Électronique', 'إلكترونيات', 'electronics'),
  ('Clothing',    'Vêtements',    'ملابس',      'clothing'),
  ('Accessories', 'Accessoires',  'إكسسوارات',  'accessories'),
  ('Home & Kitchen', 'Maison & Cuisine', 'المنزل والمطبخ', 'home-kitchen'),
  ('Beauty',      'Beauté',       'الجمال',     'beauty'),
  ('Toys',        'Jouets',       'ألعاب',      'toys')
on conflict (slug) do nothing;
