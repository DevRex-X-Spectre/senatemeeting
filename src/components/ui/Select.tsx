import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, options, id, className, ...rest }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-caption font-medium text-midnight-navy">
            {label}
          </label>
        ) : null}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-md border border-mist-border bg-paper px-3 text-[15px] text-carbon",
            "transition-colors duration-150",
            "focus:border-signal-blue focus:outline-none focus:ring-2 focus:ring-signal-blue/15",
            "disabled:bg-fog disabled:text-slate-blue",
            error && "border-danger focus:border-danger focus:ring-danger/15",
            className,
          )}
          aria-invalid={error ? "true" : undefined}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hint && !error ? (
          <p className="text-caption text-slate-blue">{hint}</p>
        ) : null}
        {error ? (
          <p className="text-caption text-danger">{error}</p>
        ) : null}
      </div>
    );
  },
);
Select.displayName = "Select";