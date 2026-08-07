"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Brain, CheckCircle2, Info, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import type { CoachInsight } from "@/features/dashboard/queries";

interface DailyCoachProps {
  insights: CoachInsight[];
}

const toneConfig: Record<
  CoachInsight["tone"],
  { icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>; className: string }
> = {
  positive: { icon: CheckCircle2, className: "text-success" },
  warning: { icon: AlertTriangle, className: "text-warning" },
  action: { icon: Sparkles, className: "text-primary" },
  neutral: { icon: Info, className: "text-muted-foreground" },
};

export function DailyCoach({ insights }: DailyCoachProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" aria-hidden />
          Daily Coach
        </CardTitle>
        <CardDescription>Personalized tips generated from your latest data.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {insights.map((insight) => {
          const config = toneConfig[insight.tone];
          const Icon = config.icon;
          return (
            <div
              key={insight.id}
              className="flex items-start gap-3 rounded-lg border bg-secondary/40 p-3"
            >
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", config.className)} aria-hidden />
              <div className="space-y-0.5">
                <p className="text-sm font-semibold leading-tight">{insight.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{insight.content}</p>
              </div>
            </div>
          );
        })}

        <Link
          href="/app/ai-coach"
          className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Open AI Coach
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </CardContent>
    </Card>
  );
}
