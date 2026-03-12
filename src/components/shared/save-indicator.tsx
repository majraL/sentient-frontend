import { CheckCircle2, Clock3 } from "lucide-react";

type SaveIndicatorProps = {
  savedAt?: string | null;
};

export function SaveIndicator({ savedAt }: SaveIndicatorProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#101a2c] px-3 py-2 text-sm text-slate-300">
      {savedAt ? <CheckCircle2 className="size-4 text-emerald-300" /> : <Clock3 className="size-4 text-slate-500" />}
      <span>{savedAt ? `Saved ${new Date(savedAt).toLocaleTimeString()}` : "Unsaved changes"}</span>
    </div>
  );
}
