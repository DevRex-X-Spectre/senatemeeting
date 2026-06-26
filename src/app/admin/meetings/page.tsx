import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, Button, MeetingStatusBadge, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils/dates";
import Link from "next/link";
import { Plus, CalendarDays } from "lucide-react";

export const metadata: Metadata = { title: "Manage meetings" };

export default async function AdminMeetingsPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: meetingsRaw } = await supabase
    .from("meetings")
    .select("*, created_by:profiles!meetings_created_by_fkey(full_name)")
    .order("scheduled_at", { ascending: false });

  const meetings: any[] = (meetingsRaw ?? []) as any[];

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading font-bold text-midnight-navy">Meetings</h1>
          <p className="mt-1 text-[15px] text-slate-blue">Create and manage senate meetings.</p>
        </div>
        <Link href="/admin/meetings/new">
          <Button className="gap-2">
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
          {meetings.map((m: any) => (
            <Card key={m.id} className="transition-shadow hover:shadow-card-hover">
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div className="flex min-w-0 flex-col gap-1">
                  <Link
                    href={`/admin/meetings/${m.id}`}
                    className="text-[15px] font-semibold text-midnight-navy hover:underline"
                  >
                    {m.title}
                  </Link>
                  <p className="text-caption text-slate-blue">
                    {formatDateTime(m.scheduled_at)}
                    {m.location ? ` · ${m.location}` : null}
                    {m.created_by?.full_name ? ` · Created by ${m.created_by.full_name}` : null}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <MeetingStatusBadge status={m.status as any} size="sm" />
                  <Link href={`/admin/meetings/${m.id}`}>
                    <Button variant="outline" size="sm">Manage</Button>
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