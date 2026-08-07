import type { Metadata } from "next";
import { Target } from "lucide-react";
import { requireProfile } from "@/lib/dal/auth";
import { getGoals } from "@/features/goals/queries";
import { deleteGoalAction } from "@/features/goals/actions";
import { goalTypeOptions } from "@/features/goals/schemas";
import { GoalForm } from "@/features/goals/components/goal-form";
import { GoalStatusButton } from "@/features/goals/components/goal-status-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DeleteButton } from "@/components/ui/delete-button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNumber } from "@/utils/format";
import { formatDate } from "@/utils/dates";
import type { GoalStatus, GoalType } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Goals",
};

const statusBadgeVariant: Record<
  GoalStatus,
  "default" | "success" | "secondary" | "destructive"
> = {
  active: "default",
  completed: "success",
  paused: "secondary",
  abandoned: "destructive",
};

function formatStatus(status: GoalStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function typeLabel(type: GoalType): string {
  return goalTypeOptions.find((option) => option.value === type)?.label ?? type;
}

export default async function GoalsPage() {
  await requireProfile();
  const goals = await getGoals();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
        <p className="text-sm text-muted-foreground">
          Set a target and track your progress over time.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid gap-4 lg:col-span-2">
          {goals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="No goals yet"
              description="Create your first goal to start working toward a target."
            />
          ) : (
            goals.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{goal.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {typeLabel(goal.type)}
                        {goal.target_date
                          ? ` · Target ${formatDate(goal.target_date)}`
                          : ""}
                      </p>
                    </div>
                    <Badge variant={statusBadgeVariant[goal.status]}>
                      {formatStatus(goal.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {formatNumber(goal.start_value)} →{" "}
                      <span className="font-semibold text-foreground">
                        {formatNumber(goal.target_value)}
                      </span>
                      {goal.unit ? ` ${goal.unit}` : ""}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Started {formatDate(goal.start_date)}
                    </span>
                  </div>
                  <Progress value={0} />
                  <p className="text-xs text-muted-foreground">
                    Track progress in your daily logs.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {goal.status === "active" && (
                      <>
                        <GoalStatusButton
                          goalId={goal.id}
                          status="completed"
                          label="Mark complete"
                        />
                        <GoalStatusButton
                          goalId={goal.id}
                          status="paused"
                          label="Pause"
                        />
                      </>
                    )}
                    {goal.status === "paused" && (
                      <GoalStatusButton
                        goalId={goal.id}
                        status="active"
                        label="Resume"
                      />
                    )}
                    <DeleteButton
                      action={deleteGoalAction}
                      id={goal.id}
                      label="Delete"
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">New goal</CardTitle>
            </CardHeader>
            <CardContent>
              <GoalForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
