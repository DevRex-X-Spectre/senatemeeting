import type { Metadata } from "next";
import { ShieldOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Account suspended" };

export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-mist px-4">
      <Card padding="lg" className="max-w-sm text-center">
        <CardHeader>
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-danger-soft">
            <ShieldOff className="size-6 text-danger" />
          </div>
          <CardTitle>Account suspended</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[15px] text-slate-blue">
            Your account has been suspended and you no longer have access to NaubSenate.
            Contact the administrator if you believe this is an error.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}