import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { getAdminDashboard } from "@/lib/dashboard/queries";
import { StatCard, Card, CardContent, Button, MeetingStatusBadge } from "@/components/ui";
import { CalendarDays, Users, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils/dates";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getAdminDashboard();

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-6 sm:space-y-8 sm:py-8">
      <div className="space-y-2">
        <h1 className="text-[32px] font-bold leading-[1.14] tracking-[-0.025em] text-graphite sm:text-[40px]">
          Admin overview
        </h1>
        <p className="max-w-2xl text-[16px] leading-[1.5] text-steel">
          Review the latest meeting activity, member counts, and agenda progress in one place.
        </p>
      </div>

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
          label="Average attendance"
          value={stats.avgAttendance}
          icon={<TrendingUp className="size-4" />}
        />
        <StatCard
          label="Agenda completion"
          value={`${stats.completionRate}%`}
          icon={<TrendingUp className="size-4" />}
        />
      </div>

      {stats.pendingRegistrations > 0 ? (
        <Card className="border-l-4 border-l-signal-blue">
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full border border-signal-blue/10 bg-signal-blue/10 text-signal-blue">
                <Users className="size-4" />
              </span>
              <div>
                <p className="text-[14px] font-medium text-graphite">
                  {stats.pendingRegistrations} member registration{stats.pendingRegistrations === 1 ? "" : "s"} awaiting approval
                </p>
                <p className="text-[14px] leading-[1.43] text-steel">
                  Review new accounts from the members dashboard.
                </p>
              </div>
            </div>
            <Link href="/admin/members" className="w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full gap-1.5 sm:w-auto">
                Review registrations <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {stats.pendingCarryOvers > 0 ? (
        <Card className="border-l-4 border-l-warning/70">
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-full border border-warning/10 bg-warning-soft text-warning">
                <ArrowRight className="size-4" />
              </span>
              <div>
                <p className="text-[14px] font-medium text-graphite">
                  {stats.pendingCarryOvers} agenda item{stats.pendingCarryOvers !== 1 ? "s" : ""} need carry-over
                </p>
                <p className="text-[14px] leading-[1.43] text-steel">
                  Items marked deferred or tabled from earlier meetings.
                </p>
              </div>
            </div>
            <Link href="/admin/meetings/new" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">Review items</Button>
            </Link>
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[22px] font-semibold leading-[1.38] tracking-[-0.025em] text-graphite">Recent meetings</h2>
          <Link href="/admin/meetings" className="w-full sm:w-auto">
            <Button variant="ghost" size="sm" className="gap-1.5 w-full sm:w-auto">
              View all <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          {stats.recentMeetings.map((m) => (
            <Card key={m.id} className="transition-colors duration-150 hover:border-graphite/20">
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-col gap-1">
                  <Link
                    href={`/admin/meetings/${m.id}`}
                    className="text-[16px] font-semibold text-graphite hover:underline"
                  >
                    {m.title}
                  </Link>
                  <p className="text-[14px] leading-[1.43] text-steel">{formatDateTime(m.scheduled_at)}</p>
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
