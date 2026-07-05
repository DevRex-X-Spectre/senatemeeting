"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, id, className, type, disabled, ...rest }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";

    return (
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {label ? (
          <label htmlFor={inputId} className="text-[14px] font-medium leading-[1.43] text-graphite">
            {label}
          </label>
        ) : null}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? "text" : type}
            disabled={disabled}
            className={cn(
              "h-11 w-full rounded-md border border-graphite/15 bg-pure-white px-3 text-[16px] text-graphite",
              "placeholder:text-silver-mist",
              "transition-colors duration-150",
              "focus:border-graphite focus:outline-none focus:ring-2 focus:ring-graphite/10",
              "disabled:bg-plaster disabled:text-steel",
              isPassword && "pr-11",
              error && "border-danger focus:border-danger focus:ring-danger/15",
              className,
            )}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={hint || error ? `${inputId}-desc` : undefined}
            {...rest}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              disabled={disabled}
              className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-steel transition-colors hover:bg-plaster hover:text-graphite disabled:pointer-events-none disabled:opacity-50"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
            </button>
          ) : null}
        </div>
        {hint && !error ? (
          <p id={`${inputId}-desc`} className="text-[14px] leading-[1.43] text-steel">{hint}</p>
        ) : null}
        {error ? (
          <p id={`${inputId}-desc`} className="text-[14px] leading-[1.43] text-danger">{error}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
