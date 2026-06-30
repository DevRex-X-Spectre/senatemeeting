"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";
import type { Profile } from "@/types/domain";
import { University } from "lucide-react";

interface TopbarProps {
  profile: Profile;
}

export function Topbar({ profile }: TopbarProps) {
  const pathname = usePathname();
  const title = getMobileTitle(pathname, profile.role === "admin");

  return (
    <header className="sticky top-0 z-30 border-b border-fog-border bg-pure-white/95 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:h-18 sm:px-6 lg:h-20 lg:px-8">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2 sm:hidden">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-graphite bg-graphite text-pure-white">
              <University className="size-4" />
            </div>
            <div className="min-w-0 leading-tight">
              <span className="block text-[11px] font-semibold uppercase text-steel">
                UniSenate
              </span>
              <span className="block truncate text-[15px] font-bold text-graphite">
                {title}
              </span>
            </div>
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-steel">
              UniSenate
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.025em] text-graphite">
              Senate workspace
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <NotificationBell userId={profile.id} />
          <UserMenu profile={profile} />
        </div>
      </div>
    </header>
  );
}

function getMobileTitle(pathname: string, isAdmin: boolean) {
  if (isAdmin) {
    if (pathname.startsWith("/admin/meetings")) return "Meetings";
    if (pathname.startsWith("/admin/members")) return "Members";
    return "Admin";
  }

  if (pathname.startsWith("/meetings")) return "Meetings";
  if (pathname.startsWith("/history")) return "History";
  if (pathname.startsWith("/notifications")) return "Notifications";
  if (pathname.startsWith("/profile")) return "Profile";
  return "Dashboard";
}
