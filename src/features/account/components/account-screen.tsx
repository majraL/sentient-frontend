"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { accountApi } from "@/features/account/api/account-api";
import { accountProfileSchema, type AccountProfileSchema } from "@/features/account/schemas/account-schema";

export function AccountScreen() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["account-profile"],
    queryFn: accountApi.getProfile,
  });

  const form = useForm<AccountProfileSchema>({
    resolver: zodResolver(accountProfileSchema),
    values: query.data
      ? {
          companyName: query.data.companyName,
          name: query.data.name,
          email: query.data.email,
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: (values: AccountProfileSchema) => accountApi.updateProfile(values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["account-profile"] });
      toast.success("Account profile updated");
    },
  });

  if (query.isLoading) {
    return <LoadingState label="Loading account..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState onRetry={() => query.refetch()} />;
  }

  return (
    <PageShell>
      <PageHeader title="Account" description="Company info, user profile, subscription, and security overview." />

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Company and profile" description="Primary account details for the signed-in workspace.">
          <form className="space-y-4" onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <div className="space-y-2">
              <Label>Company name</Label>
              <Input {...form.register("companyName")} />
            </div>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...form.register("name")} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input {...form.register("email")} />
            </div>
            <Button type="submit">Save profile</Button>
          </form>
        </SectionCard>

        <SectionCard title="Subscription" description="Current plan and seat allocation for this tenant.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/8 bg-[#0a1321] p-4">
              <p className="text-sm text-slate-500">Subscription plan</p>
              <p className="mt-2 text-xl font-semibold text-white">{query.data.subscriptionPlan}</p>
            </div>
            <div className="rounded-xl border border-white/8 bg-[#0a1321] p-4">
              <p className="text-sm text-slate-500">Seat count</p>
              <p className="mt-2 text-xl font-semibold text-white">{query.data.seatCount}</p>
            </div>
          </div>
          <div className="mt-4 rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-400">
            Security management will be connected to the backend auth service later.
          </div>
        </SectionCard>
      </section>
    </PageShell>
  );
}
