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
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-fog"
        aria-label="User menu"
        aria-expanded={open}
      >
        <Avatar name={profile.full_name} src={profile.avatar_url} size="sm" />
        <div className="hidden flex-col items-start lg:flex">
          <span className="text-[13px] font-medium leading-none text-midnight-navy">
            {profile.full_name}
          </span>
          <span className="text-[11px] leading-none text-slate-blue capitalize">
            {profile.role}
          </span>
        </div>
        <ChevronDown className={cn("size-4 text-slate-blue transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-lg border border-mist-border bg-paper shadow-card-hover">
            <div className="border-b border-mist-border px-3 py-2.5">
              <p className="text-[13px] font-medium text-midnight-navy">{profile.full_name}</p>
              <p className="text-[12px] text-slate-blue">{profile.email}</p>
            </div>
            <nav className="p-1">
              <button
                type="button"
                onClick={() => { setOpen(false); router.push("/profile"); }}
                className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-slate-blue transition-colors hover:bg-fog hover:text-midnight-navy"
              >
                <User className="size-4" />
                Profile
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