import { Loader2 } from "lucide-react";

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Loading data..." }: LoadingStateProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0d1626]/90">
      <Loader2 className="size-5 animate-spin text-[#f28c28]" />
      <p className="mt-3 text-sm text-slate-400">{label}</p>
    </div>
  );
}
