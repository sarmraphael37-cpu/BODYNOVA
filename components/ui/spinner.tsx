import { cn } from "@/utils/cn";

function Spinner({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Spinner };
