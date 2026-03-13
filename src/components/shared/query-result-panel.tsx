"use client";

import type { QueryResultUrl, QueryRow } from "@/types/api";
import { EmptyState } from "@/components/shared/empty-state";
import { ProcessingCellOverlay } from "@/components/shared/processing-cell-overlay";
import { SentimentBadge } from "@/components/shared/sentiment-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type QueryResultPanelProps = {
  row: QueryRow | null;
  results: QueryResultUrl[];
};

export function QueryResultPanel({ row, results }: QueryResultPanelProps) {
  if (!row) {
    return (
      <EmptyState
        title="Select a query row"
        description="Click a completed or in-progress row to inspect its URL-level sentiment results."
      />
    );
  }

  const isProcessing = row.status === "searching" || row.status === "analyzing";
  const isDone = row.status === "done";
  const isFailed = row.status === "failed";

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-white">{row.keyword}</CardTitle>
        <p className="text-sm text-slate-400">
          {row.countryName} • {row.languageName}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {isProcessing ? (
          <ProcessingCellOverlay active className="rounded-2xl">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-xl border border-white/8 bg-[#0a1321] p-4">
                  <p className="font-medium text-white">Result title loading</p>
                  <p className="mt-1 text-xs text-slate-500">Source</p>
                  <p className="mt-3 text-sm text-slate-300">Preview content is still being prepared.</p>
                </div>
              ))}
            </div>
          </ProcessingCellOverlay>
        ) : isDone ? (
          results.map((result) => (
            <div key={result.id} className="rounded-xl border border-white/8 bg-[#0a1321] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-white">{result.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{result.source}</p>
                </div>
                <SentimentBadge sentiment={result.sentiment} />
              </div>
              <a
                href={result.url}
                className="mt-3 block truncate text-sm text-[#f7a85a] hover:text-[#ffbb79]"
                target="_blank"
                rel="noreferrer"
              >
                {result.url}
              </a>
              <p className="mt-3 text-sm text-slate-300">{result.snippet}</p>
            </div>
          ))
        ) : isFailed ? (
          <EmptyState
            title="No results available"
            description="This query failed, so URL-level results were not saved."
          />
        ) : (
          <EmptyState
            title="No results yet"
            description="Run this query to inspect the first 10 search results and sentiment labels."
          />
        )}
      </CardContent>
    </Card>
  );
}
