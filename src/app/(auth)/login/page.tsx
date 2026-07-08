"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/lib/auth/actions";
import { Card, CardContent, Button, Input } from "@/components/ui";
import { ArrowLeft, ShieldCheck } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth disabled={pending} loading={pending} className="gap-2">
      Sign in
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <>
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 rounded-lg border border-fog-border bg-pure-white/88 px-3 py-2 text-[13px] font-semibold text-graphite shadow-card backdrop-blur-sm transition-colors hover:bg-plaster"
      >
        <ArrowLeft className="size-4" /> Back to home
      </Link>
      <div className="mb-6 flex flex-col gap-3 text-center sm:mb-8">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-fog-border bg-plaster px-3 py-1 text-[12px] font-medium text-steel">
          <ShieldCheck className="size-3.5 text-graphite" />
          Secure sign in
        </div>
        <div className="space-y-1">
          <h1 className="text-[32px] font-bold leading-[1.14] tracking-[-0.025em] text-graphite">
            Welcome back
          </h1>
          <p className="text-[16px] leading-[1.5] text-steel">
            Members use their staff ID. The VC can continue with email.
          </p>
        </div>
      </div>

      <Card padding="md" variant="default">
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <Input
              label="Staff ID or VC email"
              name="identifier"
              type="text"
              placeholder="NAUB-001 or admin@gmail.com"
              autoComplete="username"
              required
              error={state?.errors?.identifier?.[0]}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              error={state?.errors?.password?.[0]}
            />

            {state?.errors?.identifier?.[0] ? (
              <p className="text-[14px] leading-[1.43] text-danger">{state.errors.identifier[0]}</p>
            ) : null}

            <div className="mt-1">
              <SubmitButton />
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
