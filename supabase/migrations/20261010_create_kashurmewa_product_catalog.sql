-- Kashurmewa product catalogue: prices and stock live in Supabase.
create extension if not exists pgcrypto;

create table if not exists public.km_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  origin text not null default 'Kashmir, India',
  ingredients text not null default '100% Walnuts',
  storage_instructions text,
  shelf_life text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.km_product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.km_products(id) on delete cascade,
  size text not null,
  price_inr integer not null check (price_inr >= 0),
  stock integer not null default 0 check (stock >= 0),
  sku text unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size)
);

create table if not exists public.km_product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.km_products(id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists km_product_variants_product_id_idx on public.km_product_variants(product_id);
create index if not exists km_product_images_product_id_sort_idx on public.km_product_images(product_id, sort_order);
-- The original schema did not declare SKU unique; required by the seed's ON CONFLICT clause.
create index if not exists km_product_variants_sku_idx on public.km_product_variants(sku);

alter table public.km_products enable row level security;
alter table public.km_product_variants enable row level security;
alter table public.km_product_images enable row level security;

grant select on public.km_products to anon, authenticated;
grant select on public.km_product_variants to anon, authenticated;
grant select on public.km_product_images to anon, authenticated;

drop policy if exists "Public can read active products" on public.km_products;
create policy "Public can read active products" on public.km_products
  for select to anon, authenticated using (active = true);

drop policy if exists "Public can read active product variants" on public.km_product_variants;
create policy "Public can read active product variants" on public.km_product_variants
  for select to anon, authenticated using (
    active = true and exists (
      select 1 from public.km_products p
      where p.id = product_id and p.active = true
    )
  );

drop policy if exists "Public can read images for active products" on public.km_product_images;
create policy "Public can read images for active products" on public.km_product_images
  for select to anon, authenticated using (
    exists (
      select 1 from public.km_products p
      where p.id = product_id and p.active = true
    )
  );

insert into public.km_products
  (slug, name, description, origin, ingredients, storage_instructions, shelf_life, active)
values (
  'kashmiri-walnuts',
  'Kashmiri In-Shell Walnuts',
  'Handpicked premium Kashmiri walnuts with natural hard shells, grown in high-altitude orchards of Kashmir. Known for rich oil content, thin shells, crunchy kernels, and authentic natural flavor.',
  'Kashmir, India',
  '100% Kashmiri In-Shell Walnuts. No preservatives, bleach, or artificial coating.',
  'Store in a cool, dry place away from direct heat and humidity. Keep sealed after opening.',
  '6 Months from packaging date',
  true
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  origin = excluded.origin,
  ingredients = excluded.ingredients,
  storage_instructions = excluded.storage_instructions,
  shelf_life = excluded.shelf_life,
  active = excluded.active,
  updated_at = now();

insert into public.km_product_variants (product_id, size, price_inr, stock, sku, active)
select p.id, v.size, v.price_inr, v.stock, v.sku, true
from public.km_products p
cross join (values
  ('250 g', 349, 100, 'KM-WAL-250G'),
  ('500 g', 649, 75, 'KM-WAL-500G'),
  ('1 kg', 1199, 50, 'KM-WAL-1KG')
) as v(size, price_inr, stock, sku)
where p.slug = 'kashmiri-walnuts'
on conflict (sku) do nothing; -- Preserve live price, availability and inventory on migration reruns.

insert into public.km_product_images (product_id, url, alt_text, sort_order)
select p.id, i.url, i.alt_text, i.sort_order
from public.km_products p
cross join (values
  ('https://images.pexels.com/photos/8303558/pexels-photo-8303558.jpeg', 'Whole Kashmiri Walnuts in Shell', 1),
  ('https://images.pexels.com/photos/14627184/pexels-photo-14627184.jpeg', 'Fresh Kashmiri Walnut Harvest', 2),
  ('https://images.pexels.com/photos/16089996/pexels-photo-16089996.jpeg', 'Kashurmewa Walnut Presentation', 3)
) as i(url, alt_text, sort_order)
where p.slug = 'kashmiri-walnuts'
and not exists (
  select 1 from public.km_product_images existing
  where existing.product_id = p.id and existing.url = i.url
);
