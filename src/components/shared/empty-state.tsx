import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0d1626]/90 px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-white/6">
        <Inbox className="size-5 text-slate-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
