import type { FitnessContext } from "@/features/ai-coach/lib/types";
import {
  formatNumber,
  formatMinutes,
  formatSleepMinutes,
  formatPercent,
} from "@/utils/format";

export const COACH_SYSTEM_VERSION = "coach-v1";

// ---------------------------------------------------------------------------
// Shared safety + behavior contract applied to every generation.
// ---------------------------------------------------------------------------

const SAFETY_NOTICE = `You are "Nova", the BodyNova AI Fitness Coach — a supportive, evidence-aware coaching assistant. Rules:
- Only reference data that appears in the user context. If data is missing, say so. Never fabricate numbers.
- Do not diagnose medical conditions, prescribe treatment, or give dangerous diet/exercise advice.
- For anything that looks like an injury, severe pain, or a medical concern, advise speaking to a qualified healthcare professional.
- Avoid promising specific outcome dates or unsupported medical claims. Prefer cautious language like "may be associated with".
- Be concise, friendly, motivating, and non-judgmental.
- All guidance is informational, not medical advice.`;

function formatWeight(ctx: FitnessContext): string {
  const w = ctx.weight;
  const parts: string[] = [];
  if (w.currentKg != null) {
    parts.push(`current ${formatNumber(w.currentKg, 1)} kg`);
    if (w.change7dKg != null) parts.push(`7d change ${w.change7dKg > 0 ? "+" : ""}${formatNumber(w.change7dKg, 1)} kg`);
    if (w.change30dKg != null) parts.push(`30d change ${w.change30dKg > 0 ? "+" : ""}${formatNumber(w.change30dKg, 1)} kg`);
    parts.push(`BMI ${formatNumber(w.bmi ?? 0, 1)} (${w.bmiCategory ?? "unknown"})`);
  } else {
    parts.push("no weight logged");
  }
  return parts.join(" | ");
}

