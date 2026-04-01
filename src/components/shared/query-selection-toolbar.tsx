"use client";

import { Button } from "@/components/ui/button";
import { SearchToggle } from "@/components/shared/search-toggle";

type QuerySelectionToolbarProps = {
  selectedCount: number;
  usePreviousResults: boolean;
  onUsePreviousResultsChange: (checked: boolean) => void;
  onSearchAndAnalyze: () => void;
  disabled?: boolean;
};

export function QuerySelectionToolbar({
  selectedCount,
  usePreviousResults,
  onUsePreviousResultsChange,
  onSearchAndAnalyze,
  disabled,
}: QuerySelectionToolbarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0d1626]/95 p-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <span className="rounded-lg bg-white/5 px-3 py-2 text-slate-200">
          {selectedCount} selected
        </span>
        <SearchToggle
          checked={usePreviousResults}
          onCheckedChange={onUsePreviousResultsChange}
          label="Use Previous Results"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={onSearchAndAnalyze} disabled={disabled}>
          Search and Analyze
        </Button>
      </div>
    </div>
  );
}
