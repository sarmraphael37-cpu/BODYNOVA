import Link from "next/link";
import { Activity } from "lucide-react";
import { cn } from "@/utils/cn";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2", className)}
      aria-label="BodyNova home"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
        <Activity className="h-4.5 w-4.5" aria-hidden />
      </span>
      <span className="text-lg font-bold tracking-tight">
        Body<span className="text-emerald-500">Nova</span>
      </span>
    </Link>
  );
}
