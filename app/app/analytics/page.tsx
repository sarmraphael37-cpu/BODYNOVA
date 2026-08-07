import type { Metadata } from "next";
import { Activity, Flame, Moon, Footprints } from "lucide-react";
import { requireProfile } from "@/lib/dal/auth";
import { getAnalyticsData } from "@/features/analytics/queries";
import { AnalyticsCharts } from "@/features/analytics/components/analytics-charts";
import { StatCard } from "@/components/ui/stat-card";
import { formatNumber, formatPercent, formatSleepMinutes } from "@/utils/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Analytics",
  description: "Insights from your last 90 days of activity.",
};

export default async function AnalyticsPage() {
  await requireProfile();
  const data = await getAnalyticsData();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Insights from your last 90 days of activity.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Consistency score"
          value={formatPercent(data.consistency)}
          icon={Activity}
          hint="Last 28 days"
        />
        <StatCard
          title="Workouts"
          value={formatNumber(data.totals.workouts)}
          icon={Flame}
          hint="Last 90 days"
        />
        <StatCard
          title="Avg sleep"
          value={formatSleepMinutes(data.avgSleep)}
          icon={Moon}
          hint="Last 30 days"
        />
        <StatCard
          title="Avg steps"
          value={formatNumber(data.avgSteps)}
          icon={Footprints}
          hint="Last 30 days"
        />
      </div>

      <AnalyticsCharts data={data} />
    </div>
  );
}
