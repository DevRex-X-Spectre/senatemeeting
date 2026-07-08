import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/auth/guards";
import { getMemberDashboard } from "@/lib/dashboard/queries";
import { Card, CardContent, Button, EmptyState, MeetingStatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/utils/dates";
import Link from "next/link";
import { CalendarDays, FileCheck2, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

type UpcomingMeeting = {
  id: string;
  title: string;
  status: Parameters<typeof MeetingStatusBadge>[0]["status"];
  scheduled_at: string;
  location?: string | null;
};

type UnackedMinutes = {
  meeting_id: string;
  meeting?: {
    title?: string | null;
    minutes_published_at?: string | null;
  } | null;
};

export default async function DashboardPage() {
  const profile = await requireActiveMember();
  const { upcomingMeetings, unackedMinutes } = await getMemberDashboard(profile);

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6 sm:space-y-8 sm:py-8">
      <div className="space-y-2">
        <h1 className="text-[32px] font-bold leading-[1.14] tracking-[-0.025em] text-graphite sm:text-[40px]">
          Welcome back.
        </h1>
        <p className="max-w-2xl text-[16px] leading-[1.5] text-steel">
          Here is a quick view of your upcoming meetings and any minutes that still need your review.
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[22px] font-semibold leading-[1.38] tracking-[-0.025em] text-graphite">Upcoming meetings</h2>
          <Link href="/meetings" className="w-full sm:w-auto">
            <Button variant="ghost" size="sm" className="gap-1.5 w-full sm:w-auto">
              View all <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>

        {upcomingMeetings.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="size-6" />}
            title="No upcoming meetings"
            description="When a meeting is scheduled, it will show up here."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {(upcomingMeetings as UpcomingMeeting[]).map((m) => (
              <Card key={m.id} className="transition-colors duration-150 hover:border-graphite/20">
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/meetings/${m.id}`} className="truncate text-[16px] font-semibold text-graphite hover:underline">
                        {m.title}
                      </Link>
                      <MeetingStatusBadge status={m.status} size="sm" />
                    </div>
                    <p className="text-[14px] leading-[1.43] text-steel">
                      {formatDateTime(m.scheduled_at)}
                      {m.location ? ` · ${m.location}` : null}
                    </p>
                  </div>
                  <Link href={`/meetings/${m.id}`} className="w-full sm:w-auto">
                    <Button variant="outline" size="sm" fullWidth className="sm:w-auto">
                      View meeting
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {unackedMinutes.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-[22px] font-semibold leading-[1.38] tracking-[-0.025em] text-graphite">
            Minutes waiting for review
          </h2>
          <div className="flex flex-col gap-3">
            {(unackedMinutes as UnackedMinutes[]).map((m) => (
              <Card key={m.meeting_id} className="border-l-4 border-l-warning/70 transition-colors duration-150 hover:border-graphite/20">
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full border border-warning/10 bg-warning-soft text-warning">
                      <FileCheck2 className="size-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[14px] font-medium text-graphite">
                        {m.meeting?.title ?? "Meeting minutes"}
                      </p>
                      <p className="text-[14px] leading-[1.43] text-steel">
                        Published {m.meeting?.minutes_published_at ? formatDateTime(m.meeting.minutes_published_at) : ""}
                      </p>
                    </div>
                  </div>
                  <Link href={`/meetings/${m.meeting_id}/minutes`} className="w-full sm:w-auto">
                    <Button variant="outline" size="sm" fullWidth className="sm:w-auto">
                      Review minutes
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
