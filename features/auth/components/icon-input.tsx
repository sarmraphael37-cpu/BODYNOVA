import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/input";

interface IconInputProps extends React.ComponentProps<"input"> {
  icon: LucideIcon;
}

const IconInput = React.forwardRef<HTMLInputElement, IconInputProps>(
  ({ icon: Icon, className, ...props }, ref) => {
    return (
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <Input ref={ref} className={cn("pl-9", className)} {...props} />
      </div>
    );
  }
);
IconInput.displayName = "IconInput";

export { IconInput };
