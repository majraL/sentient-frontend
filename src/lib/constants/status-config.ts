import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  CircleSlash,
  Clock3,
  Frown,
  LoaderCircle,
  Minus,
  Pencil,
  Search,
  Smile,
  Sparkles,
  XCircle,
} from "lucide-react";
import type { QuerySentiment } from "@/types/api";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "muted";

type StatusDefinition = {
  label: string;
  variant: BadgeVariant;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
};

export type RunStatusDisplay = "scheduled" | "running" | "completed" | "failed";
export type TaskExecutionStatusDisplay = "pending" | "searching" | "analyzing" | "done" | "failed";
export type MetaStatus = "assigned" | "edited";
export type SystemStatus = "healthy" | "degraded" | "down";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled";

export const runStatusConfig: Record<RunStatusDisplay, StatusDefinition> = {
  scheduled: {
    label: "Scheduled",
    variant: "warning",
    icon: Clock3,
    className: "border border-amber-400/15",
  },
  running: {
    label: "Running",
    variant: "info",
    icon: LoaderCircle,
    className: "border border-sky-400/15",
    iconClassName: "animate-spin",
  },
  completed: {
    label: "Completed",
    variant: "success",
    icon: CheckCircle2,
    className: "border border-emerald-400/15",
  },
  failed: {
    label: "Failed",
    variant: "danger",
    icon: XCircle,
    className: "border border-rose-400/15",
  },
};

export const taskExecutionStatusConfig: Record<TaskExecutionStatusDisplay, StatusDefinition> = {
  pending: {
    label: "Pending",
    variant: "muted",
    icon: Clock3,
    className: "border border-slate-500/20",
  },
  searching: {
    label: "Searching",
    variant: "info",
    icon: Search,
    className: "border border-sky-400/15",
  },
  analyzing: {
    label: "Analyzing",
    variant: "info",
    icon: Sparkles,
    className: "border border-cyan-400/15 text-cyan-300",
  },
  done: {
    label: "Done",
    variant: "success",
    icon: Check,
    className: "border border-emerald-400/15",
  },
  failed: {
    label: "Failed",
    variant: "danger",
    icon: XCircle,
    className: "border border-rose-400/15",
  },
};

export const sentimentStatusConfig: Record<QuerySentiment, StatusDefinition> = {
  positive: {
    label: "Positive",
    variant: "success",
    icon: Smile,
    className: "border border-emerald-400/15",
  },
  negative: {
    label: "Negative",
    variant: "danger",
    icon: Frown,
    className: "border border-rose-400/15",
  },
  neutral: {
    label: "Neutral",
    variant: "muted",
    icon: Minus,
    className: "border border-slate-500/20",
  },
  invalid: {
    label: "Invalid",
    variant: "muted",
    icon: CircleSlash,
    className: "border border-slate-500/20 text-slate-500",
  },
};

export const metaStatusConfig: Record<MetaStatus, StatusDefinition> = {
  assigned: {
    label: "Assigned",
    variant: "success",
    icon: Check,
    className: "border border-emerald-400/10 bg-emerald-500/10 text-emerald-200",
  },
  edited: {
    label: "Edited",
    variant: "warning",
    icon: Pencil,
    className: "border border-amber-400/10 bg-amber-500/10 text-amber-200",
  },
};

export const systemStatusConfig: Record<SystemStatus, StatusDefinition> = {
  healthy: {
    label: "Healthy",
    variant: "success",
    icon: CheckCircle2,
    className: "border border-emerald-400/15",
  },
  degraded: {
    label: "Degraded",
    variant: "warning",
    icon: AlertCircle,
    className: "border border-amber-400/15",
  },
  down: {
    label: "Down",
    variant: "danger",
    icon: XCircle,
    className: "border border-rose-400/15",
  },
};

export const subscriptionStatusConfig: Record<SubscriptionStatus, StatusDefinition> = {
  trialing: {
    label: "Trialing",
    variant: "info",
    icon: Clock3,
    className: "border border-sky-400/15",
  },
  active: {
    label: "Active",
    variant: "success",
    icon: CheckCircle2,
    className: "border border-emerald-400/15",
  },
  past_due: {
    label: "Past Due",
    variant: "warning",
    icon: AlertCircle,
    className: "border border-amber-400/15",
  },
  cancelled: {
    label: "Cancelled",
    variant: "muted",
    icon: XCircle,
    className: "border border-slate-500/20",
  },
};

export function normalizeRunStatus(status: string): RunStatusDisplay {
  if (status === "running") {
    return "running";
  }

  if (status === "completed") {
    return "completed";
  }

  if (status === "failed") {
    return "failed";
  }

  return "scheduled";
}
