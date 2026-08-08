import {
  formatNumber,
  formatSleepMinutes,
  formatPercent,
} from "@/utils/format";
import type { FitnessContext } from "@/features/ai-coach/lib/types";
import type { WorkoutPlan } from "@/features/ai-coach/schemas";

// ---------------------------------------------------------------------------
// Deterministic coaching intelligence. This powers the AI Coach even when no
// LLM provider is configured, and acts as the fallback whenever the provider
// is unavailable or returns an invalid response.
// ---------------------------------------------------------------------------

export type RecommendedAction = {
  key: "hydrate" | "workout" | "sleep" | "steps" | "nutrition" | "consistency";
  label: string;
  reason: string;
  action: string;
  href: string;
};

export type TodayOverview = {
  insight: string;
  focus: string;
  focusLabel: string;
  recommendedAction: string;
  actionHref: string;
  weeklyIntelligence: string;
};

export type WeeklySummary = {
  yourWeek: string;
  whatWentWell: string[];
  needsAttention: string[];
  keyInsight: string;
  recommendedFocus: string;
  nextWeekTarget: string;
};

export function buildRecommendationPriority(ctx: FitnessContext): RecommendedAction[] {
  const actions: RecommendedAction[] = [];
  const w = ctx.water;
  const s = ctx.sleep;
  const wo = ctx.workouts;
  const a = ctx.activity;
  const targetMl = w.targetMl || ctx.user.waterTargetMl;

  if (w.todayMl > 0 && w.todayMl < targetMl * 0.6) {
    actions.push({
      key: "hydrate",
      label: "Hydration",
      reason: `You're at ${formatPercent(
        Math.round((w.todayMl / targetMl) * 100)
      )} of your daily water target.`,
      action: "Log your next glass of water now.",
      href: "/app/hydration",
    });
  }

  if (wo.last7d === 0 && wo.last30d > 0) {
    actions.push({
      key: "workout",
      label: "Workout",
      reason: "You haven't logged a workout this week yet.",
      action: "Start with a 20–30 minute session today.",
      href: "/app/workouts",
    });
  } else if (wo.last7d === 0 && wo.last30d === 0) {
    actions.push({
      key: "workout",
      label: "First workout",
      reason: "Logging your first workout establishes your baseline.",
      action: "Try a light 20-minute session to get started.",
      href: "/app/workouts",
    });
  }

  if (s.avgMinutes7d != null && s.avgMinutes7d < 420) {
    actions.push({
      key: "sleep",
      label: "Recovery",
      reason: `You're averaging ${formatSleepMinutes(s.avgMinutes7d)} of sleep a night.`,
      action: "Aim to protect 7–9 hours tonight.",
      href: "/app/sleep",
    });
  }

  if (a.avgSteps7d > 0 && a.avgSteps7d < (ctx.user.stepTarget || 8000) * 0.6) {
    actions.push({
      key: "steps",
      label: "Daily movement",
      reason: `You're averaging ${formatNumber(
        a.avgSteps7d,
        0
      )} steps a day.`,
      action: "Add a couple of short walks today.",
      href: "/app/activity",
    });
  }

  if (actions.length === 0 && ctx.hasData) {
    actions.push({
      key: "consistency",
      label: "Keep it up",
      reason: `You've been active on ${formatPercent(ctx.consistency)} of the last 28 days.`,
      action: "Stay consistent with today's logging.",
      href: "/app/dashboard",
    });
  }

  return actions.slice(0, 3);
}

