-- ============================================================================
-- Shop website - tables, Row Level Security and seed data.
-- M1: paste this whole file into Supabase -> SQL Editor -> Run.
-- Safe to re-run: "if not exists", "drop policy if exists" and
-- "on conflict (id) do nothing" are used throughout.
-- ============================================================================

-- ------------------------------------------------------------------ tables --

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text     not null,
  description text     not null,
  price_cents integer  not null check (price_cents >= 0),
  image_url   text     not null
);

create table if not exists public.cart_items (
  id         uuid    primary key default gen_random_uuid(),
  user_id    uuid    not null references auth.users (id) on delete cascade,
  product_id uuid    not null references public.products (id) on delete cascade,
  quantity   integer not null check (quantity > 0),
  unique (user_id, product_id)        -- one row per product, per user
);

create table if not exists public.orders (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  total_cents integer     not null check (total_cents >= 0),
  created_at  timestamptz not null default now()
);

create table if not exists public.order_items (
  id          uuid    primary key default gen_random_uuid(),
  order_id    uuid    not null references public.orders (id) on delete cascade,
  product_id  uuid             references public.products (id) on delete set null,
  name        text    not null,       -- copied at checkout, so old orders never change
  price_cents integer not null check (price_cents >= 0),
  quantity    integer not null check (quantity > 0)
);

create index if not exists cart_items_user_id_idx   on public.cart_items (user_id);
create index if not exists orders_user_id_idx       on public.orders (user_id);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- ------------------------------------------------------- Row Level Security --
-- With RLS on, the anon/browser key can only touch what these policies allow.
alter table public.products    enable row level security;
alter table public.cart_items  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- products: anyone (logged in or not) can read the catalogue. No API writes.
drop policy if exists "products are readable by everyone" on public.products;
create policy "products are readable by everyone"
  on public.products for select
  using (true);

-- cart_items: you can only read and change your own rows.
drop policy if exists "cart_items: read own" on public.cart_items;
create policy "cart_items: read own"
  on public.cart_items for select
  using (auth.uid() = user_id);

drop policy if exists "cart_items: insert own" on public.cart_items;
create policy "cart_items: insert own"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "cart_items: update own" on public.cart_items;
create policy "cart_items: update own"
  on public.cart_items for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "cart_items: delete own" on public.cart_items;
create policy "cart_items: delete own"
  on public.cart_items for delete
  using (auth.uid() = user_id);

-- orders: you can only read and create your own orders.
drop policy if exists "orders: read own" on public.orders;
create policy "orders: read own"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "orders: insert own" on public.orders;
create policy "orders: insert own"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- order_items: a row belongs to you when its parent order belongs to you.
drop policy if exists "order_items: read own" on public.order_items;
create policy "order_items: read own"
  on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

drop policy if exists "order_items: insert own" on public.order_items;
create policy "order_items: insert own"
  on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

-- ------------------------------------------------------------ seed: products -
-- 9 demo products. Prices are in cents, so 2400 = 24.00.
-- The images are files in this repo (public/products/*.png); regenerate them
-- with: node scripts/generate-placeholder-images.mjs
-- Re-running this file refreshes these rows, so this list is the source of truth.
insert into public.products (id, name, description, price_cents, image_url) values
  ('10000000-0000-4000-8000-000000000001', 'Everyday Cotton T-Shirt', 'Soft 100% cotton tee with a relaxed fit.',           2400, '/products/tshirt.png'),
  ('10000000-0000-4000-8000-000000000002', 'Ceramic Mug',             'Stoneware mug, holds 350 ml, dishwasher safe.',      1500, '/products/mug.png'),
  ('10000000-0000-4000-8000-000000000003', 'Linen Tote Bag',          'Roomy natural linen tote with two handles.',         2800, '/products/tote.png'),
  ('10000000-0000-4000-8000-000000000004', 'Stainless Water Bottle',  'Insulated 500 ml bottle, keeps drinks cold.',        3200, '/products/bottle.png'),
  ('10000000-0000-4000-8000-000000000005', 'Wool Beanie',             'Warm ribbed knit beanie, one size fits most.',       1900, '/products/beanie.png'),
  ('10000000-0000-4000-8000-000000000006', 'Leather Notebook',        'A5 refillable notebook with a soft leather cover.',  3400, '/products/notebook.png'),
  ('10000000-0000-4000-8000-000000000007', 'Bamboo Desk Organiser',   'Five compartments to keep a desk tidy.',             2600, '/products/desk.png'),
  ('10000000-0000-4000-8000-000000000008', 'Enamel Pin Set',          'Set of three hard-enamel pins.',                     1200, '/products/pins.png'),
  ('10000000-0000-4000-8000-000000000009', 'Canvas Apron',            'Heavyweight canvas apron with a front pocket.',      4200, '/products/apron.png')
on conflict (id) do update set
  name        = excluded.name,
  description = excluded.description,
  price_cents = excluded.price_cents,
  image_url   = excluded.image_url;

-- ----------------------------------------------------------------- check it --
-- Run this line after the script; you should get 9.
-- select count(*) from public.products;
