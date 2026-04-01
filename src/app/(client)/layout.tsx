import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/features/auth/components/auth-guard";
import { CLIENT_NAV_ITEMS } from "@/lib/constants/routes";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppShell
        navItems={CLIENT_NAV_ITEMS}
        mode="client"
      >
        {children}
      </AppShell>
    </AuthGuard>
  );
}