export function buildTodayOverview(ctx: FitnessContext): TodayOverview {
  const w = ctx.water;
  const s = ctx.sleep;
  const wo = ctx.workouts;
  const a = ctx.activity;
  const targetMl = w.targetMl || ctx.user.waterTargetMl;

  if (!ctx.hasData) {
    return {
      insight:
        "You've just started your fitness journey. Once you record a few workouts, measurements, and daily habits, I'll be able to identify meaningful patterns.",
      focus: "Establish your baseline",
      focusLabel: "Today's focus",
      recommendedAction: "Log your first weight, workout, or water entry today.",
      actionHref: "/app/dashboard?quick=add",
      weeklyIntelligence: "No weekly data yet — your first insights will appear as you track.",
    };
  }

  // Insight: the single most notable observation today.
  let insight: string;
  if (w.todayMl > 0 && w.todayMl < targetMl * 0.5) {
    insight = `Your hydration is the biggest gap today — you're at ${formatPercent(
      Math.round((w.todayMl / targetMl) * 100)
    )} of your water target. A few glasses will get you back on track.`;
  } else if (wo.last7d === 0 && wo.last30d > 0) {
    insight = "Your week is quiet so far: no workouts logged yet. A single session restarts the habit.";
  } else if (s.avgMinutes7d != null && s.avgMinutes7d < 360) {
    insight = `Sleep has been your weak point this week (${formatSleepMinutes(
      s.avgMinutes7d
    )} a night on average). Recovery drives everything else.`;
  } else if (ctx.weight.currentKg != null && Math.abs(ctx.weight.change7dKg ?? 0) >= 0.5) {
    const dir = ctx.weight.change7dKg! > 0 ? "up" : "down";
    insight = `Your weight moved ${dir} ${formatNumber(
      Math.abs(ctx.weight.change7dKg!),
      1
    )} kg over the last week to ${formatNumber(ctx.weight.currentKg, 1)} kg. Keep logging to read the true trend.`;
  } else if (wo.last7d >= 3) {
    insight = `You've logged ${wo.last7d} workouts this week. Consistency like this is the strongest predictor of results — protect your recovery.`;
  } else if (a.avgSteps7d > 0 && a.avgSteps7d < 4000) {
    insight = `You're averaging ${formatNumber(
      a.avgSteps7d,
      0
    )} steps a day. Two 10-minute walks would add a few thousand steps.`;
  } else {
    insight = `Your data looks steady today. Weight: ${
      ctx.weight.currentKg != null ? `${formatNumber(ctx.weight.currentKg, 1)} kg` : "not logged yet"
    } · Steps avg: ${formatNumber(a.avgSteps7d, 0)}/day · Workouts: ${wo.last7d} this week.`;
  }

  const priority = buildRecommendationPriority(ctx)[0];
  const focusLabel = priority ? priority.label : "Today's focus";
  const focus = priority ? priority.label : "Keep momentum";
  const recommendedAction = priority ? priority.action : "Keep logging — consistency compounds.";
  const actionHref = priority ? priority.href : "/app/dashboard";

  const weeklyIntelligence = buildWeeklySummary(ctx).yourWeek;

  return {
    insight,
    focus,
    focusLabel,
    recommendedAction,
    actionHref,
    weeklyIntelligence,
  };
}

