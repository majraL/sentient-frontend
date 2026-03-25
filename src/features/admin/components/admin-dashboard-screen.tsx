"use client";

import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { AppTable } from "@/components/shared/app-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/features/admin/api/admin-api";

export function AdminDashboardScreen() {
  const query = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: adminApi.getDashboard,
  });

  if (query.isLoading) {
    return <LoadingState label="Loading admin dashboard..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState onRetry={() => query.refetch()} />;
  }

  return (
    <PageShell>
      <PageHeader title="Admin dashboard" description="System health, queue depth, active runs, and token usage." />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0d1626]/95 p-5">
          <p className="text-sm text-slate-500">Active runs</p>
          <p className="mt-2 text-3xl font-semibold text-white">{query.data.systemHealth.activeRuns}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0d1626]/95 p-5">
          <p className="text-sm text-slate-500">Queue depth</p>
          <p className="mt-2 text-3xl font-semibold text-white">{query.data.systemHealth.queueDepth}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0d1626]/95 p-5">
          <p className="text-sm text-slate-500">Failed tasks 24h</p>
          <p className="mt-2 text-3xl font-semibold text-white">{query.data.systemHealth.failedTasks24h}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0d1626]/95 p-5">
          <p className="text-sm text-slate-500">API status</p>
          <div className="mt-3">
            <StatusBadge status={query.data.systemHealth.apiStatus} category="system" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <AppTable title="Active runs" description="Runs currently executing or queued.">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.data.activeRuns.map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="font-medium">{run.name}</TableCell>
                  <TableCell>{run.brandName}</TableCell>
                  <TableCell><StatusBadge status={run.status} category="run" /></TableCell>
                  <TableCell>{run.completedQueries}/{run.totalQueries}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AppTable>

        <AppTable title="Token usage today" description="Minimal trend view for admin health checks.">
          <div className="h-[320px] p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={query.data.tokenUsage}>
                <XAxis dataKey="label" stroke="#6b7a92" />
                <YAxis stroke="#6b7a92" />
                <Tooltip />
                <Bar dataKey="value" fill="#f28c28" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AppTable>
      </section>
    </PageShell>
  );
}
