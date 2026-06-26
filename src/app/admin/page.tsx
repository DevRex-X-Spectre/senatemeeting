import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { getAdminDashboard } from "@/lib/dashboard/queries";
import { StatCard, Card, CardContent, CardHeader, CardTitle, Button, MeetingStatusBadge } from "@/components/ui";
import { CalendarDays, Users, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils/dates";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getAdminDashboard();

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-8">
      <div>
        <h1 className="text-heading font-bold text-midnight-navy">Admin overview</h1>
        <p className="mt-1 text-[15px] text-slate-blue">
          Key metrics and recent activity.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total meetings"
          value={stats.totalMeetings}
          icon={<CalendarDays className="size-4" />}
        />
        <StatCard
          label="Active members"
          value={stats.activeMembers}
          icon={<Users className="size-4" />}
        />
        <StatCard
          label="Avg. attendance"
          value={stats.avgAttendance}
          icon={<TrendingUp className="size-4" />}
        />
        <StatCard
          label="Agenda completion"
          value={`${stats.completionRate}%`}
          icon={<TrendingUp className="size-4" />}
        />
      </div>

      {/* Carry-over alert */}
      {stats.pendingCarryOvers > 0 && (
        <Card className="border-l-4 border-l-warning">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full bg-warning-soft text-warning">
                <ArrowRight className="size-4" />
              </span>
              <div>
                <p className="text-[14px] font-medium text-midnight-navy">
                  {stats.pendingCarryOvers} agenda item{stats.pendingCarryOvers !== 1 ? "s" : ""} pending carry-over
                </p>
                <p className="text-caption text-slate-blue">
                  Items marked deferred or tabled from past meetings.
                </p>
              </div>
            </div>
            <Link href="/admin/meetings/new">
              <Button variant="outline" size="sm">Address</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Recent meetings */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-subheading font-semibold text-midnight-navy">Recent meetings</h2>
          <Link href="/admin/meetings">
            <Button variant="ghost" size="sm" className="gap-1.5">
              View all <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {stats.recentMeetings.map((m) => (
            <Card key={m.id} className="transition-shadow hover:shadow-card-hover">
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <Link
                    href={`/admin/meetings/${m.id}`}
                    className="text-[15px] font-semibold text-midnight-navy hover:underline"
                  >
                    {m.title}
                  </Link>
                  <p className="text-caption text-slate-blue">{formatDateTime(m.scheduled_at)}</p>
                </div>
                <MeetingStatusBadge status={m.status} size="sm" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}