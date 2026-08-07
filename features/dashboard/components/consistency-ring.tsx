"use client";

import { cn } from "@/utils/cn";

interface ConsistencyRingProps {
  value: number;
  label?: string;
}

export function ConsistencyRing({ value, label }: ConsistencyRingProps) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const dashOffset = circumference * (1 - clamped / 100);

  const color =
    clamped >= 70 ? "var(--color-success)" : clamped >= 40 ? "var(--color-warning)" : "var(--color-destructive)";

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24" role="img" aria-label={`Consistency score ${clamped} percent`}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--color-secondary)"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold tracking-tight">{clamped}%</span>
        </div>
      </div>
      <div className="space-y-1">
        <p className={cn("text-sm font-semibold")}>{label ?? "Consistency score"}</p>
        <p className="text-xs text-muted-foreground">
          Active days in the last 28.
        </p>
      </div>
    </div>
  );
}
