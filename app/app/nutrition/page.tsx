import type { Metadata } from "next";
import { Flame, Beef, Wheat, Droplet, Utensils } from "lucide-react";
import { requireProfile } from "@/lib/dal/auth";
import {
  getNutritionEntries,
  getNutritionTotals,
  getFoods,
} from "@/features/nutrition/queries";
import { deleteFoodEntryAction } from "@/features/nutrition/actions";
import { FoodForm } from "@/features/nutrition/components/food-form";
import { CustomFoodForm } from "@/features/nutrition/components/custom-food-form";
import { DateNavigator } from "@/features/nutrition/components/date-navigator";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteButton } from "@/components/ui/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatNumber } from "@/utils/format";
import { todayString } from "@/utils/dates";
import type { MealType, NutritionEntry } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nutrition",
  description: "Log your meals and track your macros.",
};

const mealTypeLabels: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const mealOrder: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

function MacroRow({
  label,
  grams,
  percent,
  indicatorClassName,
}: {
  label: string;
  grams: number;
  percent: number;
  indicatorClassName: string;
}) {
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {formatNumber(grams, 1)} g · {formatNumber(percent, 0)}%
        </span>
      </div>
      <Progress value={percent} max={100} indicatorClassName={indicatorClassName} />
    </div>
  );
}

export default async function NutritionPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requireProfile();
  const params = await searchParams;
  const date = params?.date ?? todayString();

  const [entries, totals, foods] = await Promise.all([
    getNutritionEntries(date),
    getNutritionTotals(date),
    getFoods(),
  ]);

  const grouped = entries.reduce<Record<MealType, NutritionEntry[]>>(
    (acc, entry) => {
      acc[entry.meal_type].push(entry);
      return acc;
    },
    { breakfast: [], lunch: [], dinner: [], snack: [] }
  );

  const proteinCalories = totals.protein_g * 4;
  const carbsCalories = totals.carbs_g * 4;
  const fatCalories = totals.fat_g * 9;
  const macroTotal = totals.calories;
  const percentOf = (value: number) => (macroTotal > 0 ? (value / macroTotal) * 100 : 0);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nutrition</h1>
          <p className="text-sm text-muted-foreground">
            Log your meals and track your daily macros.
          </p>
        </div>
        <DateNavigator date={date} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Calories"
          value={formatNumber(totals.calories, 0)}
          icon={Flame}
        />
        <StatCard
          title="Protein (g)"
          value={formatNumber(totals.protein_g, 1)}
          icon={Beef}
        />
        <StatCard
          title="Carbs (g)"
          value={formatNumber(totals.carbs_g, 1)}
          icon={Wheat}
        />
        <StatCard
          title="Fat (g)"
          value={formatNumber(totals.fat_g, 1)}
          icon={Droplet}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Food log</CardTitle>
            </CardHeader>
            <CardContent>
              <FoodForm foods={foods} />
            </CardContent>
          </Card>

          {entries.length === 0 ? (
            <EmptyState
              icon={Utensils}
              title="No meals logged"
              description="Add a food above to start tracking your nutrition."
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Meals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {mealOrder.map((meal) => {
                  const mealEntries = grouped[meal];
                  if (mealEntries.length === 0) return null;
                  const mealCalories = mealEntries.reduce(
                    (sum, entry) => sum + entry.calories,
                    0
                  );
                  return (
                    <div key={meal}>
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="text-sm font-semibold">
                          {mealTypeLabels[meal]}
                        </h3>
                        <Badge variant="secondary">
                          {formatNumber(mealCalories, 0)} kcal
                        </Badge>
                      </div>
                      <ul className="divide-y">
                        {mealEntries.map((entry) => (
                          <li
                            key={entry.id}
                            className="flex items-center justify-between gap-4 py-2.5"
                          >
                            <div>
                              <p className="text-sm font-semibold">
                                {entry.food_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatNumber(entry.servings, 1)} servings ·{" "}
                                {formatNumber(entry.calories, 0)} kcal
                                {entry.protein_g > 0
                                  ? ` · P ${formatNumber(entry.protein_g, 1)}g`
                                  : ""}
                              </p>
                            </div>
                            <DeleteButton
                              action={deleteFoodEntryAction}
                              id={entry.id}
                              label="Delete"
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Macros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MacroRow
                label="Protein"
                grams={totals.protein_g}
                percent={percentOf(proteinCalories)}
                indicatorClassName="bg-success"
              />
              <MacroRow
                label="Carbs"
                grams={totals.carbs_g}
                percent={percentOf(carbsCalories)}
                indicatorClassName="bg-warning"
              />
              <MacroRow
                label="Fat"
                grams={totals.fat_g}
                percent={percentOf(fatCalories)}
                indicatorClassName="bg-destructive"
              />
              <p className="text-xs text-muted-foreground">
                Share of total calories from each macro.
              </p>
            </CardContent>
          </Card>
          <CustomFoodForm />
        </div>
      </div>
    </div>
  );
}
