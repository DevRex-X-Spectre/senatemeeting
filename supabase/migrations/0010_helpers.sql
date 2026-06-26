-- 0010_helpers.sql — utility functions, triggers, and the quorum view
-- Used by RLS policies, server actions, and dashboard queries.

-- updated_at touch trigger (re-used across tables)
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger meetings_touch
  before update on public.meetings
  for each row execute function public.touch_updated_at();

create trigger agenda_items_touch
  before update on public.agenda_items
  for each row execute function public.touch_updated_at();

create trigger motions_touch
  before update on public.motions
  for each row execute function public.touch_updated_at();

create trigger minutes_touch
  before update on public.minutes
  for each row execute function public.touch_updated_at();

-- Role + status lookups used in RLS. SECURITY DEFINER so policies don't recurse.
create or replace function public.current_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select status = 'active' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Active-member denominator for quorum.
create or replace function public.active_members_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int from public.profiles where status = 'active';
$$;

-- Live quorum snapshot per meeting.
create or replace view public.meeting_quorum as
select
  m.id as meeting_id,
  public.active_members_count() as denominator,
  coalesce((select count(*) from public.attendance a where a.meeting_id = m.id), 0)::int as present,
  coalesce((select count(*) from public.attendance a where a.meeting_id = m.id), 0)
    >= ceil(public.active_members_count()::numeric / 2) as quorum_met
from public.meetings m;

grant select on public.meeting_quorum to authenticated;