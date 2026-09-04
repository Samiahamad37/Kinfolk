"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  GitBranch,
  Users,
  Clock,
  Image,
  CalendarDays,
  FileText,
  BookOpen,
  MessageCircle,
  Settings2,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  LogOut,
  UserCog,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { PersonProfilePanel } from "@/components/PersonProfilePanel";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tree", label: "Family Tree", icon: GitBranch },
  { href: "/people", label: "Family Members", icon: Users },
  { href: "/timeline", label: "Timeline", icon: Clock },
  { href: "/photos", label: "Photos & Memories", icon: Image },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/stories", label: "Family Stories", icon: BookOpen },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/admin/members", label: "Manage access", icon: UserCog },
  { href: "/settings", label: "Settings", icon: Settings2 },
] as const;

const MOBILE_NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/tree", label: "Tree", icon: GitBranch },
  { href: "/people", label: "Members", icon: Users },
  { href: "/photos", label: "Photos", icon: Image },
  { href: "/settings", label: "Settings", icon: Settings2 },
] as const;

type Props = {
  userName: string;
  userInitials: string;
  userRole: string;
  children: React.ReactNode;
};

export function AppShell({ userName, userInitials, userRole, children }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const selectedPersonId = searchParams.get("person");
  const pageTitle =
    NAV_ITEMS.find((n) => pathname === n.href || pathname.startsWith(`${n.href}/`))?.label ??
    "Roots & Relations";

  function toggleDark() {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
  }

  function closePerson() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("person");
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  }

  function selectPerson(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("person", id);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--ink)]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-[var(--sidebar)] transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]">
            <GitBranch size={17} color="#FDFAF6" />
          </div>
          <div>
            <div className="font-display text-sm font-semibold leading-none text-[#F0E8DC]">Roots &</div>
            <div className="font-display text-sm font-semibold leading-none text-[var(--accent)]">
              Relations
            </div>
          </div>
          <button type="button" className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={18} color="#A89882" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6E4828]">
            Navigation
          </div>
          {NAV_ITEMS.map((item) => {
            if (item.href === "/admin/members" && userRole !== "ADMIN") return null;
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item w-full ${active ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 px-3 py-4">
          <div className="flex items-center gap-3 rounded-lg p-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8B5E3C] text-[13px] font-semibold text-[#FDFAF6]">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-[#F0E8DC]">{userName}</div>
              <div className="text-[11px] text-[#6E4828]">Tree creator</div>
            </div>
            <form action={logoutAction}>
              <button type="submit" title="Log out" className="text-[#A89882] hover:text-white">
                <LogOut size={15} />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--line)] bg-[var(--panel)] px-5 py-3">
          <button type="button" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-[var(--muted)]" />
          </button>
          <div className="font-display text-base font-semibold text-[var(--ink)]">{pageTitle}</div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)]"
              onClick={toggleDark}
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun size={15} className="text-[var(--muted)]" />
              ) : (
                <Moon size={15} className="text-[var(--muted)]" />
              )}
            </button>
            <button
              type="button"
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--line)]"
              aria-label="Notifications"
            >
              <Bell size={15} className="text-[var(--muted)]" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto pb-20 lg:pb-0">{children}</main>

        <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-[var(--line)] bg-[var(--panel)] lg:hidden">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 flex-col items-center gap-1 py-3"
                style={{ color: active ? "#C17E4A" : "var(--muted)" }}
              >
                <Icon size={20} />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {selectedPersonId && (
        <PersonProfilePanel
          personId={selectedPersonId}
          onClose={closePerson}
          onSelectPerson={selectPerson}
        />
      )}
    </div>
  );
}
