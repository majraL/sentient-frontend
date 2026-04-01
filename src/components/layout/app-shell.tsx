"use client";

import type { PropsWithChildren } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAuth } from "@/features/auth/hooks/use-auth";

type AppShellProps = PropsWithChildren<{
  navItems: Array<{
    href: string;
    label: string;
  }>;
  mode: "client" | "admin";
}>;

export function AppShell({
  children,
  navItems,
  mode,
}: AppShellProps) {
  const { user } = useAuth();
  const workspaceTitle = user?.workspaceName?.trim() || "Sentient Workspace";

  return (
    <div className="min-h-screen bg-[#07101d] text-slate-100">
      <div className="flex min-h-screen">
        <AppSidebar navItems={navItems} user={user} mode={mode} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader title={workspaceTitle} />
          <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
