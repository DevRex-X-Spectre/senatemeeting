import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: { value: number; label?: string };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, delta, icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-mist-border bg-paper p-5 shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-caption font-medium text-slate-blue">{label}</span>
        {icon ? (
          <span className="flex size-8 items-center justify-center rounded-full bg-fog text-midnight-navy">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[32px] font-bold leading-none tracking-tight text-midnight-navy">
          {value}
        </span>
        {delta ? (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[12px] font-semibold leading-none",
              delta.value >= 0
                ? "bg-success-soft text-success"
                : "bg-danger-soft text-danger",
            )}
          >
            {delta.value >= 0 ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {Math.abs(delta.value)}%
            {delta.label ? <span className="ml-1 font-normal opacity-80">{delta.label}</span> : null}
          </span>
        ) : null}
      </div>
    </div>
  );
}