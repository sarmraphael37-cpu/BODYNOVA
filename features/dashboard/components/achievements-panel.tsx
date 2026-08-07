"use client";

import Link from "next/link";
import {
  Activity,
  CalendarDays,
  Check,
  Droplets,
  Flame,
  Footprints,
  Repeat,
  Scale,
  Target,
  Trophy,
  Utensils,
  Zap,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/utils/cn";
import type { DashboardData } from "@/features/dashboard/queries";

interface AchievementsPanelProps {
  data: DashboardData["achievements"];
}

const iconMap: Record<string, React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>> = {
  flame: Flame,
  scale: Scale,
  calendar: CalendarDays,
  footprints: Footprints,
  activity: Activity,
  droplets: Droplets,
  target: Target,
  utensils: Utensils,
  trophy: Trophy,
  zap: Zap,
  repeat: Repeat,
  check: Check,
};

export function AchievementsPanel({ data }: AchievementsPanelProps) {
  const { unlocked, total, recent, lockedPreview } = data;
  const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-warning" aria-hidden />
          Achievements
        </CardTitle>
        <CardDescription>
          {unlocked} of {total} unlocked
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        <Progress value={percent} aria-label={`Achievements: ${unlocked} of ${total} unlocked`} />

        {recent.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recently unlocked
            </p>
            <ul className="space-y-1.5">
              {recent.map((item) => {
                const Icon = iconMap[item.icon] ?? Trophy;
                return (
                  <li key={item.name} className="flex items-center gap-2.5 text-sm">
                    <Icon className="h-4 w-4 text-success" aria-hidden />
                    <span className="font-medium">{item.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {lockedPreview.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Next up
            </p>
            <div className="flex flex-wrap gap-1.5">
              {lockedPreview.map((item) => {
                const Icon = iconMap[item.icon] ?? Trophy;
                return (
                  <span
                    key={item.name}
                    className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    <Lock className="h-3 w-3" aria-hidden />
                    <Icon className="h-3 w-3" aria-hidden />
                    {item.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {recent.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Log your first workout, weight, or glass of water to start unlocking badges.
          </p>
        )}

        <Link
          href="/app/achievements"
          className={cn("mt-auto text-sm font-medium text-primary underline-offset-4 hover:underline")}
        >
          View all achievements
        </Link>
      </CardContent>
    </Card>
  );
}
