"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { Play, Radio, ThumbsDown, ThumbsUp } from "lucide-react";
import { closeAgendaItemAction, startAgendaItemAction } from "@/lib/agenda/actions";
import { decideMotionAction, openVoteAction } from "@/lib/motions/actions";
import { useMeetingRealtime } from "@/hooks/useMeetingRealtime";
import { Badge, Button, Card, CardContent, ItemStatusBadge, MotionStatusBadge } from "@/components/ui";
import type { AgendaItem, Motion, QuorumSnapshot } from "@/types/domain";

type MotionWithPeople = Motion & {
  raised_by?: { full_name: string | null } | null;
  seconded_by?: { full_name: string | null } | null;
};

type Props = {
  meetingId: string;
  meetingTitle: string;
  initialAgendaItems: AgendaItem[];
  initialQuorum: QuorumSnapshot | null;
  initialMotions: MotionWithPeople[];
};

export function LiveAdminClient({
  meetingId,
  meetingTitle,
  initialAgendaItems,
  initialQuorum,
  initialMotions,
}: Props) {
  const realtimeState = useMeetingRealtime(meetingId, {
    agendaItems: initialAgendaItems,
    motions: initialMotions,
    quorum: initialQuorum,
    attendance: [],
  });

  const [, startItemAction] = useActionState(startAgendaItemAction, null);
  const [, closeItemAction] = useActionState(closeAgendaItemAction, null);
  const [, openVoteActionForm] = useActionState(openVoteAction, null);
  const [, decideAction] = useActionState(decideMotionAction, null);

  const items = React.useMemo(
    () => [...(realtimeState.agendaItems as AgendaItem[])].sort((a, b) => a.order_index - b.order_index),
    [realtimeState.agendaItems],
  );
  const currentItem = items.find((item) => item.status === "in_progress") ?? null;
  const allMotions = realtimeState.motions as MotionWithPeople[];
  const currentMotions = currentItem
    ? allMotions.filter((motion) => motion.agenda_item_id === currentItem.id)
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge tone="info" className="mb-2 gap-1.5">
            <Radio className="size-3 animate-pulse" /> Advanced controls
          </Badge>
          <h1 className="text-heading font-bold text-midnight-navy">{meetingTitle}</h1>
          <p className="mt-1 text-caption text-slate-blue">
            Use this page only when the meeting needs motions, votes, or formal live-session controls.
          </p>
        </div>
        <Link href={`/admin/meetings/${meetingId}`}>
          <Button variant="outline" size="sm">Back to checklist</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between py-3">
          <span className="text-[14px] font-medium text-midnight-navy">Attendance</span>
          <span className="text-[14px] text-slate-blue">
            {realtimeState.quorum?.present ?? 0} / {realtimeState.quorum?.denominator ?? 0} present
          </span>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 text-subheading font-semibold text-midnight-navy">Agenda checklist</h2>
        <div className="flex flex-col gap-3">
          {items.map((item, index) => {
            const isActive = item.status === "in_progress";

            return (
              <Card key={item.id} className={isActive ? "border-2 border-signal-blue" : ""}>
                <CardContent className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-fog text-[11px] font-bold text-slate-blue">
                      {index + 1}
                    </span>
                    <span className={`text-[14px] font-medium ${isActive ? "text-signal-blue" : "text-midnight-navy"}`}>
                      {item.title}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <ItemStatusBadge status={item.status} size="sm" />
                    {item.status === "pending" ? (
                      <form action={startItemAction}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <Button type="submit" variant="primary" size="sm" className="gap-1">
                          <Play className="size-3" /> Cover now
                        </Button>
                      </form>
                    ) : null}
                    {isActive ? (
                      <div className="flex flex-wrap gap-1.5">
                        {(["resolved", "deferred", "tabled"] as const).map((status) => (
                          <form key={status} action={closeItemAction}>
                            <input type="hidden" name="itemId" value={item.id} />
                            <input type="hidden" name="status" value={status} />
                            <Button
                              type="submit"
                              variant={status === "resolved" ? "primary" : "outline"}
                              size="sm"
                            >
                              {status === "resolved" ? "Accomplished" : status.charAt(0).toUpperCase() + status.slice(1)}
                            </Button>
                          </form>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {currentItem ? (
        <section>
          <h2 className="mb-3 text-subheading font-semibold text-midnight-navy">
            Motions on &quot;{currentItem.title}&quot;
          </h2>
          {currentMotions.length === 0 ? (
            <p className="text-caption text-slate-blue">No motions raised yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {currentMotions.map((motion) => (
                <Card key={motion.id}>
                  <CardContent className="py-4">
                    <p className="mb-2 text-[14px] font-medium text-midnight-navy">{motion.text}</p>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="text-caption text-slate-blue">
                        Raised by {motion.raised_by?.full_name ?? "Unknown"}
                      </span>
                      {motion.seconded_by ? (
                        <span className="text-caption text-slate-blue">
                          · Seconded by {motion.seconded_by.full_name ?? "Unknown"}
                        </span>
                      ) : null}
                      <MotionStatusBadge status={motion.status} size="sm" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {motion.status === "raised" ? (
                        <form action={openVoteActionForm}>
                          <input type="hidden" name="motionId" value={motion.id} />
                          <Button type="submit" variant="primary" size="sm">
                            Open vote
                          </Button>
                        </form>
                      ) : null}
                      {motion.status === "voting_open" ? (
                        <div className="flex gap-2">
                          <form action={decideAction}>
                            <input type="hidden" name="motionId" value={motion.id} />
                            <input type="hidden" name="outcome" value="passed" />
                            <Button type="submit" variant="primary" size="sm" className="gap-1.5 !bg-success hover:!bg-success/90">
                              <ThumbsUp className="size-4" /> Passed
                            </Button>
                          </form>
                          <form action={decideAction}>
                            <input type="hidden" name="motionId" value={motion.id} />
                            <input type="hidden" name="outcome" value="rejected" />
                            <Button type="submit" variant="destructive" size="sm" className="gap-1.5">
                              <ThumbsDown className="size-4" /> Rejected
                            </Button>
                          </form>
                        </div>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
