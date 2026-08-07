import type { Metadata } from "next";
import { Dumbbell, Shield, Trophy, Users } from "lucide-react";
import { getAdminStats } from "@/features/admin/queries";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/utils/format";
import { relativeTime } from "@/utils/dates";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          A snapshot of the BodyNova platform.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total users"
          value={formatNumber(stats.userCount, 0)}
          icon={Users}
        />
        <StatCard
          title="Admins"
          value={formatNumber(stats.adminCount, 0)}
          icon={Shield}
        />
        <StatCard
          title="Active exercises"
          value={formatNumber(stats.activeExerciseCount, 0)}
          icon={Dumbbell}
        />
        <StatCard
          title="Achievements"
          value={formatNumber(stats.achievementCount, 0)}
          icon={Trophy}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent signups</CardTitle>
          <CardDescription>
            The latest profiles to join BodyNova.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentSignups.length === 0 ? (
            <p className="text-sm text-muted-foreground">No signups yet.</p>
          ) : (
            <ul className="divide-y">
              {stats.recentSignups.map((profile) => (
                <li
                  key={profile.id}
                  className="flex items-center justify-between gap-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {profile.full_name || profile.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {profile.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Badge variant={profile.onboarding_completed ? "success" : "warning"}>
                      {profile.onboarding_completed ? "Onboarded" : "Incomplete"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {relativeTime(profile.created_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
