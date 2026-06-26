"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "@/lib/auth/actions";
import { Card, CardContent, CardFooter, Button, Input } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth disabled={pending} loading={pending}>
      Log in
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-[28px] font-bold text-midnight-navy">Welcome back</h1>
        <p className="mt-1.5 text-[15px] text-slate-blue">Sign in to your UniSenate account.</p>
      </div>

      <Card padding="md">
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
              placeholder="••••••••"
              autoComplete="current-password"
              required
              error={state?.errors?.password?.[0]}
            />

            {state?.errors?.email?.[0] ? (
              <p className="text-caption text-danger">{state.errors.email[0]}</p>
            ) : null}

            <div className="mt-1">
              <SubmitButton />
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col !gap-1 pt-0 text-center">
          <p className="text-caption text-slate-blue">
            No account yet?{" "}
            <Link href="/register" className="font-medium text-signal-blue hover:underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </>
  );
}