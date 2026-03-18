"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Cog, LayoutDashboard, Search, Settings2, UserCircle2, PlayCircle, PanelsTopLeft } from "lucide-react";
import { APP_NAME } from "@/lib/constants/app";
import { cn } from "@/lib/utils/cn";
import type { SessionUser } from "@/types/auth";

type NavItem = {
  href: string;
  label: string;
};

type AppSidebarProps = {
  navItems: NavItem[];
  user: SessionUser | null;
  mode: "client" | "admin";
};

const icons = {
  Dashboard: LayoutDashboard,
  Configuration: PanelsTopLeft,
  Runs: PlayCircle,
  Results: Search,
  Account: UserCircle2,
  Clients: Cog,
  Settings: Settings2,
};

export function AppSidebar({ navItems, user, mode }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-white/8 bg-[#08111d]/90 lg:flex lg:flex-col">
      <div className="border-b border-white/8 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-[#f28c28] text-[#10131a]">
            <BarChart3 className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-white">{APP_NAME}</p>
            <p className="text-sm text-slate-400">
              {mode === "admin" ? "Admin Console" : "Operational Workspace"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-6">
        <p className="px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Navigation
        </p>
        <nav className="mt-4 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = icons[item.label as keyof typeof icons] ?? LayoutDashboard;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-[#f28c28] text-[#10131a]" : "text-slate-300 hover:bg-white/6 hover:text-white",
                )}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/8 px-6 py-4">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Workspace</p>
        <p className="mt-2 font-medium text-slate-900">
          {user?.tenantId ? "Assigned tenant" : "Platform operations"}
        </p>
        <p className="text-sm text-slate-400">{user?.name ?? "Unknown user"}</p>
      </div>
    </aside>
  );
}
