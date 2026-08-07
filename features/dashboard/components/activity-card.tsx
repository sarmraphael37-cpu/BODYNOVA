"use client";

import { Footprints } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { average } from "@/services/calculations/fitness";
import { formatNumber } from "@/utils/format";
import type { ActivityTrendPoint } from "@/features/dashboard/queries";

interface ActivityCardProps {
  data: ActivityTrendPoint[];
  todaySteps: number;
}

export function ActivityCard({ data, todaySteps }: ActivityCardProps) {
  const avgSteps = data.length > 0 ? Math.round(average(data.map((d) => d.steps))) : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Footprints className="h-4 w-4 text-primary" aria-hidden />
          Activity
        </CardTitle>
        <CardDescription>Daily steps, last 7 days</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-2xl font-bold tracking-tight">{formatNumber(avgSteps)}</p>
            <p className="text-xs text-muted-foreground">avg steps / day</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Today: <span className="font-medium text-foreground">{formatNumber(todaySteps)}</span>
          </p>
        </div>

        {data.length > 0 ? (
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: -16 }}>
                <defs>
                  <linearGradient id="stepsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), "EEE")}
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickFormatter={(value) => formatNumber(Number(value), 0)}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.5rem",
                    fontSize: "0.75rem",
                  }}
                  cursor={{ stroke: "var(--color-muted)" }}
                  labelFormatter={(value) => format(new Date(String(value)), "MMM d, yyyy")}
                  formatter={(value) => [formatNumber(Number(value), 0), "Steps"]}
                />
                <Area
                  type="monotone"
                  dataKey="steps"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#stepsFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="flex-1 py-6 text-center text-sm text-muted-foreground">
            No activity logged yet. Add steps to start tracking your movement.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
