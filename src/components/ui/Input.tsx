import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, id, className, ...rest }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    return (
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {label ? (
          <label htmlFor={inputId} className="text-[14px] font-medium leading-[1.43] text-graphite">
            {label}
          </label>
        ) : null}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-md border border-graphite/15 bg-pure-white px-3 text-[16px] text-graphite",
            "placeholder:text-silver-mist",
            "transition-colors duration-150",
            "focus:border-graphite focus:outline-none focus:ring-2 focus:ring-graphite/10",
            "disabled:bg-plaster disabled:text-steel",
            error && "border-danger focus:border-danger focus:ring-danger/15",
            className,
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={hint || error ? `${inputId}-desc` : undefined}
          {...rest}
        />
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