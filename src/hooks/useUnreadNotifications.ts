"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/browser";

export function useUnreadNotifications(userId: string) {
  const [unread, setUnread] = React.useState(0);
  const channelId = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");

  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => setUnread((count) => count + 1),
      )
      .subscribe();

    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null)
      .then(({ count }) => setUnread(count ?? 0));

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, userId]);

  return unread;
}
