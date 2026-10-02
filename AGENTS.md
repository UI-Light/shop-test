# AGENTS.md — Shop App (source of truth)

## Goal
Simple shop website: browse products, cart, checkout, Google login, data in DB, confirmation email. Beginner owner who wants to understand the code.

## Priority rule
CORE (M0-M8) is the pass/fail requirement. It must be live and working before any STRETCH (S1-S2) starts. Never let stretch work break core.

## Stack (fixed)
Next.js (App Router, TypeScript), Tailwind, Supabase (Postgres + Auth w/ Google), Mailgun HTTP API (server-side only), deploy on Vercel. Secrets only in .env.local (gitignored). Never print or commit secrets.

## CORE (must have)
- Login/logout with Google (via Supabase Auth)
- Product list (8-10 seeded products), cards with Add to cart. OWNER CHANGE: the whole site requires login - signed-out visitors only ever see /login.
- Cart: add, change quantity, remove. Stored in DB per user, persists across logout/login. Must be logged in to add.
- Checkout page: order summary + Place order (mock payment, no real card)
- On order: save order + items, clear cart, show confirmation page, send confirmation email via Mailgun. Email failure must NOT fail the order.

## STRETCH (only after core is live)
- Product detail page: image, description, price, quantity, Add to cart
- Search: filter products by name on the product list (case-insensitive, via query param)

## Out of scope
Real payments, admin panel, reviews, guest cart, anything not listed above.

## Data (Postgres, Row Level Security ON)
products(id, name, description, price_cents, image_url)
cart_items(id, user_id, product_id, quantity) unique(user_id, product_id)
orders(id, user_id, total_cents, created_at)
order_items(id, order_id, product_id, name, price_cents, quantity)
RLS: products readable by all; cart_items/orders/order_items only own rows.

## Pages
Core: / products · /cart · /checkout · /orders/[id] confirmation · /login
Stretch: /products/[id] detail · search box on /

## Agent rules (context is small, be brief)
- Read this file and DESIGN.md first - DESIGN.md owns every visual, motion and feedback rule (accent colour, cards, hover states, buttons, pending states, toasts). Don't re-explain either file.
- Work ONE milestone at a time. Show only changed files. No re-printing unchanged code.
- After each milestone: max 5 lines plain-language explanation + exact run/test command, then STOP and wait for me.
- HUMAN steps: stop, give numbered click-by-click instructions with exact field names and what to copy where. Wait for "done". Never ask me to paste secrets in chat; tell me which .env.local variable to fill.
- Ask at most 3 questions at once. Update the Status line below after each milestone.
- Before any commit/deploy of stretch work, confirm core still passes the Done-when test.

## Milestones
CORE
M0 Scaffold Next.js + Tailwind, git init, .gitignore, .env.local.example
H1 HUMAN: create Supabase project, copy URL + anon key into .env.local
M1 SQL for tables, RLS policies, seed products (I run it in Supabase SQL editor)
M2 Product list page
H2 HUMAN: Google Cloud Console OAuth client (consent screen, client ID/secret, redirect URI = Supabase callback), enable Google provider in Supabase, add local + production URLs
M3 Login/logout + protected routes
M4 Cart (DB-backed) + cart page
M5 Checkout + orders + confirmation page
H3 HUMAN: Mailgun account, sandbox domain, add + verify authorized recipients, copy API key + domain into .env.local
M6 Confirmation email (server route)
M7 Basic error/empty states, mobile check
H4 HUMAN: push to GitHub, deploy on Vercel, add env vars, update Google + Supabase redirect/site URLs to the live URL
M8 README (setup, env vars, what I built, what I learned) — CORE COMPLETE, submit-ready
STRETCH
S1 Product detail page + link from product cards
S2 Search on product list
S3 Redeploy, re-test core, update README

## Done when
Core: live URL works: log in with Google, add to cart, log out, log in, cart intact, place order, email arrives, order saved.
Stretch: detail page opens from a product card; search filters the list; core test above still passes.

## Status
Done: M0-M5 (all CORE up to checkout) + S1 (product page at /products/[id], linked from every card) + S2 (search box on /, case-insensitive via ?q=).
Photos are now real photographs from Wikimedia Commons, not drawings - `node scripts/fetch-product-photos.mjs` re-downloads the exact files listed in its PICKS map and rewrites public/products/CREDITS.md (the CC BY-SA photos must be credited; the footer links to it). Whole public/products folder is 836 KB.
Design pass: violet accent end to end, sticky SiteHeader with cart badge, new SiteFooter, rounded-xl cards with hover lift, real empty/error states, app/loading.tsx skeleton.
Feedback: SubmitButton (useFormStatus) gives every action button a spinner + "Adding..."/"Placing order..."/"Signing out..." pending state; Toast + ActionForm raise a corner toast for add to cart, quantity change, remove and failures. Cart actions now return an ActionState instead of nothing, and addToCart honours the quantity chosen on the product page.
Verified: lint + build clean; signed-out /, /cart, /checkout, /orders/<id> and /products/<id> all 307 -> /login?next=...; search returns the right rows for mug/MUG/%%mug%% and treats a lone % or _ as "no search".
**NEEDS ONE SQL PASTE** - `supabase/schema.sql` must be re-run in the SQL Editor. That single paste does three things: adds the "orders: delete own" policy, points image_url at the new .jpg files, and renames 3 products to match their photos (Canvas Tote Bag, A5 Ruled Notebook, Desk Organiser). Until you run it, product images are broken because the database still points at the deleted .png files.
Note: the M1 policy "products readable by all" is unchanged, so the anon key can still read products through the API even though the site is gated.
Mailgun (H3) is set up: MAILGUN_API_KEY + MAILGUN_DOMAIN are in .env.local, the key is valid (GET /v3/domains -> 200) and the domain is an active sandbox on the US region, so MAILGUN_API_BASE is not needed.
M6 code is written (lib/mail.ts + a call from placeOrder) but the email will NOT send yet: Mailgun answered 403 "Free accounts are for test purposes only. Please upgrade or add the address to your authorized recipients." The owner still has to add their own Gmail address under the sandbox domain -> Authorized Recipients. That is the only thing left before an order email can arrive.
Current: add the authorized recipient, then place a real order to confirm the email lands. After that: M7, H4, M8.