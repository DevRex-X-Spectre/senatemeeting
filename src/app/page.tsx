import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
<<<<<<< ours
import { Button, Card, CardContent } from "@/components/ui";
import { GradientBackdrop } from "@/components/ui/GradientBackdrop";
import { CalendarCheck2, Vote, FileText, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "UniSenate — Senate Meeting Management",
=======
import { ArrowRight, CalendarCheck2, FileText, Menu, University, Users, Vote } from "lucide-react";

export const metadata: Metadata = {
  title: "UniSenate, Senate Meeting Management",
>>>>>>> theirs
};

export default async function LandingPage() {
  const supabase = await createClient();
<<<<<<< ours
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="relative min-h-screen bg-mist">
      <GradientBackdrop variant="marketing" className="fixed inset-0" />

      {/* Nav */}
      <header className="relative z-10 flex h-16 items-center justify-between border-b border-mist-border/50 bg-paper/80 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-midnight-navy text-paper">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M8 2L14 5v6l-6 3L2 11V5l6-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[17px] font-bold tracking-tight text-midnight-navy">UniSenate</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-24 pb-32">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-fog px-3 py-1 text-[12px] font-medium text-slate-blue">
              University Senate Management
            </div>
            <h1 className="text-[50px] font-bold leading-[1.1] tracking-tight text-midnight-navy">
              Run senate meetings with clarity.
            </h1>
            <p className="text-body-lg text-slate-blue leading-relaxed">
              Build agendas, run live sessions, vote on motions, and publish minutes — all from one quiet, professional canvas built for academic governance.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/register">
                <Button size="lg">Get started free</Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="lg">Sign in</Button>
              </Link>
            </div>
          </div>

          {/* Product mockup card */}
          <div className="relative">
            <Card padding="none" className="overflow-hidden shadow-card-hover">
              <div className="flex h-8 items-center gap-2 border-b border-mist-border bg-fog px-4">
                <span className="size-2 rounded-full bg-danger" />
                <span className="size-2 rounded-full bg-warning" />
                <span className="size-2 rounded-full bg-success" />
              </div>
              <CardContent className="p-6">
                <div className="mb-4 h-2 w-24 rounded-full bg-fog" />
                <div className="mb-6 space-y-2">
                  {[80, 60, 90, 50].map((w, i) => (
                    <div key={i} className="h-2 rounded-full bg-fog" style={{ width: `${w}%` }} />
                  ))}
                </div>
                <div className="mb-4 h-2 w-16 rounded-full bg-signal-blue/20" />
                <div className="space-y-2">
                  {[60, 80, 40, 70].map((w, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="size-6 rounded-full bg-fog" />
                      <div className="h-2 flex-1 rounded-full bg-mist-border" style={{ width: `${w}%` }} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 border-t border-mist-border bg-paper py-24">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="mb-12 text-center text-[38px] font-bold leading-tight text-midnight-navy">
            Everything you need to govern.
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-signal-blue/10 text-signal-blue">
                  <f.icon className="size-5" />
                </div>
                <h3 className="text-[17px] font-semibold text-midnight-navy">{f.title}</h3>
                <p className="text-[14px] text-slate-blue leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 text-center">
        <div className="mx-auto max-w-xl px-6">
          <h2 className="mb-4 text-[38px] font-bold text-midnight-navy">Ready to get started?</h2>
          <p className="mb-8 text-body text-slate-blue">
            Create your account in minutes. No credit card required.
          </p>
          <Link href="/register">
            <Button size="lg">Create free account</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-mist-border bg-paper py-6 text-center">
        <p className="text-caption text-slate-blue">
          &copy; {new Date().getFullYear()} UniSenate. Built for academic governance.
        </p>
      </footer>
=======
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen overflow-hidden bg-pure-white text-graphite">
      <header className="border-b border-fog-border bg-pure-white">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5 sm:h-16 sm:px-8">
          <Link href="/" className="flex items-center gap-2" aria-label="UniSenate home">
            <span className="flex size-6 items-center justify-center rounded-[2px] border border-graphite bg-pure-white text-graphite">
              <University className="size-3.5" />
            </span>
            <span className="text-[14px] font-bold leading-none tracking-[-0.025em]">
              UniSenate
            </span>
          </Link>

          <nav className="hidden items-center gap-2 sm:flex" aria-label="Primary navigation">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-[14px] font-semibold leading-none text-graphite transition-colors hover:bg-plaster"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-graphite px-4 py-2.5 text-[14px] font-bold leading-none text-pure-white transition-colors hover:bg-charcoal"
            >
              Get started
            </Link>
          </nav>

          <Link
            href="/login"
            className="rounded-lg p-2 text-graphite transition-colors hover:bg-plaster sm:hidden"
            aria-label="Open sign in"
          >
            <Menu className="size-5" />
          </Link>
        </div>
      </header>

      <section className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-[1200px] flex-col px-5 pt-14 sm:min-h-[calc(100vh-4rem)] sm:px-8 sm:pt-20">
        <div className="relative z-10 mx-auto flex max-w-3xl flex-1 flex-col items-center text-center">
          <h1 className="max-w-3xl text-[40px] font-bold leading-[1.1] tracking-[-0.025em] text-graphite sm:text-[56px]">
            Senate meetings made <span className="text-prismic-green">clear.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[16px] font-medium leading-[1.5] text-steel sm:text-[18px] sm:leading-[1.56]">
            Plan agendas, approve members, run votes, and publish minutes from one simple workspace.
          </p>

          <div className="mt-7 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-graphite px-6 py-3 text-[16px] font-bold leading-[1.4] text-pure-white transition-colors hover:bg-charcoal"
            >
              Get started now <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border-[1.5px] border-graphite bg-transparent px-6 py-3 text-[16px] font-semibold leading-[1.4] text-graphite transition-colors hover:bg-plaster"
            >
              Sign in
            </Link>
          </div>

          <p className="mt-12 max-w-xl text-[14px] font-bold leading-[1.43] text-steel">
            Built for senate teams that need approvals, attendance, motions, voting, and minutes in one place.
          </p>
        </div>

        <LandingWorkshop />
      </section>
    </main>
  );
}

function LandingWorkshop() {
  return (
    <div className="pointer-events-none relative -mx-5 mt-10 h-[190px] overflow-hidden sm:-mx-8 sm:h-[260px] lg:h-[300px]" aria-hidden>
      <div className="absolute inset-x-[-12%] bottom-0 h-[82%] bg-graphite [clip-path:polygon(0_36%,9%_49%,18%_64%,25%_42%,34%_69%,42%_49%,51%_76%,60%_54%,70%_70%,79%_43%,91%_58%,100%_39%,100%_100%,0_100%)]" />
      <div className="absolute inset-x-[-12%] bottom-[28px] h-[46%] bg-charcoal [clip-path:polygon(0_18%,9%_35%,18%_53%,25%_29%,34%_61%,42%_38%,51%_70%,60%_46%,70%_63%,79%_34%,91%_49%,100%_28%,100%_48%,91%_70%,79%_55%,70%_84%,60%_67%,51%_91%,42%_60%,34%_82%,25%_61%,18%_83%,9%_66%,0_49%)]" />
      <div className="absolute inset-x-[-12%] bottom-[72px] h-[42%] bg-fog-border [clip-path:polygon(0_16%,9%_34%,18%_52%,25%_28%,34%_61%,42%_36%,51%_69%,60%_46%,70%_63%,79%_32%,91%_49%,100%_27%,100%_38%,91%_60%,79%_43%,70%_76%,60%_58%,51%_83%,42%_50%,34%_73%,25%_50%,18%_72%,9%_56%,0_38%)]" />

      <IsometricTile className="left-[21%] bottom-[70px] rotate-[-28deg]" label="Sign up" icon={<Users className="size-3.5" />} />
      <IsometricTile className="left-[29%] bottom-[40px] rotate-[-25deg]" label="Approve" icon={<CalendarCheck2 className="size-3.5" />} />
      <IsometricTile className="left-[48%] bottom-[28px] rotate-[23deg]" label="Agenda" icon={<FileText className="size-3.5" />} />
      <IsometricTile className="right-[32%] bottom-[75px] rotate-[24deg]" label="Vote" icon={<Vote className="size-3.5" />} />
      <IsometricTile className="right-[20%] bottom-[42px] rotate-[-25deg]" label="Minutes" icon={<FileText className="size-3.5" />} />
>>>>>>> theirs
    </div>
  );
}

<<<<<<< ours
const FEATURES = [
  {
    icon: CalendarCheck2,
    title: "Agenda Builder",
    desc: "Create and publish meeting agendas. Drag to reorder, set time allocations, and carry items forward automatically.",
  },
  {
    icon: Vote,
    title: "Live Voting",
    desc: "Raise motions, second them, and vote in real time. Results shown instantly to all present members.",
  },
  {
    icon: Users,
    title: "Attendance & Quorum",
    desc: "Members check in live. Quorum status updates automatically. Never run a vote without knowing who's there.",
  },
  {
    icon: FileText,
    title: "Minutes",
    desc: "Auto-generate meeting minutes from your session data. Edit before publishing. Members acknowledge on receipt.",
  },
];
=======
function IsometricTile({
  className,
  label,
  icon,
}: {
  className: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={`absolute hidden h-9 min-w-24 items-center justify-center gap-2 rounded-[4px] border-2 border-ink-black bg-charcoal px-4 text-[12px] font-bold text-pure-white shadow-none sm:flex ${className}`}
    >
      {icon}
      {label}
    </div>
  );
}
>>>>>>> theirs
