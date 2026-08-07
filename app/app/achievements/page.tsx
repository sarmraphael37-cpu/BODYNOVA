import type { Metadata } from "next";
import {
  Activity,
  CalendarDays,
  Droplets,
  Flame,
  Footprints,
  Repeat,
  Scale,
  Target,
  Trophy,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { requireProfile } from "@/lib/dal/auth";
import {
  getAchievements,
  getUnlockedCount,
} from "@/features/achievements/queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/utils/cn";
import { formatPercent } from "@/utils/format";
import { formatDate } from "@/utils/dates";
import type { AchievementCategory } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Achievements",
};

const categoryIcons: Record<string, LucideIcon> = {
  trophy: Trophy,
  flame: Flame,
  zap: Zap,
  scale: Scale,
  calendar: CalendarDays,
  footsteps: Footprints,
  activity: Activity,
  droplets: Droplets,
  target: Target,
  repeat: Repeat,
  utensils: Utensils,
};

function achievementIcon(icon: string): LucideIcon {
  return categoryIcons[icon] ?? Trophy;
}

function categoryLabel(category: AchievementCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export default async function AchievementsPage() {
  await requireProfile();
  const [achievements, unlockedCount] = await Promise.all([
    getAchievements(),
    getUnlockedCount(),
  ]);

  const percent =
    achievements.length > 0
      ? Math.round((unlockedCount / achievements.length) * 100)
      : 0;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Achievements</h1>
        <p className="text-sm text-muted-foreground">
          {unlockedCount} of {achievements.length} unlocked
        </p>
      </div>

      <Card>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall completion</span>
            <span className="font-semibold">{formatPercent(percent)}</span>
          </div>
          <Progress value={unlockedCount} max={achievements.length} />
        </CardContent>
      </Card>

      {achievements.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No achievements yet"
          description="Achievements will appear here as you build your fitness history."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => {
            const Icon = achievementIcon(achievement.icon);
            return (
              <Card
                key={achievement.id}
                className={cn("flex flex-col", !achievement.unlocked && "opacity-60")}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
                    </div>
                    <Badge variant={achievement.unlocked ? "success" : "secondary"}>
                      {achievement.unlocked ? "Unlocked" : "Locked"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base">{achievement.name}</CardTitle>
                    <CardDescription>{achievement.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto flex items-center justify-between gap-4">
                  <Badge variant="outline">{categoryLabel(achievement.category)}</Badge>
                  {achievement.unlocked && (
                    <span className="text-xs text-muted-foreground">
                      {formatDate(achievement.unlocked_at ?? "")}
                    </span>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
