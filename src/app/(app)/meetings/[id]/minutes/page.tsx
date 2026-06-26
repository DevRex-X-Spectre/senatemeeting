import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireActiveMember } from "@/lib/auth/guards";
import { getMinutes, getMyAcknowledgment, acknowledgeMinutesAction } from "@/lib/minutes/generator";
import { getMeeting } from "@/lib/meetings/queries";
import { Card, CardContent, Button } from "@/components/ui";
import { formatDateTime } from "@/lib/utils/dates";
import { AcknowledgeButton } from "@/components/minutes/AcknowledgeButton";
import Link from "next/link";

export const metadata: Metadata = { title: "Minutes" };

function notFound(): never {
  throw new Error("Meeting not found");
}

export default async function MinutesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireActiveMember();
  const meeting: any = await getMeeting(id);
  if (!meeting) notFound();

  const [minutes, acknowledged] = await Promise.all([
    getMinutes(id) as Promise<any>,
    getMyAcknowledgment(id, profile.id),
  ]);

  if (!minutes || !minutes.published_at) {
    return (
      <div className="mx-auto max-w-4xl py-8">
        <p className="text-slate-blue">Minutes for this meeting haven&apos;t been published yet.</p>
        <Link href={`/meetings/${id}`} className="mt-4 inline-block text-signal-blue hover:underline">
          Back to meeting
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-heading font-bold text-midnight-navy">Meeting minutes</h1>
          <p className="mt-1 text-[15px] text-slate-blue">{meeting.title}</p>
          <p className="text-caption text-slate-blue">
            Published {formatDateTime(minutes.published_at)}
          </p>
        </div>
        <Link href={`/meetings/${id}`}>
          <Button variant="outline" size="sm">Back to meeting</Button>
        </Link>
      </div>

      {/* Minutes body */}
      <Card>
        <CardContent className="py-6">
          <div className="whitespace-pre-wrap text-[15px] text-carbon">
            {minutes.body}
          </div>
        </CardContent>
      </Card>

      {/* Acknowledge */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="text-[14px] font-medium text-midnight-navy">Acknowledge receipt</p>
            <p className="text-caption text-slate-blue">
              {acknowledged
                ? "You've acknowledged these minutes."
                : "Click to confirm you've read and accepted these minutes."}
            </p>
          </div>
          <AcknowledgeButton meetingId={id} alreadyAcknowledged={acknowledged} />
        </CardContent>
      </Card>
    </div>
  );
}