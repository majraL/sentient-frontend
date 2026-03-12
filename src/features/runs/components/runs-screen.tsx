"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { AppTable } from "@/components/shared/app-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { SearchInput } from "@/components/shared/search-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRunRoute } from "@/lib/constants/routes";
import { formatDateTime } from "@/lib/utils/dates";
import { runsApi } from "@/features/runs/api/runs-api";

export function RunsScreen() {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const query = useQuery({
    queryKey: ["runs"],
    queryFn: runsApi.getRuns,
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

  return (
    <PageShell>
      <PageHeader title="Runs" description="Previous executions across brands, with status and completion detail." />

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
                <SelectItem value="running">Running</SelectItem>
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
              <TableHead>Brand</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Started</TableHead>
              <TableHead>Finished</TableHead>
              <TableHead>Completed queries</TableHead>
              <TableHead>Failed queries</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRuns.map((run) => (
              <TableRow key={run.id}>
                <TableCell>
                  <Link className="font-medium text-white hover:text-[#ffb56e]" href={getRunRoute(run.id)}>
                    {run.name}
                  </Link>
                </TableCell>
                <TableCell>{run.brandName}</TableCell>
                <TableCell><StatusBadge status={run.status} /></TableCell>
                <TableCell>{formatDateTime(run.startedAt)}</TableCell>
                <TableCell>{run.finishedAt ? formatDateTime(run.finishedAt) : "-"}</TableCell>
                <TableCell>{run.completedQueries}/{run.totalQueries}</TableCell>
                <TableCell>{run.failedQueries}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AppTable>
    </PageShell>
  );
}
