"use client";

import { format } from "date-fns";
import { Activity, Droplets, Dumbbell, Moon, Scale, Utensils } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { cn } from "@/utils/cn";
import type { RecentActivityItem } from "@/features/dashboard/queries";

interface RecentActivityProps {
  items: RecentActivityItem[];
}

const typeConfig: Record<
  RecentActivityItem["type"],
  { icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>; className: string }
> = {
  workout: { icon: Dumbbell, className: "bg-primary/15 text-primary" },
  weight: { icon: Scale, className: "bg-info/15 text-info" },
  sleep: { icon: Moon, className: "bg-secondary text-muted-foreground" },
  activity: { icon: Activity, className: "bg-primary/15 text-primary" },
  water: { icon: Droplets, className: "bg-info/15 text-info" },
  meal: { icon: Utensils, className: "bg-warning/15 text-warning" },
};

function formatRelative(date: string): string {
  const today = new Date().toISOString().slice(0, 10);
  if (date === today) return "Today";
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (date === yesterday.toISOString().slice(0, 10)) return "Yesterday";
  return format(new Date(date), "MMM d");
}

export function RecentActivity({ items }: RecentActivityProps) {
  const mounted = useMounted();

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Your latest logged entries</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {items.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description="Your workouts, weight, water, sleep, and meals will show up here as you log them."
            className="py-10"
            action={
              <Button variant="outline" size="sm" asChild>
                <a href="/app/dashboard?quick=add">Quick add</a>
              </Button>
            }
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => {
              const config = typeConfig[item.type];
              const Icon = config.icon;
              return (
                <li key={item.id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      config.className
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {mounted ? formatRelative(item.date) : format(new Date(item.date), "MMM d")}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
