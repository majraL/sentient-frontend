"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateRunWizardModal } from "@/features/runs/components/create-run-wizard-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { AppTable } from "@/components/shared/app-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { SearchInput } from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRunRoute } from "@/lib/constants/routes";
import { formatDateTime } from "@/lib/utils/dates";
import { runsApi } from "@/features/runs/api/runs-api";

export function RunsScreen() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [isCreateRunOpen, setIsCreateRunOpen] = useState(false);
  const query = useQuery({
    queryKey: ["runs"],
    queryFn: runsApi.getRuns,
  });

  const startNowMutation = useMutation({
    mutationFn: (runId: string) => runsApi.startNow(runId),
    onSuccess: async (_, runId) => {
      await queryClient.invalidateQueries({ queryKey: ["runs"] });
      await queryClient.invalidateQueries({ queryKey: ["run", runId] });
    },
  });

  const runMutation = useMutation({
    mutationFn: (runId: string) => runsApi.run(runId),
    onSuccess: async (_, runId) => {
      await queryClient.invalidateQueries({ queryKey: ["runs"] });
      await queryClient.invalidateQueries({ queryKey: ["run", runId] });
      await queryClient.invalidateQueries({ queryKey: ["run-query-results", runId] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-query-rows"] });
    },
  });

  const filteredRuns = useMemo(() => {
    if (!query.data) {
      return [];
    }
    return query.data.filter((run) => {
      const matchesStatus = status === "all" || run.status === status;
      const matchesSearch =
        run.name.toLowerCase().includes(search.toLowerCase()) ||
        run.brandName.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [query.data, search, status]);

  if (query.isLoading) {
    return <LoadingState label="Loading run history..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState onRetry={() => query.refetch()} />;
  }

  if (!filteredRuns.length) {
    return (
      <PageShell>
        <PageHeader
          title="Runs"
          description="Previous executions across brands, with status and completion detail."
          actions={<Button onClick={() => setIsCreateRunOpen(true)}>Create Run</Button>}
        />
        <EmptyState
          title="No runs yet"
          description="Create your first run to group tasks and prepare execution."
          action={(
            <Button onClick={() => setIsCreateRunOpen(true)}>
              Create Run
            </Button>
          )}
        />
        <CreateRunWizardModal open={isCreateRunOpen} onOpenChange={setIsCreateRunOpen} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Runs"
        description="Previous executions across brands, with status and completion detail."
        actions={<Button onClick={() => setIsCreateRunOpen(true)}>Create Run</Button>}
      />

      <AppTable
        title="Run history"
        description="Filter and inspect previous workflow executions."
        actions={
          <div className="flex flex-col gap-3 md:flex-row">
            <SearchInput value={search} onChange={setSearch} placeholder="Search runs..." />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="queued">Queued</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Run name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Task Count</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRuns.map((run) => (
              <TableRow key={run.id}>
                <TableCell>
                  <div>
                    <Link className="font-medium text-white hover:text-[#ffb56e]" href={getRunRoute(run.id)}>
                      {run.name}
                    </Link>
                    {run.description ? (
                      <p className="mt-1 text-xs text-slate-400">{run.description}</p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <StatusBadge status={run.status} />
                    {run.status === "scheduled" && run.scheduledFor ? (
                      <p className="text-xs text-slate-400">Start: {formatDateTime(run.scheduledFor)}</p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>{formatDateTime(run.createdAt)}</TableCell>
                <TableCell>{run.taskIds.length}</TableCell>
                <TableCell className="text-right">
                  {run.status === "scheduled" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={startNowMutation.isPending}
                      onClick={() => startNowMutation.mutate(run.id)}
                    >
                      Start now
                    </Button>
                  ) : null}
                  {run.status === "ready" ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={runMutation.isPending}
                      onClick={() => runMutation.mutate(run.id)}
                    >
                      Run
                    </Button>
                  ) : null}
                  {run.status === "running" ? (
                    <Button type="button" size="sm" variant="outline" disabled>
                      Running
                    </Button>
                  ) : null}
                  {run.status === "completed" ? (
                    <Button asChild type="button" size="sm" variant="outline">
                      <Link href={getRunRoute(run.id)}>View</Link>
                    </Button>
                  ) : null}
                  {run.status === "failed" ? (
                    <span className="text-xs text-slate-500">No action</span>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AppTable>
      <CreateRunWizardModal open={isCreateRunOpen} onOpenChange={setIsCreateRunOpen} />
    </PageShell>
  );
}