export function buildWeeklySummary(ctx: FitnessContext): WeeklySummary {
  const wentWell: string[] = [];
  const attention: string[] = [];
  const w = ctx.water;
  const s = ctx.sleep;
  const wo = ctx.workouts;
  const a = ctx.activity;
  const n = ctx.nutrition;
  const targetMl = w.targetMl || ctx.user.waterTargetMl;

  const weightLine = ctx.weight.currentKg
    ? `weight is ${formatNumber(ctx.weight.currentKg, 1)} kg (${formatNumber(
        ctx.weight.change30dKg ?? 0,
        1
      )} kg over 30 days)`
    : "no weight logged yet";
  const yourWeek = `This week you logged ${wo.last7d} workout${
    wo.last7d === 1 ? "" : "s"
  }, averaged ${formatNumber(a.avgSteps7d, 0)} steps/day, ${formatSleepMinutes(
    s.avgMinutes7d ?? 0
  )} sleep/night, and ${
    w.daysLogged7d > 0
      ? `${formatPercent(Math.round((w.daysHitTarget7d / Math.max(1, w.daysLogged7d)) * 100))} of tracked water days hit target`
      : "no water logged"
  }. Overall, ${weightLine}.`;

  if (wo.last7d >= 3) wentWell.push(`Workouts: ${wo.last7d} sessions this week.`);
  else if (wo.last7d > 0) wentWell.push(`Workouts: ${wo.last7d} sessions this week — a solid start.`);
  if (a.avgSteps7d >= ctx.user.stepTarget) wentWell.push(`Steps: averaging ${formatNumber(a.avgSteps7d, 0)}/day meets your target.`);
  if (s.avgMinutes7d != null && s.avgMinutes7d >= 420) wentWell.push(`Sleep: averaging ${formatSleepMinutes(s.avgMinutes7d)} a night.`);
  if (w.daysHitTarget7d >= 4) wentWell.push(`Hydration: hit target on ${w.daysHitTarget7d} of the last 7 days.`);
  if (n.daysLogged7d >= 4) wentWell.push(`Nutrition: logged meals on ${n.daysLogged7d} days this week.`);
  if (ctx.habits.length > 0) {
    const strong = ctx.habits.filter((h) => h.completionRate >= 80);
    if (strong.length > 0) {
      wentWell.push(
        `Habits: ${strong.map((h) => h.name).join(", ")} at ${formatPercent(strong[0].completionRate)}+ completion.`
      );
    }
  }

  if (wentWell.length === 0 && ctx.hasData) {
    wentWell.push("You're building your tracking baseline — that's the first win.");
  }

  if (wo.last7d === 0 && wo.last30d > 0) attention.push("Workouts: none logged this week after a previous streak.");
  if (s.avgMinutes7d != null && s.avgMinutes7d < 420) attention.push(`Sleep: averaging ${formatSleepMinutes(s.avgMinutes7d)} a night — below the 7–9h range.`);
  if (w.todayMl > 0 && w.todayMl < targetMl * 0.6) attention.push(`Hydration: only ${formatPercent(Math.round((w.todayMl / targetMl) * 100))} of today's target so far.`);
  if (a.avgSteps7d > 0 && a.avgSteps7d < ctx.user.stepTarget * 0.6) attention.push(`Steps: averaging ${formatNumber(a.avgSteps7d, 0)}/day, below your ${formatNumber(ctx.user.stepTarget, 0)} target.`);
  if (ctx.habits.length > 0) {
    const weak = ctx.habits.filter((h) => h.completionRate < 60);
    if (weak.length > 0) attention.push(`Habits: ${weak.map((h) => h.name).join(", ")} are your biggest opportunity.`);
  }
  if (attention.length === 0 && ctx.hasData) attention.push("Nothing major to correct — focus on consistency.");

  const priority = buildRecommendationPriority(ctx)[0];
  const keyInsight = priority
    ? `${priority.label} is your biggest lever: ${priority.reason.toLowerCase()}`
    : "Your current routine is on a healthy path — protect consistency and recovery.";

  return {
    yourWeek,
    whatWentWell: wentWell,
    needsAttention: attention,
    keyInsight,
    recommendedFocus: priority ? priority.label : "Consistency",
    nextWeekTarget: priority
      ? priority.action.replace(/today\.?$/i, "next week.")
      : "Maintain 3+ workouts and consistent hydration.",
  };
}

// ---------------------------------------------------------------------------
// Deterministic chat responder for common questions.
// ---------------------------------------------------------------------------

export type DeterministicReply = {
  reply: string;
  actions: { id: string; label: string; href: string }[];
  confidence: "high" | "medium" | "low";
};

