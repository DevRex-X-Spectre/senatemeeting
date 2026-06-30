"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, AlertCircle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ToastVariant = "success" | "error" | "info" | "warning";
interface ToastInput {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface Toast extends Required<Omit<ToastInput, "id" | "description">> {
  id: string;
  description?: string;
}

interface ToastContextValue {
  push: (toast: ToastInput) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const push = React.useCallback((t: ToastInput) => {
    const id = t.id ?? Math.random().toString(36).slice(2);
    const toast: Toast = {
      id,
      title: t.title,
      description: t.description,
      variant: t.variant ?? "info",
      durationMs: t.durationMs ?? 4000,
    };
    setToasts((prev) => [...prev, toast]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, toast.durationMs);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      {mounted
        ? createPortal(
            <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
              {toasts.map((t) => (
                <ToastView key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

function ToastView({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const Icon = ICON[toast.variant];
  return (
    <div
      className={cn(
        "pointer-events-auto flex items-start gap-3 rounded-xl border border-mist-border/80 bg-paper p-3.5 shadow-card-hover ring-1 ring-white/60 backdrop-blur-xl",
      )}
      role="status"
    >
      <Icon className={cn("size-5 shrink-0", ICON_TONE[toast.variant])} />
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="text-[14px] font-semibold text-midnight-navy tracking-tight">{toast.title}</p>
        {toast.description ? (
          <p className="text-caption text-slate-blue">{toast.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-md p-1 text-slate-blue transition-colors hover:bg-fog hover:text-midnight-navy"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

const ICON: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertCircle,
};
const ICON_TONE: Record<ToastVariant, string> = {
  success: "text-success",
  error: "text-danger",
  info: "text-info-blue",
  warning: "text-warning",
};

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    // No-op fallback so non-wrapped trees don't crash.
    return { push: () => {} };
  }
  return ctx;
}