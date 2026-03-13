"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { BrandTabs } from "@/components/shared/brand-tabs";
import { SaveIndicator } from "@/components/shared/save-indicator";
import { SectionCard } from "@/components/shared/section-card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { configurationApi } from "@/features/configuration/api/configuration-api";
import { brandSchema, configRowSchema, type BrandSchema, type ConfigRowSchema } from "@/features/configuration/schemas/configuration-schema";

export function ConfigurationScreen() {
  const queryClient = useQueryClient();
  const [activeBrandId, setActiveBrandId] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: configurationApi.getBrands,
  });

  const resolvedBrandId = activeBrandId || brandsQuery.data?.[0]?.id || "";

  const rowsQuery = useQuery({
    queryKey: ["brand-config-rows", resolvedBrandId],
    queryFn: () => configurationApi.getBrandConfigRows(resolvedBrandId),
    enabled: !!resolvedBrandId,
  });

  const brandForm = useForm<BrandSchema>({
    resolver: zodResolver(brandSchema),
    values: brandsQuery.data?.find((brand) => brand.id === resolvedBrandId),
  });

  const rowForm = useForm<ConfigRowSchema>({
    resolver: zodResolver(configRowSchema),
    defaultValues: {
      countryCode: "CH",
      countryName: "Switzerland",
      languageCode: "en",
      languageName: "English",
      geolocation: "",
      keywords: ["Brand review"],
    },
  });

  const updateBrandMutation = useMutation({
    mutationFn: (values: BrandSchema) => configurationApi.updateBrand(resolvedBrandId, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success("Brand updated");
    },
  });

  const addRowMutation = useMutation({
    mutationFn: (values: ConfigRowSchema) => configurationApi.createBrandConfigRow(resolvedBrandId, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["brand-config-rows", resolvedBrandId] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-query-rows", resolvedBrandId] });
      rowForm.reset({
        countryCode: "CH",
        countryName: "Switzerland",
        languageCode: "en",
        languageName: "English",
        geolocation: "",
        keywords: ["Brand review"],
      });
      toast.success("Configuration row added");
    },
  });

  const deleteRowMutation = useMutation({
    mutationFn: (rowId: string) => configurationApi.deleteBrandConfigRow(rowId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["brand-config-rows", resolvedBrandId] });
      toast.success("Configuration row deleted");
    },
  });

  const saveMutation = useMutation({
    mutationFn: () => configurationApi.saveBrandConfiguration(resolvedBrandId),
    onSuccess: async (result) => {
      setSavedAt(result.savedAt);
      await queryClient.invalidateQueries({ queryKey: ["brand-config-rows", resolvedBrandId] });
      toast.success("Configuration saved");
    },
  });

  if (brandsQuery.isLoading || rowsQuery.isLoading) {
    return <LoadingState label="Loading brand configuration..." />;
  }

  if (brandsQuery.isError || rowsQuery.isError || !brandsQuery.data || !rowsQuery.data) {
    return <ErrorState onRetry={() => {
      brandsQuery.refetch();
      rowsQuery.refetch();
    }} />;
  }

  return (
    <PageShell>
      <PageHeader
        title="Configuration"
        description="Manage brands and editable query configuration rows for each market and language."
        actions={<SaveIndicator savedAt={savedAt} />}
      />

      <BrandTabs brands={brandsQuery.data} activeBrandId={resolvedBrandId} onChange={setActiveBrandId} />

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <SectionCard title="Brand details" description="Basic info for the active brand.">
          <form className="space-y-4" onSubmit={brandForm.handleSubmit((values) => updateBrandMutation.mutate(values))}>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input {...brandForm.register("name")} />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input {...brandForm.register("website")} />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input {...brandForm.register("industry")} />
            </div>
            <Button type="submit">Save brand</Button>
          </form>
        </SectionCard>

        <SectionCard
          title="Brand configuration rows"
          description="Country, language, geolocation, and keyword setup for the selected brand."
          actions={<Button onClick={() => saveMutation.mutate()}>Save changes</Button>}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Geolocation</TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowsQuery.data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.countryName}</TableCell>
                  <TableCell>{row.languageName}</TableCell>
                  <TableCell>{row.geolocation ?? "-"}</TableCell>
                  <TableCell>{row.keywords.join(", ")}</TableCell>
                  <TableCell>
                    <button type="button" onClick={() => deleteRowMutation.mutate(row.id)}>
                      <Trash2 className="size-4 text-rose-300" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <form
            className="mt-6 grid gap-4 rounded-2xl border border-white/8 bg-[#0a1321] p-4 md:grid-cols-2"
            onSubmit={rowForm.handleSubmit((values) =>
              addRowMutation.mutate({
                ...values,
                geolocation: values.geolocation || null,
                keywords: values.keywords,
              })
            )}
          >
            <div className="space-y-2">
              <Label>Country code</Label>
              <Input {...rowForm.register("countryCode")} />
            </div>
            <div className="space-y-2">
              <Label>Country name</Label>
              <Input {...rowForm.register("countryName")} />
            </div>
            <div className="space-y-2">
              <Label>Language code</Label>
              <Input {...rowForm.register("languageCode")} />
            </div>
            <div className="space-y-2">
              <Label>Language name</Label>
              <Input {...rowForm.register("languageName")} />
            </div>
            <div className="space-y-2">
              <Label>Geolocation</Label>
              <Input {...rowForm.register("geolocation")} />
            </div>
            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input
                defaultValue={rowForm.getValues("keywords").join(", ")}
                onChange={(event) =>
                  rowForm.setValue(
                    "keywords",
                    event.target.value.split(",").map((keyword) => keyword.trim()).filter(Boolean),
                  )
                }
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit">Add row</Button>
            </div>
          </form>
        </SectionCard>
      </section>
    </PageShell>
  );
}
