# GolfGives — Charity Golf Platform

A full-stack subscription platform where golfers track Stableford scores, enter automated monthly prize draws, and contribute to vetted charities — all in one place.

**Live:** [golf-charity-platform-three-livid.vercel.app](https://golf-charity-platform-three-livid.vercel.app)

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Auth & Database:** Supabase
- **Payments:** Stripe (subscriptions + webhooks)
- **Deployment:** Vercel

---

## Features

- Subscriber signup, login, and dashboard
- Stableford score tracking (rolling 5-score average)
- Tier-based automated monthly prize draws (3, 4, or 5 number match)
- Charity selection — 10% of every subscription donated automatically
- Stripe subscription billing (monthly £9.99 / yearly £89.99)
- Winner proof upload and payout tracking
- Admin portal with full user, draw, charity, and winner management
- Stripe webhook handling for subscription lifecycle events

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/your-username/golf-charity-platform.git
cd golf-charity-platform
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Stripe Webhooks (Local Testing)

Use the Stripe CLI to forward events to your local server:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Events handled:
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.deleted`

---

## Project Structure

```
app/
├── (auth)/          # Login, signup, admin-login pages
├── (admin)/         # Admin dashboard (users, draws, charities, winners)
├── (dashboard)/     # Subscriber dashboard (scores, draws, charity, winnings)
├── api/             # API routes (auth, subscriptions, draws, scores, webhooks)
├── charities/       # Public charities page
└── page.tsx         # Landing page

components/          # Shared UI components
lib/                 # Supabase clients, Stripe config
```

---

## Admin Access

Any Supabase user with `admin` in their email is automatically elevated to admin role on first login. Create an admin user via Supabase Dashboard → Authentication → Users.

---

## Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel
2. Add all environment variables from `.env.local` to Vercel project settings
3. Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL
4. Add a Stripe webhook endpoint pointing to `https://your-app.vercel.app/api/webhooks/stripe`
5. Copy the new `whsec_...` signing secret into Vercel env vars and redeploy

---

## License

MIT
