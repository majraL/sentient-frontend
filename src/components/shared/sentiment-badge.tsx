import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { sentimentStatusConfig } from "@/lib/constants/status-config";
import type { QuerySentiment } from "@/types/api";

type SentimentBadgeProps = {
  sentiment: QuerySentiment;
};

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const { label, variant, icon: Icon, className, iconClassName } = sentimentStatusConfig[sentiment];

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
