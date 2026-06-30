import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, Button, MeetingStatusBadge, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils/dates";
import Link from "next/link";
import { Plus, CalendarDays } from "lucide-react";

export const metadata: Metadata = { title: "Manage meetings" };

type AdminMeetingRow = {
  id: string;
  title: string;
  scheduled_at: string;
  location?: string | null;
  status: string;
  created_by?: { full_name?: string | null } | null;
};

export default async function AdminMeetingsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: meetingsRaw } = await supabase
    .from("meetings")
    .select("*, created_by:profiles!meetings_created_by_fkey(full_name)")
    .order("scheduled_at", { ascending: false });

  const meetings = (meetingsRaw ?? []) as AdminMeetingRow[];

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6 sm:space-y-8 sm:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-[32px] font-bold leading-[1.14] tracking-[-0.025em] text-graphite sm:text-[40px]">
            Meetings
          </h1>
          <p className="max-w-2xl text-[16px] leading-[1.5] text-steel">
            Create, review, and manage senate meetings from one place.
          </p>
        </div>
        <Link href="/admin/meetings/new" className="w-full sm:w-auto">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="size-4" /> New meeting
          </Button>
        </Link>
      </div>

      {!meetings.length ? (
        <EmptyState
          icon={<CalendarDays className="size-6" />}
          title="No meetings yet"
          description="Create your first meeting to get started."
          action={
            <Link href="/admin/meetings/new">
              <Button>Create meeting</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {meetings.map((m) => (
            <Card key={m.id} className="transition-colors duration-150 hover:border-graphite/20">
              <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-col gap-1">
                  <Link
                    href={`/admin/meetings/${m.id}`}
                    className="text-[16px] font-semibold text-graphite hover:underline"
                  >
                    {m.title}
                  </Link>
                  <p className="text-[14px] leading-[1.43] text-steel">
                    {formatDateTime(m.scheduled_at)}
                    {m.location ? ` · ${m.location}` : null}
                    {m.created_by?.full_name ? ` · Created by ${m.created_by.full_name}` : null}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <MeetingStatusBadge status={m.status} size="sm" />
                  <Link href={`/admin/meetings/${m.id}`} className="w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">Manage</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}