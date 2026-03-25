"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { ArrowRight, Pencil, Trash2, X } from "lucide-react";
import { AddBrandModal } from "@/components/shared/add-brand-modal";
import { EmptyState } from "@/components/shared/empty-state";
import { MetaBadge } from "@/components/shared/meta-badge";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { BrandTabs } from "@/components/shared/brand-tabs";
import { SectionCard } from "@/components/shared/section-card";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { configurationApi } from "@/features/configuration/api/configuration-api";
import { brandSchema, configRowSchema, type BrandSchema, type ConfigRowSchema } from "@/features/configuration/schemas/configuration-schema";

export function ConfigurationScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [assigningTaskId, setAssigningTaskId] = useState<string | null>(null);
  const [isNewBrandOpen, setIsNewBrandOpen] = useState(false);
  const [createKeywordsInput, setCreateKeywordsInput] = useState("");
  const [editKeywordsInput, setEditKeywordsInput] = useState("");
  const [selectedRunId, setSelectedRunId] = useState("");
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
  const runsQuery = useQuery({
    queryKey: ["runs"],
    queryFn: configurationApi.getRuns,
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

  function normalizeKeywords(keywords: string[]) {
    return Array.from(new Set(keywords.map((keyword) => keyword.trim()).filter(Boolean)));
  }

  function renderKeywordBadges(keywords: string[]) {
    const normalizedKeywords = normalizeKeywords(keywords);

    return (
      <div className="flex flex-wrap gap-2">
        {normalizedKeywords.map((keyword) => (
          <Badge key={keyword}>{keyword}</Badge>
        ))}
      </div>
    );
  }

  function finalizeKeywords(committedKeywords: string[], inputValue: string) {
    return normalizeKeywords([
      ...committedKeywords,
      ...inputValue.split(",").map((keyword) => keyword.trim()).filter(Boolean),
    ]);
  }

  function buildKeywordInputState(currentKeywords: string[], inputValue: string) {
    const segments = inputValue.split(", ");
    if (segments.length === 1) {
      return {
        keywords: currentKeywords,
        inputValue,
      };
    }

    return {
      keywords: normalizeKeywords([...currentKeywords, ...segments.slice(0, -1)]),
      inputValue: segments.at(-1) ?? "",
    };
  }

  function removeKeyword(
    keywords: string[],
    setKeywords: (keywords: string[]) => void,
    keywordToRemove: string,
  ) {
    setKeywords(keywords.filter((keyword) => keyword !== keywordToRemove));
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
      setCreateKeywordsInput("");
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
      setEditKeywordsInput("");
      toast.success("Task updated");
    },
  });

  const addTaskToRunMutation = useMutation({
    mutationFn: ({ rowId, runId }: { rowId: string; runId: string }) => configurationApi.addTaskToRun(rowId, runId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["runs"] });
      setAssigningTaskId(null);
      setSelectedRunId("");
      toast.success("Task added to run");
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
  const assigningTask = rowsQuery.data?.find((row) => row.id === assigningTaskId) ?? null;

  if (brandsQuery.isLoading || rowsQuery.isLoading || runsQuery.isLoading) {
    return <LoadingState label="Loading brand setup and tasks..." />;
  }

  if (brandsQuery.isError || rowsQuery.isError || runsQuery.isError || !brandsQuery.data || !runsQuery.data) {
    return <ErrorState onRetry={() => {
      brandsQuery.refetch();
      rowsQuery.refetch();
      runsQuery.refetch();
    }} />;
  }

  if (!brandsQuery.data.length) {
    return (
      <PageShell>
        <PageHeader
          title="Configuration"
          description="Manage brands and define tasks for each market, language, and keyword set."
        />

        <EmptyState
          title="No brands yet"
          description="Create your first brand to start adding tasks."
          action={(
            <Button onClick={() => setIsNewBrandOpen(true)}>
              Create your first brand
            </Button>
          )}
        />

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

  if (!rowsQuery.data) {
    return <ErrorState onRetry={() => rowsQuery.refetch()} />;
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
            <div id="task-form" className="mb-4 rounded-2xl border border-white/8 bg-[#0a1321] p-4">
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
                  keywords: finalizeKeywords(createKeywords, createKeywordsInput),
                })
              )}
            >
              <div className="space-y-2">
                <Label>Country code</Label>
                <Input {...countryCodeField} placeholder="CH" />
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
                <div className="space-y-3">
                  {createKeywords.length ? (
                    <div className="flex flex-wrap gap-2">
                      {createKeywords.map((keyword) => (
                        <Badge key={keyword} className="gap-1">
                          <span>{keyword}</span>
                          <button
                            type="button"
                            className="rounded-full hover:text-white"
                            onClick={() =>
                              removeKeyword(
                                createKeywords,
                                (keywords) => rowForm.setValue("keywords", keywords, { shouldValidate: true }),
                                keyword,
                              )
                            }
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  <Input
                    value={createKeywordsInput}
                    placeholder="brand name, brand review, is brand legit"
                    onChange={(event) => {
                      const nextState = buildKeywordInputState(createKeywords, event.target.value);
                      setCreateKeywordsInput(nextState.inputValue);
                      rowForm.setValue("keywords", nextState.keywords, { shouldValidate: true });
                    }}
                  />
                </div>
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
                    <TableHead>Status</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rowsQuery.data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.countryName}</TableCell>
                      <TableCell>{row.languageName}</TableCell>
                      <TableCell>{row.geolocation ?? "-"}</TableCell>
                      <TableCell>{renderKeywordBadges(row.keywords)}</TableCell>
                      <TableCell>
                        {row.runId ? <MetaBadge status="assigned" /> : <span className="text-sm text-slate-500">-</span>}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <div className="flex items-center gap-2">
                            {!row.runId ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    type="button"
                                    aria-label="Add task to run"
                                    className="cursor-pointer transition-opacity hover:opacity-80"
                                    onClick={() => {
                                      setAssigningTaskId(row.id);
                                      setSelectedRunId(runsQuery.data?.[0]?.id ?? "");
                                    }}
                                  >
                                    <ArrowRight className="size-4 text-amber-300" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent>Add to run</TooltipContent>
                              </Tooltip>
                            ) : null}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  aria-label="Edit Task"
                                  className="cursor-pointer transition-opacity hover:opacity-80"
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
                                    setEditKeywordsInput("");
                                  }}
                                >
                                  <Pencil className="size-4 text-slate-300" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  aria-label="Delete Task"
                                  className="cursor-pointer transition-opacity hover:opacity-80"
                                  onClick={() => deleteRowMutation.mutate(row.id)}
                                >
                                  <Trash2 className="size-4 text-rose-300" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="No tasks yet"
                description="Add your first task above to begin."
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
                  keywords: finalizeKeywords(editKeywords, editKeywordsInput),
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
                <div className="space-y-3">
                  {editKeywords.length ? (
                    <div className="flex flex-wrap gap-2">
                      {editKeywords.map((keyword) => (
                        <Badge key={keyword} className="gap-1">
                          <span>{keyword}</span>
                          <button
                            type="button"
                            className="rounded-full hover:text-white"
                            onClick={() =>
                              removeKeyword(
                                editKeywords,
                                (keywords) => editTaskForm.setValue("keywords", keywords, { shouldValidate: true }),
                                keyword,
                              )
                            }
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  <Input
                    value={editKeywordsInput}
                    placeholder="brand name, brand review, is brand legit"
                    onChange={(event) => {
                      const nextState = buildKeywordInputState(editKeywords, event.target.value);
                      setEditKeywordsInput(nextState.inputValue);
                      editTaskForm.setValue("keywords", nextState.keywords, { shouldValidate: true });
                    }}
                  />
                </div>
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

      <Dialog open={!!assigningTask} onOpenChange={(open) => {
        if (!open) {
          setAssigningTaskId(null);
          setSelectedRunId("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add task to run</DialogTitle>
            <DialogDescription>
              Choose an existing run to include this task.
            </DialogDescription>
          </DialogHeader>

          {runsQuery.data.length ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!assigningTaskId || !selectedRunId) {
                  return;
                }
                addTaskToRunMutation.mutate({ rowId: assigningTaskId, runId: selectedRunId });
              }}
            >
              <div className="space-y-2">
                <Label>Run</Label>
                <select
                  className="flex h-10 w-full rounded-xl border border-white/10 bg-[#101a2c] px-3 py-2 text-sm text-white outline-none"
                  value={selectedRunId}
                  onChange={(event) => setSelectedRunId(event.target.value)}
                >
                  {runsQuery.data.map((run) => (
                    <option key={run.id} value={run.id}>
                      {run.name}
                    </option>
                  ))}
                </select>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAssigningTaskId(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedRunId || addTaskToRunMutation.isPending}>
                  Add to Run
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <EmptyState
              title="No runs yet"
              description="Create a run before adding tasks."
              action={(
                <Button onClick={() => {
                  setAssigningTaskId(null);
                  router.push("/runs");
                }}
                >
                  Create a new Run
                </Button>
              )}
            />
          )}
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
