import { Frown, Meh, Minus, Smile } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { QuerySentiment } from "@/types/api";

type SentimentBadgeProps = {
  sentiment: QuerySentiment;
};

const config: Record<
  QuerySentiment,
  { label: string; variant: "success" | "danger" | "muted"; icon: typeof Smile }
> = {
  positive: { label: "Positive", variant: "success", icon: Smile },
  negative: { label: "Negative", variant: "danger", icon: Frown },
  neutral: { label: "Neutral", variant: "muted", icon: Meh },
  invalid: { label: "Invalid", variant: "muted", icon: Minus },
};

export function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  const { label, variant, icon: Icon } = config[sentiment];

  return (
    <Badge variant={variant} className="gap-1.5 px-2 py-0.5 text-[11px]">
      <Icon className="size-3.5" />
      <span>{label}</span>
    </Badge>
  );
}
