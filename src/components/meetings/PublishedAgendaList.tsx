"use client";

import * as React from "react";
import { CheckCircle2, Circle, Clock3 } from "lucide-react";
import { useMeetingRealtime } from "@/hooks/useMeetingRealtime";
import { Card, CardContent, ItemStatusBadge } from "@/components/ui";
import type { AgendaItem } from "@/types/domain";

type Props = {
  meetingId: string;
  initialItems: AgendaItem[];
};

export function PublishedAgendaList({ meetingId, initialItems }: Props) {
  const realtimeState = useMeetingRealtime(meetingId, {
    agendaItems: initialItems,
    motions: [],
    quorum: null,
    attendance: [],
  });

  const items = React.useMemo(
    () => [...(realtimeState.agendaItems as AgendaItem[])].sort((a, b) => a.order_index - b.order_index),
    [realtimeState.agendaItems],
  );
  const accomplished = items.filter((item) => item.status === "resolved").length;
  const progressPercent = items.length ? Math.round((accomplished / items.length) * 100) : 0;

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-[14px] leading-[1.43] text-steel">The agenda checklist has not been published yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[14px] font-semibold text-graphite">Agenda progress</p>
              <p className="text-[14px] leading-[1.43] text-steel">
                {accomplished} of {items.length} agenda item{items.length === 1 ? "" : "s"} accomplished
              </p>
            </div>
            <span className="text-[20px] font-bold text-graphite">{progressPercent}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-plaster">
            <div className="h-full rounded-full bg-success transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {items.map((item, index) => {
          const isAccomplished = item.status === "resolved";
          const isDeferred = item.status === "deferred" || item.status === "tabled";

          return (
            <Card key={item.id} className={item.status === "in_progress" ? "border-graphite/30" : ""}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 gap-3">
                    <span
                      className={
                        isAccomplished
                          ? "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-success text-pure-white"
                          : isDeferred
                            ? "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning"
                            : "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-fog-border bg-plaster text-steel"
                      }
                    >
                      {isAccomplished ? (
                        <CheckCircle2 className="size-4" />
                      ) : isDeferred ? (
                        <Clock3 className="size-4" />
                      ) : (
                        <Circle className="size-3" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-steel">Item {index + 1}</span>
                        <ItemStatusBadge status={item.status} size="sm" />
                      </div>
                      <p className="mt-1 text-[16px] font-medium text-graphite">{item.title}</p>
                      {item.description ? (
                        <p className="mt-1 text-[14px] leading-[1.43] text-steel">{item.description}</p>
                      ) : null}
                      {item.outcome_notes ? (
                        <p className="mt-2 rounded-md border border-fog-border bg-plaster px-2.5 py-1.5 text-[14px] leading-[1.43] text-steel">
                          Update: {item.outcome_notes}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <span className="shrink-0 text-[14px] leading-[1.43] text-steel">{item.allocated_min} min</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
