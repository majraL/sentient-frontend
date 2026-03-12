"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, RefreshCcw } from "lucide-react";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { ProcessingCellOverlay } from "@/components/shared/processing-cell-overlay";
import { QueryResultPanel } from "@/components/shared/query-result-panel";
import { RunSummaryCard } from "@/components/shared/run-summary-card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { AppTable } from "@/components/shared/app-table";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { runsApi } from "@/features/runs/api/runs-api";
import type { QueryRow } from "@/types/api";

function isProcessingStatus(status: QueryRow["status"]) {
  return status === "searching" || status === "analyzing";
}

export function RunDetailScreen({ runId }: { runId: string }) {
  const [activeQueryRow, setActiveQueryRow] = useState<QueryRow | null>(null);
  const runQuery = useQuery({
    queryKey: ["run", runId],
    queryFn: () => runsApi.getRunById(runId),
  });
  const queryResults = useQuery({
    queryKey: ["run-query-results", runId],
    queryFn: () => runsApi.getRunQueryResults(runId),
  });
  const fallbackQueryRow = useMemo(() => {
    if (!queryResults.data?.length || !runQuery.data) {
      return null;
    }
    const first = queryResults.data[0];
    return {
      id: first.queryRowId,
      tenantId: runQuery.data.tenantId,
      brandId: runQuery.data.brandId,
      brandName: runQuery.data.brandName,
      countryCode: first.countryCode,
      countryName: first.countryName,
      languageCode: first.languageCode,
      languageName: first.languageName,
      keyword: first.keyword,
      status: first.status,
      selected: false,
      score: first.score,
      runId,
    };
  }, [queryResults.data, runId, runQuery.data]);
  const resolvedActiveQueryRow = activeQueryRow ?? fallbackQueryRow;
  const urlResults = useQuery({
    queryKey: ["run-url-results", runId, resolvedActiveQueryRow?.id],
    queryFn: () => runsApi.getRunResultUrls(runId, resolvedActiveQueryRow!.id),
    enabled: !!resolvedActiveQueryRow,
  });

  const rerunMutation = useMutation({
    mutationFn: () => runsApi.rerun(runQuery.data!.brandId),
    onSuccess: () => toast.success("Rerun queued from current brand context"),
  });

  if (runQuery.isLoading || queryResults.isLoading) {
    return <LoadingState label="Loading run detail..." />;
  }

  if (runQuery.isError || queryResults.isError || !runQuery.data || !queryResults.data) {
    return <ErrorState onRetry={() => {
      runQuery.refetch();
      queryResults.refetch();
    }} />;
  }

  return (
    <PageShell>
      <PageHeader
        title={runQuery.data.name}
        description="Inspect per-query execution status and review URL-level sentiment results."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => toast.success("Export prepared")}>
              <Download className="size-4" />
              Export
            </Button>
            <Button onClick={() => rerunMutation.mutate()}>
              <RefreshCcw className="size-4" />
              Rerun
            </Button>
          </div>
        }
      />

      <RunSummaryCard run={runQuery.data} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <AppTable title="Run query results" description="Execution outcomes and result counts for each query row.">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Keyword</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Results</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queryResults.data.map((result) => (
                <TableRow
                  key={result.id}
                  className={resolvedActiveQueryRow?.id === result.queryRowId ? "bg-white/[0.04]" : undefined}
                  onClick={() =>
                    setActiveQueryRow({
                      id: result.queryRowId,
                      tenantId: runQuery.data.tenantId,
                      brandId: runQuery.data.brandId,
                      brandName: runQuery.data.brandName,
                      countryCode: result.countryCode,
                      countryName: result.countryName,
                      languageCode: result.languageCode,
                      languageName: result.languageName,
                      keyword: result.keyword,
                      status: result.status,
                      selected: false,
                      score: result.score,
                      runId,
                    })
                  }
                >
                  <TableCell className="font-medium">{result.keyword}</TableCell>
                  <TableCell>{result.countryName}</TableCell>
                  <TableCell>{result.languageName}</TableCell>
                  <TableCell><StatusBadge status={result.status} /></TableCell>
                  <TableCell>
                    <ProcessingCellOverlay active={isProcessingStatus(result.status)} label={result.status}>
                      <span>{result.status === "done" ? result.score.toFixed(2) : "—"}</span>
                    </ProcessingCellOverlay>
                  </TableCell>
                  <TableCell>
                    <ProcessingCellOverlay active={isProcessingStatus(result.status)} label={result.status}>
                      <span>{result.status === "done" ? "10" : result.status === "failed" ? "0" : "—"}</span>
                    </ProcessingCellOverlay>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AppTable>

        <QueryResultPanel row={resolvedActiveQueryRow} results={urlResults.data ?? []} />
      </section>
    </PageShell>
  );
}
