-- 0015_performance_indexes.sql
-- Hot-path indexes for meeting lists, agenda progress, notifications,
-- attendance/quorum, and motion lookups.

create index if not exists idx_meetings_status
  on public.meetings (status);

create index if not exists idx_meetings_scheduled_at
  on public.meetings (scheduled_at desc);

create index if not exists idx_meetings_status_scheduled_at
  on public.meetings (status, scheduled_at desc);

create index if not exists idx_agenda_items_meeting_id_order
  on public.agenda_items (meeting_id, order_index);

create index if not exists idx_agenda_items_meeting_id_status
  on public.agenda_items (meeting_id, status);

create index if not exists idx_agenda_items_status
  on public.agenda_items (status);

create index if not exists idx_notifications_user_read_created
  on public.notifications (user_id, read_at, created_at desc);

create index if not exists idx_attendance_meeting_id
  on public.attendance (meeting_id);

create index if not exists idx_attendance_user_id
  on public.attendance (user_id);

create index if not exists idx_motions_meeting_id
  on public.motions (meeting_id);

create index if not exists idx_motions_agenda_item_id
  on public.motions (agenda_item_id);

create index if not exists idx_minutes_published_at
  on public.minutes (published_at desc)
  where published_at is not null;
