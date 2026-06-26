"use client";

import * as React from "react";
import { useActionState } from "react";
import { raiseMotionAction } from "@/lib/motions/actions";
import { Button, Textarea } from "@/components/ui";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending} loading={pending}>Raise motion</Button>;
}

export function RaiseMotionForm({ agendaItemId, disabled }: { agendaItemId: string; disabled?: boolean }) {
  const [state, formAction] = useActionState(raiseMotionAction, null);
  const [text, setText] = React.useState("");

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="agendaItemId" value={agendaItemId} />
      <Textarea
        name="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="I move that…"
        rows={2}
        maxLength={500}
        disabled={disabled}
        error={state?.errors?.text?.[0]}
      />
      {state?.error ? <p className="text-caption text-danger">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}