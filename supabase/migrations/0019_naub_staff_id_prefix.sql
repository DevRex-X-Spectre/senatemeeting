-- 0019_naub_staff_id_prefix.sql — enforce NAUB staff-ID prefix.

update public.profiles
   set staff_id = 'NAUB-' || upper(left(id::text, 8))
 where staff_id is not null
   and public.normalize_staff_id(staff_id) not like 'NAUB%';

alter table public.profiles
  drop constraint if exists profiles_staff_id_naub_prefix;

alter table public.profiles
  add constraint profiles_staff_id_naub_prefix
  check (staff_id is null or staff_id ~ '^NAUB[-_.]?[A-Z0-9][A-Z0-9._-]*$');
