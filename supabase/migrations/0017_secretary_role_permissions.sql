-- 0017_secretary_role_permissions.sql — VC delegation via secretary role.
--
-- admin = VC/full authority, including role assignment.
-- secretary = operational authority for senate meetings, excluding role assignment.
-- member = normal approved senate member.

create table if not exists public.role_change_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete restrict,
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  old_role public.user_role not null,
  new_role public.user_role not null,
  created_at timestamptz not null default now()
);

create index if not exists role_change_audit_target_created_idx
  on public.role_change_audit (target_user_id, created_at desc);

create index if not exists role_change_audit_actor_created_idx
  on public.role_change_audit (actor_id, created_at desc);

alter table public.role_change_audit enable row level security;

create or replace function public.can_manage_roles()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' and status = 'active' from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.can_manage_senate()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select role in ('admin', 'secretary') and status = 'active'
      from public.profiles
      where id = auth.uid()
    ),
    false
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.can_manage_roles();
$$;

drop policy if exists role_change_audit_select_managers on public.role_change_audit;
create policy role_change_audit_select_managers
  on public.role_change_audit for select to authenticated
  using (public.can_manage_roles());

drop policy if exists profiles_select_self_or_admin on public.profiles;
drop policy if exists profiles_select_self_or_manager on public.profiles;
create policy profiles_select_self_or_manager
  on public.profiles for select to authenticated
  using (id = auth.uid() or public.can_manage_senate());

drop policy if exists profiles_admin_all on public.profiles;
drop policy if exists profiles_manager_all on public.profiles;
create policy profiles_manager_all
  on public.profiles for all to authenticated
  using (public.can_manage_senate())
  with check (public.can_manage_senate());

drop policy if exists meetings_select on public.meetings;
create policy meetings_select
  on public.meetings for select to authenticated
  using (status <> 'draft' or public.can_manage_senate());

drop policy if exists meetings_admin_write on public.meetings;
drop policy if exists meetings_manager_write on public.meetings;
create policy meetings_manager_write
  on public.meetings for all to authenticated
  using (public.can_manage_senate())
  with check (public.can_manage_senate());

drop policy if exists agenda_items_select on public.agenda_items;
create policy agenda_items_select
  on public.agenda_items for select to authenticated
  using (
    exists (
      select 1 from public.meetings m
      where m.id = agenda_items.meeting_id
        and (m.status <> 'draft' or public.can_manage_senate())
    )
  );

drop policy if exists agenda_items_admin_write on public.agenda_items;
drop policy if exists agenda_items_manager_write on public.agenda_items;
create policy agenda_items_manager_write
  on public.agenda_items for all to authenticated
  using (public.can_manage_senate())
  with check (public.can_manage_senate());

drop policy if exists attendance_select on public.attendance;
create policy attendance_select
  on public.attendance for select to authenticated
  using (
    user_id = auth.uid()
    or public.can_manage_senate()
    or exists (
      select 1 from public.meetings m
      where m.id = attendance.meeting_id and m.status in ('live','ended','minutes_published')
    )
  );

drop policy if exists attendance_admin_write on public.attendance;
drop policy if exists attendance_manager_write on public.attendance;
create policy attendance_manager_write
  on public.attendance for all to authenticated
  using (public.can_manage_senate())
  with check (public.can_manage_senate());

drop policy if exists motions_select on public.motions;
create policy motions_select
  on public.motions for select to authenticated
  using (
    public.can_manage_senate()
    or exists (
      select 1 from public.meetings m
      where m.id = motions.meeting_id and m.status <> 'draft'
    )
  );

drop policy if exists motions_admin_write on public.motions;
drop policy if exists motions_manager_write on public.motions;
create policy motions_manager_write
  on public.motions for all to authenticated
  using (public.can_manage_senate())
  with check (public.can_manage_senate());

drop policy if exists votes_select on public.votes;
create policy votes_select
  on public.votes for select to authenticated
  using (
    user_id = auth.uid()
    or public.can_manage_senate()
    or exists (
      select 1 from public.motions mo
      join public.meetings m on m.id = mo.meeting_id
      where mo.id = votes.motion_id
        and (m.status <> 'draft' or mo.status in ('voting_open','passed','rejected'))
    )
  );

drop policy if exists votes_admin_write on public.votes;
drop policy if exists votes_manager_write on public.votes;
create policy votes_manager_write
  on public.votes for all to authenticated
  using (public.can_manage_senate())
  with check (public.can_manage_senate());

drop policy if exists minutes_select on public.minutes;
create policy minutes_select
  on public.minutes for select to authenticated
  using (published_at is not null or public.can_manage_senate());

drop policy if exists minutes_admin_write on public.minutes;
drop policy if exists minutes_manager_write on public.minutes;
create policy minutes_manager_write
  on public.minutes for all to authenticated
  using (public.can_manage_senate())
  with check (public.can_manage_senate());

