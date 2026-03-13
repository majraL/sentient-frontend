import { AlertTriangle, LoaderCircle, Search, Sparkles, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: string;
};

const variantMap: Record<string, "default" | "success" | "warning" | "danger" | "info" | "muted"> = {
  queued: "warning",
  pending: "muted",
  searching: "info",
  analyzing: "warning",
  done: "success",
  completed: "success",
  failed: "danger",
  healthy: "success",
  degraded: "warning",
  down: "danger",
  trialing: "info",
  past_due: "warning",
};

const labels: Record<string, string> = {
  pending: "Pending",
  searching: "Searching",
  analyzing: "Analyzing",
  done: "Done",
  queued: "Queued",
  completed: "Completed",
  failed: "Failed",
  healthy: "Healthy",
  degraded: "Degraded",
  down: "Down",
  trialing: "Trialing",
  past_due: "Past Due",
};

const icons = {
  pending: AlertTriangle,
  searching: Search,
  analyzing: Sparkles,
  done: Sparkles,
  queued: LoaderCircle,
  completed: Sparkles,
  failed: XCircle,
  healthy: Sparkles,
  degraded: AlertTriangle,
  down: XCircle,
  trialing: LoaderCircle,
  past_due: AlertTriangle,
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const Icon = icons[status as keyof typeof icons];

  return (
    <Badge variant={variantMap[status] ?? "default"} className="gap-1.5 px-2 py-0.5 text-[11px]">
      {Icon ? <Icon className="size-3.5" /> : null}
      <span>{labels[status] ?? status.replace("_", " ")}</span>
    </Badge>
  );
}
