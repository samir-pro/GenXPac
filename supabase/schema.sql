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
  sku text,
  tags text[],
  images text[],
  cost_price decimal(10,3),
  selling_price decimal(10,3) not null default 0,
  currency text default 'TND',
  unit text default 'pièce',
  min_order_qty integer default 1,
  weight_kg decimal(8,3),
  lead_time_days integer,
  supplier_name text,
  supplier_url text,
  stock_status text default 'available' check (stock_status in ('available', 'limited', 'unavailable')),
  is_published boolean default false,
  created_by uuid references profiles(id) on delete set null,
  updated_by uuid references profiles(id) on delete set null,
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
-- Seed categories (hierarchical — Electronics + Fashion + Home)
-- ----------------------------------------------------------------

-- Level 1: parent categories
INSERT INTO categories (name_en, name_fr, name_ar, slug) VALUES
  ('Electronics & Tech',   'Électronique & Tech',  'إلكترونيات وتقنية', 'electronics'),
  ('Fashion & Footwear',   'Mode & Chaussures',    'الموضة والأحذية',   'fashion'),
  ('Home & Living',        'Maison & Vie',         'المنزل والمعيشة',   'home-living')
ON CONFLICT (slug) DO UPDATE SET name_en=EXCLUDED.name_en, name_fr=EXCLUDED.name_fr, name_ar=EXCLUDED.name_ar;

-- Level 2: Electronics subcategories
INSERT INTO categories (name_en, name_fr, name_ar, slug, parent_id) VALUES
  ('Phone Accessories',          'Accessoires Téléphone',       'إكسسوارات الهاتف',             'phone-accessories', (SELECT id FROM categories WHERE slug='electronics')),
  ('Chargers & Cables',          'Chargeurs & Câbles',          'شواحن وكابلات',                 'chargers-cables',   (SELECT id FROM categories WHERE slug='electronics')),
  ('Audio & Earphones',          'Audio & Écouteurs',           'صوت وسماعات',                   'audio',             (SELECT id FROM categories WHERE slug='electronics')),
  ('Power Banks',                'Batteries Externes',          'بطاريات خارجية',                'power-banks',       (SELECT id FROM categories WHERE slug='electronics')),
  ('PC & Office Accessories',    'Accessoires PC & Bureau',     'إكسسوارات الكمبيوتر والمكتب',  'pc-accessories',    (SELECT id FROM categories WHERE slug='electronics')),
  ('Car Electronics',            'Électronique Auto',           'إلكترونيات السيارة',            'car-electronics',   (SELECT id FROM categories WHERE slug='electronics')),
  ('Smart Gadgets',              'Gadgets & Maison Connectée',  'أجهزة ذكية ومنزل متصل',        'smart-gadgets',     (SELECT id FROM categories WHERE slug='electronics')),
  ('Outdoor & Sport Tech',       'Tech Outdoor & Sport',        'تقنية للخارج والرياضة',         'outdoor-tech',      (SELECT id FROM categories WHERE slug='electronics')),
  ('Cables & Adapters',          'Câbles & Adaptateurs',        'كابلات ومحولات',                'cables-adapters',   (SELECT id FROM categories WHERE slug='electronics'))
ON CONFLICT (slug) DO UPDATE SET name_en=EXCLUDED.name_en, name_fr=EXCLUDED.name_fr, name_ar=EXCLUDED.name_ar, parent_id=EXCLUDED.parent_id;

-- Level 3: Phone accessories sub-subcategories
INSERT INTO categories (name_en, name_fr, name_ar, slug, parent_id) VALUES
  ('Phone Cases & Covers',   'Coques & Housses',              'أغطية وحافظات الهاتف',  'phone-cases',     (SELECT id FROM categories WHERE slug='phone-accessories')),
  ('Screen Protectors',      'Protections Écran',             'واقيات الشاشة',          'screen-protectors',(SELECT id FROM categories WHERE slug='phone-accessories')),
  ('Phone Holders & Stands', 'Supports & Fixations Téléphone','حوامل وأحامل الهاتف',   'phone-holders',   (SELECT id FROM categories WHERE slug='phone-accessories')),
  ('Selfie Sticks & Tripods','Perches Selfie & Trépieds',     'عصي السيلفي وحوامل',     'selfie-sticks',   (SELECT id FROM categories WHERE slug='phone-accessories'))
ON CONFLICT (slug) DO UPDATE SET name_en=EXCLUDED.name_en, name_fr=EXCLUDED.name_fr, name_ar=EXCLUDED.name_ar, parent_id=EXCLUDED.parent_id;

