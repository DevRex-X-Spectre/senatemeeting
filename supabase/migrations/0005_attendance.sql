-- 0005_attendance.sql — per-meeting member check-ins

create table public.attendance (
  meeting_id    uuid not null references public.meetings(id) on delete cascade,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  primary key (meeting_id, user_id)
);

create index attendance_meeting_idx on public.attendance (meeting_id);
create index attendance_user_idx    on public.attendance (user_id);