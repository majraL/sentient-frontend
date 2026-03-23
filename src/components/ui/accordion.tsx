import type { ComponentPropsWithoutRef, HTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function Accordion({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-3", className)} {...props} />;
}

export function AccordionItem({
  className,
  ...props
}: ComponentPropsWithoutRef<"details">) {
  return (
    <details
      className={cn(
        "group overflow-hidden rounded-2xl border border-white/8 bg-[#0a1321]",
        className,
      )}
      {...props}
    />
  );
}

type AccordionTriggerProps = ComponentPropsWithoutRef<"summary"> & {
  chevronPosition?: "left" | "right";
};

export function AccordionTrigger({
  className,
  children,
  chevronPosition = "right",
  ...props
}: AccordionTriggerProps) {
  return (
    <summary
      className={cn(
        "flex cursor-pointer list-none items-start gap-4 px-4 py-4 [&::-webkit-details-marker]:hidden",
        className,
      )}
      {...props}
    >
      {chevronPosition === "left" ? (
        <>
          <ChevronDown className="mt-1 size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
          <div className="min-w-0 flex-1">{children}</div>
        </>
      ) : (
        <>
          <div className="min-w-0 flex-1">{children}</div>
          <ChevronDown className="mt-1 ml-auto size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
        </>
      )}
    </summary>
  );
}

export function AccordionContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t border-white/8 px-4 py-4", className)} {...props} />;
}
