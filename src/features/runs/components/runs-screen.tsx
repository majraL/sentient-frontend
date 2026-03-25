"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { AddBrandModal } from "@/components/shared/add-brand-modal";
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
import { getResultsRoute, getRunRoute } from "@/lib/constants/routes";
import { formatDateTime } from "@/lib/utils/dates";
import { configurationApi } from "@/features/configuration/api/configuration-api";
import { runsApi } from "@/features/runs/api/runs-api";

export function RunsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [isCreateRunOpen, setIsCreateRunOpen] = useState(false);
  const [isNewBrandOpen, setIsNewBrandOpen] = useState(false);
  const query = useQuery({
    queryKey: ["runs"],
    queryFn: runsApi.getRuns,
  });
  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: configurationApi.getBrands,
  });
  const taskPoolSummaryQuery = useQuery({
    queryKey: ["run-task-pool-summary"],
    queryFn: runsApi.getTaskPoolSummary,
  });
  const hasAvailableTasks = taskPoolSummaryQuery.data ? taskPoolSummaryQuery.data.availableTasks > 0 : false;
  const createRunHelperText = hasAvailableTasks
    ? null
    : "No available tasks. Add new tasks in Configuration before creating another run.";

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

  if (query.isLoading || brandsQuery.isLoading || taskPoolSummaryQuery.isLoading) {
    return <LoadingState label="Loading run history..." />;
  }

  if (query.isError || brandsQuery.isError || taskPoolSummaryQuery.isError || !query.data || !brandsQuery.data || !taskPoolSummaryQuery.data) {
    return <ErrorState onRetry={() => {
      query.refetch();
      brandsQuery.refetch();
      taskPoolSummaryQuery.refetch();
    }} />;
  }

  if (!query.data.length) {
    if (!brandsQuery.data.length) {
      return (
        <PageShell>
          <PageHeader
            title="Runs"
            description="Previous executions across brands, with status and completion detail."
          />
          <EmptyState
            title="No brands yet"
            description="Create a new brand to start setting up tasks and creating runs."
            action={(
              <Button onClick={() => setIsNewBrandOpen(true)}>
                Create Brand
              </Button>
            )}
          />
          <AddBrandModal
            open={isNewBrandOpen}
            onOpenChange={setIsNewBrandOpen}
            onCreated={async () => {
              await queryClient.invalidateQueries({ queryKey: ["brands"] });
              await queryClient.invalidateQueries({ queryKey: ["dashboard-brands"] });
            }}
          />
        </PageShell>
      );
    }

    if (taskPoolSummaryQuery.data.totalTasks === 0) {
      return (
        <PageShell>
          <PageHeader
            title="Runs"
            description="Previous executions across brands, with status and completion detail."
          />
            <EmptyState
              title="No tasks yet"
              description="Create a task for one of your brands before creating a run."
              action={(
              <Button onClick={() => router.push(`/configuration?brandId=${brandsQuery.data[0].id}`)}>
                Create Task
              </Button>
              )}
            />
        </PageShell>
      );
    }

    return (
      <PageShell>
        <PageHeader
          title="Runs"
          description="Previous executions across brands, with status and completion detail."
          actions={(
            <div className="flex flex-col items-end gap-2">
              <Button disabled={!hasAvailableTasks} onClick={() => setIsCreateRunOpen(true)}>
                Create Run
              </Button>
              {createRunHelperText ? (
                <p className="max-w-64 text-right text-xs text-slate-400">{createRunHelperText}</p>
              ) : null}
            </div>
          )}
        />
        <EmptyState
          title="No runs yet"
          description="Create a run to group tasks and prepare execution."
          action={(
            <Button disabled={!hasAvailableTasks} onClick={() => setIsCreateRunOpen(true)}>
              Create Run
            </Button>
          )}
        />
        {createRunHelperText ? (
          <p className="mt-4 text-center text-sm text-slate-400">{createRunHelperText}</p>
        ) : null}
        <CreateRunWizardModal open={isCreateRunOpen} onOpenChange={setIsCreateRunOpen} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        title="Runs"
        description="Previous executions across brands, with status and completion detail."
        actions={(
          <div className="flex flex-col items-end gap-2">
            <Button disabled={!hasAvailableTasks} onClick={() => setIsCreateRunOpen(true)}>
              Create Run
            </Button>
            {createRunHelperText ? (
              <p className="max-w-64 text-right text-xs text-slate-400">{createRunHelperText}</p>
            ) : null}
          </div>
        )}
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
              <TableHead className="whitespace-nowrap">Run name</TableHead>
              <TableHead className="whitespace-nowrap">Status</TableHead>
              <TableHead className="whitespace-nowrap">Created</TableHead>
              <TableHead className="whitespace-nowrap">Task Count</TableHead>
              <TableHead className="w-[240px] whitespace-nowrap text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRuns.map((run) => (
              <TableRow key={run.id}>
                <TableCell>
                  <div className="max-w-[600px]">
                    <Link className="font-medium text-white hover:text-[#ffb56e]" href={getRunRoute(run.id)}>
                      {run.name}
                    </Link>
                    {run.description ? (
                      <p className="mt-1 line-clamp-3 text-xs text-slate-400">{run.description}</p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <StatusBadge status={run.status} category="run" />
                    {run.status === "scheduled" && run.scheduledFor ? (
                      <p className="text-xs text-slate-400">Start: {formatDateTime(run.scheduledFor)}</p>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap">{formatDateTime(run.createdAt)}</TableCell>
                <TableCell>{run.taskIds.length}</TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-2">
                    {run.status === "scheduled" ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await runsApi.startNow(run.id);
                          await queryClient.invalidateQueries({ queryKey: ["runs"] });
                          await queryClient.invalidateQueries({ queryKey: ["run", run.id] });
                          await queryClient.invalidateQueries({ queryKey: ["run-query-results", run.id] });
                          await queryClient.invalidateQueries({ queryKey: ["dashboard-query-rows"] });
                        }}
                      >
                        Start now
                      </Button>
                    ) : null}
                    {run.status === "failed" ? (
                      <span className="text-xs text-slate-500">Review available</span>
                    ) : null}
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button asChild type="button" size="sm" variant="ghost">
                        <Link href={getRunRoute(run.id)}>View Run</Link>
                      </Button>
                      {run.status !== "scheduled" ? (
                        <Button asChild type="button" size="sm" variant="outline">
                          <Link href={getResultsRoute(run.id)}>View results</Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
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
