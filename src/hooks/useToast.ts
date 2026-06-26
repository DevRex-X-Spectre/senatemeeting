"use client";

import * as React from "react";
import { createPortal } from "react-dom";

type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

let toastListener: ((toast: Omit<Toast, "id">) => void) | null = null;

export function dispatchToast(toast: Omit<Toast, "id">) {
  toastListener?.(toast);
}

export function useToast() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    const listener = (t: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
    };
    toastListener = listener;
    return () => {
      toastListener = null;
    };
  }, []);

  return toasts;
}