"use client";

import * as React from "react";
import { useActionState } from "react";
import { approveMemberAction, suspendMemberAction } from "@/lib/auth/guards";
import { Button } from "@/components/ui";
import { CheckCircle2, ShieldOff } from "lucide-react";

export function ApproveButton({ userId, label }: { userId: string; label?: string }) {
  const [state, formAction, pending] = useActionState(approveMemberAction, null);
  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <Button
        type="submit"
        variant="primary"
        size="sm"
        loading={pending}
        className="gap-1.5"
      >
        <CheckCircle2 className="size-4" /> {label ?? "Approve"}
      </Button>
    </form>
  );
}

export function SuspendButton({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState(suspendMemberAction, null);
  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        loading={pending}
        className="gap-1.5 text-danger border-danger hover:bg-danger-soft"
      >
        <ShieldOff className="size-4" /> Suspend
      </Button>
    </form>
  );
}