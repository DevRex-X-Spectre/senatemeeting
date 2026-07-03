"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "./NotificationBell";
import { UserMenu } from "./UserMenu";
import type { Profile } from "@/types/domain";
import { logoutAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/components/ui";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";
import {
  Bell,
  CalendarDays,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  University,
  User,
  X,
} from "lucide-react";

interface TopbarProps {
  profile: Profile;
}

const MOBILE_NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meetings", label: "Meetings", icon: CalendarDays },
  { href: "/history", label: "History", icon: History },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

const MOBILE_ADMIN_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/meetings", label: "Meetings", icon: CalendarDays },
  { href: "/admin/members", label: "Members", icon: University },
];

export function Topbar({ profile }: TopbarProps) {
  const pathname = usePathname();
  const title = getMobileTitle(pathname, profile.role === "admin");
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const menuPanelRef = React.useRef<HTMLElement>(null);
  const unreadNotifications = useUnreadNotifications(profile.id);

  React.useEffect(() => {
    if (!menuOpen) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (menuButtonRef.current?.contains(target) || menuPanelRef.current?.contains(target)) return;
      setMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-fog-border bg-pure-white/95 backdrop-blur-xl">
      <div className="flex h-[68px] items-center justify-between gap-3 px-4 sm:h-18 sm:px-6 lg:h-20 lg:px-8">
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2 sm:hidden">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-graphite bg-graphite text-pure-white shadow-card">
              <University className="size-[18px]" />
            </div>
            <div className="min-w-0 leading-tight">
              <span className="block text-[11px] font-semibold uppercase text-steel">
                UniSenate
              </span>
              <span className="block truncate text-[16px] font-bold text-graphite">
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
          <div className="hidden sm:block">
            <NotificationBell unread={unreadNotifications} />
          </div>
          <div className="hidden sm:block">
            <UserMenu profile={profile} />
          </div>
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex size-10 items-center justify-center rounded-md border border-fog-border bg-pure-white text-graphite shadow-card transition-colors hover:bg-plaster sm:hidden"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      <MobileNavigationDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
        profile={profile}
        panelRef={menuPanelRef}
        unreadNotifications={unreadNotifications}
      />
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

function MobileNavigationDrawer({
  open,
  onClose,
  pathname,
  profile,
  panelRef,
  unreadNotifications,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
  profile: Profile;
  panelRef: React.RefObject<HTMLElement | null>;
  unreadNotifications: number;
}) {
  const isAdmin = profile.role === "admin";
  const items = isAdmin ? MOBILE_ADMIN_ITEMS : MOBILE_NAV_ITEMS;

  async function handleLogout() {
    onClose();
    await logoutAction();
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 top-[68px] z-40 bg-graphite/20 backdrop-blur-[2px] transition-opacity sm:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden
      />
      <nav
        ref={panelRef}
        className={cn(
          "fixed right-3 top-[76px] z-50 w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-fog-border bg-pure-white shadow-card-hover transition-all duration-200 sm:hidden",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
        aria-label="Mobile navigation"
      >
        <div className="flex items-center gap-3 border-b border-fog-border px-4 py-3">
          <Avatar name={profile.full_name} src={profile.avatar_url} size="md" />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-graphite">{profile.full_name}</p>
            <p className="break-all text-[12px] text-steel">{profile.email}</p>
          </div>
        </div>
        <ul className="border-b border-fog-border p-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 text-[14px] font-semibold transition-colors",
                    active
                      ? "bg-plaster text-graphite"
                      : "text-steel hover:bg-plaster/70 hover:text-graphite",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon className="size-5 shrink-0" />
                  <span>{item.label}</span>
                  {item.href === "/notifications" && unreadNotifications > 0 ? (
                    <span className="ml-auto flex min-w-5 items-center justify-center rounded-full bg-graphite px-1.5 py-0.5 text-[10px] font-bold leading-none text-pure-white">
                      {unreadNotifications > 9 ? "9+" : unreadNotifications}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="p-2">
          <Link
            href="/profile"
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-[14px] font-semibold transition-colors",
              pathname === "/profile"
                ? "bg-plaster text-graphite"
                : "text-steel hover:bg-plaster/70 hover:text-graphite",
            )}
          >
            <User className="size-5 shrink-0" />
            Account settings
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[14px] font-semibold text-danger transition-colors hover:bg-danger-soft"
          >
            <LogOut className="size-5 shrink-0" />
            Sign out
          </button>
        </div>
      </nav>
    </>
  );
}

function isActiveRoute(pathname: string, href: string) {
  if (href === "/admin" || href === "/dashboard" || href === "/profile") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
