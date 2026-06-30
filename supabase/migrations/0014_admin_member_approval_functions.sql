-- 0014_admin_member_approval_functions.sql — admin-only member approval helpers.
--
-- Normal registrations stay `member/pending` through 0002_profiles.sql.
-- These functions are the controlled path for admins to approve or suspend users.

create or replace function public.approve_member(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_admin_id uuid := auth.uid();
begin
  if not exists (
    select 1
      from public.profiles
     where id = v_admin_id
       and role = 'admin'
       and status = 'active'
  ) then
    raise exception 'Admin access required';
  end if;

  if not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'Profile not found';
  end if;

  perform set_config('app.is_admin_via_app', 'true', true);

  update public.profiles
     set role = case when role = 'admin' then 'admin'::public.user_role else 'member'::public.user_role end,
         status = 'active',
         approved_by = v_admin_id,
         approved_at = now(),
         updated_at = now()
   where id = p_user_id;

  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
          || '{"role":"member","status":"active"}'::jsonb,
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
  v_admin_id uuid := auth.uid();
begin
  if not exists (
    select 1
      from public.profiles
     where id = v_admin_id
       and role = 'admin'
       and status = 'active'
  ) then
    raise exception 'Admin access required';
  end if;

  if exists (select 1 from public.profiles where id = p_user_id and role = 'admin') then
    raise exception 'Admin accounts cannot be suspended here';
  end if;

  perform set_config('app.is_admin_via_app', 'true', true);

  update public.profiles
     set status = 'suspended',
         updated_at = now()
   where id = p_user_id;

  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
          || '{"role":"member","status":"suspended"}'::jsonb,
         updated_at = now()
   where id = p_user_id;
end;
$$;

revoke all on function public.approve_member(uuid) from public;
revoke all on function public.suspend_member(uuid) from public;
grant execute on function public.approve_member(uuid) to authenticated;
grant execute on function public.suspend_member(uuid) to authenticated;
