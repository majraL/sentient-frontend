"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/shared/loading-state";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ROUTES } from "@/lib/constants/routes";

export default function HomePage() {
  const router = useRouter();
  const { loading, user } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace(ROUTES.login);
      return;
    }

    router.replace(user.role === "admin" ? ROUTES.adminDashboard : ROUTES.dashboard);
  }, [loading, router, user]);

  return <LoadingState label="Preparing your workspace..." />;
}
