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
  ChevronLeft,
  ChevronRight,
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
  const [collapsed, setCollapsed] = React.useState(false);

  const isAdmin = profile.role === "admin";
  const items = isAdmin ? ADMIN_ITEMS : NAV_ITEMS;

  return (
    <>
      {/* Mobile bottom nav */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 flex items-center border-t border-mist-border bg-paper sm:hidden",
          "h-16 pb-safe",
        )}
        aria-label="Mobile navigation"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                active ? "text-signal-blue" : "text-slate-blue hover:text-midnight-navy",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden sm:flex fixed left-0 top-0 h-full flex-col border-r border-mist-border bg-paper transition-all duration-200",
          collapsed ? "w-16" : "w-60",
        )}
        aria-label="Navigation"
      >
        {/* Logo */}
        <div className={cn(
          "flex h-16 items-center border-b border-mist-border px-4 shrink-0",
          collapsed ? "justify-center" : "gap-2.5",
        )}>
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-midnight-navy text-paper">
            <University className="size-4" />
          </div>
          {!collapsed && (
            <span className="text-[17px] font-bold tracking-tight text-midnight-navy">
              UniSenate
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <ul className="flex flex-col gap-0.5">
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-medium transition-all duration-150",
                      collapsed && "justify-center px-0",
                      active
                        ? "bg-signal-blue/10 text-signal-blue"
                        : "text-slate-blue hover:bg-fog hover:text-midnight-navy",
                    )}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="size-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-mist-border px-2 py-3">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] text-slate-blue transition-colors hover:bg-fog hover:text-midnight-navy"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <>
                <ChevronLeft className="size-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}