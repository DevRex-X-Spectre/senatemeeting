"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZES = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({ open, onClose, title, description, children, size = "md" }: ModalProps) {
  const isClient = typeof document !== "undefined";

  React.useEffect(() => {
    if (!open || !isClient) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, isClient]);

  if (!open || !isClient) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-graphite/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-t-xl bg-pure-white ring-1 ring-fog-border sm:rounded-xl",
          SIZES[size],
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-fog-border p-4 sm:p-5">
          <div className="flex flex-col gap-1">
            {title ? (
              <h2 id="modal-title" className="text-[22px] font-semibold leading-[1.38] tracking-[-0.025em] text-graphite">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-[14px] leading-[1.43] text-steel">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-steel transition-colors duration-150 hover:bg-plaster hover:text-graphite"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-4 sm:p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}