import { describe, it, expect } from "vitest";
import {
  buildRecommendationPriority,
  buildTodayOverview,
  buildWeeklySummary,
  answerDeterministically,
  buildDeterministicWorkoutPlan,
} from "@/features/ai-coach/lib/responder";
import type { FitnessContext } from "@/features/ai-coach/lib/types";

function makeContext(overrides: Partial<FitnessContext> = {}): FitnessContext {
  return {
    generatedAt: "2026-08-07T12:00:00.000Z",
    user: {
      firstName: "Alex",
      heightCm: 180,
      age: 32,
      gender: "male",
      fitnessLevel: "beginner",
      activityLevel: "light",
      primaryGoal: "lose_weight",
      waterTargetMl: 2500,
      stepTarget: 8000,
      calorieTarget: 2200,
    },
    weight: {
      currentKg: 82,
      change7dKg: -0.5,
      change30dKg: -1.5,
      bmi: 25.3,
      bmiCategory: "overweight",
      lastRecordedDate: "2026-08-06",
    },
    workouts: {
      last7d: 2,
      last30d: 8,
      perWeek: 1.9,
      minutesLast30d: 320,
      categories: { strength: 5, cardio: 3 },
      recent: [],
    },
    activity: {
      avgSteps7d: 6200,
      activeMinutes7d: 120,
      daysLogged7d: 5,
      daysLogged30d: 18,
    },
    sleep: {
      avgMinutes7d: 390,
      avgQuality: "fair",
      daysLogged7d: 6,
    },
    water: {
      todayMl: 1000,
      avgPerDay7d: 1800,
      daysLogged7d: 6,
      daysHitTarget7d: 3,
      targetMl: 2500,
    },
    nutrition: {
      avgCalories7d: 2100,
      avgProteinG7d: 110,
      daysLogged7d: 5,
    },
    habits: [
      { id: "h1", name: "Morning stretch", targetPerWeek: 5, completionRate: 90 },
      { id: "h2", name: "Read", targetPerWeek: 7, completionRate: 40 },
    ],
    goals: [
      {
        id: "g1",
        type: "weight",
        title: "Reach 78 kg",
        current: 82,
        target: 78,
        percent: 20,
        status: "active",
      },
    ],
    consistency: 60,
    hasData: true,
    ...overrides,
  };
}

describe("buildRecommendationPriority", () => {
  it("flags hydration when far below target", () => {
    const ctx = makeContext({ water: { ...makeContext().water, todayMl: 800 } });
    const actions = buildRecommendationPriority(ctx);
    expect(actions[0].key).toBe("hydrate");
  });

  it("flags missing workouts this week", () => {
    const ctx = makeContext({
      workouts: { ...makeContext().workouts, last7d: 0, last30d: 3 },
    });
    const actions = buildRecommendationPriority(ctx);
    expect(actions.some((a) => a.key === "workout")).toBe(true);
  });

  it("caps at 3 actions", () => {
    const ctx = makeContext({
      water: { ...makeContext().water, todayMl: 500 },
      workouts: { ...makeContext().workouts, last7d: 0 },
      sleep: { ...makeContext().sleep, avgMinutes7d: 300 },
    });
    expect(buildRecommendationPriority(ctx).length).toBeLessThanOrEqual(3);
  });

  it("falls back to consistency when everything is fine", () => {
    const ctx = makeContext({
      water: { ...makeContext().water, todayMl: 2500 },
      workouts: { ...makeContext().workouts, last7d: 4 },
      sleep: { ...makeContext().sleep, avgMinutes7d: 480 },
    });
    const actions = buildRecommendationPriority(ctx);
    expect(actions[0]?.key).toBe("consistency");
  });
});

