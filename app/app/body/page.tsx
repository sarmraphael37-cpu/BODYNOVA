import type { Metadata } from "next";
import { Ruler, Weight, Percent, Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requireProfile } from "@/lib/dal/auth";
import {
  getBodyMeasurements,
  getLatestMeasurements,
} from "@/features/body/queries";
import { deleteBodyMeasurementAction } from "@/features/body/actions";
import { BodyForm } from "@/features/body/components/body-form";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteButton } from "@/components/ui/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatKg, formatNumber, formatPercent } from "@/utils/format";
import { formatDate } from "@/utils/dates";
import type { BodyMeasurement } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Body",
  description: "Track your body measurements over time.",
};

type MetricStat = {
  title: string;
  value: string;
  icon: LucideIcon;
};

function latestStatCards(entry: BodyMeasurement): MetricStat[] {
  const cards: MetricStat[] = [];
  const cm = (value: number) => `${formatNumber(value, 1)} cm`;
  if (entry.weight_kg !== null)
    cards.push({ title: "Weight", value: formatKg(entry.weight_kg), icon: Weight });
  if (entry.body_fat_percentage !== null)
    cards.push({
      title: "Body fat",
      value: formatPercent(entry.body_fat_percentage, 1),
      icon: Percent,
    });
  if (entry.muscle_mass_kg !== null)
    cards.push({
      title: "Muscle mass",
      value: formatKg(entry.muscle_mass_kg),
      icon: Activity,
    });
  if (entry.waist_cm !== null)
    cards.push({ title: "Waist", value: cm(entry.waist_cm), icon: Ruler });
  if (entry.chest_cm !== null)
    cards.push({ title: "Chest", value: cm(entry.chest_cm), icon: Ruler });
  if (entry.arms_cm !== null)
    cards.push({ title: "Arms", value: cm(entry.arms_cm), icon: Ruler });
  if (entry.thighs_cm !== null)
    cards.push({ title: "Thighs", value: cm(entry.thighs_cm), icon: Ruler });
  if (entry.hips_cm !== null)
    cards.push({ title: "Hips", value: cm(entry.hips_cm), icon: Ruler });
  if (entry.neck_cm !== null)
    cards.push({ title: "Neck", value: cm(entry.neck_cm), icon: Ruler });
  return cards;
}

function describeMeasurements(entry: BodyMeasurement): string {
  const parts: string[] = [];
  const cm = (value: number) => `${formatNumber(value, 1)} cm`;
  if (entry.weight_kg !== null)
    parts.push(`Weight ${formatKg(entry.weight_kg)}`);
  if (entry.body_fat_percentage !== null)
    parts.push(`Body fat ${formatPercent(entry.body_fat_percentage, 1)}`);
  if (entry.muscle_mass_kg !== null)
    parts.push(`Muscle mass ${formatKg(entry.muscle_mass_kg)}`);
  if (entry.waist_cm !== null) parts.push(`Waist ${cm(entry.waist_cm)}`);
  if (entry.chest_cm !== null) parts.push(`Chest ${cm(entry.chest_cm)}`);
  if (entry.arms_cm !== null) parts.push(`Arms ${cm(entry.arms_cm)}`);
  if (entry.thighs_cm !== null) parts.push(`Thighs ${cm(entry.thighs_cm)}`);
  if (entry.hips_cm !== null) parts.push(`Hips ${cm(entry.hips_cm)}`);
  if (entry.neck_cm !== null) parts.push(`Neck ${cm(entry.neck_cm)}`);
  return parts.join(" · ");
}

export default async function BodyPage() {
  await requireProfile();
  const [entries, latest] = await Promise.all([
    getBodyMeasurements(),
    getLatestMeasurements(),
  ]);

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Body measurements</h1>
        <p className="text-sm text-muted-foreground">
          Log your body measurements to track changes over time.
        </p>
      </div>

      {latest && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {latestStatCards(latest).map((card) => (
            <StatCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              hint="Latest"
            />
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Log measurements</CardTitle>
          </CardHeader>
          <CardContent>
            <BodyForm />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">History</CardTitle>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <EmptyState
                icon={Ruler}
                title="No measurements yet"
                description="Log your first body measurements to start tracking progress."
              />
            ) : (
              <ul className="divide-y">
                {entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-4 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold">
                        {formatDate(entry.date)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {describeMeasurements(entry)}
                      </p>
                    </div>
                    <DeleteButton
                      action={deleteBodyMeasurementAction}
                      id={entry.id}
                      label="Delete"
                    />
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
