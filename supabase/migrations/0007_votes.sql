-- 0007_votes.sql — individual votes on motions (one vote per user per motion)

create table public.votes (
  motion_id uuid not null references public.motions(id) on delete cascade,
  user_id   uuid not null references public.profiles(id) on delete cascade,
  choice    public.vote_choice not null,
  voted_at  timestamptz not null default now(),
  primary key (motion_id, user_id)
);

create index votes_motion_idx on public.votes (motion_id);