export function renderContext(ctx: FitnessContext): string {
  const u = ctx.user;
  const lines: string[] = [
    "USER PROFILE",
    `- First name: ${u.firstName}`,
    `- Primary goal: ${u.primaryGoal ?? "not set"}`,
    `- Fitness level: ${u.fitnessLevel ?? "unknown"} | Activity level: ${u.activityLevel ?? "unknown"}`,
    `- Height: ${u.heightCm ? `${u.heightCm} cm` : "not set"} | Age: ${u.age ?? "unknown"} | Gender: ${u.gender ?? "unspecified"}`,
    `- Targets: ${formatNumber(u.waterTargetMl, 0)} ml water, ${formatNumber(u.stepTarget, 0)} steps, calories ${u.calorieTarget ? formatNumber(u.calorieTarget, 0) : "unset"}`,
    "",
    "WEIGHT",
    `- ${formatWeight(ctx)}`,
    "",
    "WORKOUTS",
    `- ${ctx.workouts.last7d} in last 7d | ${ctx.workouts.last30d} in last 30d (~${ctx.workouts.perWeek}/week) | ${formatMinutes(ctx.workouts.minutesLast30d)} total`,
    `- Categories: ${Object.entries(ctx.workouts.categories)
      .map(([k, v]) => `${k} x${v}`)
      .join(", ") || "none"}`,
    `- Recent: ${ctx.workouts.recent
      .slice(0, 5)
      .map((w) => `${w.name} (${w.category}, ${w.durationMinutes}m, ${w.date})`)
      .join("; ") || "none"}`,
    "",
    "ACTIVITY",
    `- Avg steps 7d: ${formatNumber(ctx.activity.avgSteps7d, 0)} | Active minutes 7d: ${formatNumber(
      ctx.activity.activeMinutes7d,
      0
    )} | Logged ${ctx.activity.daysLogged7d}/7 days`,
    "",
    "SLEEP",
    ctx.sleep.avgMinutes7d != null
      ? `- Avg ${formatSleepMinutes(ctx.sleep.avgMinutes7d)}/night over ${ctx.sleep.daysLogged7d} nights | usual quality: ${ctx.sleep.avgQuality ?? "unknown"}`
      : "- No sleep logged in the last 7 days",
    "",
    "HYDRATION",
    `- Today: ${formatNumber(ctx.water.todayMl, 0)} ml / ${formatNumber(ctx.water.targetMl, 0)} ml target | Avg per tracked day: ${formatNumber(
      ctx.water.avgPerDay7d,
      0
    )} ml | Hit target on ${ctx.water.daysHitTarget7d}/${ctx.water.daysLogged7d || 0} tracked days`,
    "",
    "NUTRITION",
    ctx.nutrition.daysLogged7d > 0
      ? `- Avg ${formatNumber(ctx.nutrition.avgCalories7d, 0)} kcal/day, ${formatNumber(
          ctx.nutrition.avgProteinG7d,
          0
        )}g protein on ${ctx.nutrition.daysLogged7d} logged days`
      : "- No nutrition logged in the last 7 days",
    "",
    "HABITS",
    ctx.habits.length > 0
      ? `- ${ctx.habits.map((h) => `${h.name} ${formatPercent(h.completionRate)}`).join(" | ")}`
      : "- No habits created",
    "",
    "GOALS",
    ctx.goals.length > 0
      ? `- ${ctx.goals
          .map((g) => `${g.title}: ${g.current != null ? formatNumber(g.current, 1) : "unmeasured"} / ${formatNumber(g.target, 1)} (${formatPercent(g.percent)})`)
          .join(" | ")}`
      : "- No active goals",
    "",
    `CONSISTENCY SCORE: ${formatPercent(ctx.consistency)} (active days in the last 28)`,
  ];
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Prompt builders (versioned via COACH_SYSTEM_VERSION).
// ---------------------------------------------------------------------------

const jsonShape = (shape: string) =>
  `Return ONLY a valid JSON object with this exact shape (no markdown, no commentary):\n${shape}`;

const insightShape = `{
  "type": "daily|weekly|goal|workout|nutrition|hydration|activity|sleep",
  "title": "short headline",
  "summary": "one sentence (optional)",
  "content": "2-4 sentences, personalized, using only the data provided",
  "priority": "high|medium|low",
  "recommendations": ["1-3 short actionable recommendations"],
  "confidence": "high|medium|low",
  "safetyNote": "optional short note"
}`;

export function dailyInsightPrompt(ctx: FitnessContext): string {
  return [
    SAFETY_NOTICE,
    "",
    "Generate ONE personalized daily fitness insight for the user based strictly on the context below.",
    "Consider weight trend, workout consistency, hydration, sleep, step activity, goal progress, and habit completion.",
    "Pick the single most notable pattern today and make the insight specific and actionable — not generic.",
    "",
    "USER CONTEXT:",
    renderContext(ctx),
    "",
    jsonShape(insightShape),
  ].join("\n");
}

export function weeklyReviewPrompt(ctx: FitnessContext): string {
  return [
    SAFETY_NOTICE,
    "",
    "Generate a concise weekly fitness review for the user using ONLY the context below.",
    "Analyze weight change, workout frequency, steps, water intake, sleep, goal progress, and habit completion.",
    "Be honest about missing data: if an area has no data, note it as 'not tracked' rather than guessing.",
    "",
    "USER CONTEXT:",
    renderContext(ctx),
    "",
    jsonShape(`{
  "yourWeek": "2-3 sentence narrative of the week",
  "whatWentWell": ["2-4 short positive findings"],
  "needsAttention": ["2-4 short areas to improve"],
  "keyInsight": "one key takeaway",
  "recommendedFocus": "the single most important focus next week",
  "nextWeekTarget": "one concrete, measurable target for next week"
}`),
  ].join("\n");
}

export function workoutRecommendationPrompt(ctx: FitnessContext): string {
  return [
    SAFETY_NOTICE,
    "",
    "Recommend ONE structured workout for today for this user.",
    "Tailor it to their goal, fitness level, recent workout volume, and recovery. Keep it safe and executable with minimal or no equipment.",
    "If the user has logged heavy training recently, prioritize recovery and a lighter session.",
    "",
    "USER CONTEXT:",
    renderContext(ctx),
    "",
    jsonShape(`{
  "title": "workout title",
  "durationMinutes": 25,
  "difficulty": "beginner|intermediate|advanced",
  "focus": "e.g. full body, push, recovery",
  "warmup": "5 minute suggestion",
  "exercises": [
    { "name": "Squats", "sets": 3, "reps": "12" }
  ],
  "cooldown": "light stretching suggestion",
  "safetyNote": "short safety reminder"
}`),
  ].join("\n");
}

export function progressAnalysisPrompt(ctx: FitnessContext): string {
  return [
    SAFETY_NOTICE,
    "",
    "Analyze the user's fitness progress from the context below.",
    "Identify positive changes, negative changes, important patterns, and possible trade-offs.",
    "Do not overstate causality — prefer phrasing like 'may be associated with'.",
    "",
    "USER CONTEXT:",
    renderContext(ctx),
    "",
    jsonShape(`{
  "summary": "2-3 sentence plain-language summary of current state and trend",
  "positiveChanges": ["2-4 findings"],
  "negativeChanges": ["2-4 findings"],
  "patterns": ["2-4 observed patterns"],
  "tradeoffs": ["1-3 possible trade-offs, worded cautiously"],
  "recommendedFocus": "the single best next step"
}`),
  ].join("\n");
}

export function chatSystemPrompt(ctx: FitnessContext): string {
  return [
    SAFETY_NOTICE,
    "",
    "Answer the user's fitness question conversationally using the context below when relevant.",
    "Prefer short paragraphs and bullet lists. Match their language: if they ask 'explain my progress', give a plain-language progress summary.",
    "If you detect a medical concern, respond with safety guidance and suggest consulting a professional — do not diagnose.",
    "",
    "USER CONTEXT (current snapshot):",
    renderContext(ctx),
    "",
    "Begin your answer directly with the reply text.",
  ].join("\n");
}

export function chartExplanationPrompt(chartData: unknown): string {
  return [
    SAFETY_NOTICE,
    "",
    "Explain the following chart data to the user in plain language. Describe the trend, notable changes, and relationship to their goals.",
    "Do not invent data outside what is provided.",
    "",
    "CHART DATA (JSON):",
    JSON.stringify(chartData).slice(0, 6000),
    "",
    "Return ONLY a valid JSON object:",
    jsonShape(`{
  "summary": "what the chart shows",
  "trend": "upward|downward|stable|mixed and why",
  "notablePoints": ["1-3 notable observations"],
  "goalRelationship": "how this relates to their goal, or 'no active goal'",
  "suggestedFocus": "one practical suggestion"
}`),
  ].join("\n");
}
