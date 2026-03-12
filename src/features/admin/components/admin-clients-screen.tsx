"use client";

import { useQuery } from "@tanstack/react-query";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { AppTable } from "@/components/shared/app-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminApi } from "@/features/admin/api/admin-api";

export function AdminClientsScreen() {
  const query = useQuery({
    queryKey: ["admin-clients"],
    queryFn: adminApi.getClients,
  });

  if (query.isLoading) {
    return <LoadingState label="Loading clients..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState onRetry={() => query.refetch()} />;
  }

  return (
    <PageShell>
      <PageHeader title="Clients" description="Tenant list with subscription and billing summary." />
      <AppTable title="Client accounts" description="Admin-only tenant visibility.">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company name</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Seat count</TableHead>
              <TableHead>Billing email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.companyName}</TableCell>
                <TableCell><StatusBadge status={client.subscriptionStatus} /></TableCell>
                <TableCell>{client.seatCount}</TableCell>
                <TableCell>{client.billingEmail}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AppTable>
    </PageShell>
  );
}
