import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { SUPABASE_AUTH_TIMEOUT_MS, withTimeout } from "@/lib/supabase/errors";
import { AppLogo } from "@/components/layout/AppLogo";
import { LandingMatrixBackground } from "@/components/layout/LandingMatrixBackground";
import {
  ArrowRight,
  CalendarCheck2,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "NaubSenate, Nigerian Army University Biu Senate Meeting Management",
};

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await withTimeout(
    supabase.auth.getUser(),
    "Landing auth lookup",
    SUPABASE_AUTH_TIMEOUT_MS,
  ).catch(() => ({ data: { user: null } }));

  if (user) redirect("/dashboard");

  return (
    <main className="relative min-h-screen overflow-hidden bg-mist text-graphite">
      <LandingMatrixBackground />

      <header className="relative z-20 border-b border-signal-blue bg-signal-blue text-pure-white shadow-card">
        <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-4 sm:h-20 sm:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="NaubSenate home">
            <AppLogo className="size-10 border border-pure-white/70 shadow-card sm:size-11" priority />
            <span className="truncate text-[16px] font-bold leading-none sm:text-[18px]">NaubSenate</span>
          </Link>

          <nav className="hidden items-center gap-2 sm:flex" aria-label="Primary navigation">
            <Link
              href="/login"
              className="rounded-lg bg-pure-white px-5 py-3 text-[14px] font-bold leading-none text-signal-blue shadow-button transition-colors hover:bg-warning-soft"
            >
              Sign in with staff ID
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:hidden">
            <Link
              href="/login"
              className="rounded-lg bg-pure-white px-3.5 py-2.5 text-[13px] font-bold leading-none text-signal-blue shadow-button transition-colors hover:bg-warning-soft"
            >
              Staff login
            </Link>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1180px] items-center justify-center px-5 py-16 sm:min-h-[calc(100vh-5rem)] sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-signal-blue/20 bg-success-soft/90 px-3 py-1.5 text-[12px] font-bold text-graphite shadow-card backdrop-blur-sm">
            <span className="size-2 rounded-full bg-prismic-green shadow-[0_0_16px_rgba(41,77,90,0.75)]" />
            Nigerian Army University Biu senate platform
          </div>

          <h1 className="mt-6 max-w-4xl text-[44px] font-bold leading-[1.04] text-graphite sm:text-[64px]">
            Manage NAUB senate meetings around the VC agenda.
          </h1>
          <p className="mt-5 max-w-3xl text-[17px] font-medium leading-[1.65] text-steel sm:text-[19px]">
            NaubSenate helps Nigerian Army University Biu senate staff schedule meetings,
            publish agenda checklists, track what has been accomplished, and keep senate
            members aligned before and during each session.
          </p>

          <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-signal-blue px-6 py-3 text-[16px] font-bold leading-[1.4] text-pure-white shadow-button transition-colors hover:bg-danger"
            >
              Sign in with staff ID <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-12 grid w-full max-w-4xl gap-4 sm:grid-cols-3">
            <SignalCard icon={<CalendarCheck2 className="size-4" />} label="Checklist" value="Build and publish" />
            <SignalCard icon={<CheckCircle2 className="size-4" />} label="Progress" value="Mark accomplished" />
            <SignalCard icon={<FileText className="size-4" />} label="Records" value="Document after" />
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1180px] px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="rounded-2xl border border-signal-blue/20 bg-success-soft/72 p-5 shadow-card-hover backdrop-blur-md sm:p-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-prismic-green">
                Meeting lifecycle
              </p>
              <h2 className="mt-2 text-[28px] font-bold leading-tight text-graphite sm:text-[36px]">
                One structured flow for every senate session.
              </h2>
            </div>
            <p className="max-w-md text-[15px] font-medium leading-[1.6] text-steel">
              Keep each meeting traceable from the published agenda checklist to what was actually accomplished.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <ProcessCard
              step="01"
              title="Plan"
              body="Create the NAUB senate meeting, prepare the VC's agenda checklist, and publish it to approved members."
            />
            <ProcessCard
              step="02"
              title="Track"
              body="Move through the agenda and mark each item as accomplished, deferred, or still to cover."
            />
            <ProcessCard
              step="03"
              title="Record"
              body="Keep the meeting record available after the agenda has been covered."
            />
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-[1180px] px-5 pb-20 sm:px-8 sm:pb-24">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((item) => (
            <CapabilityCard key={item.title} {...item} />
          ))}
        </div>
      </section>
    </main>
  );
}

function SignalCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-mist-border bg-pure-white/92 p-5 text-left shadow-card-hover backdrop-blur-sm">
      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-mint-cream text-prismic-green ring-1 ring-prismic-green/15">
        {icon}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-steel">{label}</p>
      <p className="mt-1 text-[16px] font-bold text-graphite">{value}</p>
    </div>
  );
}

function ProcessCard({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-mist-border bg-pure-white p-5 shadow-card">
      <span className="inline-flex size-9 items-center justify-center rounded-lg bg-graphite text-[12px] font-bold text-pure-white">
        {step}
      </span>
      <h3 className="mt-5 text-[20px] font-bold text-graphite">{title}</h3>
      <p className="mt-2 text-[15px] font-medium leading-[1.6] text-steel">{body}</p>
    </div>
  );
}

function CapabilityCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-mist-border bg-pure-white/90 p-5 shadow-card backdrop-blur-sm">
      <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-mint-cream text-prismic-green ring-1 ring-prismic-green/15">
        {icon}
      </div>
      <h3 className="text-[18px] font-bold text-graphite">{title}</h3>
      <p className="mt-2 text-[15px] font-medium leading-[1.6] text-steel">{body}</p>
    </div>
  );
}

const CAPABILITIES = [
  {
    icon: <ShieldCheck className="size-5" />,
    title: "Staff-ID access",
    body: "The VC or secretary issues each senate member a staff ID and temporary password.",
  },
  {
    icon: <CalendarCheck2 className="size-5" />,
    title: "Agenda checklist publishing",
    body: "Build ordered agenda items and publish the checklist members should follow.",
  },
  {
    icon: <Users className="size-5" />,
    title: "Attendance and quorum",
    body: "Members check in digitally while quorum status updates from the attendance record.",
  },
  {
    icon: <CheckCircle2 className="size-5" />,
    title: "Agenda progress tracking",
    body: "The VC can mark agenda items as accomplished so members see the meeting progress.",
  },
  {
    icon: <FileText className="size-5" />,
    title: "Post-meeting record",
    body: "Keep minutes and official records available after the agenda has been handled.",
  },
  {
    icon: <CheckCircle2 className="size-5" />,
    title: "Meeting history",
    body: "Keep past meetings, decisions, attendance, and minutes available for institutional review.",
  },
];
