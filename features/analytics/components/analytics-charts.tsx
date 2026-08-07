"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format } from "date-fns";
import { ChartCard } from "@/components/ui/chart-card";
import { formatMinutes, formatNumber, formatSleepMinutes } from "@/utils/format";
import type {
  ActivityTrendPoint,
  AnalyticsData,
  SleepTrendPoint,
  WeightTrendPoint,
  WorkoutTrendPoint,
} from "@/features/analytics/queries";

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.5rem",
  fontSize: "0.75rem",
};

function EmptyChartMessage({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function WeightTrendChart({ data }: { data: WeightTrendPoint[] }) {
  if (data.length === 0) {
    return <EmptyChartMessage message="No weight entries in the last 90 days." />;
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
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
          domain={["auto", "auto"]}
          tickFormatter={(value) => value.toFixed(0)}
          width={48}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(value) => format(new Date(String(value)), "MMM d, yyyy")}
          formatter={(value) => [`${Number(value).toFixed(1)} kg`, "Weight"]}
        />
        <Line
          type="monotone"
          dataKey="weight_kg"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function WorkoutTrendChart({ data }: { data: WorkoutTrendPoint[] }) {
  if (data.length === 0) {
    return <EmptyChartMessage message="No workouts in the last 90 days." />;
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
          contentStyle={tooltipStyle}
          labelFormatter={(value) => format(new Date(String(value)), "MMM d, yyyy")}
          formatter={(value) => [formatMinutes(Number(value)), "Minutes"]}
          cursor={{ fill: "var(--color-muted)" }}
        />
        <Bar dataKey="minutes" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function SleepTrendChart({ data }: { data: SleepTrendPoint[] }) {
  if (data.length === 0) {
    return <EmptyChartMessage message="No sleep logs in the last 90 days." />;
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
          contentStyle={tooltipStyle}
          labelFormatter={(value) => format(new Date(String(value)), "MMM d, yyyy")}
          formatter={(value) => [formatSleepMinutes(Number(value)), "Sleep"]}
          cursor={{ fill: "var(--color-muted)" }}
        />
        <Bar dataKey="duration_minutes" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function ActivityTrendChart({ data }: { data: ActivityTrendPoint[] }) {
  if (data.length === 0) {
    return <EmptyChartMessage message="No activity logged in the last 90 days." />;
  }

  return (
    <ResponsiveContainer width="100%" height={256}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
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
          width={40}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          labelFormatter={(value) => format(new Date(String(value)), "MMM d, yyyy")}
          formatter={(value) => [`${formatNumber(Number(value), 0)} steps`, "Steps"]}
        />
        <Area
          type="monotone"
          dataKey="steps"
          stroke="var(--color-primary)"
          fill="var(--color-primary)"
          fillOpacity={0.15}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const { weightTrend, workoutTrend, sleepTrend, activityTrend } = data;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard title="Weight trend" description="Last 90 days">
        <WeightTrendChart data={weightTrend} />
      </ChartCard>
      <ChartCard title="Workout minutes" description="Last 90 days">
        <WorkoutTrendChart data={workoutTrend} />
      </ChartCard>
      <ChartCard title="Sleep duration" description="Last 90 days">
        <SleepTrendChart data={sleepTrend} />
      </ChartCard>
      <ChartCard title="Daily steps" description="Last 90 days">
        <ActivityTrendChart data={activityTrend} />
      </ChartCard>
    </div>
  );
}
