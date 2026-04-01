# GolfGive — Golf Charity Subscription Platform

> **Play golf. Win prizes. Support charity.**  
> A full-stack subscription platform where golfers compete in monthly prize draws while automatically donating to their chosen charity.

---

## 🌐 Live Demo

| Environment | URL |
|---|---|
| Production | [https://digital-heros.vercel.app](https://digital-heros.vercel.app) *(deploy via Vercel)* |
| GitHub | [https://github.com/xyzError404/DigitalHeros](https://github.com/xyzError404/DigitalHeros) |

---

## 📋 Test Credentials

| Role | Email | Password |
|---|---|---|
| **User** | user@golfgive.com | *(set after signup)* |
| **Admin** | admin@golfgive.com | *(set after promoting via SQL)* |

> 💡 To promote a user to admin, run in Supabase SQL Editor:
> ```sql
> UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
> ```

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, TypeScript) |
| **Database** | Supabase (PostgreSQL + Auth + Storage + RLS) |
| **Payments** | Stripe (Subscriptions, Webhooks) |
| **Email** | Resend |
| **Deployment** | Vercel (with Cron Jobs) |
| **Styling** | Vanilla CSS (custom design system — dark, premium) |

---

## ✨ Key Features

### For Players
- 🔐 **Auth** — email/password signup via Supabase Auth
- 💳 **Subscriptions** — Monthly (£29.99) or Yearly (£299) via Stripe
- ⛳ **Score Management** — Log Stableford scores (1–45), rolling 5-score logic
- 🎰 **Monthly Draws** — Auto-enrolled every month; scores snapshotted and locked
- 🏆 **Prize Claims** — Upload proof, track verification and payment status
- 💜 **Charity** — Choose a cause; min 10% of subscription donated automatically
- 🔔 **Notifications** — In-app feed for draw results, winner status, billing alerts

### For Admins
- 📊 **Analytics** — Total users, active subscribers, prize pool, charity totals
- 🎰 **Draw Management** — Create, simulate (isolated preview), and publish monthly draws
- 🧠 **Two Draw Algorithms** — Standard random OR frequency-weighted (inverse probability)
- 🏆 **Winner Verification** — Approve/reject proof submissions, mark payouts as paid
- 💜 **Charity Management** — Add/toggle charities, set featured charity
- 👥 **User Management** — Full user table with subscription and charity details

---

## 🗄️ Database Schema

> All tables have Row Level Security (RLS) enabled.

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users` — role, full_name |
| `subscriptions` | Stripe subscription state per user |
| `golf_scores` | Up to 5 scores per user, with lock flag |
| `charities` | Supported charities directory |
| `user_charities` | User ↔ Charity with contribution % |
| `donations` | Monthly charity contribution records |
| `draws` | Monthly draw records with status |
| `draw_entries` | Immutable score snapshots per draw |
| `draw_results` | Published winning tiers + amounts |
| `prize_pool` | Prize pool breakdown per draw |
| `winner_verifications` | Proof submissions + payout tracking |
| `notifications` | In-app notification feed |

---

## ⚙️ Local Development

### 1. Prerequisites
- Node.js 18+
- A Supabase project ([supabase.com](https://supabase.com))
- A Stripe account ([stripe.com](https://stripe.com))
- A Resend account ([resend.com](https://resend.com)) *(free tier works)*

### 2. Clone & Install
```bash
git clone https://github.com/xyzError404/DigitalHeros.git
cd DigitalHeros/golf-platform
npm install
```

### 3. Environment Variables
Copy the template and fill in your values:
```bash
cp .env.local.example .env.local
```

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API Keys |
| `STRIPE_MONTHLY_PRICE_ID` | Stripe → Products → Monthly plan |
| `STRIPE_YEARLY_PRICE_ID` | Stripe → Products → Yearly plan |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks |
| `RESEND_API_KEY` | Resend → API Keys |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` locally |
| `CRON_SECRET` | Any random secure string |

### 4. Run the Database Schema
Open your Supabase project → **SQL Editor** → paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) → click **Run**.

