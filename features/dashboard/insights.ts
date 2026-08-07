import { formatNumber } from "@/utils/format";

export type InsightContext = {
  hasAnyData: boolean;
  lastWeight: number | null;
  weightChangeKg: number | null;
  workoutsThisWeek: number;
  workoutsLast30: number;
  avgSteps7d: number;
  waterTodayMl: number;
  waterTargetMl: number;
  avgSleepMinutes7d: number | null;
  caloriesToday: number;
  calorieTarget: number | null;
  consistency: number;
};

export type CoachInsight = {
  id: string;
  title: string;
  content: string;
  tone: "positive" | "neutral" | "warning" | "action";
};

const toneRank: Record<CoachInsight["tone"], number> = {
  warning: 0,
  action: 1,
  positive: 2,
  neutral: 3,
};

export function buildDashboardInsights(ctx: InsightContext): CoachInsight[] {
  if (!ctx.hasAnyData) {
    return [
      {
        id: "getting-started",
        title: "Let's set your baseline",
        content:
          "Log your first weight, workout, or water today. Your dashboard will start showing trends, goals, and personalized tips as soon as you have a little data.",
        tone: "action",
      },
    ];
  }

  const insights: CoachInsight[] = [];

  if (ctx.weightChangeKg != null && ctx.lastWeight != null) {
    const change = ctx.weightChangeKg;
    if (Math.abs(change) >= 0.3) {
      insights.push({
        id: "weight-change",
        title: change < 0 ? "Weight trending down" : "Weight trending up",
        content:
          change < 0
            ? `You're down ${formatNumber(Math.abs(change), 1)} kg to ${formatNumber(
                ctx.lastWeight,
                1
              )} kg since your last entry. Keep the momentum going.`
            : `You're up ${formatNumber(change, 1)} kg to ${formatNumber(
                ctx.lastWeight,
                1
              )} kg since your last entry. Track it for another week before judging the trend.`,
        tone: change < 0 ? "positive" : "warning",
      });
    }
  }

  if (ctx.workoutsLast30 > 0 && ctx.workoutsThisWeek === 0) {
    insights.push({
      id: "workout-this-week",
      title: "Your week is quiet so far",
      content:
        "You haven't logged a workout this week yet. A single session is a great way to restart the habit — even 20 minutes counts.",
      tone: "action",
    });
  } else if (ctx.workoutsThisWeek >= 3) {
    insights.push({
      id: "workout-consistency",
      title: "Great training week",
      content: `You've logged ${ctx.workoutsThisWeek} workouts this week. Protect your recovery and keep the streak rolling.`,
      tone: "positive",
    });
  } else if (ctx.workoutsThisWeek > 0) {
    insights.push({
      id: "workout-building",
      title: "Building consistency",
      content: `You've logged ${ctx.workoutsThisWeek} workout${
        ctx.workoutsThisWeek === 1 ? "" : "s"
      } this week. Aim for at least three sessions a week to make steady progress.`,
      tone: "neutral",
    });
  }

  if (ctx.avgSteps7d > 0) {
    if (ctx.avgSteps7d >= 8000) {
      insights.push({
        id: "steps-great",
        title: "You're moving well",
        content: `You're averaging ${formatNumber(
          ctx.avgSteps7d,
          0
        )} steps a day over the last week. Excellent baseline for general health and recovery.`,
        tone: "positive",
      });
    } else if (ctx.avgSteps7d < 4000) {
      insights.push({
        id: "steps-low",
        title: "Small steps add up",
        content: `You're averaging ${formatNumber(
          ctx.avgSteps7d,
          0
        )} steps a day. A couple of 10-minute walks could comfortably add a few thousand steps.`,
        tone: "action",
      });
    } else {
      insights.push({
        id: "steps-steady",
        title: "Steady daily movement",
        content: `You're averaging ${formatNumber(
          ctx.avgSteps7d,
          0
        )} steps a day over the last week. Adding a short walk is a simple way to raise your daily burn.`,
        tone: "neutral",
      });
    }
  }

  if (ctx.waterTodayMl > 0) {
    const percent = Math.round((ctx.waterTodayMl / Math.max(1, ctx.waterTargetMl)) * 100);
    if (ctx.waterTodayMl >= ctx.waterTargetMl) {
      insights.push({
        id: "water-hit",
        title: "Hydration goal hit",
        content: `You've logged ${formatNumber(
          ctx.waterTodayMl,
          0
        )} ml of water today — that's your full target. Keep sipping steadily into the evening.`,
        tone: "positive",
      });
    } else {
      insights.push({
        id: "water-progress",
        title: "Keep sipping",
        content: `You're ${percent}% of the way to your ${formatNumber(
          ctx.waterTargetMl,
          0
        )} ml water goal today. A few more glasses will get you there.`,
        tone: "action",
      });
    }
  }

  if (ctx.avgSleepMinutes7d != null) {
    if (ctx.avgSleepMinutes7d >= 420) {
      insights.push({
        id: "sleep-good",
        title: "Solid recovery",
        content: `You're averaging ${formatNumber(
          ctx.avgSleepMinutes7d / 60,
          1
        )} hours of sleep a night. That supports your training and body composition goals.`,
        tone: "positive",
      });
    } else {
      insights.push({
        id: "sleep-short",
        title: "Sleep is a performance lever",
        content: `You're averaging ${formatNumber(
          ctx.avgSleepMinutes7d / 60,
          1
        )} hours of sleep a night. Aiming for 7-9 hours will noticeably improve training and recovery.`,
        tone: "warning",
      });
    }
  }

  if (ctx.calorieTarget != null && ctx.caloriesToday > 0) {
    const percent = Math.round((ctx.caloriesToday / ctx.calorieTarget) * 100);
    if (percent <= 110 && percent >= 90) {
      insights.push({
        id: "nutrition-balanced",
        title: "Nutrition on target",
        content: `You've eaten ${formatNumber(
          ctx.caloriesToday,
          0
        )} kcal today, right around your ${formatNumber(ctx.calorieTarget, 0)} kcal target.`,
        tone: "positive",
      });
    } else if (percent > 110) {
      insights.push({
        id: "nutrition-high",
        title: "A little above target",
        content: `You've eaten ${formatNumber(
          ctx.caloriesToday,
          0
        )} kcal today (${percent}% of your ${formatNumber(ctx.calorieTarget, 0)} kcal target). One balanced meal can balance it out.`,
        tone: "warning",
      });
    } else {
      insights.push({
        id: "nutrition-room",
        title: "Room left today",
        content: `You've eaten ${formatNumber(
          ctx.caloriesToday,
          0
        )} kcal so far (${percent}% of your ${formatNumber(
          ctx.calorieTarget,
          0
        )} kcal target). A protein-rich meal keeps you on track.`,
        tone: "neutral",
      });
    }
  }

  if (ctx.consistency >= 70) {
    insights.push({
      id: "consistency-high",
      title: "Consistency is paying off",
      content: `You've been active on ${ctx.consistency}% of the last 28 days. That's the single best predictor of long-term results.`,
      tone: "positive",
    });
  } else if (ctx.consistency >= 40) {
    insights.push({
      id: "consistency-medium",
      title: "Building a rhythm",
      content: `You've been active on ${ctx.consistency}% of the last 28 days. Two small active days per week would push this higher.`,
      tone: "neutral",
    });
  }

  insights.sort((a, b) => toneRank[a.tone] - toneRank[b.tone]);

  return insights.slice(0, 4);
}
