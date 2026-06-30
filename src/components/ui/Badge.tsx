import * as React from "react";
import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "info" | "success" | "warning" | "danger";

const TONE: Record<Tone, string> = {
  neutral: "bg-plaster text-steel border border-fog-border",
  info: "bg-pure-white text-graphite border border-graphite/15",
  success: "bg-success-soft text-success border border-success/10",
  warning: "bg-warning-soft text-warning border border-warning/10",
  danger: "bg-danger-soft text-danger border border-danger/10",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: "sm" | "md";
}

export function Badge({
  tone = "neutral",
  size = "md",
  className,
  ...rest
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold leading-none tracking-tight transition-colors duration-150",
        size === "sm" ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-[14px]",
        TONE[tone],
        className,
      )}
      {...rest}
    />
  );
}