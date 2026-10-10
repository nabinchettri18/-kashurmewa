-- Security and transactional commerce hardening for Kashurmewa.
-- Safe to apply after the existing catalogue/order migrations.
-- Public visitors may read only active catalogue data. Customer orders are never public.

begin;

-- Remove every legacy/public policy that could expose or mutate private commerce rows.
do $$
declare p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('km_products','km_product_variants','km_product_images','km_orders','km_order_items','km_admin_users')
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

alter table public.km_products enable row level security;
alter table public.km_product_variants enable row level security;
alter table public.km_product_images enable row level security;
alter table public.km_orders enable row level security;
alter table public.km_order_items enable row level security;
alter table public.km_admin_users enable row level security;

-- Start with no direct access to private tables. Service role bypasses RLS and is server-only.
revoke all on public.km_orders, public.km_order_items, public.km_admin_users from anon, authenticated;
revoke insert, update, delete on public.km_products, public.km_product_variants, public.km_product_images from anon, authenticated;
grant select on public.km_products, public.km_product_variants, public.km_product_images to anon, authenticated;

create policy "Public read active products" on public.km_products
  for select to anon, authenticated using (active = true);
create policy "Public read active variants" on public.km_product_variants
  for select to anon, authenticated using (
    active = true and exists (
      select 1 from public.km_products p where p.id = product_id and p.active = true
    )
  );
create policy "Public read active product images" on public.km_product_images
  for select to anon, authenticated using (
    exists (select 1 from public.km_products p where p.id = product_id and p.active = true)
  );

-- Admins are assigned through Supabase Auth app_metadata by a trusted server/admin process.
create policy "Admins manage products" on public.km_products
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins manage variants" on public.km_product_variants
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins manage images" on public.km_product_images
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins read and update orders" on public.km_orders
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins update orders" on public.km_orders
  for update to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "Admins read order items" on public.km_order_items
  for select to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

grant select, insert, update, delete on public.km_products, public.km_product_variants, public.km_product_images to authenticated;
grant select, update on public.km_orders to authenticated;
grant select on public.km_order_items to authenticated;

-- Support inbox: no client role can read it. Public submission happens through a validated server route.
create table if not exists public.km_contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  subject text not null default '' check (char_length(subject) <= 160),
  message text not null check (char_length(message) between 1 and 5000),
  created_at timestamptz not null default now()
);
alter table public.km_contact_messages enable row level security;
revoke all on public.km_contact_messages from anon, authenticated;

-- Atomic COD checkout: validate live catalogue, lock stock rows, decrement inventory,
-- and write order plus items in one transaction. Any exception rolls the entire transaction back.
create or replace function public.km_place_cod_order(
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_address_line1 text,
  p_address_line2 text,
  p_city text,
  p_state text,
  p_pincode text,
  p_items jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  item jsonb;
  v_variant_id uuid;
  v_qty integer;
  v_product_id uuid;
  v_product_name text;
  v_size text;
  v_price numeric(10,2);
  v_stock integer;
  v_subtotal numeric(10,2) := 0;
  v_shipping numeric(10,2);
  v_total numeric(10,2);
  v_order_id uuid;
  v_order_reference text;
  v_items_count integer;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'INVALID_ITEMS';
  end if;
  v_items_count := jsonb_array_length(p_items);
  if v_items_count < 1 or v_items_count > 10 then raise exception 'INVALID_ITEMS'; end if;

  if p_customer_name is null or length(trim(p_customer_name)) not between 1 and 120
    or p_customer_email is null or length(trim(p_customer_email)) > 254
    or p_customer_phone is null or p_customer_phone !~ '^[0-9]{10}$'
    or p_address_line1 is null or length(trim(p_address_line1)) not between 1 and 250
    or length(coalesce(p_address_line2,'')) > 250
    or p_city is null or length(trim(p_city)) not between 1 and 100
    or p_state is null or length(trim(p_state)) not between 1 and 100
    or p_pincode is null or p_pincode !~ '^[0-9]{6}$'
  then raise exception 'INVALID_CUSTOMER_DETAILS'; end if;

  if exists (
    select 1 from jsonb_array_elements(p_items) x
    where coalesce(x->>'variantId','') = ''
       or coalesce(x->>'qty','') !~ '^[0-9]+$'
       or (x->>'qty')::integer not between 1 and 20
  ) then raise exception 'INVALID_ITEMS'; end if;
  if (select count(distinct x->>'variantId') from jsonb_array_elements(p_items) x) <> v_items_count
  then raise exception 'DUPLICATE_VARIANTS'; end if;

  -- Lock in deterministic order to reduce deadlocks between simultaneous checkouts.
  for item in select value from jsonb_array_elements(p_items) order by value->>'variantId'
  loop
    v_variant_id := (item->>'variantId')::uuid;
    v_qty := (item->>'qty')::integer;
    select v.id, v.product_id, p.name, v.size, v.price_inr, v.stock
      into v_variant_id, v_product_id, v_product_name, v_size, v_price, v_stock
    from public.km_product_variants v
    join public.km_products p on p.id = v.product_id
    where v.id = (item->>'variantId')::uuid and v.active = true and p.active = true
    for update of v;
    if not found then raise exception 'ITEM_UNAVAILABLE'; end if;
    if v_stock < v_qty then raise exception 'INSUFFICIENT_STOCK:%', v_size; end if;
    v_subtotal := v_subtotal + (v_price * v_qty);
  end loop;

  v_subtotal := round(v_subtotal, 2);
  v_shipping := case when v_subtotal >= 999 then 0 else 99 end;
  v_total := v_subtotal + v_shipping;
  v_order_reference := 'KM-' || to_char(now() at time zone 'UTC', 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8));

  insert into public.km_orders (
    order_reference, customer_name, customer_email, customer_phone,
    address_line1, address_line2, city, state, pincode,
    subtotal_inr, shipping_fee_inr, total_amount_inr,
    payment_method, payment_status, fulfillment_status
  ) values (
    v_order_reference, trim(p_customer_name), lower(trim(p_customer_email)), trim(p_customer_phone),
    trim(p_address_line1), nullif(trim(coalesce(p_address_line2,'')),''), trim(p_city), trim(p_state), trim(p_pincode),
    v_subtotal, v_shipping, v_total, 'cod', 'pending', 'pending'
  ) returning id into v_order_id;

  for item in select value from jsonb_array_elements(p_items) order by value->>'variantId'
  loop
    v_variant_id := (item->>'variantId')::uuid;
    v_qty := (item->>'qty')::integer;
    select v.product_id, p.name, v.size, v.price_inr
      into v_product_id, v_product_name, v_size, v_price
    from public.km_product_variants v
    join public.km_products p on p.id = v.product_id
    where v.id = v_variant_id;
    update public.km_product_variants set stock = stock - v_qty where id = v_variant_id;
    insert into public.km_order_items (
      order_id, product_id, variant_id, product_name, variant_size,
      quantity, unit_price_inr, total_price_inr
    ) values (
      v_order_id, v_product_id, v_variant_id, v_product_name, v_size,
      v_qty, v_price, v_price * v_qty
    );
  end loop;

  return jsonb_build_object(
    'success', true, 'orderReference', v_order_reference,
    'subtotalInr', v_subtotal, 'shippingFeeInr', v_shipping,
    'totalAmountInr', v_total, 'paymentMethod', 'cod'
  );
end;
$$;

revoke all on function public.km_place_cod_order(text,text,text,text,text,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.km_place_cod_order(text,text,text,text,text,text,text,text,jsonb) to service_role;

commit;
