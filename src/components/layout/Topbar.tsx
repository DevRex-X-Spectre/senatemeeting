"use client";

import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";
import { Avatar } from "@/components/ui";
import type { Profile } from "@/types/domain";

interface TopbarProps {
  profile: Profile;
}

export function Topbar({ profile }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-mist-border bg-paper px-4 sm:px-6">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 sm:hidden">
        <span className="text-[15px] font-bold text-midnight-navy">UniSenate</span>
      </div>

      {/* Spacer for mobile */}
      <div className="hidden sm:block" />

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <NotificationBell userId={profile.id} />
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}