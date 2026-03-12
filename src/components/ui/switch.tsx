import * as SwitchPrimitives from "@radix-ui/react-switch";
import * as React from "react";
import { cn } from "@/lib/utils/cn";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-11 items-center rounded-full bg-white/10 transition-colors data-[state=checked]:bg-[#f28c28]",
      className,
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform data-[state=checked]:translate-x-[1.4rem]" />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
