import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "ghost" | "outline" | "destructive" | "soft";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-signal-blue text-paper hover:brightness-110 active:brightness-95 shadow-button",
  ghost:
    "bg-transparent text-midnight-navy hover:bg-fog active:bg-fog/80",
  outline:
    "bg-transparent text-midnight-navy border border-mist-border hover:bg-fog active:bg-fog/80",
  destructive:
    "bg-danger text-paper hover:brightness-110 active:brightness-95 shadow-button",
  soft:
    "bg-fog text-midnight-navy hover:bg-mist-border/60 active:bg-mist-border",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-[13px]",
  md: "h-11 px-5 text-[14px]",
  lg: "h-12 px-6 text-[16px]",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      type = "button",
      ...rest
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all duration-150 ease-out",
          "disabled:cursor-not-allowed disabled:opacity-60",
          // Touch target — ensures 44px minimum on mobile
          "min-h-[44px] sm:min-h-0",
          VARIANTS[variant],
          SIZES[size],
          fullWidth && "w-full",
          className,
        )}
        aria-busy={loading || undefined}
        {...rest}
      >
        {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";