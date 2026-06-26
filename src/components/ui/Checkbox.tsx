import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, id, className, ...rest }, ref) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    return (
      <label htmlFor={inputId} className="flex cursor-pointer items-start gap-3">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          className={cn(
            "mt-0.5 size-4 shrink-0 rounded-sm border-mist-border text-signal-blue",
            "focus:ring-2 focus:ring-signal-blue/15 focus:ring-offset-0",
            className,
          )}
          {...rest}
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-[14px] font-medium text-midnight-navy">{label}</span>
          {description ? (
            <span className="text-caption text-slate-blue">{description}</span>
          ) : null}
        </div>
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";