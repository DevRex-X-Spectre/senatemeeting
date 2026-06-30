"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/lib/auth/actions";
import { Card, CardContent, CardFooter, Button, Input } from "@/components/ui";
import { ArrowRight, ShieldCheck } from "lucide-react";

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
            Sign in to continue to UniSenate.
          </p>
        </div>
      </div>

      <Card padding="md" variant="default">
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
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
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              error={state?.errors?.password?.[0]}
            />

            {state?.errors?.email?.[0] ? (
              <p className="text-[14px] leading-[1.43] text-danger">{state.errors.email[0]}</p>
            ) : null}

            <div className="mt-1">
              <SubmitButton />
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col !gap-1 pt-0 text-center">
          <p className="text-[14px] leading-[1.43] text-steel">
            Need an account?{" "}
            <Link href="/register" className="inline-flex items-center gap-1 font-medium text-graphite hover:underline">
              Register here <ArrowRight className="size-3.5" />
            </Link>
          </p>
        </CardFooter>
      </Card>
    </>
  );
}