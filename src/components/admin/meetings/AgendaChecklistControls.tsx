"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, RotateCcw } from "lucide-react";
import { updateAgendaItemStatusAction } from "@/lib/agenda/actions";
import { Badge, Button, Card, CardContent, ItemStatusBadge } from "@/components/ui";
import type { AgendaItem, ItemStatus, MeetingStatus } from "@/types/domain";

type Props = {
  meetingStatus: MeetingStatus;
  initialItems: AgendaItem[];
};

type ActionResult = {
  ok?: boolean;
  error?: string;
};

export function AgendaChecklistControls({ meetingStatus, initialItems }: Props) {
  const router = useRouter();
  const [items, setItems] = React.useState(initialItems);
  const [pendingAction, setPendingAction] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const canTrackProgress = meetingStatus === "agenda_published" || meetingStatus === "live" || meetingStatus === "ended";
  const accomplishedCount = items.filter((item) => item.status === "resolved").length;
  const progressText = `${accomplishedCount} of ${items.length} agenda item${items.length === 1 ? "" : "s"} accomplished`;

  async function setAgendaStatus(itemId: string, status: ItemStatus) {
    const actionKey = `${itemId}:${status}`;
    setPendingAction(actionKey);
    setError(null);

    const formData = new FormData();
    formData.set("itemId", itemId);
    formData.set("status", status);

    try {
      const result = (await updateAgendaItemStatusAction(null, formData)) as ActionResult;
      if (!result.ok) {
        setError(result.error ?? "Could not update the agenda item.");
        return;
      }

      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status,
                ended_at: status === "resolved" || status === "deferred" || status === "tabled" ? new Date().toISOString() : null,
              }
            : item,
        ),
      );
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not update the agenda item.");
    } finally {
      setPendingAction(null);
    }
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-caption text-slate-blue">No agenda checklist items have been added yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-lg border border-mist-border bg-paper px-4 py-3 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-steel-blue">Agenda checklist</p>
          <p className="text-[15px] font-medium text-midnight-navy">{progressText}</p>
        </div>
        <Badge tone={accomplishedCount === items.length ? "success" : "info"} size="sm">
          {canTrackProgress ? "VC progress tracking" : "Prepare before publishing"}
        </Badge>
      </div>

      {error ? (
        <p className="rounded-md border border-danger/20 bg-danger-soft px-3 py-2 text-caption text-danger">{error}</p>
      ) : null}

      <div className="flex flex-col gap-3">
        {items.map((item, index) => {
          const isAccomplished = item.status === "resolved";
          const isDeferred = item.status === "deferred" || item.status === "tabled";

          return (
            <Card key={item.id} className={isAccomplished ? "border-success/30 bg-success-soft/20" : ""}>
              <CardContent className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <span
                    className={
                      isAccomplished
                        ? "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-success text-paper"
                        : "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-mist-border bg-fog text-[12px] font-bold text-slate-blue"
                    }
                  >
                    {isAccomplished ? <CheckCircle2 className="size-4" /> : index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-midnight-navy">{item.title}</p>
                    {item.description ? (
                      <p className="mt-1 text-[13px] leading-[1.45] text-slate-blue">{item.description}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <ItemStatusBadge status={item.status} size="sm" />
                      <span className="text-caption text-slate-blue">{item.allocated_min} min</span>
                    </div>
                  </div>
                </div>

                {canTrackProgress ? (
                  <div className="flex flex-col gap-2 sm:min-w-[220px]">
                    {isAccomplished || isDeferred ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        loading={pendingAction === `${item.id}:pending`}
                        onClick={() => setAgendaStatus(item.id, "pending")}
                      >
                        <RotateCcw className="size-4" /> Mark as not done
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        className="gap-1.5"
                        loading={pendingAction === `${item.id}:resolved`}
                        onClick={() => setAgendaStatus(item.id, "resolved")}
                      >
                        <CheckCircle2 className="size-4" /> Mark accomplished
                      </Button>
                    )}
                    {!isAccomplished && !isDeferred ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        loading={pendingAction === `${item.id}:deferred`}
                        onClick={() => setAgendaStatus(item.id, "deferred")}
                      >
                        <Clock3 className="size-4" /> Defer
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
