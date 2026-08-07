"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Droplets, Flame, Footprints } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { waterQuickAmounts } from "@/constants";
import { logWaterAction, type WaterActionState } from "@/features/hydration/actions";
import { formatMl, formatMinutes, formatNumber } from "@/utils/format";
import type { TodaySummary } from "@/features/dashboard/queries";

interface DailyGoalsProps {
  summary: TodaySummary;
}

function WaterQuickAdd({ onLogged }: { onLogged: () => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [state, formAction, isPending] = useActionState<WaterActionState, FormData>(
    logWaterAction,
    {}
  );

  React.useEffect(() => {
    if (state.success) {
      toast.success("Water added");
      onLogged();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, onLogged]);

  return (
    <form action={formAction} className="flex items-center gap-1.5">
      <input type="hidden" name="date" value={today} />
      <span className="text-xs text-muted-foreground">+</span>
      {waterQuickAmounts.map((amount) => (
        <button
          key={amount}
          type="submit"
          name="amount_ml"
          value={amount}
          disabled={isPending}
          className="rounded-full border bg-background px-2.5 py-0.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {amount}
        </button>
      ))}
    </form>
  );
}

export function DailyGoals({ summary }: DailyGoalsProps) {
  const router = useRouter();

  const waterPercent = Math.min(
    100,
    Math.round((summary.waterMl / Math.max(1, summary.waterTargetMl)) * 100)
  );
  const stepPercent = Math.min(100, Math.round((summary.steps / Math.max(1, summary.stepTarget)) * 100));
  const activeTarget = 30;
  const activePercent = Math.min(100, Math.round((summary.activeMinutes / activeTarget) * 100));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s goals</CardTitle>
        <CardDescription>
          {summary.workoutsToday > 0
            ? `${summary.workoutsToday} workout${summary.workoutsToday === 1 ? "" : "s"} logged today — nice work.`
            : "Small wins add up. Log a little more today."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Droplets className="h-4 w-4 text-info" aria-hidden />
              Water
            </span>
            <WaterQuickAdd
              onLogged={() => {
                router.refresh();
              }}
            />
          </div>
          <Progress
            value={waterPercent}
            aria-label={`Water goal: ${summary.waterMl} of ${summary.waterTargetMl} ml`}
            indicatorClassName="bg-info"
          />
          <p className="text-xs text-muted-foreground">
            {formatMl(summary.waterMl)} of {formatMl(summary.waterTargetMl)} · {waterPercent}%
          </p>
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Footprints className="h-4 w-4 text-primary" aria-hidden />
              Steps
            </span>
            <span className="text-xs text-muted-foreground">
              {formatNumber(summary.steps)} / {formatNumber(summary.stepTarget)}
            </span>
          </div>
          <Progress
            value={stepPercent}
            aria-label={`Step goal: ${summary.steps} of ${summary.stepTarget}`}
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Flame className="h-4 w-4 text-warning" aria-hidden />
              Active minutes
            </span>
            <span className="text-xs text-muted-foreground">
              {formatMinutes(summary.activeMinutes)} of {formatMinutes(activeTarget)}
            </span>
          </div>
          <Progress
            value={activePercent}
            aria-label={`Active minutes: ${summary.activeMinutes} of ${activeTarget}`}
            indicatorClassName="bg-warning"
          />
        </div>
      </CardContent>
    </Card>
  );
}
