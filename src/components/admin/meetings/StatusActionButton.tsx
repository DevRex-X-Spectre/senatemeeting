"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Modal } from "@/components/ui";
import { publishAgendaAction, startMeetingAction, endMeetingAction } from "@/lib/meetings/actions";

interface Props {
  actionType: "publishAgenda" | "startMeeting" | "endMeeting";
  meetingId: string;
  label: string;
  variant?: "primary" | "outline" | "destructive" | "ghost";
  size?: "sm" | "md";
  icon?: React.ReactNode;
  confirm?: string;
}

export function StatusActionButton({
  actionType,
  meetingId,
  label,
  variant = "outline",
  size = "sm",
  icon,
  confirm,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function run() {
    setPending(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("meetingId", meetingId);
      let result;
      if (actionType === "publishAgenda") result = await publishAgendaAction(null, fd);
      else if (actionType === "startMeeting") result = await startMeetingAction(null, fd);
      else result = await endMeetingAction(null, fd);
      if (!result.ok) {
        setError(result.error ?? "Action failed");
      } else {
        setOpen(false);
        router.refresh();
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Action failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => (confirm ? setOpen(true) : run())}
        className="gap-1.5"
      >
        {icon}
        {label}
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title={label} description={confirm}>
        <div className="flex flex-col gap-4">
          {error ? (
            <p className="rounded-md bg-danger-soft px-3 py-2 text-caption text-danger">{error}</p>
          ) : null}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={variant === "destructive" ? "destructive" : "primary"}
              loading={pending}
              onClick={run}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
