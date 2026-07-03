"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction } from "@/lib/auth/actions";
import { Card, CardContent, CardFooter, Button, Input } from "@/components/ui";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth disabled={pending} loading={pending} className="gap-2">
      Create account
    </Button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, null);

  return (
    <>
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 rounded-lg border border-fog-border bg-pure-white/88 px-3 py-2 text-[13px] font-semibold text-graphite shadow-card backdrop-blur-sm transition-colors hover:bg-plaster"
      >
        <ArrowLeft className="size-4" /> Back to home
      </Link>
      <div className="mb-6 flex flex-col gap-3 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-fog px-3 py-1 text-[12px] font-medium text-slate-blue ring-1 ring-mist-border/70">
          <ShieldCheck className="size-3.5 text-signal-blue" />
          Join the senate
        </div>
        <div>
          <h1 className="text-[30px] font-bold tracking-tight text-midnight-navy">Create account</h1>
          <p className="mt-1.5 text-[15px] text-slate-blue">
            Register as a senate member. An admin will approve your account.
          </p>
        </div>
      </div>

      <Card padding="md" variant="elevated">
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <Input
              label="Full name"
              name="fullName"
              type="text"
              placeholder="Jane Smith"
              autoComplete="name"
              required
              error={state?.errors?.fullName?.[0]}
            />
            <Input
              label="Email address"
              name="email"
              type="email"
              placeholder="you@university.edu"
              autoComplete="email"
              required
              error={state?.errors?.email?.[0]}
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              required
              hint="Minimum 8 characters."
              error={state?.errors?.password?.[0]}
            />
            <Input
              label="Confirm password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
              error={state?.errors?.confirmPassword?.[0]}
            />

            <div className="mt-1">
              <SubmitButton />
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col !gap-1 pt-0 text-center">
          <p className="text-caption text-slate-blue">
            Already have an account?{" "}
            <Link href="/login" className="inline-flex items-center gap-1 font-medium text-signal-blue hover:underline">
              Log in <ArrowRight className="size-3.5" />
            </Link>
          </p>
        </CardFooter>
      </Card>
    </>
  );
}