-- Level 3: PC accessories sub-subcategories
INSERT INTO categories (name_en, name_fr, name_ar, slug, parent_id) VALUES
  ('Mice',                   'Souris',                        'فأرة الكمبيوتر',         'mice',            (SELECT id FROM categories WHERE slug='pc-accessories')),
  ('Keyboards',              'Claviers',                      'لوحات المفاتيح',          'keyboards',       (SELECT id FROM categories WHERE slug='pc-accessories')),
  ('Mouse Pads & Desk Mats', 'Tapis de Souris & Bureaux',     'أحزمة الفأرة والمكتب',   'mouse-pads',      (SELECT id FROM categories WHERE slug='pc-accessories')),
  ('USB Hubs & Docks',       'Hubs USB & Stations d''accueil','موزعات USB ومحطات',      'usb-hubs',        (SELECT id FROM categories WHERE slug='pc-accessories')),
  ('Webcams',                'Webcams & Caméras PC',          'كاميرات الويب',           'webcams',         (SELECT id FROM categories WHERE slug='pc-accessories')),
  ('PC Cooling & Fans',      'Refroidisseurs & Ventilateurs', 'مراوح وتبريد الكمبيوتر', 'pc-cooling',      (SELECT id FROM categories WHERE slug='pc-accessories'))
ON CONFLICT (slug) DO UPDATE SET name_en=EXCLUDED.name_en, name_fr=EXCLUDED.name_fr, name_ar=EXCLUDED.name_ar, parent_id=EXCLUDED.parent_id;

-- Level 2: Fashion subcategories
INSERT INTO categories (name_en, name_fr, name_ar, slug, parent_id) VALUES
  ('Men''s Shoes',        'Chaussures Homme',       'أحذية رجالية',                    'mens-shoes',       (SELECT id FROM categories WHERE slug='fashion')),
  ('Women''s Shoes',      'Chaussures Femme',       'أحذية نسائية',                    'womens-shoes',     (SELECT id FROM categories WHERE slug='fashion')),
  ('Kids'' Shoes',        'Chaussures Enfant',      'أحذية أطفال',                     'kids-shoes',       (SELECT id FROM categories WHERE slug='fashion')),
  ('Sports Shoes & Cleats','Chaussures Sport & Crampons','أحذية رياضية وملاعب',        'sports-shoes',     (SELECT id FROM categories WHERE slug='fashion')),
  ('Boots & Ankle Boots', 'Bottes & Bottines',      'بوط وجلاجل',                      'boots',            (SELECT id FROM categories WHERE slug='fashion')),
  ('Women''s Fashion',    'Mode Femme',             'أزياء نسائية',                    'womens-fashion',   (SELECT id FROM categories WHERE slug='fashion')),
  ('Men''s Fashion',      'Mode Homme',             'أزياء رجالية',                    'mens-fashion',     (SELECT id FROM categories WHERE slug='fashion')),
  ('Bags & Accessories',  'Sacs & Accessoires',     'حقائب وإكسسوارات',                'bags-accessories', (SELECT id FROM categories WHERE slug='fashion')),
  ('Beauty & Cosmetics',  'Beauté & Cosmétiques',   'الجمال ومستحضرات التجميل',        'beauty-cosmetics', (SELECT id FROM categories WHERE slug='fashion'))
ON CONFLICT (slug) DO UPDATE SET name_en=EXCLUDED.name_en, name_fr=EXCLUDED.name_fr, name_ar=EXCLUDED.name_ar, parent_id=EXCLUDED.parent_id;

-- Level 3: Sports shoes
INSERT INTO categories (name_en, name_fr, name_ar, slug, parent_id) VALUES
  ('Football Cleats',   'Chaussures de Football', 'أحذية كرة القدم',        'football-cleats', (SELECT id FROM categories WHERE slug='sports-shoes')),
  ('Running Shoes',     'Chaussures de Course',   'أحذية الجري',            'running-shoes',   (SELECT id FROM categories WHERE slug='sports-shoes')),
  ('Gym & Training',    'Fitness & Salle',        'أحذية الجيم واللياقة',   'training-shoes',  (SELECT id FROM categories WHERE slug='sports-shoes'))
ON CONFLICT (slug) DO UPDATE SET name_en=EXCLUDED.name_en, name_fr=EXCLUDED.name_fr, name_ar=EXCLUDED.name_ar, parent_id=EXCLUDED.parent_id;

-- Level 3: Women's fashion
INSERT INTO categories (name_en, name_fr, name_ar, slug, parent_id) VALUES
  ('Tops & Blouses',      'Tops & Blouses',         'توب وبلوزات',       'womens-tops',     (SELECT id FROM categories WHERE slug='womens-fashion')),
  ('Dresses & Skirts',    'Robes & Jupes',           'فساتين وتنانير',    'womens-dresses',  (SELECT id FROM categories WHERE slug='womens-fashion')),
  ('Abayas & Modest Wear','Abayas & Vêtements Couvrants','عباءات وملابس محتشمة','womens-abayas',(SELECT id FROM categories WHERE slug='womens-fashion')),
  ('Jackets & Coats',     'Vestes & Manteaux',       'جاكيتات ومعاطف',   'womens-jackets',  (SELECT id FROM categories WHERE slug='womens-fashion')),
  ('Lingerie & Underwear','Lingerie & Sous-vêtements','لانجري وملابس داخلية','womens-lingerie',(SELECT id FROM categories WHERE slug='womens-fashion'))
