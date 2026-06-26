import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Pending approval" };

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-mist px-4">
      <Card padding="lg" className="max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-fog">
            <Clock className="size-6 text-slate-blue" />
          </div>
          <CardTitle>Account under review</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[15px] text-slate-blue">
            Your account is pending administrator approval. You&apos;ll be able to access
            meetings and participate once approved. Please check back shortly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}