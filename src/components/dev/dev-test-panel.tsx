"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { devToolsApi } from "@/features/dev/api/dev-tools-api";

export function DevTestPanel() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const populateMutation = useMutation({
    mutationFn: devToolsApi.populateDemoData,
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      router.refresh();
      toast.success("Demo data loaded");
    },
  });

  const clearMutation = useMutation({
    mutationFn: devToolsApi.clearAllData,
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      router.refresh();
      toast.success("All data cleared");
    },
  });

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const isBusy = populateMutation.isPending || clearMutation.isPending;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-52 rounded-2xl border border-white/10 bg-[#0a1321]/95 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Dev Tools</p>
      <div className="mt-3 flex flex-col gap-2">
        <Button
          type="button"
          size="sm"
          className="justify-start"
          disabled={isBusy}
          onClick={() => populateMutation.mutate()}
        >
          Populate Demo Data
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="justify-start border-white/10 bg-transparent text-slate-200 hover:bg-white/5"
          disabled={isBusy}
          onClick={() => clearMutation.mutate()}
        >
          Clear All Data
        </Button>
      </div>
    </div>
  );
}
