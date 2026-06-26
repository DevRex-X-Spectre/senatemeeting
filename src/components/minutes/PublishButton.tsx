"use client";

import * as React from "react";
import { useActionState } from "react";
import { publishMinutesAction } from "@/lib/minutes/generator";
import { Button } from "@/components/ui";
import { Send } from "lucide-react";

export function PublishButton({ meetingId, disabled }: { meetingId: string; disabled?: boolean }) {
  const [, formAction, pending] = useActionState(publishMinutesAction, null);

  return (
    <form action={formAction}>
      <input type="hidden" name="meetingId" value={meetingId} />
      <Button type="submit" size="sm" disabled={disabled} loading={pending} className="gap-1.5">
        <Send className="size-4" /> Publish minutes
      </Button>
    </form>
  );
}