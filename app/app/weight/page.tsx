import type { Metadata } from "next";
import Link from "next/link";
import { Scale } from "lucide-react";
import { requireProfile } from "@/lib/dal/auth";
import {
  getWeightEntriesWithDelta,
  getWeightTrend,
  getLatestWeight,
} from "@/features/weight/queries";
import { deleteWeightAction } from "@/features/weight/actions";
import { WeightForm } from "@/features/weight/components/weight-form";
import { WeightChart } from "@/features/dashboard/components/weight-chart";
import { StatCard } from "@/components/ui/stat-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteButton } from "@/components/ui/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { formatKg, formatNumber, formatPercent } from "@/utils/format";
import { formatDate } from "@/utils/dates";

export const metadata: Metadata = {
  title: "Weight",
  description: "Track your weight over time.",
};

export default async function WeightPage() {
  await requireProfile();
  const [entries, trend, latest] = await Promise.all([
    getWeightEntriesWithDelta(),
    getWeightTrend(90),
    getLatestWeight(),
  ]);

  const start = entries.length > 0 ? entries[0].weight_kg : null;
  const totalChange = latest !== null && start !== null ? latest - start : null;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Weight</h1>
        <p className="text-sm text-muted-foreground">
          Log your weight regularly to see trends over time.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Current weight"
          value={latest ? formatKg(latest) : "—"}
          icon={Scale}
        />
        <StatCard
          title="Total change"
          value={totalChange !== null ? `${totalChange > 0 ? "+" : ""}${formatKg(totalChange)}` : "—"}
          hint="Since your first log"
        />
        <StatCard
          title="Entries"
          value={formatNumber(entries.length)}
          hint="90-day window"
        />
        <StatCard
          title="Trend"
          value={trend.length >= 2 ? "Available" : "Not enough data"}
          hint="Chart below"
        />
      </div>

      <ChartCard title="Weight trend" description="Last 90 days">
        <WeightChart data={trend} />
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Log weight</CardTitle>
          </CardHeader>
          <CardContent>
            <WeightForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">History</CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <EmptyState
                icon={Scale}
                title="No entries yet"
                description="Log your first weight entry to start tracking progress."
              />
            ) : (
              <ul className="divide-y">
                {entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-4 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold">{formatKg(entry.weight_kg)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.date)}
                        {entry.body_fat_percentage
                          ? ` · BF ${formatPercent(entry.body_fat_percentage, 1)}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          entry.delta === null || entry.delta === 0
                            ? "text-xs text-muted-foreground"
                            : entry.delta > 0
                              ? "text-xs font-medium text-destructive"
                              : "text-xs font-medium text-success"
                        }
                      >
                        {entry.delta === null
                          ? "—"
                          : `${entry.delta > 0 ? "+" : ""}${entry.delta.toFixed(1)} kg`}
                      </span>
                      <DeleteButton action={deleteWeightAction} id={entry.id} label="Delete" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/goals">Set a weight goal</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
