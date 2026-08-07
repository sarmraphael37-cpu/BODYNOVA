import type { Metadata } from "next";
import { Moon, Timer, Gauge, CalendarDays } from "lucide-react";
import { requireProfile } from "@/lib/dal/auth";
import { getSleepLogs, getSleepTrend } from "@/features/sleep/queries";
import { deleteSleepLogAction } from "@/features/sleep/actions";
import { SleepForm } from "@/features/sleep/components/sleep-form";
import { SleepChart } from "@/features/sleep/components/sleep-chart";
import { StatCard } from "@/components/ui/stat-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DeleteButton } from "@/components/ui/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatSleepMinutes, formatNumber } from "@/utils/format";
import { formatDate } from "@/utils/dates";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sleep",
  description: "Track your sleep over time.",
};

const qualityLabel: Record<string, string> = {
  poor: "Poor",
  fair: "Fair",
  good: "Good",
  excellent: "Excellent",
};

export default async function SleepPage() {
  await requireProfile();
  const [logs, trend] = await Promise.all([getSleepLogs(), getSleepTrend(30)]);

  const lastNight = logs[0] ?? null;
  const last7 = logs.slice(0, 7);
  const last7Avg =
    last7.length > 0
      ? Math.round(
          last7.reduce((sum, log) => sum + log.duration_minutes, 0) / last7.length
        )
      : null;
  const hoursThisWeek = last7.reduce((sum, log) => sum + log.duration_minutes, 0);

  const qualityCounts = logs.reduce<Record<string, number>>((acc, log) => {
    if (log.quality) acc[log.quality] = (acc[log.quality] ?? 0) + 1;
    return acc;
  }, {});
  const breakdown = Object.entries(qualityCounts)
    .map(([quality, count]) => `${qualityLabel[quality]}: ${count}`)
    .join(" · ");

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sleep</h1>
        <p className="text-sm text-muted-foreground">
          Log your sleep regularly to see trends over time.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Last night"
          value={lastNight ? formatSleepMinutes(lastNight.duration_minutes) : "—"}
          icon={Moon}
        />
        <StatCard
          title="7-day average"
          value={last7Avg ? formatSleepMinutes(last7Avg) : "—"}
          icon={Timer}
          hint="Last 7 entries"
        />
        <StatCard
          title="Hours this week"
          value={hoursThisWeek > 0 ? formatSleepMinutes(hoursThisWeek) : "—"}
          icon={Gauge}
          hint="Last 7 entries"
        />
        <StatCard
          title="Entries"
          value={formatNumber(logs.length)}
          icon={CalendarDays}
          hint="60-day window"
        />
      </div>

      <ChartCard title="Sleep duration" description="Last 30 days">
        <SleepChart data={trend} />
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Log sleep</CardTitle>
          </CardHeader>
          <CardContent>
            <SleepForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">History</CardTitle>
            {breakdown && <CardDescription>{breakdown}</CardDescription>}
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <EmptyState
                icon={Moon}
                title="No sleep logged yet"
                description="Log your first night of sleep to start tracking your rest."
              />
            ) : (
              <ul className="divide-y">
                {logs.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between gap-4 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {formatSleepMinutes(log.duration_minutes)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(log.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.quality && (
                        <Badge variant="secondary">{qualityLabel[log.quality]}</Badge>
                      )}
                      <DeleteButton
                        action={deleteSleepLogAction}
                        id={log.id}
                        label="Delete"
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
