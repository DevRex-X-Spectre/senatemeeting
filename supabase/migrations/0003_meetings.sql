-- 0003_meetings.sql — meetings table

create table public.meetings (
  id                   uuid primary key default gen_random_uuid(),
  title                text not null,
  description          text,
  location             text,
  scheduled_at         timestamptz not null,
  duration_min         integer not null default 60 check (duration_min > 0),
  status               public.meeting_status not null default 'draft',
  created_by           uuid not null references public.profiles(id),
  agenda_published_at  timestamptz,
  started_at           timestamptz,
  ended_at             timestamptz,
  minutes_published_at timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index meetings_scheduled_idx on public.meetings (scheduled_at desc);
create index meetings_status_idx     on public.meetings (status);
create index meetings_created_by_idx on public.meetings (created_by);