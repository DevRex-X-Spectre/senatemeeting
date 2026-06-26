-- 0004_agenda_items.sql — agenda items per meeting

create table public.agenda_items (
  id              uuid primary key default gen_random_uuid(),
  meeting_id      uuid not null references public.meetings(id) on delete cascade,
  title           text not null,
  description     text,
  allocated_min   integer not null default 10 check (allocated_min > 0),
  order_index     integer not null,
  status          public.item_status not null default 'pending',
  outcome_notes   text,
  carried_from_id uuid references public.agenda_items(id),
  started_at      timestamptz,
  ended_at        timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (meeting_id, order_index)
);

create index agenda_items_meeting_idx on public.agenda_items (meeting_id, order_index);
create index agenda_items_status_idx  on public.agenda_items (status);
create index agenda_items_carried_idx on public.agenda_items (carried_from_id)
  where carried_from_id is not null;

-- Only one in_progress item per meeting at a time.
create unique index agenda_items_one_in_progress
  on public.agenda_items (meeting_id) where status = 'in_progress';