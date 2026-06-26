"use client";

import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils/cn";

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [unread, setUnread] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => setUnread((n) => n + 1),
      )
      .subscribe();

    // Load initial count.
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null)
      .then(({ count }) => setUnread(count ?? 0));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex size-10 items-center justify-center rounded-full text-slate-blue transition-colors hover:bg-fog hover:text-midnight-navy"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
      >
        <Bell className="size-5" />
        {unread > 0 ? (
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-signal-blue text-[9px] font-bold leading-none text-paper">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          {/* Panel */}
          <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-mist-border bg-paper shadow-card-hover">
            <div className="flex items-center justify-between border-b border-mist-border px-4 py-3">
              <h3 className="text-[14px] font-semibold text-midnight-navy">
                Notifications
              </h3>
              <Link
                href="/notifications"
                className="text-[13px] font-medium text-signal-blue hover:underline"
                onClick={() => setOpen(false)}
              >
                View all
              </Link>
            </div>
            <div className="max-h-80 overflow-y-auto p-1">
              {unread === 0 ? (
                <p className="p-4 text-center text-[14px] text-slate-blue">
                  No new notifications.
                </p>
              ) : (
                <p className="p-4 text-center text-[14px] text-slate-blue">
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