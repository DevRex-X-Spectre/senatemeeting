"use client";

import * as React from "react";
import { Button } from "@/components/ui";
import { AlertCircle } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const message = getErrorMessage(error);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center px-4">
      <div className="flex size-12 items-center justify-center rounded-full bg-danger-soft">
        <AlertCircle className="size-6 text-danger" />
      </div>
      <div>
        <h2 className="text-subheading font-semibold text-midnight-navy">{message.title}</h2>
        <p className="mt-1 text-[14px] text-slate-blue">
          {message.body}
        </p>
      </div>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}

function getErrorMessage(error: Error) {
  const raw = error?.message ?? "";
  const lower = raw.toLowerCase();

  if (lower.includes("supabase") || lower.includes("connection") || lower.includes("network") || lower.includes("timed out")) {
    return {
      title: "Connection problem",
      body: "The app could not reach Supabase. Check your connection, then try again.",
    };
  }

  if (lower.includes("permission") || lower.includes("not have access")) {
    return {
      title: "Access denied",
      body: "Your account does not have permission to open this page.",
    };
  }

  return {
    title: "Something went wrong",
    body: raw || "An unexpected error occurred.",
  };
}
