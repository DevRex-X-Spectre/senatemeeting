-- 0011_rls.sql — Row Level Security policies
-- Pattern: enable RLS on every table; policies split admin vs member.
-- Helper functions (is_admin, is_active_member) live in 0010_helpers.sql.

-- ============================================================
-- profiles
-- ============================================================
alter table public.profiles enable row level security;

create policy profiles_select_self_or_admin
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy profiles_update_self
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy profiles_admin_all
  on public.profiles for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- meetings
-- ============================================================
alter table public.meetings enable row level security;

create policy meetings_select
  on public.meetings for select to authenticated
  using (status <> 'draft' or public.is_admin());

create policy meetings_admin_write
  on public.meetings for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- agenda_items
-- ============================================================
alter table public.agenda_items enable row level security;

create policy agenda_items_select
  on public.agenda_items for select to authenticated
  using (
    exists (
      select 1 from public.meetings m
      where m.id = agenda_items.meeting_id
        and (m.status <> 'draft' or public.is_admin())
    )
  );

create policy agenda_items_admin_write
  on public.agenda_items for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- attendance
-- ============================================================
alter table public.attendance enable row level security;

create policy attendance_select
  on public.attendance for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.meetings m
      where m.id = attendance.meeting_id and m.status in ('live','ended','minutes_published')
    )
  );

create policy attendance_insert_self
  on public.attendance for insert to authenticated
  with check (user_id = auth.uid() and public.is_active_member());

create policy attendance_admin_write
  on public.attendance for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- motions
-- ============================================================
alter table public.motions enable row level security;

create policy motions_select
  on public.motions for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.meetings m
      where m.id = motions.meeting_id and m.status <> 'draft'
    )
  );

-- Members can raise a motion only on a live meeting, in_progress item, own row.
create policy motions_insert
  on public.motions for insert to authenticated
  with check (
    raised_by = auth.uid()
    and public.is_active_member()
    and exists (
      select 1 from public.meetings m
      where m.id = motions.meeting_id and m.status = 'live'
    )
    and exists (
      select 1 from public.agenda_items ai
      where ai.id = motions.agenda_item_id
        and ai.meeting_id = motions.meeting_id
        and ai.status = 'in_progress'
    )
  );

-- Members can second a motion (set seconded_by to themselves) if status='raised'
-- and they didn't raise it.
create policy motions_second
  on public.motions for update to authenticated
  using (
    status = 'raised'
    and seconded_by is null
    and raised_by <> auth.uid()
    and public.is_active_member()
  )
  with check (seconded_by = auth.uid());

-- Raiser can withdraw before vote opens.
create policy motions_withdraw
  on public.motions for update to authenticated
  using (
    raised_by = auth.uid()
    and status in ('raised','seconded')
  )
  with check (status = 'withdrawn');

create policy motions_admin_write
  on public.motions for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- votes
-- ============================================================
alter table public.votes enable row level security;

create policy votes_select
  on public.votes for select to authenticated
  using (
    user_id = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.motions mo
      join public.meetings m on m.id = mo.meeting_id
      where mo.id = votes.motion_id
        and (m.status <> 'draft' or mo.status in ('voting_open','passed','rejected'))
    )
  );

create policy votes_insert_own
  on public.votes for insert to authenticated
  with check (
    user_id = auth.uid()
    and public.is_active_member()
    and exists (
      select 1 from public.motions mo
      where mo.id = votes.motion_id and mo.status = 'voting_open'
    )
  );

-- Members may change their vote while voting is open.
create policy votes_update_own
  on public.votes for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy votes_admin_write
  on public.votes for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- minutes
-- ============================================================
alter table public.minutes enable row level security;

create policy minutes_select
  on public.minutes for select to authenticated
  using (published_at is not null or public.is_admin());

create policy minutes_admin_write
  on public.minutes for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- minutes_acknowledgments
-- ============================================================
alter table public.minutes_acknowledgments enable row level security;

create policy ack_select
  on public.minutes_acknowledgments for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy ack_insert_own
  on public.minutes_acknowledgments for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.minutes mn
      where mn.meeting_id = minutes_acknowledgments.meeting_id
        and mn.published_at is not null
    )
  );

create policy ack_admin_write
  on public.minutes_acknowledgments for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- notifications
-- ============================================================
alter table public.notifications enable row level security;

create policy notifications_select_own
  on public.notifications for select to authenticated
  using (user_id = auth.uid());

create policy notifications_update_own
  on public.notifications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy notifications_admin_write
  on public.notifications for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());