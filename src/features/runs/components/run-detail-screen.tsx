"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Download, RefreshCcw } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { runsApi } from "@/features/runs/api/runs-api";
import type { QueryRow } from "@/types/api";

function isProcessingStatus(status: QueryRow["status"]) {
  return status === "searching" || status === "analyzing";
}

export function RunDetailScreen({ runId }: { runId: string }) {
  const [activeQueryRow, setActiveQueryRow] = useState<QueryRow | null>(null);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isDescriptionOverflowing, setIsDescriptionOverflowing] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);
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

  useEffect(() => {
    function measureDescription() {
      if (!descriptionRef.current) {
        setIsDescriptionOverflowing(false);
        return;
      }

      setIsDescriptionOverflowing(
        descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight + 1,
      );
    }

    measureDescription();
    window.addEventListener("resize", measureDescription);
    return () => window.removeEventListener("resize", measureDescription);
  }, [runQuery.data?.description]);

  if (runQuery.isLoading || queryResults.isLoading) {
    return <LoadingState label="Loading run detail..." />;
  }

  if (runQuery.isError || queryResults.isError || !runQuery.data || !queryResults.data) {
    return <ErrorState onRetry={() => {
      runQuery.refetch();
      queryResults.refetch();
    }} />;
  }

  if (!queryResults.data.length) {
    return (
      <PageShell>
        <Link
          href="/runs"
          className="inline-flex w-fit items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to Runs
        </Link>
        <PageHeader
          title={runQuery.data.name}
          description={
            runQuery.data.description ? (
              <div className="max-w-3xl">
                <p ref={descriptionRef} className="line-clamp-5 whitespace-pre-wrap text-slate-400">
                  {runQuery.data.description}
                </p>
                {isDescriptionOverflowing ? (
                  <button
                    type="button"
                    className="mt-2 text-sm font-medium text-[#ffb56e] transition-colors hover:text-[#ffc78f]"
                    onClick={() => setIsDescriptionOpen(true)}
                  >
                    Read all
                  </button>
                ) : null}
              </div>
            ) : (
              "Inspect per-query execution status and review URL-level sentiment results."
            )
          }
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
        <ErrorState
          title="No run details yet"
          description="This run is ready, but no execution results have been generated yet."
          onRetry={() => {
            runQuery.refetch();
            queryResults.refetch();
          }}
        />
        <Dialog open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Run description</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-white/8 bg-[#0a1321] p-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                {runQuery.data.description}
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDescriptionOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Link
        href="/runs"
        className="inline-flex w-fit items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Back to Runs
      </Link>
        <PageHeader
          title={runQuery.data.name}
          description={
            runQuery.data.description ? (
              <div className="max-w-3xl">
                <p ref={descriptionRef} className="line-clamp-5 whitespace-pre-wrap text-slate-400">
                  {runQuery.data.description}
                </p>
                {isDescriptionOverflowing ? (
                  <button
                    type="button"
                    className="mt-2 text-sm font-medium text-[#ffb56e] transition-colors hover:text-[#ffc78f]"
                    onClick={() => setIsDescriptionOpen(true)}
                  >
                    Read all
                  </button>
                ) : null}
              </div>
            ) : (
              "Inspect per-query execution status and review URL-level sentiment results."
            )
          }
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

      <Dialog open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run description</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-white/8 bg-[#0a1321] p-4">
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
              {runQuery.data.description}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDescriptionOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
