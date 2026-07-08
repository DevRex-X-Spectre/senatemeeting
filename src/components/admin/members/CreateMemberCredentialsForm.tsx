"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createMemberCredentialsAction } from "@/lib/auth/actions";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/components/ui";
import { KeyRound, RefreshCw, UserPlus } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} disabled={pending} className="w-full gap-2 sm:w-auto">
      <UserPlus className="size-4" /> Create credentials
    </Button>
  );
}

export function CreateMemberCredentialsForm() {
  const [state, formAction] = useActionState(createMemberCredentialsAction, null);
  const [staffId, setStaffId] = React.useState("NAUB-");
  const [password, setPassword] = React.useState("");

  function handleStaffIdChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value.toUpperCase().replace(/\s+/g, "");
    setStaffId(value.startsWith("NAUB") ? value : `NAUB-${value.replace(/^[-_.]+/, "")}`);
  }

  function generatePassword() {
    const base = staffId.replace(/[^A-Z0-9]/g, "").slice(0, 7) || "NAUB";
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = new Uint32Array(3);
    window.crypto.getRandomValues(bytes);
    const suffix = Array.from(bytes, (value) => alphabet[value % alphabet.length]).join("");
    setPassword(`${base}${suffix}`.slice(0, 10));
  }

  return (
    <Card className="border-l-4 border-l-signal-blue">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-plaster text-graphite">
            <KeyRound className="size-5" />
          </span>
          <div>
            <CardTitle>Create member login</CardTitle>
            <p className="mt-1 text-[14px] leading-[1.43] text-steel">
              Generate a staff ID and temporary password for a senate member.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {state?.ok ? (
            <p className="rounded-lg border border-success/10 bg-success-soft px-3 py-2 text-[14px] text-success">
              Member credentials created. Share the staff ID and temporary password securely.
            </p>
          ) : null}
          {state?.error ? (
            <p className="rounded-lg border border-danger/10 bg-danger-soft px-3 py-2 text-[14px] text-danger">
              {state.error}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Full name"
              name="fullName"
              placeholder="Professor Jane Smith"
              autoComplete="off"
              required
              error={state?.errors?.fullName?.[0]}
            />
            <Input
              label="Staff ID"
              name="staffId"
              value={staffId}
              onChange={handleStaffIdChange}
              placeholder="NAUB-001"
              autoComplete="off"
              required
              error={state?.errors?.staffId?.[0]}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Temporary password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              required
              error={state?.errors?.password?.[0]}
            />
            <Input
              label="Title (optional)"
              name="title"
              placeholder="Dean, Faculty of Science"
              autoComplete="off"
              error={state?.errors?.title?.[0]}
            />
          </div>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              onClick={generatePassword}
              className="w-full gap-2 sm:w-auto"
            >
              <RefreshCw className="size-4" /> Generate password
            </Button>
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
