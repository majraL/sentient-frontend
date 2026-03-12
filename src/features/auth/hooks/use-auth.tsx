"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "@/lib/constants/routes";
import { clearStoredSession, getStoredSession, persistSession } from "@/lib/auth/session";
import { loginRequest } from "@/features/auth/api/auth-api";
import type { LoginPayload } from "@/types/api";
import type { Session, SessionUser } from "@/types/auth";

type AuthContextValue = {
  user: SessionUser | null;
  session: Session | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<Session>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null>(() => getStoredSession());
  const loading = false;

  useEffect(() => {
    const isAuthRoute = pathname.startsWith(ROUTES.login);
    const isAdminRoute = pathname.startsWith("/admin");

    if (!session && !isAuthRoute) {
      router.replace(ROUTES.login);
      return;
    }

    if (session && session.user.role !== "admin" && isAdminRoute) {
      router.replace(ROUTES.dashboard);
      return;
    }

    if (session && isAuthRoute) {
      router.replace(session.user.role === "admin" ? ROUTES.adminDashboard : ROUTES.dashboard);
    }
  }, [pathname, router, session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      async login(payload) {
        const nextSession = await loginRequest(payload);
        persistSession(nextSession);
        setSession(nextSession);
        toast.success("Signed in successfully");
        return nextSession;
      },
      logout() {
        clearStoredSession();
        setSession(null);
        toast.success("Logged out");
        router.replace(ROUTES.login);
      },
    }),
    [loading, router, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
