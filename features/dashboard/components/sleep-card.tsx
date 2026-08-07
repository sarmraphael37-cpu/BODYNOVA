"use client";

import { Moon } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { average } from "@/services/calculations/fitness";
import { formatSleepMinutes } from "@/utils/format";
import type { SleepTrendPoint } from "@/features/dashboard/queries";

interface SleepCardProps {
  data: SleepTrendPoint[];
}

export function SleepCard({ data }: SleepCardProps) {
  const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
  const lastNight = sorted[0] ?? null;
  const avgMinutes = data.length > 0 ? Math.round(average(data.map((d) => d.duration_minutes))) : null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Moon className="h-4 w-4 text-info" aria-hidden />
          Sleep
        </CardTitle>
        <CardDescription>Last 7 nights</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {lastNight ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-bold tracking-tight">
                {formatSleepMinutes(lastNight.duration_minutes)}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(lastNight.date), "MMM d")} night
              </p>
            </div>
            {lastNight.quality && (
              <Badge variant={lastNight.quality === "excellent" ? "success" : "secondary"}>
                {lastNight.quality}
              </Badge>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No sleep logged yet. Record last night&apos;s rest to see your recovery here.
          </p>
        )}

        {avgMinutes != null && (
          <p className="text-xs text-muted-foreground">
            7-day average:{" "}
            <span className="font-medium text-foreground">{formatSleepMinutes(avgMinutes)}</span>
          </p>
        )}

        {data.length > 0 && (
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -24 }}>
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), "EEE")}
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                    fontSize: "0.75rem",
                  }}
                  cursor={{ fill: "var(--color-muted)" }}
                  labelFormatter={(value) => format(new Date(String(value)), "MMM d, yyyy")}
                  formatter={(value) => [formatSleepMinutes(Number(value)), "Sleep"]}
                />
                <Bar dataKey="duration_minutes" fill="var(--color-info)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