export function answerDeterministically(
  ctx: FitnessContext,
  question: string
): DeterministicReply {
  const q = question.toLowerCase();

  if (!ctx.hasData) {
    return {
      reply:
        "You've just started your fitness journey. Once you record a few workouts, measurements, and daily habits, I'll be able to identify meaningful patterns and give you personalized guidance. Start by logging your weight, a workout, or your water intake.",
      actions: [
        { id: "weight", label: "Log weight", href: "/app/weight" },
        { id: "workout", label: "Log workout", href: "/app/workouts" },
        { id: "water", label: "Log water", href: "/app/hydration" },
      ],
      confidence: "high",
    };
  }

  if (/^(hi|hello|hey|yo|good (morning|afternoon|evening)|sup)\b/.test(q)) {
    return {
      reply:
        `Hey ${ctx.user.firstName || "there"}! I'm Nova, your coach. I can tell you about your progress, recommend a workout, or answer fitness questions — try asking about your steps, sleep, hydration, or this week's training.`,
      actions: [{ id: "coach", label: "Today's focus", href: "/app/ai-coach" }],
      confidence: "high",
    };
  }

  if (/(thank|thanks|thx|appreciate)/.test(q)) {
    return {
      reply: "You're welcome! I'm here whenever you need — ask about your progress, this week's training, hydration, or anything fitness related.",
      actions: [{ id: "coach", label: "Ask me anything", href: "/app/ai-coach" }],
      confidence: "high",
    };
  }

  const week = buildWeeklySummary(ctx);

  if (/(why|isn.t|isnt|hasn.t|not changing|plateau|stuck).*(weight)|(weight).*(not changing|plateau|stuck)/.test(q)) {
    return {
      reply: weightPlateauReply(ctx),
      actions: [{ id: "weight", label: "View weight", href: "/app/weight" }],
      confidence: "high",
    };
  }

  if (q.includes("workout") && (q.includes("today") || q.includes("recommend") || q.includes("give me") || q.includes("plan") || q.includes("create"))) {
    return {
      reply: deterministicWorkoutReply(ctx),
      actions: [{ id: "workout", label: "Open workouts", href: "/app/workouts" }],
      confidence: "medium",
    };
  }

  if (/how many workouts|workout.*(this week|this week\b)/.test(q) || (q.includes("workout") && q.includes("week"))) {
    const total = ctx.workouts.last7d;
    return {
      reply: `You've completed ${total} workout${total === 1 ? "" : "s"} in the last 7 days (${
        ctx.workouts.perWeek
      } per week over 30 days). ${
        total >= 3
          ? "That's a strong rhythm — keep protecting recovery."
          : "Aim for at least 3 sessions a week for steady progress."
      }`,
      actions: [{ id: "workout", label: "View workouts", href: "/app/workouts" }],
      confidence: "high",
    };
  }

  if (/sleep/.test(q)) {
    const mins = ctx.sleep.avgMinutes7d;
    const reply = mins == null
      ? "You haven't logged enough sleep yet for a pattern. Log your sleep tonight and I'll be able to analyze your recovery."
      : `You're averaging ${formatSleepMinutes(mins)} of sleep a night over the last 7 days${
          ctx.sleep.avgQuality ? ` (usually rated "${ctx.sleep.avgQuality}")` : ""
        }. ${
          mins >= 420
            ? "That's a solid recovery baseline supporting your training."
            : "That's below the 7–9h range, so prioritizing sleep is your best performance lever right now."
        }`;
    return { reply, actions: [{ id: "sleep", label: "View sleep", href: "/app/sleep" }], confidence: "high" };
  }

  if (/(water|hydration|hydrat)/.test(q)) {
    const target = ctx.water.targetMl || ctx.user.waterTargetMl;
    const pct = Math.round((ctx.water.todayMl / Math.max(1, target)) * 100);
    const reply =
      ctx.water.todayMl === 0
        ? "You haven't logged water today yet. Your daily target is " +
          formatNumber(target, 0) +
          " ml — logging your first glass helps build the habit."
        : `You've logged ${formatNumber(
            ctx.water.todayMl,
            0
          )} ml of water today (${formatPercent(
            pct
          )} of your ${formatNumber(target, 0)} ml target). ${
            pct >= 100
              ? "Target hit — nice work."
              : pct >= 60
                ? "Well on the way — keep sipping through the evening."
                : "A couple more glasses will get you back on track."
          }`;
    return { reply, actions: [{ id: "water", label: "Log water", href: "/app/hydration" }], confidence: "high" };
  }

  if (/habit/.test(q)) {
    if (ctx.habits.length === 0) {
      return {
        reply: "You haven't created any habits yet. Add habits in the Habits tab and log them daily — I'll track your completion.",
        actions: [{ id: "habits", label: "Open habits", href: "/app/habits" }],
        confidence: "high",
      };
    }
    const sorted = [...ctx.habits].sort((a, b) => b.completionRate - a.completionRate);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    const lines = ctx.habits
      .map((h) => `- ${h.name}: ${formatPercent(h.completionRate)}`)
      .join("\n");
    return {
      reply: `Habit completion this week:\n${lines}\n\nYour strongest habit is ${best.name} (${formatPercent(
        best.completionRate
      )}). Your biggest opportunity is ${worst.name} (${formatPercent(
        worst.completionRate
      )}). Pick one small action to improve it this week.`,
      actions: [{ id: "habits", label: "View habits", href: "/app/habits" }],
      confidence: "high",
    };
  }

  if (/goal/.test(q)) {
    const goal = ctx.goals[0];
    if (!goal) {
      return {
        reply: "You don't have an active goal yet. Setting one (like a target weight or workout frequency) lets me track your progress precisely.",
        actions: [{ id: "goals", label: "Set a goal", href: "/app/goals" }],
        confidence: "high",
      };
    }
    return {
      reply: `Your current goal is "${goal.title}" (${formatPercent(
        goal.percent
      )} complete). Current value: ${
        goal.current != null ? formatNumber(goal.current, 1) : "not measured yet"
      } toward a target of ${formatNumber(goal.target, 1)}. ${
        goal.percent >= 80
          ? "You're close — keep the pressure on."
          : goal.percent > 0
            ? "Steady progress — consistency will close the gap."
            : "Once you log more data I can track progress precisely."
      }`,
      actions: [{ id: "goals", label: "View goals", href: "/app/goals" }],
      confidence: "medium",
    };
  }

  if (/progress|improving|doing|trend|analytics|review/.test(q)) {
    return {
      reply:
        `Here's your weekly review:\n\n${week.yourWeek}\n\nWhat went well:\n${week.whatWentWell
          .map((t) => `- ${t}`)
          .join("\n")}\n\nNeeds attention:\n${week.needsAttention
          .map((t) => `- ${t}`)
          .join("\n")}\n\nKey insight: ${week.keyInsight}\n\nRecommended focus: ${week.recommendedFocus}`,
      actions: [
        { id: "analytics", label: "View analytics", href: "/app/analytics" },
        { id: "reports", label: "View reports", href: "/app/reports" },
      ],
      confidence: "medium",
    };
  }

  if (/(focus|should i do|today)/.test(q)) {
    const overview = buildTodayOverview(ctx);
    return {
      reply: `Today's focus: ${overview.focus}.\n\n${overview.recommendedAction}\n\n${overview.insight}`,
      actions: [{ id: "coach", label: "Open AI Coach", href: "/app/ai-coach" }],
      confidence: "medium",
    };
  }

  if (/(consisten)/.test(q)) {
    return {
      reply: `Your consistency score is ${formatPercent(ctx.consistency)} — it measures how many of the last 28 days you were active on. ${
        ctx.consistency >= 70
          ? "That's an excellent foundation for long-term results."
          : ctx.consistency >= 40
            ? "Two small active days per week would push this higher."
            : "Start with two tiny wins a week — consistency builds on itself."
      }`,
      actions: [{ id: "dashboard", label: "View dashboard", href: "/app/dashboard" }],
      confidence: "medium",
    };
  }

  // Catch-all: if the message shows no coaching intent, don't force a fitness
  // summary on it. The live AI answers global questions; offline mode is honest
  // about that limitation.
  if (!/\b(weight|workout|exercise|training|train|sleep|water|hydrat|step|habit|goal|calorie|protein|nutrition|diet|strength|cardio|muscle|fat|progres|consisten|recovery|recover|rest|stretch|yoga|run|jog|swim|cycle|squat|lunge|plank|push.?up|pull|bench|deadlift|gym|rep|set|meal|snack|fast)/i.test(question)) {
    return {
      reply: `I'd love to answer that! General questions need my full AI connection, which is temporarily unavailable. In the meantime I can still help with your fitness data — ask about your workouts, sleep, water, habits, or this week's progress.`,
      actions: [{ id: "coach", label: "Open AI Coach", href: "/app/ai-coach" }],
      confidence: "low",
    };
  }

  return {
    reply: week.yourWeek + `\n\nRecommended focus: ${week.recommendedFocus}.`,
    actions: [
      { id: "coach", label: "Analyze my progress", href: "/app/analytics" },
      { id: "goal", label: "Set a goal", href: "/app/goals" },
    ],
    confidence: "low",
  };
}

