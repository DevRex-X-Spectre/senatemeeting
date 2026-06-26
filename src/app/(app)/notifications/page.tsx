import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/auth/guards";
import { getNotifications, markAllNotificationsReadAction } from "@/lib/notifications/actions";
import { Card, CardContent, Button, Badge } from "@/components/ui";
import { relativeTime } from "@/lib/utils/dates";
import { Bell } from "lucide-react";
import { MarkAllReadButton } from "@/components/notifications/MarkAllReadButton";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const profile = await requireActiveMember();
  const notifications: any[] = (await getNotifications({ limit: 50 })) as any[];
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-bold text-midnight-navy">Notifications</h1>
          <p className="mt-1 text-[15px] text-slate-blue">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 ? <MarkAllReadButton /> : null}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-fog text-slate-blue">
            <Bell className="size-6" />
          </div>
          <p className="text-[14px] font-medium text-midnight-navy">No notifications yet</p>
          <p className="text-caption text-slate-blue">We&apos;ll notify you when something happens.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`transition-shadow ${!n.read_at ? "border-l-4 border-l-signal-blue" : ""}`}
            >
              <CardContent className="flex items-start justify-between gap-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <p className="text-[14px] font-medium text-midnight-navy">{n.title}</p>
                  {n.body ? (
                    <p className="text-caption text-slate-blue">{n.body}</p>
                  ) : null}
                  <p className="text-caption text-steel-blue">{relativeTime(n.created_at)}</p>
                </div>
                {!n.read_at ? (
                  <Badge tone="info" size="sm">New</Badge>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}