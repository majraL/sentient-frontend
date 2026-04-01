"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AddBrandModal } from "@/components/shared/add-brand-modal";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { BrandTabs } from "@/components/shared/brand-tabs";
import { QuerySelectionToolbar } from "@/components/shared/query-selection-toolbar";
import { QueryResultPanel } from "@/components/shared/query-result-panel";
import { ProcessingCellOverlay } from "@/components/shared/processing-cell-overlay";
import { SentimentBadge } from "@/components/shared/sentiment-badge";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { AppTable } from "@/components/shared/app-table";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { dashboardApi } from "@/features/dashboard/api/dashboard-api";
import type { QueryRow } from "@/types/api";

function isProcessing(row: QueryRow) {
  return row.status === "searching" || row.status === "analyzing";
}

function getRowSentiment(row: QueryRow) {
  if (row.status !== "done") {
    return "invalid" as const;
  }

  if (row.score >= 0.3) {
    return "positive" as const;
  }

  if (row.score <= -0.1) {
    return "negative" as const;
  }

  return "neutral" as const;
}

export function DashboardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeBrandId, setActiveBrandId] = useState("");
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [usePreviousResults, setUsePreviousResults] = useState(true);
  const [isNewBrandOpen, setIsNewBrandOpen] = useState(false);

  const brandsQuery = useQuery({
    queryKey: ["dashboard-brands"],
    queryFn: dashboardApi.getBrands,
  });

  const resolvedBrandId = activeBrandId || brandsQuery.data?.[0]?.id || "";

  const rowsQuery = useQuery({
    queryKey: ["dashboard-query-rows", resolvedBrandId],
    queryFn: () => dashboardApi.getQueryRows(resolvedBrandId),
    enabled: !!resolvedBrandId,
    refetchInterval: 6000,
  });
  const resolvedActiveRowId = activeRowId || rowsQuery.data?.[0]?.id || null;

  const resultsQuery = useQuery({
    queryKey: ["query-results", resolvedActiveRowId],
    queryFn: () => dashboardApi.getQueryResults(resolvedActiveRowId!),
    enabled: !!resolvedActiveRowId,
  });

  const updateSelectionMutation = useMutation({
    mutationFn: ({ id, selected }: { id: string; selected: boolean }) =>
      dashboardApi.updateSelection(id, selected),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard-query-rows", resolvedBrandId] });
    },
  });

  const runSearchMutation = useMutation({
    mutationFn: () => dashboardApi.runSelectedQueries(resolvedBrandId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard-query-rows", resolvedBrandId] });
      await queryClient.invalidateQueries({ queryKey: ["runs"] });
      toast.success(usePreviousResults ? "Search queued with previous results enabled" : "Search queued");
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: () => dashboardApi.analyzeCompletedQueries(resolvedBrandId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard-query-rows", resolvedBrandId] });
      if (resolvedActiveRowId) {
        await queryClient.invalidateQueries({ queryKey: ["query-results", resolvedActiveRowId] });
      }
      await queryClient.invalidateQueries({ queryKey: ["runs"] });
      toast.success("Sentiment analysis completed for selected rows");
    },
  });

  const selectedCount = rowsQuery.data?.filter((row) => row.selected).length ?? 0;
  const activeRow = rowsQuery.data?.find((row) => row.id === resolvedActiveRowId) ?? null;

  const topSentiment = useMemo(() => {
    const first = resultsQuery.data?.[0];
    return first?.sentiment ?? "invalid";
  }, [resultsQuery.data]);

  if (brandsQuery.isLoading || rowsQuery.isLoading) {
    return <LoadingState label="Loading operational dashboard..." />;
  }

  if (brandsQuery.isError || rowsQuery.isError || !brandsQuery.data) {
    return <ErrorState onRetry={() => {
      brandsQuery.refetch();
      rowsQuery.refetch();
    }} />;
  }

  if (!brandsQuery.data.length) {
    return (
      <PageShell>
        <PageHeader
          title="Dashboard"
          description="Execute query rows by brand, monitor status changes, and inspect URL-level sentiment results."
        />

        <EmptyState
          title="No brands yet"
          description="Create your first brand to start configuring tasks and running sentiment analysis."
          action={(
            <Button onClick={() => setIsNewBrandOpen(true)}>
              Create your first brand
            </Button>
          )}
        />

        <AddBrandModal
          open={isNewBrandOpen}
          onOpenChange={setIsNewBrandOpen}
          onCreated={async (brand) => {
            await queryClient.invalidateQueries({ queryKey: ["dashboard-brands"] });
            await queryClient.invalidateQueries({ queryKey: ["brands"] });
            setActiveBrandId(brand.id);
            setActiveRowId(null);
          }}
        />
      </PageShell>
    );
  }

  if (!rowsQuery.data) {
    return <ErrorState onRetry={() => rowsQuery.refetch()} />;
  }

  return (
    <PageShell>
      <PageHeader
        title="Dashboard"
        description="Execute query rows by brand, monitor status changes, and inspect URL-level sentiment results."
      />

      <BrandTabs
        brands={brandsQuery.data}
        activeBrandId={resolvedBrandId}
        showNewBrandAction
        onNewBrandClick={() => setIsNewBrandOpen(true)}
        onChange={(brandId) => {
          setActiveBrandId(brandId);
          setActiveRowId(null);
        }}
      />

      <QuerySelectionToolbar
        selectedCount={selectedCount}
        usePreviousResults={usePreviousResults}
        onUsePreviousResultsChange={setUsePreviousResults}
        onSearchAndAnalyze={async () => {
          await runSearchMutation.mutateAsync();
          await analyzeMutation.mutateAsync();
        }}
        disabled={!selectedCount}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_460px]">
        <AppTable title="Tasks" description="Select tasks to search and analyze for the active brand.">
          {rowsQuery.data.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Brand</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Keyword</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sentiment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rowsQuery.data.map((row) => (
                  <TableRow
                    key={row.id}
                    className={resolvedActiveRowId === row.id ? "bg-white/[0.04]" : undefined}
                    onClick={() => setActiveRowId(row.id)}
                  >
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={(event) =>
                          updateSelectionMutation.mutate({ id: row.id, selected: event.target.checked })
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{row.brandName}</TableCell>
                    <TableCell>{row.countryName}</TableCell>
                    <TableCell>{row.languageName}</TableCell>
                    <TableCell>{row.keyword}</TableCell>
                    <TableCell><StatusBadge status={row.status} category="task" /></TableCell>
                    <TableCell>
                      <ProcessingCellOverlay active={isProcessing(row)} label={row.status}>
                        <div>
                          {row.id === resolvedActiveRowId && row.status === "done" ? (
                            <SentimentBadge sentiment={topSentiment} />
                          ) : (
                            <SentimentBadge sentiment={getRowSentiment(row)} />
                          )}
                        </div>
                      </ProcessingCellOverlay>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-6">
              <EmptyState
                title="No tasks yet"
                description="Create a task for this brand to begin execution."
                action={(
                  <Button onClick={() => router.push(`/configuration?brandId=${resolvedBrandId}#task-form`)}>
                    Create a task
                  </Button>
                )}
              />
            </div>
          )}
        </AppTable>

        <QueryResultPanel row={activeRow} results={resultsQuery.data ?? []} />
      </section>

      <AddBrandModal
        open={isNewBrandOpen}
        onOpenChange={setIsNewBrandOpen}
        onCreated={async (brand) => {
          await queryClient.invalidateQueries({ queryKey: ["dashboard-brands"] });
          await queryClient.invalidateQueries({ queryKey: ["brands"] });
          setActiveBrandId(brand.id);
          setActiveRowId(null);
        }}
      />
    </PageShell>
  );
}
