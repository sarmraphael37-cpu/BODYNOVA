"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format } from "date-fns";
import { cn } from "@/utils/cn";
import type { WeightTrendPoint } from "@/features/dashboard/queries";

interface WeightChartProps {
  data: WeightTrendPoint[];
}

const RANGES = [
  { value: 7, label: "7D" },
  { value: 30, label: "30D" },
  { value: 90, label: "90D" },
  { value: 0, label: "All" },
] as const;

function filterByRange(data: WeightTrendPoint[], range: number): WeightTrendPoint[] {
  if (range <= 0) return data;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - (range - 1));
  const cutoffIso = cutoff.toISOString().slice(0, 10);
  return data.filter((point) => point.date >= cutoffIso);
}

export function WeightChart({ data }: WeightChartProps) {
  const [range, setRange] = useState<number>(30);
  const filtered = filterByRange(data, range);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {filtered.length === 0
            ? "No entries in this range"
            : `${filtered.length} entry${filtered.length === 1 ? "" : "s"} · ${
                filtered[0].date
              } → ${filtered[filtered.length - 1].date}`}
        </p>
        <div
          role="group"
          aria-label="Weight chart range"
          className="inline-flex items-center gap-0.5 rounded-md bg-secondary p-0.5"
        >
          {RANGES.map((option) => (
            <button
              key={option.label}
              type="button"
              aria-pressed={range === option.value}
              onClick={() => setRange(option.value)}
              className={cn(
                "rounded-sm px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                range === option.value
                  ? "bg-background text-foreground shadow-sm dark:bg-card"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No weight entries yet. Log your first one to see your trend.
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No weight entries in this range. Try a wider window.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={256}>
          <LineChart data={filtered} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
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
              tickFormatter={(value) => Number(value).toFixed(0)}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.5rem",
                fontSize: "0.75rem",
              }}
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
      )}
    </div>
  );
}
