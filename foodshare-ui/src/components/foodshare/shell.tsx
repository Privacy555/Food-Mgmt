"use client";

import { ChefHat, ClipboardList, LayoutDashboard, List, MapPin, Menu, Target, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppHeader, ServiceAreaBlock } from "@/components/foodshare/ui";
import { useFS } from "@/lib/foodshare/store";

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const ROLE_NAV: Record<string, { heading: string; items: NavItem[]; tagline: string; tabs: Array<{ id: string; label: (n: number) => string }> }> = {
  vendor: {
    heading: "Operations",
    items: [
      { id: "post", label: "Post Food", icon: ChefHat },
      { id: "inventory", label: "My Donations", icon: ClipboardList },
    ],
    tagline: "Food redistribution network",
    tabs: [
      { id: "post", label: () => "Post food" },
      { id: "inventory", label: (n) => `Inventory · ${n}` },
    ],
  },
  receiver: {
    heading: "Workspace",
    items: [
      { id: "find", label: "Nearby Feed", icon: MapPin },
      { id: "claims", label: "My Claims", icon: Target },
    ],
    tagline: "Food redistribution network",
    tabs: [
      { id: "find", label: () => "Find food" },
      { id: "claims", label: (n) => `My claims · ${n}` },
    ],
  },
  admin: {
    heading: "Workspace",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "users", label: "All Users", icon: List },
    ],
    tagline: "Admin verification & governance",
    tabs: [
      { id: "dashboard", label: () => "Dashboard" },
      { id: "users", label: () => "All Users" },
    ],
  },
};

export function DashboardShell({
  role,
  activeTab,
  onTab,
  secondaryCount,
  children,
}: {
  role: "vendor" | "receiver" | "admin";
  activeTab: string;
  onTab: (id: string) => void;
  secondaryCount: number;
  children: React.ReactNode;
}) {
  const cfg = ROLE_NAV[role];
  const session = useFS((s) => s.session);
  const drawerOpen = useFS((s) => s.drawerOpen);
  const setDrawer = useFS((s) => s.setDrawer);
  if (!session) return null;

  const nav = (
    <>
      <p className="text-[11px] font-bold uppercase tracking-wider text-fs-muted">{cfg.heading}</p>
      <nav className="mt-3 space-y-1" aria-label="Workspace">
        {cfg.items.map((item) => {
          const active = item.id === activeTab;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTab(item.id)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                active ? "bg-fs-green-soft text-fs-green-deep" : "text-fs-body hover:bg-[#e9ede8]"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="size-4" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <ServiceAreaBlock />
    </>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader tagline={cfg.tagline} />

      {/* mobile workspace bar + tabs */}
      <div className="border-b border-fs-line bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-2.5">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            className="flex items-center gap-2 text-sm font-semibold text-fs-ink"
            aria-label="Open workspace menu"
          >
            <Menu className="size-4.5" />
            Workspace menu
          </button>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-fs-green-deep">
            <span className="size-1.5 rounded-full bg-fs-green" />
            Verified account
          </span>
        </div>
        <div className="flex gap-2 border-t border-fs-line px-4 py-2.5">
          {cfg.tabs.map((t, i) => {
            const active = t.id === activeTab;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onTab(t.id)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  active ? "bg-fs-green-soft text-fs-green-deep" : "text-fs-muted hover:bg-[#f0f3ef]"
                }`}
              >
                {t.label(i === 1 ? secondaryCount : 0)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        <aside className="hidden w-56 shrink-0 border-r border-fs-line px-4 py-6 md:block">{nav}</aside>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">{children}</main>
      </div>

      {/* mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Workspace menu">
          <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close menu" onClick={() => setDrawer(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-fs-ink">Workspace</span>
              <button type="button" onClick={() => setDrawer(false)} aria-label="Close menu" className="rounded p-1 hover:bg-black/5">
                <X className="size-5" />
              </button>
            </div>
            {nav}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Small uppercase eyebrow used above dashboard titles. */
export function DashEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-semibold uppercase tracking-wider text-fs-muted">{children}</p>;
}
