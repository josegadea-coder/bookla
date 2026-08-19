# Bookin

Lab equipment booking for multi-lab institutions. Web app, responsive for mobile and desktop, first-come-first-served scheduling with database-level conflict prevention.

## Stack

- **Next.js 14** (App Router) — frontend, responsive by default
- **Supabase** — Postgres database, auth, and realtime updates
- **Tailwind CSS** — styling

## 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase dashboard, go to **SQL Editor** and run the contents of `supabase/schema.sql`. This creates all tables, the booking-conflict-prevention constraint, and Row Level Security policies.
3. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**.

## 2. Configure the app

```bash
cp .env.local.example .env.local
```

Fill in the two values from step 1.

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up for an account — this creates your `profiles` row automatically.

## 4. Make yourself an admin

By default every new signup is a `member`. To manage equipment, promote yourself in the Supabase **Table Editor** (`profiles` table) or via SQL:

```sql
update profiles set role = 'super_admin' where email = 'you@institution.edu';
```

Also assign yourself (and other users) to a `lab_id` from the `labs` table if you want lab-specific admin scoping later — v1 ships with institution-wide equipment visibility and simple role-based admin access.

## 5. Add equipment

Go to `/admin` and add your first pieces of equipment. Each one gets a day-by-day booking calendar automatically.

## 6. Deploy

- **Frontend:** push to GitHub, import into [Vercel](https://vercel.com), add the two env vars in Vercel's project settings.
- **Backend:** nothing to deploy — Supabase is already hosted.

## How booking conflicts are prevented

Two people can never double-book the same equipment for overlapping times, even if they click "Confirm" at the exact same moment. This isn't handled in app code — it's enforced directly in Postgres via an `exclude` constraint on the `bookings` table (see `supabase/schema.sql`). If a race condition happens, the second insert fails at the database level and the app shows "That slot was just booked by someone else."

## What's included in this v1

- Email/password auth (Supabase Auth — swap in SSO/institutional login later if needed)
- Equipment browse page, grouped by lab, with live status (available / in use / maintenance)
- Day-view calendar per equipment item, 30-minute slots, click to book
- Realtime updates — if someone else books a slot while you're looking at the calendar, it updates live
- "My bookings" page with cancel
- Admin panel to add equipment and toggle status (active / maintenance / retired)

## Natural next steps (not built yet)

- Recurring bookings
- Email/push reminders before a booking starts
- Usage reports / CSV export for admins
- Per-lab visibility restrictions (currently equipment is visible institution-wide)
- Equipment blackout windows in the admin UI (the `equipment_blackouts` table exists in the schema but has no UI yet)
