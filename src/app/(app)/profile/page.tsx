import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle, Badge, Avatar } from "@/components/ui";
import { ProfileForm } from "@/components/auth/ProfileForm";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const profile = await requireActiveMember();

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      <div>
        <h1 className="text-heading font-bold text-midnight-navy">Profile</h1>
        <p className="mt-1 text-[15px] text-slate-blue">
          Manage your personal information.
        </p>
      </div>

      {/* Avatar preview */}
      <Card>
        <CardContent className="flex items-center gap-4 py-5">
          <Avatar name={profile.full_name} src={profile.avatar_url} size="lg" />
          <div className="flex flex-col gap-1">
            <p className="text-[16px] font-semibold text-midnight-navy">{profile.full_name}</p>
            <p className="text-caption text-slate-blue">{profile.email}</p>
            <Badge
              tone={profile.role === "admin" ? "info" : "neutral"}
              className="mt-1 w-fit capitalize"
            >
              {profile.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle>Edit information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}