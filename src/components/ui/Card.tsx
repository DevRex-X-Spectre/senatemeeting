import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline" | "soft";
  padding?: "none" | "sm" | "md" | "lg";
}

const VARIANTS = {
  default: "bg-paper shadow-card",
  elevated: "bg-paper shadow-card-hover",
  outline: "bg-paper border border-mist-border",
  soft: "bg-fog border border-mist-border",
};

const PADDING = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
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
        "rounded-lg",
        VARIANTS[variant],
        PADDING[padding],
        className,
      )}
      {...rest}
    />
  );
}

export function CardHeader({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5", className)} {...rest} />;
}

export function CardTitle({ className, ...rest }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-subheading font-semibold leading-tight text-midnight-navy",
        className,
      )}
      {...rest}
    />
  );
}

export function CardDescription({ className, ...rest }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-caption text-slate-blue", className)} {...rest} />
  );
}

export function CardContent({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-4", className)} {...rest} />;
}

export function CardFooter({ className, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-4 flex flex-wrap items-center gap-3 border-t border-mist-border pt-4",
        className,
      )}
      {...rest}
    />
  );
}