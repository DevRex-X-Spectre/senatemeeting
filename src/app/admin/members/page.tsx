import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, Button, Badge, Avatar, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils/dates";
import { Users } from "lucide-react";
import { ApproveButton, SuspendButton } from "@/components/admin/members/ApprovalActions";

export const metadata: Metadata = { title: "Members" };

export default async function MembersPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: profilesRaw } = await supabase
    .from("profiles")
    .select("*, approved_by:profiles!profiles_approved_by_fkey(full_name)")
    .order("created_at", { ascending: false });

  const profiles: any[] = (profilesRaw ?? []) as any[];
  const pending = profiles.filter((p) => p.status === "pending");
  const active = profiles.filter((p) => p.status === "active");
  const suspended = profiles.filter((p) => p.status === "suspended");

  return (
    <div className="mx-auto max-w-4xl space-y-8 py-8">
      <div>
        <h1 className="text-heading font-bold text-midnight-navy">Members</h1>
        <p className="mt-1 text-[15px] text-slate-blue">
          Manage senate member accounts and approvals.
        </p>
      </div>

      {/* Pending */}
      <section>
        <h2 className="mb-3 text-subheading font-semibold text-midnight-navy">
          Pending approval ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-caption text-slate-blue">No pending members.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((p: any) => (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.full_name} src={p.avatar_url} />
                    <div>
                      <p className="text-[14px] font-medium text-midnight-navy">{p.full_name}</p>
                      <p className="text-caption text-slate-blue">{p.email}</p>
                      <p className="text-caption text-steel-blue">Registered {formatDateTime(p.created_at)}</p>
                    </div>
                  </div>
                  <ApproveButton userId={p.id} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Active */}
      <section>
        <h2 className="mb-3 text-subheading font-semibold text-midnight-navy">
          Active members ({active.length})
        </h2>
        {active.length === 0 ? (
          <EmptyState icon={<Users className="size-6" />} title="No active members yet" />
        ) : (
          <div className="flex flex-col gap-3">
            {active.map((p: any) => (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.full_name} src={p.avatar_url} />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-medium text-midnight-navy">{p.full_name}</p>
                        {p.role === "admin" && <Badge tone="info" size="sm">Admin</Badge>}
                      </div>
                      <p className="text-caption text-slate-blue">{p.email}</p>
                      {p.approved_at ? (
                        <p className="text-caption text-steel-blue">
                          Approved {formatDateTime(p.approved_at)}
                          {p.approved_by?.full_name ? ` by ${p.approved_by.full_name}` : ""}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {p.role !== "admin" && <SuspendButton userId={p.id} />}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Suspended */}
      {suspended.length > 0 && (
        <section>
          <h2 className="mb-3 text-subheading font-semibold text-midnight-navy">
            Suspended ({suspended.length})
          </h2>
          <div className="flex flex-col gap-3">
            {suspended.map((p: any) => (
              <Card key={p.id}>
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.full_name} src={p.avatar_url} />
                    <div>
                      <p className="text-[14px] font-medium text-midnight-navy">{p.full_name}</p>
                      <p className="text-caption text-slate-blue">{p.email}</p>
                    </div>
                  </div>
                  <ApproveButton userId={p.id} label="Reactivate" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}