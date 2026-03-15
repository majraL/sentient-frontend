"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { AddBrandModal } from "@/components/shared/add-brand-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { BrandTabs } from "@/components/shared/brand-tabs";
import { SectionCard } from "@/components/shared/section-card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { configurationApi } from "@/features/configuration/api/configuration-api";
import { brandSchema, configRowSchema, type BrandSchema, type ConfigRowSchema } from "@/features/configuration/schemas/configuration-schema";

export function ConfigurationScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isNewBrandOpen, setIsNewBrandOpen] = useState(false);
  const taskFormRef = useRef<HTMLDivElement | null>(null);
  const taskCountryInputRef = useRef<HTMLInputElement | null>(null);
  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: configurationApi.getBrands,
  });

  const requestedBrandId = searchParams.get("brandId") ?? "";
  const resolvedBrandId = requestedBrandId || brandsQuery.data?.[0]?.id || "";

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
      countryCode: "",
      countryName: "",
      languageCode: "",
      languageName: "",
      geolocation: "",
      keywords: [],
    },
  });
  const editTaskForm = useForm<ConfigRowSchema>({
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
  const countryCodeField = rowForm.register("countryCode");
  const createKeywords = useWatch({ control: rowForm.control, name: "keywords" }) ?? [];
  const editKeywords = useWatch({ control: editTaskForm.control, name: "keywords" }) ?? [];

  function focusTaskForm() {
    taskFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    taskCountryInputRef.current?.focus();
  }

  function selectBrand(brandId: string) {
    router.replace(`${pathname}?brandId=${brandId}`);
  }

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
        countryCode: "",
        countryName: "",
        languageCode: "",
        languageName: "",
        geolocation: "",
        keywords: [],
      });
      toast.success("Task added");
    },
  });

  const editTaskMutation = useMutation({
    mutationFn: ({ rowId, values }: { rowId: string; values: ConfigRowSchema }) =>
      configurationApi.updateBrandConfigRow(rowId, values),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["brand-config-rows", resolvedBrandId] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-query-rows", resolvedBrandId] });
      setEditingTaskId(null);
      toast.success("Task updated");
    },
  });

  const deleteRowMutation = useMutation({
    mutationFn: (rowId: string) => configurationApi.deleteBrandConfigRow(rowId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["brand-config-rows", resolvedBrandId] });
      toast.success("Task deleted");
    },
  });

  const editingTask = rowsQuery.data?.find((row) => row.id === editingTaskId) ?? null;

  if (brandsQuery.isLoading || rowsQuery.isLoading) {
    return <LoadingState label="Loading brand setup and tasks..." />;
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
        description="Manage brands and define tasks for each market, language, and keyword set."
      />

      <BrandTabs
        brands={brandsQuery.data}
        activeBrandId={resolvedBrandId}
        showNewBrandAction
        onNewBrandClick={() => setIsNewBrandOpen(true)}
        onChange={selectBrand}
      />

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

        <div className="space-y-6">
          <SectionCard
            title="Add Task"
            description="Create a task for the selected brand with country, language, geolocation, and keywords."
          >
            <div ref={taskFormRef} className="mb-4 rounded-2xl border border-white/8 bg-[#0a1321] p-4">
              <p className="text-sm font-medium text-white">
                {brandsQuery.data.find((brand) => brand.id === resolvedBrandId)?.name}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Add a new task first, then review the full task list below.
              </p>
            </div>

            <form
              className="grid gap-4 rounded-2xl border border-white/8 bg-[#0a1321] p-4 md:grid-cols-2"
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
                <Input
                  {...countryCodeField}
                  placeholder="CH"
                  ref={(node) => {
                    countryCodeField.ref(node);
                    taskCountryInputRef.current = node;
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Country name</Label>
                <Input {...rowForm.register("countryName")} placeholder="Switzerland" />
              </div>
              <div className="space-y-2">
                <Label>Language code</Label>
                <Input {...rowForm.register("languageCode")} placeholder="en" />
              </div>
              <div className="space-y-2">
                <Label>Language name</Label>
                <Input {...rowForm.register("languageName")} placeholder="English" />
              </div>
              <div className="space-y-2">
                <Label>Geolocation</Label>
                <Input {...rowForm.register("geolocation")} placeholder="Zurich" />
              </div>
              <div className="space-y-2">
                <Label>Keywords</Label>
                <Input
                  value={createKeywords.join(", ")}
                  placeholder="brand name, brand review, brand scam"
                  onChange={(event) =>
                    rowForm.setValue(
                      "keywords",
                      event.target.value.split(",").map((keyword) => keyword.trim()).filter(Boolean),
                    )
                  }
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit">Add Task</Button>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            title="Task List"
            description="Review and remove existing tasks for the selected brand."
          >
            {rowsQuery.data.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Country</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Geolocation</TableHead>
                    <TableHead>Keywords</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
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
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            aria-label="Edit Task"
                            onClick={() => {
                              setEditingTaskId(row.id);
                              editTaskForm.reset({
                                countryCode: row.countryCode,
                                countryName: row.countryName,
                                languageCode: row.languageCode,
                                languageName: row.languageName,
                                geolocation: row.geolocation ?? "",
                                keywords: row.keywords,
                              });
                            }}
                          >
                            <Pencil className="size-4 text-slate-300" />
                          </button>
                          <button type="button" aria-label="Delete Task" onClick={() => deleteRowMutation.mutate(row.id)}>
                            <Trash2 className="size-4 text-rose-300" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="No tasks yet"
                description="Create a task for this brand to begin execution."
                action={<Button onClick={focusTaskForm}>Create a task</Button>}
              />
            )}
          </SectionCard>
        </div>
      </section>

      <Dialog open={!!editingTask} onOpenChange={(open) => {
        if (!open) {
          setEditingTaskId(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update the country, language, geolocation, and keywords for this task.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={editTaskForm.handleSubmit((values) => {
              if (!editingTaskId) {
                return;
              }

              editTaskMutation.mutate({
                rowId: editingTaskId,
                values: {
                  ...values,
                  geolocation: values.geolocation || null,
                  keywords: values.keywords,
                },
              });
            })}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Country code</Label>
                <Input {...editTaskForm.register("countryCode")} />
              </div>
              <div className="space-y-2">
                <Label>Country name</Label>
                <Input {...editTaskForm.register("countryName")} />
              </div>
              <div className="space-y-2">
                <Label>Language code</Label>
                <Input {...editTaskForm.register("languageCode")} />
              </div>
              <div className="space-y-2">
                <Label>Language name</Label>
                <Input {...editTaskForm.register("languageName")} />
              </div>
              <div className="space-y-2">
                <Label>Geolocation</Label>
                <Input {...editTaskForm.register("geolocation")} />
              </div>
              <div className="space-y-2">
                <Label>Keywords</Label>
                <Input
                  value={editKeywords.join(", ")}
                  onChange={(event) =>
                    editTaskForm.setValue(
                      "keywords",
                      event.target.value.split(",").map((keyword) => keyword.trim()).filter(Boolean),
                    )
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingTaskId(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={editTaskMutation.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AddBrandModal
        open={isNewBrandOpen}
        onOpenChange={setIsNewBrandOpen}
        onCreated={async (brand) => {
          await queryClient.invalidateQueries({ queryKey: ["brands"] });
          router.replace(`${pathname}?brandId=${brand.id}`);
        }}
      />
    </PageShell>
  );
}
