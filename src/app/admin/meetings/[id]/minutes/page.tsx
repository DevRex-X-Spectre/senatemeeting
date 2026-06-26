import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { getMeeting } from "@/lib/meetings/queries";
import { getMinutes, generateMinutesAction, updateMinutesAction, publishMinutesAction } from "@/lib/minutes/generator";
import { Card, CardContent, Badge } from "@/components/ui";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Send } from "lucide-react";
import { MinutesEditor } from "@/components/minutes/MinutesEditor";
import { PublishButton } from "@/components/minutes/PublishButton";
import { ActionFormButton } from "@/components/admin/meetings/ActionFormButton";

export const metadata: Metadata = { title: "Minutes" };

function notFound(): never {
  throw new Error("Meeting not found");
}

export default async function AdminMinutesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireAdmin();
  const meeting: any = await getMeeting(id);
  if (!meeting) notFound();

  const minutes: any = await getMinutes(id);

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-8">
      <div>
        <Link href={`/admin/meetings/${id}`} className="mb-3 inline-flex items-center gap-1.5 text-signal-blue hover:underline">
          <ArrowLeft className="size-4" /> Back to meeting
        </Link>
        <h1 className="text-heading font-bold text-midnight-navy">Meeting minutes</h1>
        <p className="mt-1 text-[15px] text-slate-blue">{meeting.title}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <ActionFormButton
          action={generateMinutesAction}
          args={[id]}
          label="Regenerate"
          icon={<RefreshCw className="size-4" />}
        />
        {minutes?.published_at ? (
          <Badge tone="success" className="gap-1.5 py-2">
            <Send className="size-3" /> Published
          </Badge>
        ) : (
          <PublishButton meetingId={id} disabled={!minutes?.body} />
        )}
      </div>

      {/* Editor */}
      {minutes ? (
        <MinutesEditor meetingId={id} initialBody={minutes.body} />
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-caption text-slate-blue">
              No minutes generated yet. Click &quot;Regenerate&quot; to auto-generate from the meeting data.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}