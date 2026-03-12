import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  title: string;
  value: string;
  description?: string;
  icon?: ReactNode;
};

export function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
        </div>
        {icon ? <div className="rounded-lg bg-slate-100 p-2 text-slate-700">{icon}</div> : null}
      </CardContent>
    </Card>
  );
}
