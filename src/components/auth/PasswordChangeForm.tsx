"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changePasswordAction } from "@/lib/auth/actions";
import { Button, Input } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} disabled={pending}>
      Change password
    </Button>
  );
}

export function PasswordChangeForm() {
  const [state, formAction] = useActionState(changePasswordAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state?.error ? (
        <p className="rounded-lg border border-danger/10 bg-danger-soft px-3 py-2 text-caption text-danger">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="rounded-lg border border-success/10 bg-success-soft px-3 py-2 text-caption text-success">
          Password changed successfully.
        </p>
      ) : null}
      <Input
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
        error={state?.errors?.currentPassword?.[0]}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          error={state?.errors?.newPassword?.[0]}
        />
        <Input
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          error={state?.errors?.confirmPassword?.[0]}
        />
      </div>
      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
