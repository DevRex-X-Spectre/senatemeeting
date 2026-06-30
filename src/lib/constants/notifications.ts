import type { NotificationKind } from "@/types/domain";

export interface NotificationCopy {
  title: string;
  body: string;
}

export const notificationCopy: Record<NotificationKind, NotificationCopy> = {
  agenda_published: {
    title: "Agenda published",
    body: "The agenda for an upcoming meeting is ready to review.",
  },
  meeting_starting: {
    title: "Meeting is live",
    body: "The meeting has started, check in and join.",
  },
  vote_opened: {
    title: "Vote opened",
    body: "A motion is open for voting. Cast your vote now.",
  },
  minutes_published: {
    title: "Minutes published",
    body: "Meeting minutes are ready to review and acknowledge.",
  },
  motion_seconded: {
    title: "Motion seconded",
    body: "A motion has been seconded and will move to vote.",
  },
  item_resolved: {
    title: "Item resolved",
    body: "An agenda item has been marked resolved.",
  },
  approval_granted: {
    title: "You are approved",
    body: "Welcome aboard, you can now participate in meetings.",
  },
  approval_pending: {
    title: "Account under review",
    body: "Your account is awaiting administrator approval.",
  },
};
