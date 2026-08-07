import type { Metadata } from "next";
import { Footprints, Timer, Flame, Route } from "lucide-react";
import { format, subDays } from "date-fns";
import { requireProfile } from "@/lib/dal/auth";
import {
  getActivityLogs,
  getActivityTrend,
} from "@/features/activity/queries";
import { deleteActivityAction } from "@/features/activity/actions";
import { ActivityForm } from "@/features/activity/components/activity-form";
import { ActivityChart } from "@/features/activity/components/activity-chart";
import { StatCard } from "@/components/ui/stat-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteButton } from "@/components/ui/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber, formatMinutes, formatKm } from "@/utils/format";
import { formatDate } from "@/utils/dates";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Activity",
  description: "Track your daily steps, distance, and active minutes.",
};

export default async function ActivityPage() {
  await requireProfile();
  const [logs, trend] = await Promise.all([
    getActivityLogs(),
    getActivityTrend(30),
  ]);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayLog = logs.find((log) => log.date === today);

  const stepsToday = todayLog?.steps ?? 0;
  const activeMinutesToday = todayLog?.active_minutes ?? 0;
  const caloriesToday = todayLog?.calories_burned ?? 0;
  const distanceToday = todayLog?.distance_km ?? 0;

  const last7Start = format(subDays(new Date(), 6), "yyyy-MM-dd");
  const last7 = trend.filter((point) => point.date >= last7Start);
  const last7Steps = last7.reduce((sum, point) => sum + point.steps, 0);
  const last7ActiveMinutes = last7.reduce(
    (sum, point) => sum + point.active_minutes,
    0
  );

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity</h1>
        <p className="text-sm text-muted-foreground">
          Log your daily steps, distance, and active minutes.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Steps today"
          value={formatNumber(stepsToday)}
          icon={Footprints}
          hint={`Last 7 days: ${formatNumber(last7Steps)}`}
        />
        <StatCard
          title="Active minutes"
          value={formatMinutes(activeMinutesToday)}
          icon={Timer}
          hint={`Last 7 days: ${formatMinutes(last7ActiveMinutes)}`}
        />
        <StatCard
          title="Calories burned"
          value={formatNumber(caloriesToday)}
          icon={Flame}
          hint="Today"
        />
        <StatCard
          title="Distance"
          value={formatKm(distanceToday)}
          icon={Route}
          hint="Today"
        />
      </div>

      <ChartCard title="Steps" description="Last 30 days">
        <ActivityChart data={trend} />
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Log activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">History</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <EmptyState
                icon={Footprints}
                title="No activity yet"
                description="Log your first day of activity to start tracking."
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
                        {formatNumber(log.steps)} steps
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(log.date)}
                        {log.active_minutes
                          ? ` · ${formatMinutes(log.active_minutes)} active`
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DeleteButton action={deleteActivityAction} id={log.id} label="Delete" />
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
