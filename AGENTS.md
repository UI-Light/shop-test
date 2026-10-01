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
- Read this file and DESIGN.md first. Don't re-explain them.
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
Done: M0 (scaffold), H1 (Supabase keys), M1 (schema + RLS + 9 products), M2 (product list), H2 (Google OAuth), M3 (login/logout, whole site gated behind login), M4 (DB-backed cart: Add to cart on each card, `/cart` with +/- and Remove, header cart count), M5 (checkout summary + Place order, order + order_items saved, cart cleared, `/orders/[id]` confirmation).
Images fixed: each product image now contains a real line drawing of the product (regenerate with `node scripts/generate-placeholder-images.mjs`).
Verified: lint + build clean; signed-out `/`, `/cart`, `/checkout`, `/orders/<id>` all 307 -> `/login?next=...`.
NEEDS ONE SQL PASTE: `supabase/schema.sql` gained an "orders: delete own" policy (used to roll back a half-failed checkout) - re-run the file in the SQL Editor.
Note: the M1 policy "products readable by all" is unchanged, so the anon key can still read products through the API even though the site is gated.
Current: H3 (Mailgun) HUMAN step, then M6 - send the confirmation email server-side; email failure must NOT fail the order.