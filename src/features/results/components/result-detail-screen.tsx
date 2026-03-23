"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Download, ExternalLink, Pencil } from "lucide-react";
import { toast } from "sonner";
import { BrandTabs } from "@/components/shared/brand-tabs";
import { PageShell } from "@/components/shared/page-shell";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingState } from "@/components/shared/loading-state";
import { ErrorState } from "@/components/shared/error-state";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { resultsApi } from "@/features/results/api/results-api";
import { ROUTES } from "@/lib/constants/routes";
import { formatDateTime } from "@/lib/utils/dates";
import type { QuerySentiment } from "@/types/api";

function getSentimentBadge(sentiment: QuerySentiment) {
  if (sentiment === "positive") {
    return { label: "Positive :)", variant: "success" as const };
  }

  if (sentiment === "negative") {
    return { label: "Negative :(", variant: "danger" as const };
  }

  return { label: "Neutral", variant: "muted" as const };
}

function getTaskOpacity(status: string) {
  return status === "searching" || status === "analyzing" || status === "pending"
    ? "opacity-80"
    : "";
}

function getDomain(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

export function ResultDetailScreen({ runId }: { runId: string }) {
  const [activeBrandId, setActiveBrandId] = useState("all");
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isDescriptionOverflowing, setIsDescriptionOverflowing] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);

  const runQuery = useQuery({
    queryKey: ["run", runId],
    queryFn: () => resultsApi.getRunById(runId),
  });
  const tasksQuery = useQuery({
    queryKey: ["run-result-tasks", runId],
    queryFn: () => resultsApi.getRunResultTasks(runId),
  });

  useEffect(() => {
    function measureDescription() {
      if (!descriptionRef.current) {
        setIsDescriptionOverflowing(false);
        return;
      }

      setIsDescriptionOverflowing(
        descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight + 1,
      );
    }

    measureDescription();
    window.addEventListener("resize", measureDescription);
    return () => window.removeEventListener("resize", measureDescription);
  }, [runQuery.data?.description]);

  const sortedTasks = useMemo(
    () =>
      (tasksQuery.data ?? []).slice().sort((left, right) => {
        if (left.status === right.status) {
          return left.keyword.localeCompare(right.keyword);
        }

        const order = ["done", "searching", "analyzing", "pending", "failed"];
        return order.indexOf(left.status) - order.indexOf(right.status);
      }),
    [tasksQuery.data],
  );

  const brandsInRun = useMemo(() => {
    const brandMap = new Map<string, { id: string; name: string }>();
    sortedTasks.forEach((task) => {
      if (!brandMap.has(task.brandId)) {
        brandMap.set(task.brandId, { id: task.brandId, name: task.brandName });
      }
    });
    return Array.from(brandMap.values());
  }, [sortedTasks]);

  const visibleTasks = useMemo(
    () =>
      sortedTasks.filter((task) => activeBrandId === "all" || task.brandId === activeBrandId),
    [activeBrandId, sortedTasks],
  );

  if (runQuery.isLoading || tasksQuery.isLoading) {
    return <LoadingState label="Loading results detail..." />;
  }

  if (runQuery.isError || tasksQuery.isError || !runQuery.data || !tasksQuery.data) {
    return <ErrorState onRetry={() => {
      runQuery.refetch();
      tasksQuery.refetch();
    }} />;
  }

  const run = runQuery.data;

  return (
    <PageShell>
      <Link
        href={ROUTES.results}
        className="inline-flex w-fit items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Back to Results
      </Link>

      <PageHeader
        title={run.name}
        description={
          run.description ? (
            <div className="max-w-3xl">
              <p ref={descriptionRef} className="line-clamp-5 whitespace-pre-wrap text-slate-400">
                {run.description}
              </p>
              {isDescriptionOverflowing ? (
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-[#ffb56e] transition-colors hover:text-[#ffc78f]"
                  onClick={() => setIsDescriptionOpen(true)}
                >
                  Read all
                </button>
              ) : null}
            </div>
          ) : null
        }
        actions={
          <div className="flex flex-wrap items-center justify-end gap-3">
            <StatusBadge status={run.status} />
            <div className="rounded-xl border border-white/8 bg-[#0a1321] px-3 py-2 text-xs text-slate-300">
              Started: {formatDateTime(run.startedAt)}
            </div>
            <div className="rounded-xl border border-white/8 bg-[#0a1321] px-3 py-2 text-xs text-slate-300">
              Finished: {run.finishedAt ? formatDateTime(run.finishedAt) : "In progress"}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => toast.success("Edit mode coming soon")}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button
              type="button"
              onClick={() => toast.success("Download coming soon")}
            >
              <Download className="size-4" />
              Download report
            </Button>
          </div>
        }
      />

      {run.status !== "completed" ? (
        <div className="rounded-2xl border border-sky-400/20 bg-sky-500/8 px-4 py-3 text-sm text-sky-100">
          This run is still processing. Some results may be incomplete.
        </div>
      ) : null}

      <section className="space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveBrandId("all")}
            className={
              activeBrandId === "all"
                ? "shrink-0 rounded-xl border border-[#f28c28] bg-[#f28c28] px-4 py-2 text-sm font-medium text-[#10131a]"
                : "shrink-0 rounded-xl border border-white/10 bg-[#101a2c] px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-white"
            }
          >
            All brands
          </button>
          <BrandTabs
            brands={brandsInRun.map((brand) => ({
              id: brand.id,
              tenantId: run.tenantId,
              name: brand.name,
              website: "",
              industry: "",
              createdAt: run.createdAt,
            }))}
            activeBrandId={activeBrandId}
            onChange={setActiveBrandId}
          />
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Tasks</h3>
          <p className="mt-2 text-sm text-slate-400">
            Expand each task to inspect URL-level sentiment across collected search results.
          </p>
        </div>

        <Accordion>
          {visibleTasks.map((task, index) => (
            <AccordionItem
              key={task.id}
              className={getTaskOpacity(task.status)}
              open={index === 0 ? true : undefined}
            >
              <AccordionTrigger chevronPosition="left" className="items-center py-3">
                <div className="overflow-x-auto">
                  <div className="grid min-w-[840px] grid-cols-[minmax(0,2.4fr)_minmax(0,1.4fr)_minmax(0,1.4fr)_auto_auto_auto_auto] items-center gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{task.keyword}</p>
                    </div>
                    <div className="min-w-0 text-slate-300">
                      <p className="truncate">{task.brandName}</p>
                    </div>
                    <div className="min-w-0 text-slate-400">
                      <p className="truncate">
                        {task.countryName} / {task.languageName}
                      </p>
                    </div>
                    <div className="justify-self-start">
                      <StatusBadge status={task.status} />
                    </div>
                    <div className="whitespace-nowrap text-slate-300">P: {task.summary.positive}</div>
                    <div className="whitespace-nowrap text-slate-300">N: {task.summary.negative}</div>
                    <div className="whitespace-nowrap text-slate-300">U: {task.summary.neutral}</div>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent>
                {task.urls.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Position</TableHead>
                        <TableHead>Title / URL</TableHead>
                        <TableHead className="whitespace-nowrap">Source/domain</TableHead>
                        <TableHead className="whitespace-nowrap">Sentiment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {task.urls.map((url) => {
                        const sentiment = getSentimentBadge(url.sentiment);

                        return (
                          <TableRow key={url.id}>
                            <TableCell>{url.position}</TableCell>
                            <TableCell>
                              <div className="max-w-[640px] space-y-1">
                                <a
                                  href={url.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 font-medium text-white hover:text-[#ffb56e]"
                                >
                                  <span className="truncate">{url.title}</span>
                                  <ExternalLink className="size-4 shrink-0" />
                                </a>
                                <p className="truncate text-xs text-slate-400">{url.url}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="text-sm text-slate-200">{url.source}</p>
                                <p className="text-xs text-slate-500">{getDomain(url.url)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={sentiment.variant}>{sentiment.label}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="rounded-xl border border-white/8 bg-[#08111d] px-4 py-4 text-sm text-slate-400">
                    Results are still being collected.
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <Dialog open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run description</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-white/8 bg-[#0a1321] p-4">
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
              {run.description}
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDescriptionOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
