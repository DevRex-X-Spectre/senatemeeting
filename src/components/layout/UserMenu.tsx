"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/lib/auth/actions";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import type { Profile } from "@/types/domain";
import { ChevronDown, LogOut, User } from "lucide-react";

interface UserMenuProps {
  profile: Profile;
}

export function UserMenu({ profile }: UserMenuProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  async function handleLogout() {
    setOpen(false);
    await logoutAction();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-md border border-fog-border bg-pure-white px-2 py-1.5 transition-colors hover:bg-plaster"
        aria-label="User menu"
        aria-expanded={open}
      >
        <Avatar name={profile.full_name} src={profile.avatar_url} size="sm" />
        <div className="hidden flex-col items-start lg:flex">
          <span className="text-[13px] font-medium leading-none text-graphite">
            {profile.full_name}
          </span>
          <span className="text-[11px] leading-none text-steel capitalize">
            {profile.role}
          </span>
        </div>
        <ChevronDown className={cn("size-4 text-steel transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="fixed right-3 top-[76px] z-50 w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-fog-border bg-pure-white shadow-card-hover sm:right-6 sm:top-[80px] lg:right-8 lg:top-[88px]">
            <div className="border-b border-fog-border px-3 py-3">
              <p className="truncate text-[13px] font-medium text-graphite">{profile.full_name}</p>
              <p className="break-all text-[12px] text-steel">{profile.email}</p>
            </div>
            <nav className="p-1">
              <button
                type="button"
                onClick={() => { setOpen(false); router.push("/profile"); }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-steel transition-colors hover:bg-plaster hover:text-graphite"
              >
                <User className="size-4" />
                View profile
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-danger transition-colors hover:bg-danger-soft"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}
