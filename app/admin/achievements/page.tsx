import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { getAllAchievements } from "@/features/admin/queries";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber } from "@/utils/format";
import type { AchievementCategory } from "@/types/database";

export const metadata: Metadata = {
  title: "Achievements",
};

const categoryLabels: Record<AchievementCategory, string> = {
  workout: "Workout",
  weight: "Weight",
  activity: "Activity",
  hydration: "Hydration",
  consistency: "Consistency",
  goal: "Goal",
  nutrition: "Nutrition",
};

export default async function AdminAchievementsPage() {
  const achievements = await getAllAchievements();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Achievements</h1>
        <p className="text-sm text-muted-foreground">
          The badge catalog users can unlock.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Achievement catalog</CardTitle>
          <CardDescription>
            Definitions used to award badges to users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No achievements"
              description="Add achievements to the catalog to get started."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Category</th>
                    <th className="pb-2 pr-4 font-medium">Threshold</th>
                    <th className="pb-2 font-medium">Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {achievements.map((achievement) => (
                    <tr key={achievement.id}>
                      <td className="py-2.5 pr-4">
                        <p className="font-medium">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                      </td>
                      <td className="py-2.5 pr-4">
                        <Badge variant="outline">
                          {categoryLabels[achievement.category]}
                        </Badge>
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {formatNumber(achievement.threshold_value)}
                        {achievement.threshold_unit
                          ? ` ${achievement.threshold_unit}`
                          : ""}
                      </td>
                      <td className="py-2.5 font-mono text-xs text-muted-foreground">
                        {achievement.code}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
