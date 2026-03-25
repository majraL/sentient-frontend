import type { Run } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils/dates";

export function RunSummaryCard({ run }: { run: Run }) {
  return (
    <Card>
      <CardContent className="grid gap-4 p-5 md:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Brand</p>
          <p className="mt-2 text-slate-200">{run.brandName}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Started</p>
          <p className="mt-2 text-slate-200">{formatDateTime(run.startedAt)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
          <div className="mt-2">
            <StatusBadge status={run.status} category="run" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
