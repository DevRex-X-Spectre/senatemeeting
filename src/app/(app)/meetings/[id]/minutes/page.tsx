import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/auth/guards";
import { getMinutes, getMyAcknowledgment } from "@/lib/minutes/generator";
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
  const meeting = await getMeeting(id);
  if (!meeting) notFound();

  const [minutes, acknowledged] = await Promise.all([
    getMinutes(id),
    getMyAcknowledgment(id, profile.id),
  ]);

  if (!minutes || !minutes.published_at) {
    return (
      <div className="mx-auto max-w-4xl py-6 sm:py-8">
        <p className="text-[16px] leading-[1.5] text-steel">The minutes for this meeting have not been published yet.</p>
        <Link href={`/meetings/${id}`} className="mt-4 inline-block text-[14px] font-medium text-graphite hover:underline">
          Back to meeting
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6 sm:space-y-8 sm:py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-[32px] font-bold leading-[1.14] tracking-[-0.025em] text-graphite sm:text-[40px]">Meeting minutes</h1>
          <p className="text-[16px] leading-[1.5] text-steel">{meeting.title}</p>
          <p className="text-[14px] leading-[1.43] text-steel">
            Published {formatDateTime(minutes.published_at)}
          </p>
        </div>
        <Link href={`/meetings/${id}`} className="w-full lg:w-auto">
          <Button variant="outline" size="sm" className="w-full lg:w-auto">Back to meeting</Button>
        </Link>
      </div>

      <Card>
        <CardContent className="py-5 sm:py-6">
          <div className="whitespace-pre-wrap text-[16px] leading-[1.56] text-graphite">
            {minutes.body}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[14px] font-medium text-graphite">Acknowledge receipt</p>
            <p className="text-[14px] leading-[1.43] text-steel">
              {acknowledged
                ? "You have already acknowledged these minutes."
                : "Confirm that you have read these minutes."}
            </p>
          </div>
          <AcknowledgeButton meetingId={id} alreadyAcknowledged={acknowledged} />
        </CardContent>
      </Card>
    </div>
  );
}