"use client";

import * as React from "react";
import { useActionState } from "react";
import { markAllNotificationsReadAction } from "@/lib/notifications/actions";
import { Button } from "@/components/ui";

export function MarkAllReadButton() {
  const [, formAction, pending] = useActionState(markAllNotificationsReadAction, null);
  return (
    <form action={formAction}>
      <Button type="submit" variant="outline" size="sm" loading={pending}>
        Mark all as read
      </Button>
    </form>
  );
}