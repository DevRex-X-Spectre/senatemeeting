-- 0018_staff_id_member_credentials.sql — staff-ID login support for senate members.
--
-- VC/admin accounts can keep normal email login.
-- Member and secretary accounts use staff_id + password in the app, backed by
-- Supabase Auth with an internal email address.

alter table public.profiles
  add column if not exists staff_id text;

create unique index if not exists profiles_staff_id_unique_idx
  on public.profiles (lower(staff_id))
  where staff_id is not null;

create or replace function public.normalize_staff_id(p_staff_id text)
returns text
language sql
immutable
as $$
  select nullif(upper(regexp_replace(trim(coalesce(p_staff_id, '')), '\s+', '', 'g')), '');
$$;

create or replace function public.internal_member_email(p_staff_id text)
returns text
language sql
immutable
as $$
  select lower(public.normalize_staff_id(p_staff_id)) || '@members.unisenate.local';
$$;

-- Keep any staff IDs stored by app actions normalized.
create or replace function public.normalize_profile_staff_id()
returns trigger
language plpgsql
as $$
begin
  new.staff_id := public.normalize_staff_id(new.staff_id);
  return new;
end;
$$;

drop trigger if exists profiles_normalize_staff_id on public.profiles;
create trigger profiles_normalize_staff_id
  before insert or update of staff_id on public.profiles
  for each row execute function public.normalize_profile_staff_id();

-- Existing non-admin members may not have a staff ID yet. Give them a stable
-- placeholder based on their profile id so the new unique constraint is usable.
update public.profiles
   set staff_id = 'MEM-' || upper(left(id::text, 8))
 where staff_id is null
   and role <> 'admin';

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_full_name text;
  v_staff_id text;
begin
  v_full_name := coalesce(
    nullif(new.raw_user_meta_data->>'full_name', ''),
    nullif(new.raw_user_meta_data->>'name', ''),
    split_part(new.email, '@', 1)
  );

  v_staff_id := public.normalize_staff_id(new.raw_user_meta_data->>'staff_id');

  insert into public.profiles (id, email, full_name, staff_id)
  values (new.id, new.email, v_full_name, v_staff_id)
  on conflict (id) do nothing;

  return new;
end;
$$;
