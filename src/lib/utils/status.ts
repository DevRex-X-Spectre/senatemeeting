import type { ItemStatus, MeetingStatus, MotionStatus } from "@/types/domain";

export interface StatusMeta {
  label: string;
  /** Tailwind classes for a soft-fill badge. */
  badgeClass: string;
  /** Tailwind classes for a solid dot. */
  dotClass: string;
}

const baseBadge =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold leading-none";

export const meetingStatusMeta: Record<MeetingStatus, StatusMeta> = {
  draft: {
    label: "Draft",
    badgeClass: `${baseBadge} bg-fog text-slate-blue`,
    dotClass: "bg-steel-blue",
  },
  agenda_published: {
    label: "Agenda published",
    badgeClass: `${baseBadge} bg-info-blue text-paper`,
    dotClass: "bg-info-blue",
  },
  live: {
    label: "Live",
    badgeClass: `${baseBadge} bg-signal-blue text-paper`,
    dotClass: "bg-signal-blue",
  },
  ended: {
    label: "Ended",
    badgeClass: `${baseBadge} bg-fog text-midnight-navy`,
    dotClass: "bg-slate-blue",
  },
  minutes_published: {
    label: "Completed record",
    badgeClass: `${baseBadge} bg-success-soft text-success`,
    dotClass: "bg-success",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: `${baseBadge} bg-danger-soft text-danger`,
    dotClass: "bg-danger",
  },
};

export const itemStatusMeta: Record<ItemStatus, StatusMeta> = {
  pending: {
    label: "To cover",
    badgeClass: `${baseBadge} bg-fog text-slate-blue`,
    dotClass: "bg-steel-blue",
  },
  in_progress: {
    label: "Being covered",
    badgeClass: `${baseBadge} bg-signal-blue text-paper`,
    dotClass: "bg-signal-blue",
  },
  resolved: {
    label: "Accomplished",
    badgeClass: `${baseBadge} bg-success-soft text-success`,
    dotClass: "bg-success",
  },
  deferred: {
    label: "Deferred",
    badgeClass: `${baseBadge} bg-warning-soft text-warning`,
    dotClass: "bg-warning",
  },
  tabled: {
    label: "Skipped",
    badgeClass: `${baseBadge} bg-warning-soft text-warning`,
    dotClass: "bg-warning",
  },
};

export const motionStatusMeta: Record<MotionStatus, StatusMeta> = {
  raised: {
    label: "Raised",
    badgeClass: `${baseBadge} bg-fog text-slate-blue`,
    dotClass: "bg-steel-blue",
  },
  seconded: {
    label: "Seconded",
    badgeClass: `${baseBadge} bg-info-blue text-paper`,
    dotClass: "bg-info-blue",
  },
  voting_open: {
    label: "Voting open",
    badgeClass: `${baseBadge} bg-signal-blue text-paper`,
    dotClass: "bg-signal-blue",
  },
  passed: {
    label: "Passed",
    badgeClass: `${baseBadge} bg-success-soft text-success`,
    dotClass: "bg-success",
  },
  rejected: {
    label: "Rejected",
    badgeClass: `${baseBadge} bg-danger-soft text-danger`,
    dotClass: "bg-danger",
  },
  withdrawn: {
    label: "Withdrawn",
    badgeClass: `${baseBadge} bg-fog text-slate-blue`,
    dotClass: "bg-steel-blue",
  },
};

export const VOTE_LABEL: Record<"yes" | "no" | "abstain", string> = {
  yes: "Yes",
  no: "No",
  abstain: "Abstain",
};
