import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CalendarDays,
  CheckCircle2,
  Focus,
  Sparkles,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatPercent } from "@/utils/format";
import type { TodayOverview, WeeklySummary } from "@/features/ai-coach/lib/responder";
import type { GoalProgressValue } from "@/features/ai-coach/lib/types";

export function OverviewCards({
  overview,
  weekly,
  currentGoal,
}: {
  overview: TodayOverview;
  weekly: WeeklySummary;
  currentGoal: GoalProgressValue | null;
}) {
  return (
    <section aria-label="Coach overview" className="grid gap-4 sm:grid-cols-2">
      <Card className="sm:col-span-2">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-brand">
              <Brain className="h-5 w-5 text-primary-foreground" aria-hidden />
            </div>
            <div>
              <CardTitle className="text-base">Today&apos;s Insight</CardTitle>
              <CardDescription>Personalized observation from your latest data.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground">{overview.insight}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Focus className="h-4 w-4 text-primary" aria-hidden />
            {overview.focusLabel}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm font-semibold">{overview.focus}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {overview.recommendedAction}
          </p>
          <Button asChild size="sm" variant="outline" className="w-full">
            <Link href={overview.actionHref}>
              Do it now
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-primary" aria-hidden />
            Current Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentGoal ? (
            <>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">{currentGoal.title}</p>
                <Badge variant={currentGoal.percent >= 80 ? "success" : "secondary"}>
                  {formatPercent(currentGoal.percent)}
                </Badge>
              </div>
              <Progress value={currentGoal.percent} aria-label={`${currentGoal.title} progress`} />
              <p className="text-xs text-muted-foreground">
                {currentGoal.current != null
                  ? `${currentGoal.current} of ${currentGoal.target} ${currentGoal.type}`
                  : `Target: ${currentGoal.target}`}
              </p>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                No active goal yet. Setting one lets your coach track progress precisely.
              </p>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link href="/app/goals">Set a goal</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="sm:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-primary" aria-hidden />
            Weekly Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <p className="text-sm leading-relaxed text-muted-foreground">{weekly.yourWeek}</p>
          <div className="space-y-3">
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-success">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                What went well
              </p>
              <ul className="space-y-1">
                {weekly.whatWentWell.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground">
                    · {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-warning">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Needs attention
              </p>
              <ul className="space-y-1">
                {weekly.needsAttention.map((item) => (
                  <li key={item} className="text-sm text-muted-foreground">
                    · {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
