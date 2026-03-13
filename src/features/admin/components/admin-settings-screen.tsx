"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { SectionCard } from "@/components/shared/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminApi } from "@/features/admin/api/admin-api";
import { adminSettingsSchema, type AdminSettingsSchema } from "@/features/admin/schemas/admin-settings-schema";

export function AdminSettingsScreen() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin-settings"],
    queryFn: adminApi.getSettings,
  });

  const form = useForm<AdminSettingsSchema>({
    resolver: zodResolver(adminSettingsSchema),
    values: query.data
      ? {
          ignoredDomains: query.data.ignoredDomains.join(", "),
          concurrencyLimit: query.data.concurrencyLimit,
          runTimeoutSec: query.data.runTimeoutSec,
          retryLimit: query.data.retryLimit,
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (values: AdminSettingsSchema) =>
      adminApi.updateSettings({
        ignoredDomains: values.ignoredDomains.split(",").map((item) => item.trim()).filter(Boolean),
        concurrencyLimit: values.concurrencyLimit,
        runTimeoutSec: values.runTimeoutSec,
        retryLimit: values.retryLimit,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Admin settings saved");
    },
  });

  if (query.isLoading) {
    return <LoadingState label="Loading admin settings..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState onRetry={() => query.refetch()} />;
  }

  return (
    <PageShell>
      <PageHeader title="Settings" description="Global runtime settings for queueing, timeout, and retry behavior." />
      <SectionCard title="System settings" description="Adjust global execution safeguards and ignore rules.">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <div className="space-y-2 md:col-span-2">
            <Label>Ignored domains</Label>
            <Input {...form.register("ignoredDomains")} />
          </div>
          <div className="space-y-2">
            <Label>Concurrency limit</Label>
            <Input type="number" {...form.register("concurrencyLimit", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Run timeout (sec)</Label>
            <Input type="number" {...form.register("runTimeoutSec", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>Retry limit</Label>
            <Input type="number" {...form.register("retryLimit", { valueAsNumber: true })} />
          </div>
          <div className="md:col-span-2">
            <Button type="submit">Save settings</Button>
          </div>
        </form>
      </SectionCard>
    </PageShell>
  );
}
