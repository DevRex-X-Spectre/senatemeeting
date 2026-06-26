-- 0002_profiles.sql — user profiles linked 1:1 with auth.users

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text not null,
  role        public.user_role not null default 'member',
  status      public.member_status not null default 'pending',
  title       text,
  avatar_url  text,
  approved_by uuid references public.profiles(id),
  approved_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index profiles_role_status_idx on public.profiles (role, status);

-- Auto-create profile row when a new auth.users row is inserted.
-- Default role = member, status = pending (admin must approve).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
begin
  v_full_name := coalesce(
    nullif(new.raw_user_meta_data->>'full_name', ''),
    split_part(new.email, '@', 1)
  );
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, v_full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Block non-admin changes to role/status via BEFORE UPDATE trigger.
-- Defense-in-depth alongside RLS: even service-role writes from
-- non-admin contexts cannot silently promote/suspend users.
create or replace function public.protect_profile_admin_fields()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'UPDATE') then
    if (new.role is distinct from old.role or new.status is distinct from old.status) then
      -- Only allow if app explicitly opts in via local setting (admin server actions).
      if coalesce(current_setting('app.is_admin_via_app', true), 'false') <> 'true' then
        raise exception 'Only admins may change profiles.role or profiles.status';
      end if;
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect_admin_fields
  before update on public.profiles
  for each row execute function public.protect_profile_admin_fields();