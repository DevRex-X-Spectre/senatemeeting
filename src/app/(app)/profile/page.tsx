import type { Metadata } from "next";
import { requireActiveMember } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle, Badge, Avatar } from "@/components/ui";
import { ProfileForm } from "@/components/auth/ProfileForm";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const profile = await requireActiveMember();

  return (
    <div className="mx-auto max-w-lg space-y-6 py-6 sm:space-y-8 sm:py-8">
      <div className="space-y-2">
        <h1 className="text-[32px] font-bold leading-[1.14] tracking-[-0.025em] text-graphite sm:text-[40px]">
          Profile
        </h1>
        <p className="text-[16px] leading-[1.5] text-steel">
          Manage your personal details and account information.
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
          <Avatar name={profile.full_name} src={profile.avatar_url} size="lg" />
          <div className="flex flex-col gap-1">
            <p className="text-[16px] font-semibold text-graphite">{profile.full_name}</p>
            <p className="text-[14px] leading-[1.43] text-steel">{profile.email}</p>
            <Badge
              tone={profile.role === "admin" ? "info" : "neutral"}
              className="mt-1 w-fit capitalize"
            >
              {profile.role}
            </Badge>
          </div>
        </CardContent>
      </Card>

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