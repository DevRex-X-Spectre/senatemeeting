-- 0009_notifications.sql — in-app per-user notifications

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  kind       public.notification_kind not null,
  title      text not null,
  body       text,
  meeting_id uuid references public.meetings(id) on delete cascade,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_unread_idx
  on public.notifications (user_id, created_at desc)
  where read_at is null;

create index notifications_user_idx
  on public.notifications (user_id, created_at desc);