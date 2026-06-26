# UniSenate — Setup Guide

## Prerequisites

- Node.js 20+
- A Supabase project ([create one at supabase.com](https://supabase.com))
- Supabase CLI (`npm i -g supabase`) — optional, for local type generation

---

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment

Copy the example env file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Project Settings → API → `anon public` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase dashboard → Project Settings → API → `service_role` |

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` is a server-only secret. Never expose it to the browser.

## 3. Run database migrations

In the [Supabase SQL Editor](https://supabase.com/dashboard), run each migration file in order:

```
supabase/migrations/0001_enums.sql
supabase/migrations/0002_profiles.sql
supabase/migrations/0003_meetings.sql
supabase/migrations/0004_agenda_items.sql
supabase/migrations/0005_attendance.sql
supabase/migrations/0006_motions.sql
supabase/migrations/0007_votes.sql
supabase/migrations/0008_minutes.sql
supabase/migrations/0009_notifications.sql
supabase/migrations/0010_helpers.sql
supabase/migrations/0011_rls.sql
supabase/migrations/0012_realtime.sql
```

Or copy-paste all files into the SQL editor in one go.

## 4. Disable email confirmation (dev)

For local development, disable email confirmation so users activate immediately:

1. Supabase Dashboard → Authentication → Providers → Email
2. Uncheck **Confirm email**
3. Save

> For production, keep this enabled and implement `/api/auth/callback` to handle the confirmation link.

## 5. Promote your first admin

Register your account first (via `/register`), then run this SQL in the Supabase SQL editor:

```sql
-- Replace with your email
update public.profiles
  set role = 'admin', status = 'active', approved_at = now()
  where email = 'your@email.com';

update auth.users
  set raw_app_meta_data = raw_app_meta_data || '{"role":"admin","status":"active"}'::jsonb
  where email = 'your@email.com';
```

## 6. Generate TypeScript types (optional but recommended)

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

> This keeps the DB shape in sync with your migrations.

## 7. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture Overview

```
src/
├── app/           # Next.js App Router pages
│   ├── (auth)/    # Login, register, pending-approval, suspended
│   ├── (app)/     # Member pages (dashboard, meetings, history, notifications, profile)
│   ├── admin/     # Admin pages (dashboard, meetings, members)
│   └── api/       # API routes (auth callback)
├── components/
│   ├── ui/        # Design system primitives
│   ├── layout/    # Sidebar, Topbar, NotificationBell, UserMenu
│   ├── meetings/   # Meeting-specific components
│   ├── live/      # Live session components
│   ├── motions/   # Motion + voting components
│   ├── minutes/    # Minutes components
│   └── admin/     # Admin-specific components
├── hooks/         # Custom React hooks (useMeetingRealtime)
├── lib/
│   ├── supabase/  # Server, browser, middleware, admin clients
│   ├── auth/      # Auth actions + guards
│   ├── meetings/  # Meeting actions + queries
│   ├── agenda/    # Agenda item actions
│   ├── attendance/ # Attendance actions
│   ├── motions/   # Motion + voting actions
│   ├── minutes/   # Minutes generator + actions
│   ├── notifications/ # Notification actions
│   ├── dashboard/ # Dashboard queries
│   ├── validations/ # Zod schemas
│   ├── utils/     # cn(), dates, status maps
│   └── constants/ # Notification copy
├── types/         # Database types + domain types
└── middleware.ts  # Session refresh + route gating
```

## Key Supabase Patterns

| Pattern | Where used |
|---|---|
| Server client (`createServerClient`) | RSC, server actions, route handlers |
| Browser client (`createBrowserClient`) | Client components (realtime, forms) |
| Admin client (`createServiceClient`) | Cross-user mutations (approvals, notifications) |
| `@supabase/ssr` cookie helpers | Session refresh in middleware + server actions |
| JWT `app_metadata` for role/status | Middleware fast-path (no DB roundtrip per navigation) |
| Postgres Changes (Realtime) | Live session updates on agenda items, motions, votes, attendance |
| RLS policies | Auth boundary — every table has policies scoped to `auth.uid()` |
| Service-role trigger guard | `profiles.role` / `profiles.status` protected by a `BEFORE UPDATE` trigger |

## Database Schema Summary

| Table | Purpose |
|---|---|
| `profiles` | Linked 1:1 to `auth.users`. role + status. |
| `meetings` | Title, schedule, status lifecycle. |
| `agenda_items` | Per-meeting items. `carried_from_id` self-ref for carry-over. |
| `attendance` | Per-meeting check-ins. Composite PK prevents duplicates. |
| `motions` | Raised during a live agenda item. Status: raised → seconded → voting_open → passed/rejected. |
| `votes` | One row per (motion, member). Vote change allowed while open. |
| `minutes` | One row per meeting. Markdown body. |
| `minutes_acknowledgments` | Per-member ack of published minutes. |
| `notifications` | Per-user in-app notifications. |