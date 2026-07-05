import type { Profile } from "@/types/domain";

export function canManageSenate(profile: Pick<Profile, "role" | "status">) {
  return profile.status === "active" && (profile.role === "admin" || profile.role === "secretary");
}

export function canManageRoles(profile: Pick<Profile, "role" | "status">) {
  return profile.status === "active" && profile.role === "admin";
}

export function getRoleLabel(role: Profile["role"]) {
  if (role === "admin") return "VC";
  if (role === "secretary") return "Secretary";
  return "Member";
}