drop policy if exists ack_select on public.minutes_acknowledgments;
create policy ack_select
  on public.minutes_acknowledgments for select to authenticated
  using (user_id = auth.uid() or public.can_manage_senate());

drop policy if exists ack_admin_write on public.minutes_acknowledgments;
drop policy if exists ack_manager_write on public.minutes_acknowledgments;
create policy ack_manager_write
  on public.minutes_acknowledgments for all to authenticated
  using (public.can_manage_senate())
  with check (public.can_manage_senate());

drop policy if exists notifications_admin_write on public.notifications;
drop policy if exists notifications_manager_write on public.notifications;
create policy notifications_manager_write
  on public.notifications for all to authenticated
  using (public.can_manage_senate())
  with check (public.can_manage_senate());

create or replace function public.approve_member(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor_id uuid := auth.uid();
  v_target_role public.user_role;
begin
  if not public.can_manage_senate() then
    raise exception 'Senate manager access required';
  end if;

  select role into v_target_role
    from public.profiles
   where id = p_user_id;

  if v_target_role is null then
    raise exception 'Profile not found';
  end if;

  perform set_config('app.is_admin_via_app', 'true', true);

  update public.profiles
     set role = case
           when role in ('admin', 'secretary') then role
           else 'member'::public.user_role
         end,
         status = 'active',
         approved_by = v_actor_id,
         approved_at = now(),
         updated_at = now()
   where id = p_user_id;

  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
          || jsonb_build_object(
            'role',
            case when v_target_role in ('admin', 'secretary') then v_target_role::text else 'member' end,
            'status',
            'active'
          ),
         email_confirmed_at = coalesce(email_confirmed_at, now()),
         updated_at = now()
   where id = p_user_id;

  insert into public.notifications (user_id, kind, title, body)
  values (
    p_user_id,
    'approval_granted',
    'You''re approved',
    'Your account has been activated. You can now participate in meetings.'
  );
end;
$$;

create or replace function public.suspend_member(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_target_role public.user_role;
begin
  if not public.can_manage_senate() then
    raise exception 'Senate manager access required';
  end if;

  select role into v_target_role
    from public.profiles
   where id = p_user_id;

  if v_target_role is null then
    raise exception 'Profile not found';
  end if;

  if v_target_role = 'admin' then
    raise exception 'Admin accounts cannot be suspended here';
  end if;

  if v_target_role = 'secretary' and not public.can_manage_roles() then
    raise exception 'Only the VC can suspend a secretary';
  end if;

  perform set_config('app.is_admin_via_app', 'true', true);

  update public.profiles
     set status = 'suspended',
         updated_at = now()
   where id = p_user_id;

  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
          || jsonb_build_object('role', v_target_role::text, 'status', 'suspended'),
         updated_at = now()
   where id = p_user_id;
end;
$$;

create or replace function public.assign_member_role(p_user_id uuid, p_role public.user_role)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor_id uuid := auth.uid();
  v_old_role public.user_role;
  v_status public.member_status;
begin
  if not public.can_manage_roles() then
    raise exception 'Only the VC can assign roles';
  end if;

  if p_role = 'admin' then
    raise exception 'Admin role cannot be assigned from this screen';
  end if;

  select role, status into v_old_role, v_status
    from public.profiles
   where id = p_user_id;

  if v_old_role is null then
    raise exception 'Profile not found';
  end if;

  if v_old_role = 'admin' then
    raise exception 'Admin accounts cannot be changed here';
  end if;

  if v_status <> 'active' then
    raise exception 'Only active members can receive operational roles';
  end if;

  if v_old_role = p_role then
    return;
  end if;

  perform set_config('app.is_admin_via_app', 'true', true);

  update public.profiles
     set role = p_role,
         updated_at = now()
   where id = p_user_id;

  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
          || jsonb_build_object('role', p_role::text, 'status', v_status::text),
         updated_at = now()
   where id = p_user_id;

  insert into public.role_change_audit (actor_id, target_user_id, old_role, new_role)
  values (v_actor_id, p_user_id, v_old_role, p_role);

  insert into public.notifications (user_id, kind, title, body)
  values (
    p_user_id,
    'role_changed',
    'Role updated',
    case
      when p_role = 'secretary' then 'You have been assigned secretary privileges for senate meeting operations.'
      else 'Your role has been updated to senate member.'
    end
  );
end;
$$;

revoke all on function public.can_manage_roles() from public;
revoke all on function public.can_manage_senate() from public;
revoke all on function public.assign_member_role(uuid, public.user_role) from public;
grant execute on function public.can_manage_roles() to authenticated;
grant execute on function public.can_manage_senate() to authenticated;
grant execute on function public.assign_member_role(uuid, public.user_role) to authenticated;
