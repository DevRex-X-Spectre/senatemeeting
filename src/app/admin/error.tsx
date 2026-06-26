"use client";

import * as React from "react";
import { Button } from "@/components/ui";
import { AlertCircle } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center px-4">
      <div className="flex size-12 items-center justify-center rounded-full bg-danger-soft">
        <AlertCircle className="size-6 text-danger" />
      </div>
      <div>
        <h2 className="text-subheading font-semibold text-midnight-navy">Something went wrong</h2>
        <p className="mt-1 text-[14px] text-slate-blue">
          {error?.message ?? "An unexpected error occurred."}
        </p>
      </div>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}