import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { metaStatusConfig, type MetaStatus } from "@/lib/constants/status-config";

type MetaBadgeProps = {
  status: MetaStatus;
};

export function MetaBadge({ status }: MetaBadgeProps) {
  const { label, variant, icon: Icon, className, iconClassName } = metaStatusConfig[status];

  return (
    <Badge
      variant={variant}
      className={cn(
        "h-6 gap-1.5 px-2 py-0.5 text-[11px] font-medium normal-case",
        className,
      )}
    >
      <Icon className={cn("size-3.5 shrink-0", iconClassName)} />
      <span>{label}</span>
    </Badge>
  );
}
