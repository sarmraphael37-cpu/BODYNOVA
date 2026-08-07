"use client";

import * as React from "react";
import { useActionState } from "react";
import { Brain, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { generateInsightsAction, deleteInsightAction } from "@/features/ai-coach/actions";
import type { CoachActionState } from "@/features/ai-coach/actions";
import { DeleteButton } from "@/components/ui/delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { relativeTime } from "@/utils/dates";
import type { AiInsight, InsightType } from "@/types/database";

const typeLabels: Record<InsightType, string> = {
  daily: "Daily",
  weekly: "Weekly",
  goal: "Goal",
  workout: "Workout",
  nutrition: "Nutrition",
  hydration: "Hydration",
  activity: "Activity",
  sleep: "Sleep",
};

const typeVariants: Record<
  InsightType,
  "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
> = {
  daily: "secondary",
  weekly: "secondary",
  goal: "warning",
  workout: "success",
  nutrition: "outline",
  hydration: "default",
  activity: "outline",
  sleep: "secondary",
};

export function CoachFeed({ insights }: { insights: AiInsight[] }) {
  const [state, formAction, isPending] = useActionState<CoachActionState, FormData>(
    generateInsightsAction,
    {}
  );

  React.useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success("Your coach insights are ready.");
  }, [state]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div>
              <CardTitle className="text-base">Personalized coaching</CardTitle>
              <CardDescription>
                Your coach reads the last 30 days of your data and surfaces
                actionable tips.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <Button type="submit" disabled={isPending}>
              <RefreshCw
                className={`mr-1.5 h-4 w-4${isPending ? " animate-spin" : ""}`}
                aria-hidden
              />
              {isPending ? "Generating…" : "Generate insights"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {insights.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="No insights yet"
          description="Generate your first batch of personalized coaching insights to get started."
        />
      ) : (
        <div className="grid gap-4">
          {insights.map((insight) => (
            <Card key={insight.id}>
              <CardContent className="flex items-start justify-between gap-4 pt-6">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={typeVariants[insight.type]}>
                      {typeLabels[insight.type]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {relativeTime(insight.created_at)}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {insight.content}
                  </p>
                </div>
                <DeleteButton action={deleteInsightAction} id={insight.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
