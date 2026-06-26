-- 0012_realtime.sql — enable Realtime publication for live-session tables
-- This makes Postgres Changes available on these tables for the live UI.

-- Drop and re-add to keep idempotent.
do $$
begin
  begin alter publication supabase_realtime drop table public.agenda_items;
  exception when others then null;
  end;
  begin alter publication supabase_realtime drop table public.motions;
  exception when others then null;
  end;
  begin alter publication supabase_realtime drop table public.votes;
  exception when others then null;
  end;
  begin alter publication supabase_realtime drop table public.attendance;
  exception when others then null;
  end;
  begin alter publication supabase_realtime drop table public.notifications;
  exception when others then null;
  end;
  begin alter publication supabase_realtime drop table public.meetings;
  exception when others then null;
  end;
end $$;

alter publication supabase_realtime add table public.agenda_items;
alter publication supabase_realtime add table public.motions;
alter publication supabase_realtime add table public.votes;
alter publication supabase_realtime add table public.attendance;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.meetings;

-- For richer UPDATE payloads (old + new row), enable REPLICA IDENTITY FULL.
alter table public.agenda_items replica identity full;
alter table public.motions     replica identity full;
alter table public.votes       replica identity full;
alter table public.attendance  replica identity full;
alter table public.meetings    replica identity full;