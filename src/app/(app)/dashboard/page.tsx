import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/auth/guards";
import { getMemberDashboard } from "@/lib/dashboard/queries";
import { Card, CardHeader, CardTitle, CardContent, Button, EmptyState, MeetingStatusBadge } from "@/components/ui";
import { formatDateTime, isUpcoming } from "@/lib/utils/dates";
import Link from "next/link";
import { CalendarDays, FileCheck2, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const profile = await requireActiveMember();
  const { upcomingMeetings, unackedMinutes } = await getMemberDashboard(profile);

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      {/* Header */}
      <div>
        <h1 className="text-heading font-bold text-midnight-navy">
          Good {getTimeOfDay()}, {profile.full_name.split(" ")[0]}.
        </h1>
        <p className="mt-1 text-[15px] text-slate-blue">
          Here&apos;s what&apos;s coming up in the senate.
        </p>
      </div>

      {/* Upcoming meetings */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-subheading font-semibold text-midnight-navy">Upcoming meetings</h2>
          <Link href="/meetings">
            <Button variant="ghost" size="sm" className="gap-1.5">
              View all <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>

        {upcomingMeetings.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="size-6" />}
            title="No upcoming meetings"
            description="When an admin schedules a meeting, it'll appear here."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {upcomingMeetings.map((m: any) => (
              <Card key={m.id} className="transition-shadow hover:shadow-card-hover">
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Link href={`/meetings/${m.id}`} className="text-[15px] font-semibold text-midnight-navy hover:underline truncate">
                        {m.title}
                      </Link>
                      <MeetingStatusBadge status={m.status as any} size="sm" />
                    </div>
                    <p className="text-caption text-slate-blue">
                      {formatDateTime(m.scheduled_at)}
                      {m.location ? ` · ${m.location}` : null}
                    </p>
                  </div>
                  <Link href={`/meetings/${m.id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Minutes to acknowledge */}
      {unackedMinutes.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-subheading font-semibold text-midnight-navy">Minutes awaiting acknowledgment</h2>
          </div>
          <div className="flex flex-col gap-3">
            {unackedMinutes.map((m: any) => (
              <Card key={m.meeting_id} className="flex items-center justify-between gap-4">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex size-9 items-center justify-center rounded-full bg-warning-soft text-warning">
                    <FileCheck2 className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[14px] font-medium text-midnight-navy">
                      {m.meeting?.title ?? "Meeting minutes"}
                    </p>
                    <p className="text-caption text-slate-blue">
                      Published {m.meeting?.minutes_published_at ? formatDateTime(m.meeting.minutes_published_at) : ""}
                    </p>
                  </div>
                </CardContent>
                <div className="pr-4">
                  <Link href={`/meetings/${m.meeting_id}/minutes`}>
                    <Button variant="outline" size="sm">Review & acknowledge</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}