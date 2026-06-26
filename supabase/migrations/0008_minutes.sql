-- 0008_minutes.sql — meeting minutes (auto-generated, VC-editable, publishable)

create table public.minutes (
  meeting_id   uuid primary key references public.meetings(id) on delete cascade,
  body         text not null,
  generated_at timestamptz not null default now(),
  published_at timestamptz,
  published_by uuid references public.profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 0008b — per-member acknowledgment of published minutes
create table public.minutes_acknowledgments (
  meeting_id      uuid not null references public.meetings(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  acknowledged_at timestamptz not null default now(),
  primary key (meeting_id, user_id)
);

create index ack_meeting_idx on public.minutes_acknowledgments (meeting_id);