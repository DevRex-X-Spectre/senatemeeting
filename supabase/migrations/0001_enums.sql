-- 0001_enums.sql — Postgres enum types
-- Run this first; later migrations reference these types.

create type public.user_role as enum ('admin', 'member');
create type public.member_status as enum ('pending', 'active', 'suspended');
create type public.meeting_status as enum (
  'draft',
  'agenda_published',
  'live',
  'ended',
  'minutes_published',
  'cancelled'
);
create type public.item_status as enum (
  'pending',
  'in_progress',
  'resolved',
  'deferred',
  'tabled'
);
create type public.motion_status as enum (
  'raised',
  'seconded',
  'voting_open',
  'passed',
  'rejected',
  'withdrawn'
);
create type public.vote_choice as enum ('yes', 'no', 'abstain');
create type public.notification_kind as enum (
  'agenda_published',
  'meeting_starting',
  'vote_opened',
  'minutes_published',
  'motion_seconded',
  'item_resolved',
  'approval_granted',
  'approval_pending'
);