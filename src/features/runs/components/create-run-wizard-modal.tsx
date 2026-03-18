"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { runsApi } from "@/features/runs/api/runs-api";
import { ROUTES } from "@/lib/constants/routes";
import { formatDateTime } from "@/lib/utils/dates";
import type { RunTaskOption } from "@/types/api";

type CreateRunWizardModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type WizardStep = 1 | 2 | 3;

export function CreateRunWizardModal({ open, onOpenChange }: CreateRunWizardModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<WizardStep>(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [executionMode, setExecutionMode] = useState<"now" | "scheduled">("now");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");

  const availableTasksQuery = useQuery({
    queryKey: ["available-run-tasks"],
    queryFn: runsApi.getAvailableTasks,
    enabled: open,
  });
  const taskPoolSummaryQuery = useQuery({
    queryKey: ["run-task-pool-summary"],
    queryFn: runsApi.getTaskPoolSummary,
    enabled: open,
  });

  const groupedTasks = useMemo(() => {
    const groups = new Map<string, { brandName: string; tasks: RunTaskOption[] }>();
    for (const task of availableTasksQuery.data ?? []) {
      const group = groups.get(task.brandId);
      if (group) {
        group.tasks.push(task);
      } else {
        groups.set(task.brandId, { brandName: task.brandName, tasks: [task] });
      }
    }
    return Array.from(groups.entries()).map(([brandId, group]) => ({
      brandId,
      brandName: group.brandName,
      tasks: group.tasks,
    }));
  }, [availableTasksQuery.data]);

  const createRunMutation = useMutation({
    mutationFn: () =>
      runsApi.createRun({
        name,
        description: description || undefined,
        taskIds: selectedTaskIds,
        executionMode,
        scheduledFor:
          executionMode === "scheduled" && startDate && startTime
            ? new Date(`${startDate}T${startTime}`).toISOString()
            : null,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["runs"] });
      await queryClient.invalidateQueries({ queryKey: ["run-query-results"] });
      await queryClient.invalidateQueries({ queryKey: ["available-run-tasks"] });
      await queryClient.invalidateQueries({ queryKey: ["run-task-pool-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["brand-config-rows"] });
      await queryClient.invalidateQueries({ queryKey: ["dashboard-query-rows"] });
      toast.success("Run created");
      resetWizard();
      onOpenChange(false);
      router.push(ROUTES.runs);
    },
  });

  function resetWizard() {
    setStep(1);
    setName("");
    setDescription("");
    setSelectedTaskIds([]);
    setExecutionMode("now");
    setStartDate("");
    setStartTime("");
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetWizard();
    }
    onOpenChange(nextOpen);
  }

  function toggleTask(taskId: string, checked: boolean) {
    setSelectedTaskIds((current) =>
      checked ? [...current, taskId] : current.filter((id) => id !== taskId),
    );
  }

  function toggleBrandTasks(taskIds: string[], checked: boolean) {
    setSelectedTaskIds((current) => {
      if (checked) {
        return Array.from(new Set([...current, ...taskIds]));
      }
      return current.filter((id) => !taskIds.includes(id));
    });
  }

  const selectedTasks = (availableTasksQuery.data ?? []).filter((task) => selectedTaskIds.includes(task.id));
  const selectedBrandsCount = new Set(selectedTasks.map((task) => task.brandId)).size;
  const scheduledFor =
    executionMode === "scheduled" && startDate && startTime
      ? new Date(`${startDate}T${startTime}`).toISOString()
      : null;
  const canProceedToReview =
    selectedTaskIds.length > 0 &&
    (executionMode === "now" || (Boolean(startDate) && Boolean(startTime)));

  function renderKeywordBadges(keywords: string[]) {
    return (
      <div className="flex flex-wrap gap-2">
        {keywords
          .map((keyword) => keyword.trim())
          .filter(Boolean)
          .map((keyword) => (
            <Badge key={keyword}>{keyword}</Badge>
          ))}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85vh] max-w-5xl flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-white/8 px-6 py-5">
          <DialogTitle>Create Run</DialogTitle>
          <DialogDescription>Step {step} of 3</DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Run details</h3>
                </div>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Run Name</Label>
                    <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Weekly reputation sweep" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description (Optional)</Label>
                    <Textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="Optional notes about this run"
                      className="min-h-24"
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-0 shrink-0 border-t border-white/8 bg-[#0e1727] px-6 py-4">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" disabled={!name.trim()} onClick={() => setStep(2)}>
                Next
              </Button>
            </DialogFooter>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Select Tasks</h3>
                    <p className="mt-2 text-sm text-slate-400">Choose one or more tasks to include in this run.</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-[#101a2c] px-3 py-2 text-sm text-slate-200">
                    Selected tasks: {selectedTaskIds.length}
                  </div>
                </div>

                <div className="space-y-4">
                  {availableTasksQuery.isLoading || taskPoolSummaryQuery.isLoading ? (
                    <div className="rounded-2xl border border-white/8 bg-[#0a1321] p-8 text-sm text-slate-400">
                      Loading available tasks...
                    </div>
                  ) : taskPoolSummaryQuery.data?.totalTasks === 0 ? (
                    <EmptyState
                      title="No available tasks"
                      description="Create tasks in Configuration before creating a run."
                      action={(
                        <Button onClick={() => {
                          handleOpenChange(false);
                          router.push(ROUTES.configuration);
                        }}
                        >
                          Go to Configuration
                        </Button>
                      )}
                    />
                  ) : !availableTasksQuery.data?.length ? (
                    <EmptyState
                      title="No available tasks"
                      description="All current tasks are already assigned to runs."
                    />
                  ) : (
                    <div className="space-y-4">
                      {groupedTasks.map((group) => {
                        const groupTaskIds = group.tasks.map((task) => task.id);
                        const allSelected = groupTaskIds.every((id) => selectedTaskIds.includes(id));

                        return (
                          <div key={group.brandId} className="rounded-2xl border border-white/8 bg-[#0a1321] p-4">
                            <div className="mb-3 flex items-center justify-between gap-4">
                              <h4 className="font-medium text-white">{group.brandName}</h4>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleBrandTasks(groupTaskIds, !allSelected)}
                              >
                                {allSelected ? "Clear" : "Select All"}
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {group.tasks.map((task) => (
                                <label
                                  key={task.id}
                                  className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-3 py-3 text-sm text-slate-200"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedTaskIds.includes(task.id)}
                                    onChange={(event) => toggleTask(task.id, event.target.checked)}
                                  />
                                  <span className="w-12 text-slate-400">{task.countryCode}</span>
                                  <span className="w-24 text-slate-300">{task.languageName}</span>
                                  <div className="min-w-0 flex-1">{renderKeywordBadges(task.keywords)}</div>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/8 bg-[#0a1321] p-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Execution</h4>
                      <p className="mt-2 text-sm text-slate-400">
                        Choose whether to start the run immediately or schedule it for later.
                      </p>
                    </div>

                    <div className="mt-4 space-y-3">
                      <label className="flex items-center gap-3 text-sm text-slate-200">
                        <input
                          type="radio"
                          name="execution-mode"
                          checked={executionMode === "now"}
                          onChange={() => setExecutionMode("now")}
                        />
                        <span>Run now</span>
                      </label>
                      <label className="flex items-center gap-3 text-sm text-slate-200">
                        <input
                          type="radio"
                          name="execution-mode"
                          checked={executionMode === "scheduled"}
                          onChange={() => setExecutionMode("scheduled")}
                        />
                        <span>Schedule for later</span>
                      </label>
                    </div>

                    {executionMode === "scheduled" ? (
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(event) => setStartDate(event.target.value)}
                            placeholder="Select date"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Start Time</Label>
                          <Input
                            type="time"
                            value={startTime}
                            onChange={(event) => setStartTime(event.target.value)}
                            placeholder="Select time"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-0 shrink-0 border-t border-white/8 bg-[#0e1727] px-6 py-4">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                type="button"
                disabled={!canProceedToReview || !availableTasksQuery.data?.length}
                onClick={() => setStep(3)}
              >
                Next
              </Button>
            </DialogFooter>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Review</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-[#0a1321] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Run Name</p>
                    <p className="mt-2 font-medium text-white">{name}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-[#0a1321] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Description</p>
                    <p className="mt-2 text-sm text-slate-300">{description || "No description"}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-[#0a1321] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Brands Included</p>
                    <p className="mt-2 font-medium text-white">{selectedBrandsCount}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-[#0a1321] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Tasks Included</p>
                    <p className="mt-2 font-medium text-white">{selectedTaskIds.length}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-[#0a1321] p-4 md:col-span-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Execution</p>
                    <p className="mt-2 font-medium text-white">
                      {executionMode === "now" ? "Run now" : "Scheduled"}
                    </p>
                    {executionMode === "scheduled" && scheduledFor ? (
                      <p className="mt-2 text-sm text-slate-300">Start: {formatDateTime(scheduledFor)}</p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-4">
                  {Array.from(
                    selectedTasks.reduce((map, task) => {
                      const current = map.get(task.brandId) ?? { brandName: task.brandName, tasks: [] as RunTaskOption[] };
                      current.tasks.push(task);
                      map.set(task.brandId, current);
                      return map;
                    }, new Map<string, { brandName: string; tasks: RunTaskOption[] }>()),
                  ).map(([brandId, group]) => (
                    <div key={brandId} className="rounded-2xl border border-white/8 bg-[#0a1321] p-4">
                      <h4 className="font-medium text-white">{group.brandName}</h4>
                      <div className="mt-3 space-y-2">
                        {group.tasks.map((task) => (
                          <div key={task.id} className="rounded-xl border border-white/6 bg-white/[0.02] px-3 py-3 text-sm text-slate-200">
                            <div className="flex flex-wrap items-center gap-2">
                              <span>{task.countryCode}</span>
                              <span className="text-slate-500">|</span>
                              <span>{task.languageName}</span>
                            </div>
                            <div className="mt-3">{renderKeywordBadges(task.keywords)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="mt-0 shrink-0 border-t border-white/8 bg-[#0e1727] px-6 py-4">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button type="button" disabled={createRunMutation.isPending} onClick={() => createRunMutation.mutate()}>
                Create Run
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
