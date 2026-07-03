"use server";

import { createClient } from "@/lib/supabase/server";
import { requireActiveMember } from "@/lib/auth/guards";
import { actionError, throwFriendlyError, withTimeout } from "@/lib/supabase/errors";

export async function markNotificationReadAction(_prev: unknown, formData: FormData) {
  const profile = await requireActiveMember();
  const notificationId = formData.get("notificationId") as string;

  const supabase = await createClient();
  const { error } = await withTimeout(
    supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
      .eq("user_id", profile.id),
    "Mark notification read",
  );

  if (error) return actionError(error, "Could not mark this notification as read.");
  return { ok: true };
}

export async function markAllNotificationsReadAction(_prev?: unknown, _formData?: FormData) {
  void _prev;
  void _formData;
  const profile = await requireActiveMember();

  const supabase = await createClient();
  const { error } = await withTimeout(
    supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", profile.id)
      .is("read_at", null),
    "Mark all notifications read",
  );

  if (error) return actionError(error, "Could not mark notifications as read.");
  return { ok: true };
}

export async function getNotifications(options?: { limit?: number; offset?: number }) {
  const profile = await requireActiveMember();

  const supabase = await createClient();
  let q = supabase
    .from("notifications")
    .select("*, meeting:meetings(id, title)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (options?.limit) q = q.limit(options.limit);
  if (options?.offset) q = q.range(options.offset, options.offset + (options.limit ?? 20) - 1);

  const { data, error } = await withTimeout(q, "Notification list");
  if (error) throwFriendlyError(error, "Could not load notifications.");
  return data ?? [];
}

export async function getUnreadCount() {
  const profile = await requireActiveMember();

  const supabase = await createClient();
  const { count, error } = await withTimeout(
    supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id)
      .is("read_at", null),
    "Unread notification count",
  );

  if (error) return 0;
  return count ?? 0;
}
