### Shop

A small practice shop: browse products, keep a cart, check out and get a
confirmation email. Nothing is charged and nothing ships.

Next.js 15 (App Router, TypeScript), Tailwind CSS v4, Supabase (Postgres +
Google login), Mailgun, deployed on Vercel.

### What it does

- **Sign in with Google.** The whole site sits behind the login; signed-out
  visitors only ever see `/login`.
- **Products.** Nine seeded products, each opening a detail page with a
  quantity picker.
- **Search.** Filter by name, case-insensitive
- **Cart.** Add, change quantity, remove. Stored in the database per user, so
  it follows you between devices and survives logging out.
- **Checkout.** Order summary and a mock "Place order" button. No card details.
- **Confirmation.** The order is saved and a summary email is sent.
- **Installable.** It can be added to a phone's home screen and opens without a
  browser's address bar. See `twa/README.md` for building an Android `.apk`.

### Setup

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

Other commands: `npm run build`, `npm run start`, `npm run lint`,
`node scripts/fetch-product-photos.mjs` to re-download the product photos, and
`node scripts/make-app-icons.mjs` to redraw the app icons.
