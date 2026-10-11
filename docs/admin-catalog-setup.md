# Kashurmewa admin catalogue setup

The product studio at `/admin` uses Supabase Auth, the `km_admin_users` allow-list, RLS policies, and the `kashurmewa-products` Storage bucket. A normal customer account is **not** an admin.

## One-time setup

1. Apply `supabase/migrations/20261011_kashurmewa_admin_catalog_storage.sql` to the existing Supabase project after reviewing it. Do not rerun the original catalogue seed migration to set up admin; that older migration contains seed values and is not the admin migration.
2. Create or sign in to the intended owner account using the existing `/account` page.
3. In Supabase SQL Editor, look up the exact account and verify its email before granting admin access:

   ```sql
   select id, email
   from auth.users
   where lower(email) = lower('YOUR_OWNER_EMAIL');
   ```

4. Copy the verified user UUID and grant only that user admin membership:

   ```sql
   insert into public.km_admin_users (user_id)
   values ('PASTE_VERIFIED_AUTH_USER_UUID_HERE')
   on conflict (user_id) do nothing;
   ```

5. Sign in as that owner account and visit `/admin`.

Do not add all authenticated users to `km_admin_users`. Do not put a Supabase service-role key in any `NEXT_PUBLIC_*` variable or browser code.

## Product management

- Create/edit product name, URL slug, description, origin, ingredients, storage instructions, shelf life, and publish/draft status.
- Add any number of pack sizes with INR price, stock, optional SKU, and availability.
- Upload multiple product photos (JPG, PNG, WebP, or AVIF; up to 10 MB each), reorder them, and remove them. The first image is the product cover.
- Public visitors can read published products and their active variants. Writes require a signed-in account listed in `km_admin_users`.

## Notes

- Existing catalogue records and current prices/inventory are preserved by this admin migration.
- Existing remote image URLs remain usable; `storage_path` is nullable for those legacy images.
- Apply the migration and test in a staging project first if one is available. The migration file being committed does not mean it has been applied to the live database.
