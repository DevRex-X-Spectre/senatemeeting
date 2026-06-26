"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createMeetingAction } from "@/lib/meetings/actions";
import { Card, CardContent, Button, Input, Textarea } from "@/components/ui";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} loading={pending}>
      Create meeting
    </Button>
  );
}

export default function NewMeetingPage() {
  const router = useRouter();
  const [state, formAction] = useActionState(createMeetingAction, null);

  // Redirect on success.
  React.useEffect(() => {
    if (state?.ok && state.meetingId) {
      router.push(`/admin/meetings/${state.meetingId}`);
    }
  }, [state, router]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div>
        <Link href="/admin/meetings" className="mb-3 inline-flex items-center gap-1.5 text-signal-blue hover:underline">
          <ArrowLeft className="size-4" /> Back to meetings
        </Link>
        <h1 className="text-heading font-bold text-midnight-navy">Create meeting</h1>
      </div>

      <Card>
        <CardContent className="py-6">
          <form action={formAction} className="flex flex-col gap-4">
            {state?.error && (
              <p className="rounded-md bg-danger-soft px-3 py-2 text-caption text-danger">{state.error}</p>
            )}
            <Input label="Meeting title" name="title" placeholder="e.g. May 2026 Senate Session" required />
            <Textarea label="Description (optional)" name="description" placeholder="Brief description…" rows={3} />
            <Input label="Location or video link (optional)" name="location" placeholder="Room 101 or https://meet…" />
            <Input label="Date & time" name="scheduledAt" type="datetime-local" required />
            <Input label="Duration (minutes)" name="durationMin" type="number" min={5} max={480} defaultValue={60} required />
            <div className="pt-2">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}