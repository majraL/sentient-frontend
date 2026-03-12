"use client";

import { LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";

type AppHeaderProps = {
  title: string;
  subtitle: string;
};

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="flex flex-col gap-4 border-b border-white/8 bg-[#0b1321]/80 px-6 py-4 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Signed-in tenant workspace
        </p>
        <h1 className="mt-1 text-xl font-semibold text-white">{title}</h1>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-white/10 bg-[#101a2c] px-3 py-2 text-right">
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="flex items-center justify-end gap-1 text-xs text-slate-400">
            <Shield className="size-3.5" />
            {user?.role?.replace("_", " ")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
