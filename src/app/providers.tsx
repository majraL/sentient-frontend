"use client";

import { PropsWithChildren, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DevTestPanel } from "@/components/dev/dev-test-panel";
import { AuthProvider } from "@/features/auth/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 15_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <DevTestPanel />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