function weightPlateauReply(ctx: FitnessContext): string {
  const weight = ctx.weight;
  if (weight.currentKg == null) {
    return "I can't assess your weight trend yet — log a few weight entries and check back. Weight changes are easier to read with at least two weeks of data.";
  }
  const parts: string[] = [
    `Your weight is ${formatNumber(weight.currentKg, 1)} kg${
      weight.change30dKg != null
        ? `, ${formatNumber(Math.abs(weight.change30dKg), 1)} kg ${weight.change30dKg > 0 ? "higher" : "lower"} over 30 days`
        : ""
    }.`,
  ];
  if (ctx.nutrition.daysLogged7d === 0) {
    parts.push(
      "Your nutrition history is incomplete, so I can't confidently assess your calorie trend — that's usually the first place to look when weight stalls."
    );
  } else {
    parts.push(
      `You're averaging ${formatNumber(ctx.nutrition.avgCalories7d, 0)} kcal/day on logged days.`
    );
  }
  parts.push(
    ctx.workouts.last7d >= 3
      ? "Training volume looks consistent, so the most likely lever is calorie intake precision."
      : "Training volume is light this week; adding one more session can help."
  );
  parts.push("Weight fluctuates daily — judge the 2–4 week trend, not single weigh-ins.");
  return parts.join("\n\n");
}

