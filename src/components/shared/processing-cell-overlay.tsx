import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils/cn";

type ProcessingCellOverlayProps = PropsWithChildren<{
  active: boolean;
  label?: string;
  className?: string;
}>;

export function ProcessingCellOverlay({
  active,
  label = "Processing",
  className,
  children,
}: ProcessingCellOverlayProps) {
  if (!active) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative isolate overflow-hidden rounded-lg", className)}>
      <div className="select-none opacity-30 blur-[1.5px]">{children}</div>
      <div className="absolute inset-0 rounded-lg border border-white/8 bg-white/[0.04] backdrop-blur-md" />
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-medium uppercase tracking-[0.18em] text-slate-300">
        {label}
      </div>
    </div>
  );
}
