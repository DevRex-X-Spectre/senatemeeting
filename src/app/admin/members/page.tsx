import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/guards";
import { canManageRoles, getRoleLabel } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, Badge, Avatar, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils/dates";
import { Users } from "lucide-react";
import { ApproveButton, RejectButton, RoleButton, SuspendButton } from "@/components/admin/members/ApprovalActions";
import type { Role } from "@/types/domain";

export const metadata: Metadata = { title: "Members" };

type MemberRow = {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string | null;
  status: "pending" | "active" | "suspended";
  role: Role;
  created_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
};

export default async function MembersPage() {
  const currentProfile = await requireAdmin();
  const canAssignRoles = canManageRoles(currentProfile);
  const adminClient = createAdminClient();

  const { data: profilesRaw, error: profilesError } = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (profilesError) {
    throw new Error(`Could not load member registrations: ${profilesError.message}`);
  }

  const profiles = (profilesRaw ?? []) as MemberRow[];
  const pending = profiles.filter((p) => p.status === "pending");
  const active = profiles.filter((p) => p.status === "active");
  const suspended = profiles.filter((p) => p.status === "suspended");

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-6 sm:space-y-8 sm:py-8">
      <div className="space-y-2">
        <h1 className="text-[32px] font-bold leading-[1.14] tracking-[-0.025em] text-graphite sm:text-[40px]">
          Members
        </h1>
        <p className="max-w-2xl text-[16px] leading-[1.5] text-steel">
          Review new accounts, manage active members, handle suspensions, and delegate secretary operations.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-[22px] font-semibold leading-[1.38] tracking-[-0.025em] text-graphite">
          Pending approval ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-[14px] leading-[1.43] text-steel">No pending members.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((p) => (
              <Card key={p.id} className="border-l-4 border-l-warning/70">
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.full_name} src={p.avatar_url} />
                    <div className="space-y-0.5">
                      <p className="text-[16px] font-medium text-graphite">{p.full_name}</p>
                      <p className="text-[14px] leading-[1.43] text-steel">{p.email}</p>
                      <p className="text-[14px] leading-[1.43] text-steel">
                        Registered {formatDateTime(p.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                    <ApproveButton userId={p.id} />
                    <RejectButton userId={p.id} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-[22px] font-semibold leading-[1.38] tracking-[-0.025em] text-graphite">
          Active members ({active.length})
        </h2>
        {active.length === 0 ? (
          <EmptyState icon={<Users className="size-6" />} title="No active members yet" />
        ) : (
          <div className="flex flex-col gap-3">
            {active.map((p) => (
              <Card key={p.id} className="transition-colors duration-150 hover:border-graphite/20">
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.full_name} src={p.avatar_url} />
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[16px] font-medium text-graphite">{p.full_name}</p>
                        {p.role === "admin" || p.role === "secretary" ? (
                          <Badge tone="info" size="sm">{getRoleLabel(p.role)}</Badge>
                        ) : null}
                      </div>
                      <p className="text-[14px] leading-[1.43] text-steel">{p.email}</p>
                      {p.approved_at ? (
                        <p className="text-[14px] leading-[1.43] text-steel">
                          Approved {formatDateTime(p.approved_at)}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center">
                    {canAssignRoles && p.role === "member" ? (
                      <RoleButton userId={p.id} role="secretary" label="Make secretary" />
                    ) : null}
                    {canAssignRoles && p.role === "secretary" ? (
                      <RoleButton userId={p.id} role="member" label="Remove secretary" />
                    ) : null}
                    {p.role !== "admin" && (p.role !== "secretary" || canAssignRoles) ? (
                      <SuspendButton userId={p.id} />
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {suspended.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-[22px] font-semibold leading-[1.38] tracking-[-0.025em] text-graphite">
            Rejected / suspended ({suspended.length})
          </h2>
          <div className="flex flex-col gap-3">
            {suspended.map((p) => (
              <Card key={p.id} className="border-l-4 border-l-danger/60">
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={p.full_name} src={p.avatar_url} />
                    <div className="space-y-0.5">
                      <p className="text-[16px] font-medium text-graphite">{p.full_name}</p>
                      <p className="text-[14px] leading-[1.43] text-steel">{p.email}</p>
                    </div>
                  </div>
                  <ApproveButton userId={p.id} label="Reactivate" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