ON CONFLICT (slug) DO UPDATE SET name_en=EXCLUDED.name_en, name_fr=EXCLUDED.name_fr, name_ar=EXCLUDED.name_ar, parent_id=EXCLUDED.parent_id;

-- Level 3: Men's fashion
INSERT INTO categories (name_en, name_fr, name_ar, slug, parent_id) VALUES
  ('T-Shirts & Polos',   'T-Shirts & Polos',          'تيشيرتات وبولو',    'mens-tshirts',   (SELECT id FROM categories WHERE slug='mens-fashion')),
  ('Trousers & Jeans',   'Pantalons & Jeans',          'بنطلونات وجينز',    'mens-trousers',  (SELECT id FROM categories WHERE slug='mens-fashion')),
  ('Jackets & Hoodies',  'Vestes & Sweats',            'جاكيتات وهوديات',   'mens-jackets',   (SELECT id FROM categories WHERE slug='mens-fashion')),
  ('Underwear & Socks',  'Sous-vêtements & Chaussettes','ملابس داخلية وجوارب','mens-underwear',(SELECT id FROM categories WHERE slug='mens-fashion')),
  ('Kids'' Clothing',    'Vêtements Enfant',           'ملابس أطفال',       'kids-clothing',  (SELECT id FROM categories WHERE slug='mens-fashion'))
ON CONFLICT (slug) DO UPDATE SET name_en=EXCLUDED.name_en, name_fr=EXCLUDED.name_fr, name_ar=EXCLUDED.name_ar, parent_id=EXCLUDED.parent_id;

-- Level 3: Bags & accessories
INSERT INTO categories (name_en, name_fr, name_ar, slug, parent_id) VALUES
  ('Handbags & Tote Bags',  'Sacs à Main & Cabas',       'حقائب يد وتوت',    'handbags',      (SELECT id FROM categories WHERE slug='bags-accessories')),
  ('Backpacks',             'Sacs à Dos',                'حقائب ظهر',        'backpacks',     (SELECT id FROM categories WHERE slug='bags-accessories')),
  ('Belts & Wallets',       'Ceintures & Portefeuilles', 'أحزمة ومحافظ',     'belts-wallets', (SELECT id FROM categories WHERE slug='bags-accessories')),
  ('Sunglasses',            'Lunettes de Soleil',        'نظارات شمسية',     'sunglasses',    (SELECT id FROM categories WHERE slug='bags-accessories')),
  ('Hats, Caps & Scarves',  'Chapeaux, Casquettes & Écharpes','قبعات وأوشحة','hats-caps',    (SELECT id FROM categories WHERE slug='bags-accessories')),
  ('Jewellery & Hair Accessories','Bijoux & Cheveux',    'مجوهرات وإكسسوارات الشعر','jewellery-hair',(SELECT id FROM categories WHERE slug='bags-accessories'))
ON CONFLICT (slug) DO UPDATE SET name_en=EXCLUDED.name_en, name_fr=EXCLUDED.name_fr, name_ar=EXCLUDED.name_ar, parent_id=EXCLUDED.parent_id;

-- Level 2: Home & Living subcategories
INSERT INTO categories (name_en, name_fr, name_ar, slug, parent_id) VALUES
  ('Kitchen Gadgets & Tools', 'Gadgets & Ustensiles Cuisine','أدوات وأجهزة المطبخ', 'kitchen-gadgets',     (SELECT id FROM categories WHERE slug='home-living')),
  ('Home Decor',              'Décoration Maison',           'ديكور المنزل',         'home-decor',          (SELECT id FROM categories WHERE slug='home-living')),
  ('Lighting',                'Éclairage',                   'إضاءة',                'lighting',            (SELECT id FROM categories WHERE slug='home-living')),
  ('Storage & Organisation',  'Rangement & Organisation',    'تخزين وتنظيم',         'storage-organization',(SELECT id FROM categories WHERE slug='home-living'))
ON CONFLICT (slug) DO UPDATE SET name_en=EXCLUDED.name_en, name_fr=EXCLUDED.name_fr, name_ar=EXCLUDED.name_ar, parent_id=EXCLUDED.parent_id;

-- Level 3: Lighting
INSERT INTO categories (name_en, name_fr, name_ar, slug, parent_id) VALUES
  ('LED Strips & Smart Lights','Rubans LED & Lumières Connectées','شرائط LED وإضاءة ذكية','led-strips',   (SELECT id FROM categories WHERE slug='lighting')),
  ('Desk Lamps',               'Lampes de Bureau',               'مصابيح مكتبية',        'desk-lamps',   (SELECT id FROM categories WHERE slug='lighting')),
  ('Night Lights',             'Veilleuses & Ambiance',          'إضاءة ليلية',          'night-lights', (SELECT id FROM categories WHERE slug='lighting'))
ON CONFLICT (slug) DO UPDATE SET name_en=EXCLUDED.name_en, name_fr=EXCLUDED.name_fr, name_ar=EXCLUDED.name_ar, parent_id=EXCLUDED.parent_id;
