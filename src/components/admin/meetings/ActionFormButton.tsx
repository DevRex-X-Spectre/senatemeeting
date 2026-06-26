"use client";

import * as React from "react";
import { Button } from "@/components/ui";

interface Props {
  action: (prev: unknown, formData: FormData, ...args: any[]) => Promise<any>;
  args?: any[];
  label: string;
  variant?: "primary" | "outline" | "destructive";
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

export function ActionFormButton({
  action,
  args = [],
  label,
  variant = "outline",
  size = "sm",
  icon,
}: Props) {
  const [pending, setPending] = React.useState(false);

  async function run() {
    setPending(true);
    try {
      const fd = new FormData();
      await action(null, fd, ...args);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      loading={pending}
      onClick={run}
      className="gap-1.5"
    >
      {icon}
      {label}
    </Button>
  );
}