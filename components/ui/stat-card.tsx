import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/cn";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string;
  icon?: LucideIcon;
  hint?: string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
    positive?: boolean;
  };
}

export function StatCard({
  title,
  value,
  icon: Icon,
  hint,
  trend,
  className,
  ...props
}: StatCardProps) {
  const trendColor = trend
    ? trend.direction === "neutral"
      ? "text-muted-foreground"
      : trend.positive !== false
        ? "text-success"
        : "text-destructive"
    : undefined;

  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)} {...props}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="mt-1 flex items-center gap-2">
          {trend && (
            <span className={cn("text-xs font-medium", trendColor)}>
              {trend.value}
            </span>
          )}
          {hint && (
            <span className="text-xs text-muted-foreground">{hint}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
