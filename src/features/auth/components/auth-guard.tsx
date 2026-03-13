"use client";

import type { PropsWithChildren } from "react";
import { LoadingState } from "@/components/shared/loading-state";
import { useAuth } from "@/features/auth/hooks/use-auth";

type AuthGuardProps = PropsWithChildren<{
  requireAdmin?: boolean;
}>;

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const { loading, user } = useAuth();

  if (loading || !user) {
    return <LoadingState label="Checking session..." />;
  }

  if (requireAdmin && user.role !== "admin") {
    return <LoadingState label="Redirecting to your workspace..." />;
  }

  return <>{children}</>;
}
