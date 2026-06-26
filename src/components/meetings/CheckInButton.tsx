"use client";

import * as React from "react";
import { useActionState } from "react";
import { checkInAction } from "@/lib/attendance/actions";
import { Button } from "@/components/ui";
import { CheckCircle2 } from "lucide-react";

export function CheckInButton({
  meetingId,
  alreadyCheckedIn,
}: {
  meetingId: string;
  alreadyCheckedIn: boolean;
}) {
  const [, formAction, pending] = useActionState(checkInAction, null);

  if (alreadyCheckedIn) {
    return (
      <Button variant="ghost" size="sm" disabled className="gap-1.5 text-success">
        <CheckCircle2 className="size-4" /> Checked in
      </Button>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="meetingId" value={meetingId} />
      <Button type="submit" variant="outline" size="sm" loading={pending} className="gap-1.5">
        Check in
      </Button>
    </form>
  );
}