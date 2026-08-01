-- ============================================================
-- #SAINTEMAXIME 2026 — Schéma Supabase
-- À exécuter dans Supabase > SQL Editor > New query
-- ============================================================

-- ---------- CATEGORIES ----------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  color text default 'bg-sm-cyan',
  description text default '',
  image text default '',
  active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- PRODUCTS ----------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  price numeric(10,2) not null default 0,
  original_price numeric(10,2),
  category text not null,
  image text default '',
  images jsonb default '[]'::jsonb,
  badge text,
  description text default '',
  details jsonb default '[]'::jsonb,
  colors jsonb default '[]'::jsonb,
  sizes jsonb default '[]'::jsonb,
  in_stock boolean default true,
  stock_count int default 0,
  source text default 'manual' check (source in ('printful', 'manual')),
  printful_id text,
  last_synced_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- REVIEWS ----------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  author text not null,
  rating int not null check (rating between 1 and 5),
  text text default '',
  avatar text,
  created_at timestamptz default now()
);

-- ---------- ORDERS ----------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_name text not null,
  customer_email text not null,
  customer_address jsonb default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  total numeric(10,2) not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_method text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- ADMIN USERS ----------
-- Remarque : l'authentification se fait via Supabase Auth (table auth.users).
-- Cette table complète le profil / le rôle de chaque compte admin.
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'editor' check (role in ('superadmin', 'admin', 'editor')),
  active boolean default true,
  created_at timestamptz default now()
);

-- ---------- PAGES CONTENT (accueil, la-marque, le-coeur-au-sol, etc.) ----------
create table if not exists pages_content (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique, -- ex: 'home', 'la-marque', 'le-coeur-au-sol'
  title text,
  content jsonb not null default '{}'::jsonb, -- structure libre par page (blocs, textes, images)
  updated_at timestamptz default now(),
  updated_by uuid references admin_users(id)
);

-- ---------- MEDIA (photos, logos) ----------
create table if not exists media (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  type text default 'image', -- image, logo, icon...
  category text default 'general', -- 'logo', 'produit', 'page', 'general'
  size_bytes int,
  width int,
  height int,
  uploaded_at timestamptz default now()
);

-- ---------- LINKS (réseaux sociaux, liens externes) ----------
create table if not exists links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  type text default 'social', -- 'social', 'external', 'internal'
  icon text,
  active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- SEO SETTINGS ----------
create table if not exists seo_settings (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique,
  meta_title text,
  meta_description text,
  og_image text,
  updated_at timestamptz default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_slug on products(slug);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_email on orders(customer_email);
create index if not exists idx_reviews_product on reviews(product_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table categories enable row level security;
alter table products enable row level security;
alter table reviews enable row level security;
alter table orders enable row level security;
alter table admin_users enable row level security;
alter table pages_content enable row level security;
alter table media enable row level security;
alter table links enable row level security;
alter table seo_settings enable row level security;

-- Lecture publique (le site vitrine doit pouvoir tout lire librement)
create policy "public read categories" on categories for select using (true);
create policy "public read products" on products for select using (true);
create policy "public read reviews" on reviews for select using (true);
create policy "public read pages_content" on pages_content for select using (true);
create policy "public read media" on media for select using (true);
create policy "public read links" on links for select using (true);
create policy "public read seo_settings" on seo_settings for select using (true);

-- Écriture : réservée aux admins authentifiés (vérifiés via admin_users)
create policy "admin write categories" on categories for all
  using (exists (select 1 from admin_users where id = auth.uid() and active = true))
  with check (exists (select 1 from admin_users where id = auth.uid() and active = true));

create policy "admin write products" on products for all
  using (exists (select 1 from admin_users where id = auth.uid() and active = true))
  with check (exists (select 1 from admin_users where id = auth.uid() and active = true));

create policy "admin write reviews" on reviews for all
  using (exists (select 1 from admin_users where id = auth.uid() and active = true))
  with check (exists (select 1 from admin_users where id = auth.uid() and active = true));

create policy "admin write pages_content" on pages_content for all
  using (exists (select 1 from admin_users where id = auth.uid() and active = true))
  with check (exists (select 1 from admin_users where id = auth.uid() and active = true));

create policy "admin write media" on media for all
  using (exists (select 1 from admin_users where id = auth.uid() and active = true))
  with check (exists (select 1 from admin_users where id = auth.uid() and active = true));

create policy "admin write links" on links for all
  using (exists (select 1 from admin_users where id = auth.uid() and active = true))
  with check (exists (select 1 from admin_users where id = auth.uid() and active = true));

create policy "admin write seo_settings" on seo_settings for all
  using (exists (select 1 from admin_users where id = auth.uid() and active = true))
  with check (exists (select 1 from admin_users where id = auth.uid() and active = true));

-- Commandes : lecture/écriture réservée aux admins (les clients n'ont pas de compte)
create policy "admin read orders" on orders for select
  using (exists (select 1 from admin_users where id = auth.uid() and active = true));
create policy "admin write orders" on orders for all
  using (exists (select 1 from admin_users where id = auth.uid() and active = true))
  with check (exists (select 1 from admin_users where id = auth.uid() and active = true));

-- admin_users : chaque admin peut lire son propre profil, seul un superadmin gère les autres
create policy "self read admin_users" on admin_users for select
  using (id = auth.uid());
create policy "superadmin manage admin_users" on admin_users for all
  using (exists (select 1 from admin_users au where au.id = auth.uid() and au.role = 'superadmin' and au.active = true))
  with check (exists (select 1 from admin_users au where au.id = auth.uid() and au.role = 'superadmin' and au.active = true));
