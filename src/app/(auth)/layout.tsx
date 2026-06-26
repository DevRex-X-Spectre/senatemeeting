import type { Metadata } from "next";
import { GradientBackdrop } from "@/components/ui";

export const metadata: Metadata = { title: "Log in" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-mist px-4">
      <GradientBackdrop variant="subtle" className="absolute inset-0" />
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}