"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  History,
  Bell,
  User,
  University,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Profile } from "@/types/domain";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meetings", label: "Meetings", icon: CalendarDays },
  { href: "/history", label: "History", icon: History },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

const ADMIN_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/meetings", label: "Meetings", icon: CalendarDays },
  { href: "/admin/members", label: "Members", icon: University },
];

interface SidebarProps {
  profile: Profile;
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = profile.role === "admin";
  const items = isAdmin ? ADMIN_ITEMS : NAV_ITEMS;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-full w-60 flex-col border-r border-fog-border bg-pure-white sm:flex",
      )}
      aria-label="Navigation"
    >
        <div className="flex h-20 items-center gap-3 border-b border-fog-border px-5 shrink-0">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-graphite bg-graphite text-pure-white">
            <University className="size-4" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[17px] font-bold tracking-[-0.025em] text-graphite">UniSenate</span>
            <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-steel">
              Senate operations
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActiveRoute(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-medium transition-colors duration-150",
                      active
                        ? "bg-plaster text-graphite border border-fog-border"
                        : "text-steel hover:bg-plaster hover:text-graphite",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className={cn("size-5 shrink-0 transition-transform duration-150", active && "scale-105", "group-hover:scale-105")} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
    </aside>
  );
}

function isActiveRoute(pathname: string, href: string) {
  if (href === "/admin" || href === "/dashboard" || href === "/profile") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
