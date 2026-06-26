import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export function Spinner({ size = 18, className, label }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label ?? "Loading"}
      className={cn("inline-flex items-center justify-center text-slate-blue", className)}
    >
      <Loader2
        className="animate-spin"
        style={{ width: size, height: size }}
      />
    </span>
  );
}