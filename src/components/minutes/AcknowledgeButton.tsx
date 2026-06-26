"use client";

import * as React from "react";
import { useActionState } from "react";
import { acknowledgeMinutesAction } from "@/lib/minutes/generator";
import { Button } from "@/components/ui";
import { CheckCircle2 } from "lucide-react";

export function AcknowledgeButton({
  meetingId,
  alreadyAcknowledged,
}: {
  meetingId: string;
  alreadyAcknowledged: boolean;
}) {
  const [, formAction, pending] = useActionState(acknowledgeMinutesAction, null);

  if (alreadyAcknowledged) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-1.5 text-success">
        <CheckCircle2 className="size-4" /> Acknowledged
      </Button>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="meetingId" value={meetingId} />
      <Button type="submit" variant="outline" size="sm" loading={pending}>
        Acknowledge
      </Button>
    </form>
  );
}