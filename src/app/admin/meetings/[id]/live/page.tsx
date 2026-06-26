"use client";

import * as React from "react";
import { useActionState } from "react";
import { useMeetingRealtime } from "@/hooks/useMeetingRealtime";
import { getMeeting, getAgendaItems, getQuorum } from "@/lib/meetings/queries";
import { getMotionsForMeeting } from "@/lib/motions/actions";
import {
  Card, CardContent, Button, Badge, ItemStatusBadge, MotionStatusBadge,
} from "@/components/ui";
import { Play, ThumbsUp, ThumbsDown, Radio } from "lucide-react";
import Link from "next/link";

export default function LiveAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params) as { id: string };
  const meetingId = resolvedParams.id;

  const meetingRef = React.useRef<any>(null);
  const agendaItemsRef = React.useRef<any[]>([]);
  const quorumRef = React.useRef<any>(null);
  const motionsRef = React.useRef<any[]>([]);
  const [, setRefresh] = React.useState(0);

  React.useEffect(() => {
    Promise.all([
      getMeeting(meetingId),
      getAgendaItems(meetingId),
      getQuorum(meetingId),
      getMotionsForMeeting(meetingId),
    ]).then(([m, ai, q, mo]) => {
      meetingRef.current = m;
      agendaItemsRef.current = (ai ?? []) as any[];
      quorumRef.current = q;
      motionsRef.current = (mo ?? []) as any[];
      setRefresh((r) => r + 1);
    });
  }, [meetingId]);

  const realtimeState = useMeetingRealtime(meetingId, {
    agendaItems: agendaItemsRef.current,
    motions: motionsRef.current,
    quorum: quorumRef.current,
    attendance: [],
  });

  const [, startItemAction] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const { startAgendaItemAction } = await import("@/lib/agenda/actions");
      return startAgendaItemAction(_prev, formData);
    },
    null,
  );

  const [, closeItemAction] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const { closeAgendaItemAction } = await import("@/lib/agenda/actions");
      return closeAgendaItemAction(_prev, formData);
    },
    null,
  );

  const [, openVoteAction2] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const { openVoteAction } = await import("@/lib/motions/actions");
      return openVoteAction(_prev, formData);
    },
    null,
  );

  const [, decideAction] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      const { decideMotionAction } = await import("@/lib/motions/actions");
      return decideMotionAction(_prev, formData);
    },
    null,
  );

  const m: any = meetingRef.current ?? {};
  const items: any[] = realtimeState.agendaItems.length
    ? realtimeState.agendaItems
    : (agendaItemsRef.current ?? []);
  const currentItem = items.find((i) => i.status === "in_progress") ?? null;
  const allMotions: any[] = realtimeState.motions.length
    ? realtimeState.motions
    : (motionsRef.current ?? []);
  const currentMotions = currentItem
    ? allMotions.filter((mo: any) => mo.agenda_item_id === currentItem.id)
    : [];

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex items-start justify-between">
        <div>
          <Badge tone="info" className="mb-2 gap-1.5">
            <Radio className="size-3 animate-pulse" /> Live controls
          </Badge>
          <h1 className="text-heading font-bold text-midnight-navy">
            {m?.title ?? "Live session"}
          </h1>
        </div>
        <Link href={`/admin/meetings/${meetingId}`}>
          <Button variant="outline" size="sm">Back to meeting</Button>
        </Link>
      </div>

      {/* Quorum */}
      <Card>
        <CardContent className="flex items-center justify-between py-3">
          <span className="text-[14px] font-medium text-midnight-navy">Attendance</span>
          <span className="text-[14px] text-slate-blue">
            {realtimeState.quorum?.present ?? quorumRef.current?.present ?? 0} /{" "}
            {realtimeState.quorum?.denominator ?? quorumRef.current?.denominator ?? 0} present
          </span>
        </CardContent>
      </Card>

      {/* Agenda item controls */}
      <section>
        <h2 className="mb-3 text-subheading font-semibold text-midnight-navy">Agenda items</h2>
        <div className="flex flex-col gap-3">
          {items.map((item: any, i: number) => {
            const isActive = item.status === "in_progress";
            return (
              <Card key={item.id} className={isActive ? "border-signal-blue border-2" : ""}>
                <CardContent className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-fog text-[11px] font-bold text-slate-blue">
                      {i + 1}
                    </span>
                    <span className={`text-[14px] font-medium ${isActive ? "text-signal-blue" : "text-midnight-navy"}`}>
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ItemStatusBadge status={item.status as any} size="sm" />
                    {item.status === "pending" && (
                      <form action={startItemAction}>
                        <input type="hidden" name="itemId" value={item.id} />
                        <Button type="submit" variant="primary" size="sm" className="gap-1">
                          <Play className="size-3" /> Open
                        </Button>
                      </form>
                    )}
                    {isActive && (
                      <div className="flex gap-1.5">
                        {(["resolved", "deferred", "tabled"] as const).map((s) => (
                          <form key={s} action={closeItemAction}>
                            <input type="hidden" name="itemId" value={item.id} />
                            <input type="hidden" name="status" value={s} />
                            <Button
                              type="submit"
                              variant={s === "resolved" ? "primary" : "outline"}
                              size="sm"
                            >
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </Button>
                          </form>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Motion controls */}
      {currentItem && (
        <section>
          <h2 className="mb-3 text-subheading font-semibold text-midnight-navy">
            Motions on &quot;{currentItem.title}&quot;
          </h2>
          {currentMotions.length === 0 ? (
            <p className="text-caption text-slate-blue">No motions raised yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {currentMotions.map((motion: any) => (
                <Card key={motion.id}>
                  <CardContent className="py-4">
                    <p className="mb-2 text-[14px] font-medium text-midnight-navy">{motion.text}</p>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="text-caption text-slate-blue">
                        Raised by {motion.raised_by?.full_name}
                      </span>
                      {motion.seconded_by ? (
                        <span className="text-caption text-slate-blue">
                          · Seconded by {motion.seconded_by?.full_name}
                        </span>
                      ) : null}
                      <MotionStatusBadge status={motion.status as any} size="sm" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {motion.status === "raised" && (
                        <form action={openVoteAction2}>
                          <input type="hidden" name="motionId" value={motion.id} />
                          <Button type="submit" variant="primary" size="sm">
                            Open vote
                          </Button>
                        </form>
                      )}
                      {motion.status === "voting_open" && (
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
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}