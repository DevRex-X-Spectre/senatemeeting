-- 0016_secretary_role_enums.sql — enum additions used by later permission migration.

alter type public.user_role add value if not exists 'secretary';
alter type public.notification_kind add value if not exists 'role_changed';
