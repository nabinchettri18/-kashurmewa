# Kashurmewa launch and security checklist

## 1. Environment variables

Copy `.env.example` to `.env.local` for local development and fill in the values from your own Supabase project. Keep `.env.local` private and never commit it.

- `NEXT_PUBLIC_SUPABASE_URL`: project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: public publishable/anon key
- `SUPABASE_SERVICE_ROLE_KEY`: server-only service-role key, used by the checkout and contact APIs. Never add a `NEXT_PUBLIC_` prefix, expose it to browser code, or paste it into chat.

## 2. Apply database migrations

Apply the migration files in order to the correct Supabase project:

1. `supabase/migrations/20261009_init_kashurmewa.sql`
2. `supabase/migrations/20261010_create_kashurmewa_product_catalog.sql`
3. `supabase/migrations/20261011_secure_commerce.sql`

Use your normal Supabase migration workflow or review and run the SQL in the Supabase SQL Editor. Back up the database first. The third migration removes old permissive policies, creates the support inbox table, and adds the atomic COD checkout function. Review it against the actual live schema before applying it to a database with existing orders.

The older seed migrations have been changed so rerunning seed inserts does not overwrite live price or inventory. Editing a migration file does not automatically rerun a migration that Supabase has already recorded as applied.

## 3. Grant admin access deliberately

The dashboard checks the signed-in user's Supabase Auth `app_metadata.role` claim. Assign this claim only to trusted store operators from a secure server/admin process. For a single initial admin, a trusted operator may run the following in the Supabase SQL Editor after replacing the email with the exact account email:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
where lower(email) = lower('YOUR-ADMIN-EMAIL');
```

Confirm exactly one row was updated, then sign out and sign back in so the JWT refreshes. Do not put admin roles in user-editable `user_metadata`.

## 4. Local verification

From the repository root:

```powershell
npm ci
npm run typecheck
npm run build
npm run dev
```

The repository now has a GitHub Actions workflow that runs the type check and production build. Check the workflow result on the pull request before merging.

## 5. Required end-to-end checks before accepting real orders

- Verify anonymous users can read active catalogue data but cannot read, create, change, or delete order records.
- Verify a non-admin authenticated user cannot access customer orders or change catalogue data.
- Verify the assigned admin can manage catalogue variants and update order fulfilment.
- Place a COD test order with a low-stock variant; confirm stock decreases exactly once and both order and order items exist.
- Try two simultaneous orders for the last unit; only one should succeed.
- Force an invalid variant or insufficient quantity; confirm no partial order or stock decrement remains.
- Submit a contact message and confirm it appears in `public.km_contact_messages`; confirm the browser cannot read that table.
- Verify customer-facing order confirmation and support processes manually.

## 6. Still requires real business setup

- Confirm actual prices, weights, supplier claims, product photographs, packaging declarations, and allergen/cross-contact wording against the product you will ship.
- Verify applicable FSSAI registration/licensing, Legal Metrology package declarations, tax treatment, privacy/consumer rules, and refund terms with the relevant authorities or a qualified professional.
- Configure and test a real courier, order notifications, customer support ownership, and an operational refund/cancellation workflow.
- Online payments remain disabled intentionally until a gateway flow with server-side order creation, signature verification, and webhook reconciliation is implemented.
- Add persistent rate limiting/bot protection for public endpoints before a public launch.
- Confirm the production domain, contact email, image rights, and image accuracy before launch.

A successful build is not proof that the live database, permissions, fulfilment, or legal declarations are production-ready.
