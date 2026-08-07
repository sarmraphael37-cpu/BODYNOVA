import { Droplets, Target, CalendarDays, ListChecks } from "lucide-react";
import { requireProfile } from "@/lib/dal/auth";
import {
  getWaterLogs,
  getWaterTotalByDate,
} from "@/features/hydration/queries";
import { deleteWaterLogAction } from "@/features/hydration/actions";
import { WaterForm } from "@/features/hydration/components/water-form";
import { WaterChart } from "@/features/hydration/components/water-chart";
import { StatCard } from "@/components/ui/stat-card";
import { ChartCard } from "@/components/ui/chart-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteButton } from "@/components/ui/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatMl, formatLiters, formatNumber } from "@/utils/format";
import { formatDate } from "@/utils/dates";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hydration",
  description: "Track your daily water intake.",
};

export default async function HydrationPage() {
  const profile = await requireProfile();
  const [logs, totals] = await Promise.all([
    getWaterLogs(),
    getWaterTotalByDate(30),
  ]);

  const waterTargetMl = profile?.preferences?.water_target_ml ?? 2500;

  const today = new Date().toISOString().slice(0, 10);
  const waterToday = logs
    .filter((log) => log.date === today)
    .reduce((sum, log) => sum + log.amount_ml, 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  const weekStartIso = weekStart.toISOString().slice(0, 10);
  const weekTotal = totals
    .filter((point) => point.date >= weekStartIso && point.date <= today)
    .reduce((sum, point) => sum + point.total_ml, 0);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hydration</h1>
        <p className="text-sm text-muted-foreground">
          Log each glass of water to stay on top of your daily intake.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Water today"
          value={formatMl(waterToday)}
          icon={Droplets}
          hint="Logged today"
        />
        <StatCard
          title="Daily target"
          value={formatMl(waterTargetMl)}
          icon={Target}
          hint={`${formatLiters(waterTargetMl)} per day`}
        />
        <StatCard
          title="This week"
          value={formatMl(weekTotal)}
          icon={CalendarDays}
          hint="Last 7 days"
        />
        <StatCard
          title="Entries"
          value={formatNumber(logs.length)}
          icon={ListChecks}
          hint="Recent logs"
        />
      </div>

      <ChartCard title="Water intake" description="Last 30 days">
        <WaterChart data={totals} />
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Log water</CardTitle>
          </CardHeader>
          <CardContent>
            <WaterForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">History</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <EmptyState
                icon={Droplets}
                title="No logs yet"
                description="Log your first glass of water to start tracking your intake."
              />
            ) : (
              <ul className="divide-y">
                {logs.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between gap-4 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold">{formatMl(log.amount_ml)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(log.date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <DeleteButton
                        action={deleteWaterLogAction}
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
