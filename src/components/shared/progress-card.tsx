import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils/format";

type ProgressCardProps = {
  title: string;
  value: number;
  description: string;
};

export function ProgressCard({ title, value, description }: ProgressCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Progress value={value} />
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">{description}</span>
          <span className="font-medium text-slate-900">{formatPercent(value)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
