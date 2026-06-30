import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline" | "soft";
  padding?: "none" | "sm" | "md" | "lg";
}

const VARIANTS = {
  default: "bg-pure-white border border-fog-border",
  elevated: "bg-pure-white border border-graphite/10",
  outline: "bg-pure-white border border-graphite/15",
  soft: "bg-plaster border border-fog-border",
};

const PADDING = {
  none: "p-0",
  sm: "p-4 sm:p-5",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Card({
  variant = "default",
  padding = "md",
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl transition-colors duration-150",
        VARIANTS[variant],
        PADDING[padding],
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-2", className)} {...rest} />;
}

export function CardTitle({ className, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-[22px] font-semibold leading-[1.38] tracking-[-0.025em] text-graphite",
        className,
      )}
      {...rest}
    />
  );
}

export function CardDescription({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-[14px] leading-[1.43] text-steel", className)} {...rest} />;
}

export function CardContent({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-4", className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-4 flex flex-wrap items-center gap-3 border-t border-fog-border pt-4", className)}
      {...rest}
    />
  );
}