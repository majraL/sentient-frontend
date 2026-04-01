import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { ADMIN_NAV_ITEMS } from "@/lib/constants/routes";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requireAdmin>
      <AppShell
        navItems={ADMIN_NAV_ITEMS}
        mode="admin"
      >
        {children}
      </AppShell>
    </AuthGuard>
  );
}
