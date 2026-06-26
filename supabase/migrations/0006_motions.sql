-- 0006_motions.sql — motions raised during a live agenda item

create table public.motions (
  id             uuid primary key default gen_random_uuid(),
  meeting_id     uuid not null references public.meetings(id) on delete cascade,
  agenda_item_id uuid not null references public.agenda_items(id) on delete cascade,
  raised_by      uuid not null references public.profiles(id),
  seconded_by    uuid references public.profiles(id),
  text           text not null,
  status         public.motion_status not null default 'raised',
  opened_at      timestamptz,
  closed_at      timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index motions_item_idx    on public.motions (agenda_item_id, created_at);
create index motions_meeting_idx on public.motions (meeting_id, created_at);
create index motions_status_idx  on public.motions (status);