This creates all tables, RLS policies, triggers, and seeds 5 charities.

### 5. Create Stripe Products
In your Stripe dashboard, create two products:
- **GolfGive Monthly** → Recurring · £29.99/month → copy the Price ID
- **GolfGive Yearly** → Recurring · £299/year → copy the Price ID

Add both Price IDs to `.env.local`.

### 6. Run Locally
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000)

### 7. Stripe Webhook (local testing)
Install the Stripe CLI and forward webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Copy the `whsec_...` secret it prints → set as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

---

## 🚀 Deployment (Vercel)

1. Push to GitHub
2. Connect repo to a **new Vercel account**
3. Add all environment variables from `.env.local` in Vercel → Settings → Environment Variables
4. Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL
5. Update your Stripe webhook to point to `https://your-domain.vercel.app/api/webhooks/stripe`
6. The monthly cron job runs automatically on the 1st of every month at 9am UTC (configured in `vercel.json`)

---

## 🎲 Draw Algorithm

The platform supports two draw modes, selectable per draw:

### Random
Standard lottery — 5 unique random numbers between 1–45.

### Algorithmic (Frequency-Weighted)
1. Aggregate all users' snapshotted score sets from `draw_entries`
2. Build a frequency map of how often each score value (1–45) appears
3. Apply **inverse frequency weighting** — scores that appear least often get the highest selection probability
4. This rewards rarer score patterns with a better chance of winning, incentivising varied play

> See [`services/drawService.ts`](./services/drawService.ts) for the full documented implementation.

---

## 💰 Prize Pool Structure

| Match | Prize Share | Notes |
|---|---|---|
| 5 Numbers | 40% of pool | Jackpot — rolls over if no winner |
| 4 Numbers | 35% of pool | Split equally among all 4-match winners |
| 3 Numbers | 25% of pool | Split equally among all 3-match winners |

40% of every subscription goes into the prize pool. The remainder covers charity contributions and running costs.

---

## 📁 Project Structure

```
golf-platform/
├── app/
│   ├── (public)        # /, /charities, /how-it-works, /draws, /subscribe
│   ├── login/          # Auth pages
│   ├── signup/
│   ├── dashboard/      # User portal (scores, draws, charity, winnings, notifications)
│   ├── admin/          # Admin portal (overview, users, draws, charities, winners)
│   └── api/            # All API routes
│       ├── scores/
│       ├── draws/
│       ├── subscription/
│       ├── winner/
│       ├── notifications/
│       ├── admin/
│       ├── cron/
│       └── webhooks/stripe/
├── components/
│   └── layout/         # Navbar, Footer
├── lib/
│   ├── supabase/       # browser / server / admin clients
│   ├── stripe.ts
│   └── resend.ts
├── services/
│   ├── drawService.ts        # Draw engine + snapshot logic
│   ├── scoreService.ts       # Rolling 5-score logic
│   └── subscriptionService.ts # Stripe lifecycle handlers
├── supabase/
│   └── schema.sql      # Full DB schema, RLS, triggers, seed data
├── types/
│   └── database.ts     # TypeScript interfaces for all DB entities
└── vercel.json         # Cron job configuration
```

---

## 🔒 Security

- **Subscription gating** — middleware checks subscription status on every protected API request
- **Role-based access** — admin routes verified server-side on every call
- **RLS** — Supabase Row Level Security ensures users can only read/write their own data
- **Stripe webhooks** — signature verified before any DB mutation
- **File uploads** — type (image/PDF) and size (5MB) validated server-side
- **Signed URLs** — winner proof files accessed via time-limited Supabase signed URLs

---

## 📄 Submission Info

- **Live URL**: *(add Vercel URL here after deployment)*
- **GitHub**: [https://github.com/xyzError404/DigitalHeros](https://github.com/xyzError404/DigitalHeros)
- **Test User**: *(add credentials after first signup)*
- **Admin**: *(add credentials after promoting via SQL)*

---

Built for the **Digital Heroes Full-Stack Trainee Selection** process.
