# UniSenate — Senate Meeting Management System

A full-stack Next.js 16 + Supabase application for managing university senate meetings — agendas, live sessions, motions, voting, attendance, and minutes.

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript
- **Backend:** Supabase (Auth, PostgreSQL, Realtime, RLS)
- **Styling:** Tailwind CSS v4 (Calendly-style design system)
- **Validation:** Zod

## Quick Setup

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API → service_role |

### 3. Run migrations

Run all files in `supabase/migrations/` in order (0001 → 0012) in the Supabase SQL Editor.

### 4. Disable email confirmation (dev only)

Supabase Dashboard → Authentication → Providers → Email → uncheck **Confirm email**.

### 5. Promote your first admin

After registering at `/register`, run this in the SQL Editor:

```sql
update public.profiles
  set role = 'admin', status = 'active', approved_at = now()
  where email = 'your@email.com';

update auth.users
  set raw_app_meta_data = raw_app_meta_data || '{"role":"admin","status":"active"}'::jsonb
  where email = 'your@email.com';
```

### 6. Generate DB types (optional)

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

### 7. Run

```bash
npm run dev
```

---

## Features

### Admin (VC)
- Create, edit, schedule, and cancel meetings
- Build and publish agendas (drag-to-reorder items)
- Open/close agenda items during live sessions
- Open/close voting on motions; manually decide Passed/Rejected
- Auto-generate, edit, and publish meeting minutes
- View real-time quorum and attendance
- Approve/suspend senate member accounts

### Members
- View published agendas
- Check in to meetings
- Raise and withdraw motions
- Second other members' motions
- Vote Yes/No/Abstain when voting is open
- View live voting results
- Review and acknowledge published minutes
- View meeting history

### Architecture
- Route groups: `(auth)`, `(app)`, `admin`
- Server components by default; client components only where needed (forms, realtime)
- All DB mutations via server actions
- RLS enforced at the Postgres level
- Realtime via Supabase Postgres Changes on live session tables
- JWT `app_metadata` for fast middleware role/status gating
