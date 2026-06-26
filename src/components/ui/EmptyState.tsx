import * as React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-mist-border bg-paper p-10 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-fog text-slate-blue">
        {icon ?? <Inbox className="size-6" />}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-body-sm font-semibold text-midnight-navy">{title}</p>
        {description ? (
          <p className="text-caption text-slate-blue">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}