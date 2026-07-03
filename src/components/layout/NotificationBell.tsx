"use client";

import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

interface NotificationBellProps {
  unread: number;
}

export function NotificationBell({ unread }: NotificationBellProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-10 items-center justify-center rounded-md border border-fog-border bg-pure-white text-steel transition-colors hover:bg-plaster hover:text-graphite"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
      >
        <Bell className="size-5" />
        {unread > 0 ? (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-graphite text-[9px] font-bold leading-none text-pure-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div className="fixed right-3 top-[76px] z-50 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-fog-border bg-pure-white shadow-card-hover sm:right-6 sm:top-[80px] lg:right-8 lg:top-[88px]">
            <div className="flex items-center justify-between border-b border-fog-border px-4 py-3">
              <h3 className="text-[14px] font-semibold text-graphite">
                Notifications
              </h3>
              <Link
                href="/notifications"
                className="text-[13px] font-medium text-graphite hover:underline"
                onClick={() => setOpen(false)}
              >
                View all
              </Link>
            </div>
            <div className="max-h-80 overflow-y-auto p-1">
              {unread === 0 ? (
                <p className="p-4 text-center text-[14px] text-steel">
                  You are all caught up.
                </p>
              ) : (
                <p className="p-4 text-center text-[14px] text-steel">
                  {unread} unread notification{unread !== 1 ? "s" : ""}.
                </p>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