function deterministicWorkoutReply(ctx: FitnessContext): string {
  const plan = buildDeterministicWorkoutPlan(ctx);
  const lines = plan.exercises
    .map(
      (ex, i) =>
        `${i + 1}. ${ex.name} — ${ex.reps ?? (ex.durationSeconds ? `${ex.durationSeconds}s` : "")}`
    )
    .join("\n");
  return `Today's workout — ${plan.title} (${plan.difficulty}, ~${plan.durationMinutes} minutes)\n\n${lines}\n\n${
    plan.warmup ? `Warm up: ${plan.warmup}.\n\n` : ""
  }Cool down: ${plan.cooldown ?? "light stretching"}. Stop if you feel sharp pain. This is general guidance, not medical advice.`;
}

export function buildDeterministicWorkoutPlan(ctx: FitnessContext): WorkoutPlan {
  const level = ctx.user.fitnessLevel ?? "beginner";
  const goal = ctx.user.primaryGoal ?? "improve_fitness";
  const strength = goal === "build_muscle" || goal === "lose_weight";
  const beginner = level === "beginner";

  const exercises = strength
    ? [
        { name: "Squats", sets: 3, reps: beginner ? "12" : "10" },
        { name: "Push-ups", sets: 3, reps: beginner ? "12" : "10" },
        { name: "Dumbbell or band rows", sets: 3, reps: "12" },
        { name: "Plank", sets: 3, durationSeconds: 30 },
      ]
    : [
        { name: "Brisk walk or light jog", sets: 1, reps: "25 minutes" },
        { name: "Bodyweight squats", sets: 3, reps: "15" },
        { name: "Lunges", sets: 3, reps: beginner ? "10 each" : "12 each" },
        { name: "Incline push-ups", sets: 3, reps: "12" },
      ];

  return {
    title: "Full Body",
    durationMinutes: 35,
    difficulty: beginner ? "beginner" : "intermediate",
    focus: strength ? "strength & body composition" : "general fitness & mobility",
    warmup: "5 minutes of easy movement + dynamic stretches",
    exercises,
    cooldown: "Light stretching for the muscles you worked.",
    safetyNote: "This is general guidance, not medical advice. Stop if you feel sharp pain.",
  };
}
