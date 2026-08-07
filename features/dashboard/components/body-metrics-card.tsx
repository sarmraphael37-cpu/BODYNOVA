"use client";

import { Ruler } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatKg, formatNumber } from "@/utils/format";
import type { DashboardData } from "@/features/dashboard/queries";

interface BodyMetricsCardProps {
  bmi: DashboardData["bmi"];
  lastWeight: number | null;
  lastBodyFat: number | null;
  weightChangeKg: number | null;
}

export function BodyMetricsCard({
  bmi,
  lastWeight,
  lastBodyFat,
  weightChangeKg,
}: BodyMetricsCardProps) {
  const hasData = lastWeight != null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ruler className="h-4 w-4 text-primary" aria-hidden />
          Body metrics
        </CardTitle>
        <CardDescription>Latest measurements</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-center gap-4">
        {!hasData ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Log your first weight entry to unlock BMI and trends.
          </p>
        ) : (
          <>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {bmi ? formatNumber(bmi.value) : "—"}
                </p>
                <p className="text-xs text-muted-foreground">BMI</p>
              </div>
              {bmi && <Badge variant="secondary">{bmi.category}</Badge>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-secondary/40 p-3">
                <p className="text-xs text-muted-foreground">Weight</p>
                <p className="mt-1 text-lg font-semibold">{formatKg(lastWeight)}</p>
              </div>
              <div className="rounded-lg border bg-secondary/40 p-3">
                <p className="text-xs text-muted-foreground">Body fat</p>
                <p className="mt-1 text-lg font-semibold">
                  {lastBodyFat != null ? `${formatNumber(lastBodyFat)}%` : "—"}
                </p>
              </div>
            </div>

            {weightChangeKg != null && (
              <p className="text-xs text-muted-foreground">
                {weightChangeKg > 0 ? "+" : ""}
                {weightChangeKg.toFixed(1)} kg since your previous entry
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
