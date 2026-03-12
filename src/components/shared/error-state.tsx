import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Something went wrong",
  description = "Please try again or refresh the page.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/8 px-6 text-center">
      <AlertTriangle className="size-5 text-rose-300" />
      <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-slate-300">{description}</p>
      {onRetry ? (
        <Button className="mt-5" variant="outline" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
