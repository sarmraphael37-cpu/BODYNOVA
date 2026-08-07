"use client";

import Link from "next/link";
import { Utensils } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatNumber } from "@/utils/format";
import type { NutritionSummary } from "@/features/dashboard/queries";

interface NutritionCardProps {
  data: NutritionSummary;
  calorieTarget: number | null;
}

const macroRows = [
  { key: "protein_g", label: "Protein", color: "bg-primary" as const },
  { key: "carbs_g", label: "Carbs", color: "bg-info" as const },
  { key: "fat_g", label: "Fat", color: "bg-warning" as const },
  { key: "fiber_g", label: "Fiber", color: "bg-secondary-foreground/70" as const },
] as const;

export function NutritionCard({ data, calorieTarget }: NutritionCardProps) {
  const caloriePercent =
    calorieTarget && calorieTarget > 0
      ? Math.min(120, Math.round((data.calories / calorieTarget) * 100))
      : null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-4 w-4 text-primary" aria-hidden />
          Nutrition
        </CardTitle>
        <CardDescription>Today&apos;s intake</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {data.entries === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No meals logged yet today.
            </p>
            <Link
              href="/app/nutrition"
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              Log your first meal
            </Link>
          </div>
        ) : (
          <>
            <div>
              <p className="text-2xl font-bold tracking-tight">
                {formatNumber(data.calories)}{" "}
                <span className="text-sm font-medium text-muted-foreground">kcal</span>
              </p>
              {caloriePercent != null && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {caloriePercent >= 120 ? "120%+" : `${caloriePercent}%`} of your{" "}
                  {formatNumber(calorieTarget ?? 0)} kcal target
                </p>
              )}
            </div>

            {caloriePercent != null && (
              <Progress
                value={caloriePercent}
                indicatorClassName={
                  caloriePercent > 110 ? "bg-destructive" : "bg-primary"
                }
                aria-label={`Calories: ${data.calories} of ${calorieTarget}`}
              />
            )}

            <dl className="grid grid-cols-2 gap-3">
              {macroRows.map((row) => (
                <div key={row.key} className="rounded-lg border bg-secondary/40 p-3">
                  <dt className="text-xs text-muted-foreground">{row.label}</dt>
                  <dd className="mt-1 flex items-center gap-2 text-lg font-semibold">
                    <span className={`h-2 w-2 rounded-full ${row.color}`} aria-hidden />
                    {formatNumber(data[row.key], 0)}
                    <span className="text-xs font-normal text-muted-foreground">g</span>
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </CardContent>
    </Card>
  );
}