describe("buildTodayOverview", () => {
  it("returns onboarding copy when no data", () => {
    const ctx = makeContext({ hasData: false });
    const overview = buildTodayOverview(ctx);
    expect(overview.focus).toBe("Establish your baseline");
    expect(overview.actionHref).toBe("/app/dashboard?quick=add");
  });

  it("flags hydration as the biggest gap today", () => {
    const ctx = makeContext({ water: { ...makeContext().water, todayMl: 1000 } });
    expect(buildTodayOverview(ctx).insight).toContain("hydration");
  });

  it("always returns an action href", () => {
    expect(buildTodayOverview(makeContext()).actionHref).toMatch(/^\/app\//);
  });
});

describe("buildWeeklySummary", () => {
  it("summarizes the week and separates wins from attention", () => {
    const ctx = makeContext();
    const summary = buildWeeklySummary(ctx);
    expect(summary.yourWeek).toContain("2 workouts");
    expect(summary.whatWentWell.length).toBeGreaterThan(0);
    expect(summary.needsAttention.length).toBeGreaterThan(0);
  });

  it("flags low sleep and step deficits", () => {
    const ctx = makeContext({
      sleep: { ...makeContext().sleep, avgMinutes7d: 360 },
      activity: { ...makeContext().activity, avgSteps7d: 3000 },
    });
    const summary = buildWeeklySummary(ctx);
    expect(summary.needsAttention.some((n) => n.toLowerCase().includes("sleep"))).toBe(true);
    expect(summary.needsAttention.some((n) => n.toLowerCase().includes("steps"))).toBe(true);
  });
});

describe("answerDeterministically", () => {
  it("returns onboarding guidance when no data", () => {
    const reply = answerDeterministically(makeContext({ hasData: false }), "hello");
    expect(reply.confidence).toBe("high");
    expect(reply.actions.length).toBe(3);
  });

  it("answers sleep questions", () => {
    const reply = answerDeterministically(makeContext(), "how is my sleep?");
    expect(reply.reply).toContain("6h 30m");
  });

  it("answers hydration questions", () => {
    const reply = answerDeterministically(makeContext(), "water?");
    expect(reply.reply).toContain("1,000 ml");
  });

  it("answers goal questions", () => {
    const reply = answerDeterministically(makeContext(), "how is my goal going?");
    expect(reply.reply).toContain("Reach 78 kg");
  });

  it("answers workout plan requests", () => {
    const reply = answerDeterministically(makeContext(), "give me a workout");
    expect(reply.reply).toContain("Today's workout");
  });

  it("answers progress reviews", () => {
    const reply = answerDeterministically(makeContext(), "analyze my progress");
    expect(reply.reply).toContain("weekly review");
  });

  it("defaults to the weekly summary for fitness talk", () => {
    const reply = answerDeterministically(makeContext(), "tell me about my diet");
    expect(reply.reply).toContain("Recommended focus");
  });

  it("does not force a fitness summary onto off-topic questions", () => {
    const reply = answerDeterministically(makeContext(), "what is the capital of France?");
    expect(reply.reply).toContain("temporarily unavailable");
    expect(reply.reply).not.toContain("Recommended focus");
  });
});

describe("buildDeterministicWorkoutPlan", () => {
  it("builds a strength plan for body-composition goals", () => {
    const plan = buildDeterministicWorkoutPlan(makeContext());
    expect(plan.exercises.length).toBeGreaterThanOrEqual(4);
    expect(plan.exercises.some((e) => e.name === "Squats")).toBe(true);
    expect(plan.safetyNote).toContain("not medical advice");
  });

  it("builds a general fitness plan for non-strength goals", () => {
    const ctx = makeContext({
      user: { ...makeContext().user, primaryGoal: "improve_fitness" },
    });
    const plan = buildDeterministicWorkoutPlan(ctx);
    expect(plan.exercises.some((e) => e.name.toLowerCase().includes("walk"))).toBe(true);
  });

  it("adjusts difficulty for beginners", () => {
    const plan = buildDeterministicWorkoutPlan(makeContext());
    expect(plan.difficulty).toBe("beginner");
  });
});
