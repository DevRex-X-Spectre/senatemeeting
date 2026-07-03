import type { Metadata } from "next";
import { LandingMatrixBackground } from "@/components/layout/LandingMatrixBackground";

export const metadata: Metadata = { title: "Log in" };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-pure-white px-4 py-10 text-graphite">
      <LandingMatrixBackground />
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
