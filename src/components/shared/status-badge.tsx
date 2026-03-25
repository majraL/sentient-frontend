import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import {
  normalizeRunStatus,
  runStatusConfig,
  subscriptionStatusConfig,
  systemStatusConfig,
  taskExecutionStatusConfig,
} from "@/lib/constants/status-config";

type StatusBadgeCategory = "run" | "task" | "system" | "subscription";

type StatusBadgeProps = {
  status: string;
  category: StatusBadgeCategory;
};

export function StatusBadge({ status, category }: StatusBadgeProps) {
  const config = getStatusConfig(status, category);
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "h-6 gap-1.5 px-2 py-0.5 text-[11px] font-medium normal-case",
        config.className,
      )}
    >
      <Icon className={cn("size-3.5 shrink-0", config.iconClassName)} />
      <span>{config.label}</span>
    </Badge>
  );
}

function getStatusConfig(status: string, category: StatusBadgeCategory) {
  if (category === "run") {
    return runStatusConfig[normalizeRunStatus(status)];
  }

  if (category === "task") {
    return taskExecutionStatusConfig[status as keyof typeof taskExecutionStatusConfig] ?? taskExecutionStatusConfig.pending;
  }

  if (category === "system") {
    return systemStatusConfig[status as keyof typeof systemStatusConfig] ?? systemStatusConfig.degraded;
  }

  return subscriptionStatusConfig[status as keyof typeof subscriptionStatusConfig] ?? subscriptionStatusConfig.cancelled;
}
