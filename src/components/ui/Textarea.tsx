import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, id, className, ...rest }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    return (
      <div className="flex flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-caption font-medium text-midnight-navy">
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "min-h-[96px] w-full rounded-md border border-mist-border bg-paper px-3 py-2.5 text-[15px] text-carbon",
            "placeholder:text-steel-blue",
            "transition-colors duration-150",
            "focus:border-signal-blue focus:outline-none focus:ring-2 focus:ring-signal-blue/15",
            "disabled:bg-fog disabled:text-slate-blue",
            error && "border-danger focus:border-danger focus:ring-danger/15",
            className,
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={hint || error ? `${inputId}-desc` : undefined}
          {...rest}
        />
        {hint && !error ? (
          <p id={`${inputId}-desc`} className="text-caption text-slate-blue">{hint}</p>
        ) : null}
        {error ? (
          <p id={`${inputId}-desc`} className="text-caption text-danger">{error}</p>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";