import { describe, it, expect } from "vitest";
import {
  toIso,
  isoDaysAgo,
  computeWeightMetrics,
  computeWorkoutMetrics,
  computeActivityMetrics,
  computeSleepMetrics,
  computeWaterMetrics,
  computeHabitMetrics,
  computeNutritionMetrics,
} from "@/services/calculations/coach";

const TODAY = "2026-08-07";

describe("toIso / isoDaysAgo", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(toIso(new Date("2026-08-07T12:00:00Z"))).toBe("2026-08-07");
  });

  it("subtracts days without timezone drift", () => {
    expect(isoDaysAgo(TODAY, 6)).toBe("2026-08-01");
    expect(isoDaysAgo(TODAY, 0)).toBe("2026-08-07");
  });
});

describe("computeWeightMetrics", () => {
  it("returns nulls for empty data", () => {
    const result = computeWeightMetrics([], TODAY, 180);
    expect(result.currentKg).toBeNull();
    expect(result.lastRecordedDate).toBeNull();
    expect(result.bmi).toBeNull();
  });

  it("computes current weight, changes and BMI", () => {
    const result = computeWeightMetrics(
      [
        { date: "2026-07-01", weightKg: 85 },
        { date: "2026-07-10", weightKg: 84 },
        { date: "2026-08-05", weightKg: 83 },
      ],
      TODAY,
      180
    );
    expect(result.currentKg).toBe(83);
    expect(result.lastRecordedDate).toBe("2026-08-05");
    expect(result.change30dKg).toBe(83 - 84); // -1.0
    expect(result.bmi).toBeCloseTo(83 / 1.8 ** 2);
    expect(result.bmiCategory).not.toBeNull();
  });

  it("handles single-entry data", () => {
    const result = computeWeightMetrics([{ date: TODAY, weightKg: 70 }], TODAY, null);
    expect(result.currentKg).toBe(70);
    expect(result.change7dKg).toBeNull();
  });
});

describe("computeWorkoutMetrics", () => {
  const workouts = [
    { date: "2026-08-06", category: "strength", durationMinutes: 45 },
    { date: "2026-08-04", category: "strength", durationMinutes: 40 },
    { date: "2026-08-01", category: "cardio", durationMinutes: 30 },
    { date: "2026-07-10", category: "strength", durationMinutes: 50 },
  ];

  it("counts workouts in windows", () => {
    const result = computeWorkoutMetrics(workouts, TODAY);
    expect(result.last7d).toBe(3);
    expect(result.last30d).toBe(4);
    expect(result.perWeek).toBeCloseTo(4 / 4.3, 1);
    expect(result.minutesLast30d).toBe(45 + 40 + 30 + 50);
  });

  it("groups categories within the window", () => {
    const result = computeWorkoutMetrics(workouts, TODAY);
    expect(result.categories.strength).toBe(3);
    expect(result.categories.cardio).toBe(1);
  });
});

describe("computeActivityMetrics", () => {
  it("averages steps over the last 7 days only", () => {
    const result = computeActivityMetrics(
      [
        { date: "2026-08-07", steps: 9000, activeMinutes: 40 },
        { date: "2026-08-06", steps: 7000, activeMinutes: 20 },
        { date: "2026-08-01", steps: 8000, activeMinutes: 30 },
        { date: "2026-07-20", steps: 2000, activeMinutes: 5 },
      ],
      TODAY
    );
    expect(result.avgSteps7d).toBe(Math.round((9000 + 7000 + 8000) / 3));
    expect(result.activeMinutes7d).toBe(40 + 20 + 30);
    expect(result.daysLogged7d).toBe(3);
    expect(result.daysLogged30d).toBe(4);
  });

  it("returns zeros for empty data", () => {
    const result = computeActivityMetrics([], TODAY);
    expect(result.avgSteps7d).toBe(0);
    expect(result.activeMinutes7d).toBe(0);
  });
});

describe("computeSleepMetrics", () => {
  it("averages duration and picks the modal quality", () => {
    const result = computeSleepMetrics(
      [
        { date: "2026-08-07", durationMinutes: 480, quality: "good" },
        { date: "2026-08-06", durationMinutes: 360, quality: "good" },
        { date: "2026-08-05", durationMinutes: 420, quality: "fair" },
        { date: "2026-07-01", durationMinutes: 300, quality: "poor" },
      ],
      TODAY
    );
    expect(result.avgMinutes7d).toBe(Math.round((480 + 360 + 420) / 3));
    expect(result.avgQuality).toBe("good");
    expect(result.daysLogged7d).toBe(3);
  });

  it("returns nulls when no sleep logged", () => {
    const result = computeSleepMetrics([], TODAY);
    expect(result.avgMinutes7d).toBeNull();
    expect(result.avgQuality).toBeNull();
  });
});

describe("computeWaterMetrics", () => {
  it("aggregates by day and counts target hits", () => {
    const result = computeWaterMetrics(
      [
        { date: "2026-08-07", amountMl: 500 },
        { date: "2026-08-07", amountMl: 1500 },
        { date: "2026-08-06", amountMl: 2500 },
        { date: "2026-08-05", amountMl: 1200 },
      ],
      TODAY,
      2500
    );
    expect(result.todayMl).toBe(2000);
    expect(result.daysLogged7d).toBe(3);
    expect(result.daysHitTarget7d).toBe(1);
    expect(result.targetMl).toBe(2500);
  });

  it("returns zeros for empty data", () => {
    const result = computeWaterMetrics([], TODAY, 2500);
    expect(result.todayMl).toBe(0);
    expect(result.daysLogged7d).toBe(0);
  });
});

describe("computeHabitMetrics", () => {
  const habits = [
    { id: "h1", name: "Morning stretch", targetPerWeek: 5 },
    { id: "h2", name: "Read", targetPerWeek: 7 },
  ];
  const logs = [
    { habitId: "h1", date: "2026-08-07", completed: true },
    { habitId: "h1", date: "2026-08-06", completed: true },
    { habitId: "h1", date: "2026-08-05", completed: true },
    { habitId: "h1", date: "2026-08-04", completed: true },
    { habitId: "h1", date: "2026-08-03", completed: true },
    { habitId: "h1", date: "2026-08-01", completed: false },
    { habitId: "h2", date: "2026-08-07", completed: true },
  ];

  it("computes completion rate against the expected window", () => {
    const result = computeHabitMetrics(habits, logs, TODAY);
    const stretch = result.find((h) => h.id === "h1")!;
    // Expected = min(7 days, target 5) = 5, completed 5 in window → 100%
    expect(stretch.completionRate).toBe(100);
    const read = result.find((h) => h.id === "h2")!;
    expect(read.completionRate).toBe(Math.round((1 / 7) * 100));
  });
});

describe("computeNutritionMetrics", () => {
  it("averages per logged day within the window", () => {
    const result = computeNutritionMetrics(
      [
        { date: "2026-08-07", calories: 2000, proteinG: 120 },
        { date: "2026-08-06", calories: 1800, proteinG: 100 },
        { date: "2026-08-07", calories: 400, proteinG: 30 },
        { date: "2026-07-01", calories: 999, proteinG: 1 },
      ],
      TODAY
    );
    expect(result.daysLogged7d).toBe(2);
    expect(result.avgCalories7d).toBe(Math.round((2400 + 1800) / 2));
    expect(result.avgProteinG7d).toBe(Math.round((150 + 100) / 2));
  });

  it("returns zeros for empty data", () => {
    const result = computeNutritionMetrics([], TODAY);
    expect(result.avgCalories7d).toBe(0);
  });
});
