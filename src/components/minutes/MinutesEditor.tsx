"use client";

import * as React from "react";
import { Card, CardContent, Button } from "@/components/ui";
import { Save } from "lucide-react";
import { updateMinutesAction } from "@/lib/minutes/generator";

export function MinutesEditor({ meetingId, initialBody }: { meetingId: string; initialBody: string }) {
  const [body, setBody] = React.useState(initialBody);
  const [saved, setSaved] = React.useState(true);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function save() {
    setPending(true);
    setError(null);
    setSaved(false);
    try {
      const result = await updateMinutesAction({ meetingId, body });
      if (result.ok) setSaved(true);
      else setError(result.error ?? "Save failed");
    } catch (e: any) {
      setError(e?.message ?? "Save failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-col gap-3">
          {error ? (
            <p className="rounded-md bg-danger-soft px-3 py-2 text-caption text-danger">{error}</p>
          ) : null}
          <textarea
            value={body}
            onChange={(e) => { setBody(e.target.value); setSaved(false); }}
            rows={20}
            className="w-full rounded-md border border-mist-border bg-paper px-3 py-2.5 text-[14px] font-mono text-carbon focus:border-signal-blue focus:outline-none focus:ring-2 focus:ring-signal-blue/15"
          />
          <div className="flex items-center justify-between">
            <p className={`text-caption ${saved ? "text-success" : "text-slate-blue"}`}>
              {saved ? "Saved" : "Unsaved changes"}
            </p>
            <Button type="button" size="sm" loading={pending} onClick={save} className="gap-1.5">
              <Save className="size-4" /> Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}