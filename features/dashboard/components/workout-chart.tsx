"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format } from "date-fns";
import { formatMinutes } from "@/utils/format";
import type { WorkoutTrendPoint } from "@/features/dashboard/queries";

interface WorkoutChartProps {
  data: WorkoutTrendPoint[];
}

export function WorkoutChart({ data }: WorkoutChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No workouts in the last 30 days. Log one to start building your routine.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => format(new Date(value), "MMM d")}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
          width={32}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: "0.5rem",
            fontSize: "0.75rem",
          }}
          labelFormatter={(value) => format(new Date(String(value)), "MMM d, yyyy")}
          formatter={(value, name) => [
            name === "minutes" ? formatMinutes(Number(value)) : value,
            name === "minutes" ? "Minutes" : "Workouts",
          ]}
          cursor={{ fill: "var(--color-muted)" }}
        />
        <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
