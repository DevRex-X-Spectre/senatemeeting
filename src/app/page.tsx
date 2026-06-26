import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Button, Card, CardContent } from "@/components/ui";
import { GradientBackdrop } from "@/components/ui/GradientBackdrop";
import { CalendarCheck2, Vote, FileText, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "UniSenate — Senate Meeting Management",
};

export default async function LandingPage() {
  const supabase = await createClient();
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
    </div>
  );
}

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