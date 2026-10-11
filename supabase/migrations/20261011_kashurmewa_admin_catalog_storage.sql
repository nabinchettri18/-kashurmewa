-- Admin-only product management and Supabase Storage for Kashurmewa.
-- After this migration is applied, add the owner's existing auth.users id to
-- public.km_admin_users. Do not make every authenticated user an admin.

create table if not exists public.km_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.km_admin_users enable row level security;
revoke all on public.km_admin_users from anon, authenticated;
grant select on public.km_admin_users to authenticated;
drop policy if exists "Admins can read their own admin membership" on public.km_admin_users;
create policy "Admins can read their own admin membership"
  on public.km_admin_users for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function public.km_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.km_admin_users a
    where a.user_id = (select auth.uid())
  );
$$;
revoke all on function public.km_is_admin() from public, anon;
grant execute on function public.km_is_admin() to authenticated;

drop policy if exists "Admins can insert products" on public.km_products;
create policy "Admins can insert products" on public.km_products
  for insert to authenticated with check ((select public.km_is_admin()));
drop policy if exists "Admins can update products" on public.km_products;
create policy "Admins can update products" on public.km_products
  for update to authenticated using ((select public.km_is_admin())) with check ((select public.km_is_admin()));
drop policy if exists "Admins can delete products" on public.km_products;
create policy "Admins can delete products" on public.km_products
  for delete to authenticated using ((select public.km_is_admin()));

drop policy if exists "Admins can insert product variants" on public.km_product_variants;
create policy "Admins can insert product variants" on public.km_product_variants
  for insert to authenticated with check ((select public.km_is_admin()));
drop policy if exists "Admins can update product variants" on public.km_product_variants;
create policy "Admins can update product variants" on public.km_product_variants
  for update to authenticated using ((select public.km_is_admin())) with check ((select public.km_is_admin()));
drop policy if exists "Admins can delete product variants" on public.km_product_variants;
create policy "Admins can delete product variants" on public.km_product_variants
  for delete to authenticated using ((select public.km_is_admin()));

drop policy if exists "Admins can insert product images" on public.km_product_images;
create policy "Admins can insert product images" on public.km_product_images
  for insert to authenticated with check ((select public.km_is_admin()));
drop policy if exists "Admins can update product images" on public.km_product_images;
create policy "Admins can update product images" on public.km_product_images
  for update to authenticated using ((select public.km_is_admin())) with check ((select public.km_is_admin()));
drop policy if exists "Admins can delete product images" on public.km_product_images;
create policy "Admins can delete product images" on public.km_product_images
  for delete to authenticated using ((select public.km_is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kashurmewa-products', 'kashurmewa-products', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view Kashurmewa product images" on storage.objects;
create policy "Public can view Kashurmewa product images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'kashurmewa-products');

drop policy if exists "Admins can upload Kashurmewa product images" on storage.objects;
create policy "Admins can upload Kashurmewa product images" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'kashurmewa-products' and (select public.km_is_admin())
  );
drop policy if exists "Admins can update Kashurmewa product images" on storage.objects;
create policy "Admins can update Kashurmewa product images" on storage.objects
  for update to authenticated using (
    bucket_id = 'kashurmewa-products' and (select public.km_is_admin())
  ) with check (
    bucket_id = 'kashurmewa-products' and (select public.km_is_admin())
  );
drop policy if exists "Admins can delete Kashurmewa product images" on storage.objects;
create policy "Admins can delete Kashurmewa product images" on storage.objects
  for delete to authenticated using (
    bucket_id = 'kashurmewa-products' and (select public.km_is_admin())
  );
