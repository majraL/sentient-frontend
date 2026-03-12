import type { PropsWithChildren, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

type AppTableProps = PropsWithChildren<{
  title?: string;
  description?: string;
  actions?: ReactNode;
}>;

export function AppTable({ title, description, actions, children }: AppTableProps) {
  return (
    <Card>
      {(title || description || actions) ? (
        <div className="flex flex-col gap-4 border-b border-white/8 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            {title ? <h3 className="font-semibold text-white">{title}</h3> : null}
            {description ? <p className="text-sm text-slate-400">{description}</p> : null}
          </div>
          {actions}
        </div>
      ) : null}
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}
