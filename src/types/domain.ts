// Domain types — re-exports from the generated database shape plus
// joined/computed types used by app code.

import type {
  ProfileRow,
  MeetingRow,
  AgendaItemRow,
  MotionRow,
  VoteRow,
  AttendanceRow,
  MinutesRow,
  MinutesAckRow,
  NotificationRow,
  RoleChangeAuditRow,
} from "./database";

export type Profile = ProfileRow;
export type Meeting = MeetingRow;
export type AgendaItem = AgendaItemRow;
export type Motion = MotionRow;
export type Vote = VoteRow;
export type Attendance = AttendanceRow;
export type Minutes = MinutesRow;
export type MinutesAck = MinutesAckRow;
export type Notification = NotificationRow;
export type RoleChangeAudit = RoleChangeAuditRow;

export type Role = ProfileRow["role"];
export type MemberStatus = ProfileRow["status"];
export type MeetingStatus = MeetingRow["status"];
export type ItemStatus = AgendaItemRow["status"];
export type MotionStatus = MotionRow["status"];
export type VoteChoice = VoteRow["choice"];
export type NotificationKind = NotificationRow["kind"];

export interface QuorumSnapshot {
  meeting_id: string;
  denominator: number;
  present: number;
  quorum_met: boolean;
}

export interface VoteTally {
  motion_id: string;
  yes: number;
  no: number;
  abstain: number;
  total: number;
  my_choice: VoteChoice | null;
}
