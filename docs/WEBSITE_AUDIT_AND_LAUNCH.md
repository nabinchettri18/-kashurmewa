# Kashurmewa website audit and launch status

This checklist distinguishes code changes from tasks that require real deployment settings, live service access, or business decisions.

## Fixed in this branch

- [x] Replace the shop banner's fixed third-party image with the first published catalogue image.
- [x] Use descriptive image alt text from the catalogue when available.
- [x] Add a branded image fallback when catalogue photography is absent.
- [x] Improve shop loading, empty-search and image fallback states.
- [x] Keep the storefront's product list, pack sizes, prices, stock and product images sourced from the existing catalogue.
- [x] Use the premium editorial homepage and consistent forest-green, ivory, walnut and muted-gold design direction.
- [x] Remove the hardcoded production-domain assumption from metadata, robots.txt and sitemap.xml.
- [x] Generate product sitemap entries from active catalogue products rather than a hardcoded product slug.
- [x] Exclude private account, cart, checkout, admin and API routes from crawler discovery.
- [x] Add responsive styles for catalogue image fallbacks.

## Must be verified before merge

- [ ] GitHub Actions typecheck and production build pass on this pull request.
- [ ] Test the home page, shop, product detail, cart, account, contact, policy pages and 404 route on desktop and mobile.
- [ ] Check browser console and network errors.
- [ ] Test product search, sorting, variant selection, cart persistence, quantity limits and checkout errors.
- [ ] Test form validation, success and failure feedback.
- [ ] Test keyboard navigation, focus states, contrast and image alt text.
- [ ] Confirm every navigation and footer link points to a real route or valid external destination.
- [ ] Test RLS with anonymous, ordinary signed-in and admin users.
- [ ] Confirm the service-role key is only configured in server-side deployment settings.
- [ ] Review database migrations against the live Supabase schema before applying them.

## Requires owner or production setup

- [ ] Set `NEXT_PUBLIC_SITE_URL` to the actual production URL after the domain and hosting are configured.
- [ ] Verify HTTPS and deployment redirects on the real domain.
- [ ] Apply and verify pending Supabase migrations after taking an appropriate database backup.
- [ ] Confirm real shipping rates, delivery coverage, product claims, packaging and stock.
- [ ] Finalise privacy, cookie-consent, terms, shipping and refund language against actual business practices and applicable law.
- [ ] Configure analytics only if needed and with appropriate privacy/consent behaviour.
- [ ] Configure error monitoring and persistent rate limiting/bot protection for public forms and sensitive endpoints.
- [ ] Configure and test production email/WhatsApp notifications if they are part of the intended workflow.
- [ ] Verify favicon and social-sharing image assets exist and render correctly.
- [ ] Run a final end-to-end order test before accepting real customer orders.

## Important notes

- A robots.txt rule is not an access-control mechanism; private routes must be protected by server-side authentication and authorisation.
- An unset `NEXT_PUBLIC_SITE_URL` intentionally avoids publishing a guessed domain in canonical metadata, sitemap or robots.txt.
- Do not invent customer testimonials, certifications, nutrition claims, product origin evidence or legal promises.
- Do not apply new migrations to production just because the file exists in Git. Review the SQL and confirm the target project first.
