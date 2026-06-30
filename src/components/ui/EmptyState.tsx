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
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-fog-border bg-pure-white p-6 text-center sm:p-10",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full border border-fog-border bg-plaster text-steel sm:size-14">
        {icon ?? <Inbox className="size-5 sm:size-6" />}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[16px] font-semibold leading-[1.5] tracking-[-0.025em] text-graphite">{title}</p>
        {description ? (
          <p className="mx-auto max-w-sm text-[14px] leading-[1.43] text-steel">{description}</p>
        ) : null}
      </div>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}