import * as React from "react";
import { cn } from "@/lib/utils/cn";

const SIZE: Record<"sm" | "md" | "lg", string> = {
  sm: "size-7 text-[12px]",
  md: "size-9 text-[14px]",
  lg: "size-12 text-[16px]",
};

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-fog font-semibold text-midnight-navy ring-1 ring-mist-border/80 shadow-sm",
        SIZE[size],
        className,
      )}
      aria-label={name}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        <span>{initials(name) || "·"}</span>
      )}
    </div>
  );
}