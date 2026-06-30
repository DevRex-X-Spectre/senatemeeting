import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/auth/guards";
import { getNotifications } from "@/lib/notifications/actions";
import { Card, CardContent, Badge, EmptyState } from "@/components/ui";
import { relativeTime } from "@/lib/utils/dates";
import { Bell, CheckCheck } from "lucide-react";
import { MarkAllReadButton } from "@/components/notifications/MarkAllReadButton";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  await requireActiveMember();
  const notifications = await getNotifications({ limit: 50 });
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6 sm:space-y-8 sm:py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-[32px] font-bold leading-[1.14] tracking-[-0.025em] text-graphite sm:text-[40px]">
            Notifications
          </h1>
          <p className="text-[16px] leading-[1.5] text-steel">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "You are all caught up"}
          </p>
        </div>
        {unreadCount > 0 ? <MarkAllReadButton /> : null}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="size-6" />}
          title="No notifications yet"
          description="We will show updates here when there is new activity."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={n.read_at ? "transition-colors duration-150 hover:border-graphite/20" : "border-l-4 border-l-graphite"}
            >
              <CardContent className="flex items-start justify-between gap-4 py-3.5 sm:py-4">
                <div className="flex items-start gap-3">
                  <div className={n.read_at ? "flex size-9 items-center justify-center rounded-full border border-fog-border bg-plaster text-steel" : "flex size-9 items-center justify-center rounded-full border border-graphite/10 bg-graphite/5 text-graphite"}>
                    {n.read_at ? <CheckCheck className="size-4" /> : <Bell className="size-4" />}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[14px] font-medium text-graphite">{n.title}</p>
                    {n.body ? (
                      <p className="text-[14px] leading-[1.43] text-steel">{n.body}</p>
                    ) : null}
                    <p className="text-[14px] leading-[1.43] text-steel">{relativeTime(n.created_at)}</p>
                  </div>
                </div>
                {!n.read_at ? <Badge tone="info" size="sm">New</Badge> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
