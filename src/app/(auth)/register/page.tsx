"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction } from "@/lib/auth/actions";
import { Card, CardContent, CardFooter, Button, Input } from "@/components/ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" fullWidth disabled={pending} loading={pending}>
      Create account
    </Button>
  );
}

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, null);

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-[28px] font-bold text-midnight-navy">Create account</h1>
        <p className="mt-1.5 text-[15px] text-slate-blue">
          Register as a senate member. An admin will approve your account.
        </p>
      </div>

      <Card padding="md">
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

            <div className="mt-1">
              <SubmitButton />
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col !gap-1 pt-0 text-center">
          <p className="text-caption text-slate-blue">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-signal-blue hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </>
  );
}