# Shop

A small practice shop: browse products, keep a cart, check out and get a
confirmation email. Nothing is charged and nothing ships.

Next.js 15 (App Router, TypeScript), Tailwind CSS v4, Supabase (Postgres +
Google login), Mailgun, deployed on Vercel.

## What it does

- **Sign in with Google.** The whole site sits behind the login; signed-out
  visitors only ever see `/login`.
- **Products.** Nine seeded products, each opening a detail page with a
  quantity picker.
- **Search.** Filter by name, case-insensitive, at `/?q=mug`.
- **Cart.** Add, change quantity, remove. Stored in the database per user, so
  it follows you between devices and survives logging out.
- **Checkout.** Order summary and a mock "Place order" button. No card details.
- **Confirmation.** The order is saved and a summary email is sent.

## Setup

```bash
npm install
cp .env.local.example .env.local    # then fill in the values below
```

| Variable | Where to find it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase -> Project Settings -> API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same page - safe to ship, Row Level Security protects the data |
| `MAILGUN_API_KEY` | Mailgun -> Account -> API Keys |
| `MAILGUN_DOMAIN` | your Mailgun sending domain |
| `MAILGUN_API_BASE` | EU accounts only, e.g. `https://api.eu.mailgun.net` |

`.env.local` is gitignored. Never commit it.

Create the database by pasting `supabase/schema.sql` into the Supabase SQL
Editor and running it. It creates the four tables, enables Row Level Security
and inserts the products. Then:

```bash
npm run dev      # http://localhost:3000
```

Other commands: `npm run build`, `npm run start`, `npm run lint`, and
`node scripts/fetch-product-photos.mjs` to re-download the product photos.

## Notes

**Photos** come from Wikimedia Commons under CC / CC BY-SA licences and are
credited in `public/products/CREDITS.md`. To use your own, drop files with the
same names into `public/products` - no database change needed.

**Email** is sent from `placeOrder` _after_ the order is saved, and a Mailgun
outage never fails an order - it only writes a line to the server log. A
sandbox domain can only email addresses listed under **Authorized
Recipients**, and its mail often lands in spam.

**Security.** Prices are recalculated on the server, never trusted from the
browser. Row Level Security policies are what stop one user reading another's
cart or orders.

## What I learned

- **Server Actions are just async functions.** `"use server"` turns one into an
  endpoint a `<form>` can call, which is how orders get saved without writing
  API routes by hand.
- **`useFormStatus` gives loading states for free.** The submit button disables
  itself and swaps in "Placing order..." while the server works - no state to
  manage.
- **Never trust prices from the browser.** Anything posted back can be edited,
  so the total is recomputed from the database.
- **Row Level Security is the real firewall.** The anon key reaches every
  visitor; the policies are what actually enforce privacy.
- **A failed side effect shouldn't fail the request.** The email send returns a
  result instead of throwing, so Mailgun having a bad day cannot lose an order.
