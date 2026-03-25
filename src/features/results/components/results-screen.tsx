"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/shared/empty-state";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { AppTable } from "@/components/shared/app-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { resultsApi } from "@/features/results/api/results-api";
import { getResultsRoute, ROUTES } from "@/lib/constants/routes";
import { formatDateTime } from "@/lib/utils/dates";

function getRowOpacity(status: string) {
  if (status === "scheduled") {
    return "opacity-65";
  }

  if (status === "running") {
    return "opacity-80";
  }

  return "";
}

export function ResultsScreen() {
  const router = useRouter();
  const query = useQuery({
    queryKey: ["runs"],
    queryFn: resultsApi.getRuns,
  });

  const hasCompletedRuns = useMemo(
    () => Boolean(query.data?.some((run) => run.status === "completed")),
    [query.data],
  );

  if (query.isLoading) {
    return <LoadingState label="Loading results..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState onRetry={() => query.refetch()} />;
  }

  if (!query.data.length) {
    return (
      <PageShell>
        <PageHeader
          title="Results"
          description="Review completed and in-progress run outputs from a results perspective."
        />
        <EmptyState
          title="No results yet"
          description="Create and run tasks to generate sentiment results."
          action={(
            <Button onClick={() => router.push(ROUTES.runs)}>
              Go to Runs
            </Button>
          )}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Results"
        description="Review completed and in-progress run outputs from a results perspective."
      />

      {!hasCompletedRuns ? (
        <EmptyState
          title="No completed results yet"
          description="Results will appear here once runs finish processing."
        />
      ) : null}

      <AppTable
        title="All runs"
        description="Track pipeline progress and open result details for any run."
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">Run name</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Created</TableHead>
              <TableHead className="whitespace-nowrap">Task Count</TableHead>
              <TableHead className="whitespace-nowrap text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data.map((run) => (
              <TableRow
                key={run.id}
                className={getRowOpacity(run.status)}
                onClick={() => router.push(getResultsRoute(run.id))}
              >
                <TableCell>
                  <div className="max-w-[600px] cursor-pointer">
                    <Link className="font-medium text-white hover:text-[#ffb56e]" href={getResultsRoute(run.id)}>
                      {run.name}
                    </Link>
                    {run.description ? (
                      <p className="mt-1 line-clamp-3 text-xs text-slate-400">{run.description}</p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={run.status} category="run" />
                </TableCell>
                <TableCell className="whitespace-nowrap">{formatDateTime(run.createdAt)}</TableCell>
                <TableCell>{run.taskIds.length}</TableCell>
                <TableCell className="text-right">
                  {run.status === "completed" ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={getResultsRoute(run.id)}>View results</Link>
                    </Button>
                  ) : null}
                  {run.status === "running" ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={getResultsRoute(run.id)}>Open</Link>
                    </Button>
                  ) : null}
                  {run.status === "scheduled" ? (
                    <Button size="sm" variant="outline" disabled>
                      Scheduled
                    </Button>
                  ) : null}
                  {run.status === "failed" ? (
                    <Button asChild size="sm" variant="outline">
                      <Link href={getResultsRoute(run.id)}>View</Link>
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AppTable>
    </PageShell>
  );
}
