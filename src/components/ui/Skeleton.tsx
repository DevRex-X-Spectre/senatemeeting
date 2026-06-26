import { cn } from "@/lib/utils/cn";

export function Skeleton({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-mist-border/60",
        className,
      )}
      {...rest}
    />
  );
}