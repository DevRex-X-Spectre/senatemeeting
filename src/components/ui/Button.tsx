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
    "bg-graphite text-pure-white hover:bg-charcoal active:bg-graphite border border-graphite",
  ghost:
    "bg-transparent text-graphite hover:bg-plaster active:bg-fog-border/50",
  outline:
    "border border-graphite/20 bg-pure-white text-graphite hover:border-graphite hover:bg-plaster active:bg-fog-border/40",
  destructive:
    "bg-danger text-pure-white hover:bg-danger/90 active:bg-danger border border-danger",
  soft:
    "bg-plaster text-graphite hover:bg-fog-border/50 active:bg-fog-border/70 border border-fog-border",
};

const SIZES: Record<Size, string> = {
  sm: "h-10 px-3 text-[14px]",
  md: "h-11 px-4 sm:px-5 text-[14px]",
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
          "inline-flex items-center justify-center gap-2 rounded-lg font-semibold tracking-tight transition-colors duration-150 ease-out",
          "min-h-[44px] disabled:cursor-not-allowed disabled:opacity-60",
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
