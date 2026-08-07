import { describe, it, expect } from "vitest";
import {
  detectWaterIntent,
  detectWeightIntent,
  detectToolIntent,
} from "@/features/ai-coach/lib/tools";

describe("detectWaterIntent", () => {
  it("detects ml amounts", () => {
    expect(detectWaterIntent("log 500 ml of water")).toEqual({ amountMl: 500 });
  });

  it("detects liters", () => {
    expect(detectWaterIntent("add 1.5 L water")).toEqual({ amountMl: 1500 });
  });

  it("detects glasses as 250 ml", () => {
    expect(detectWaterIntent("drank 2 glasses of water")).toEqual({ amountMl: 500 });
  });

  it("detects cups and bottles", () => {
    expect(detectWaterIntent("1 cup water")).toEqual({ amountMl: 250 });
    expect(detectWaterIntent("record 2 bottles water")).toEqual({ amountMl: 1000 });
  });

  it("rejects nonsense amounts", () => {
    expect(detectWaterIntent("log -5 water")).toBeNull();
    expect(detectWaterIntent("log 999999 water")).toBeNull();
    expect(detectWaterIntent("water")).toBeNull();
    expect(detectWaterIntent("tell me about hydration")).toBeNull();
  });
});

describe("detectWeightIntent", () => {
  it("detects kg weights", () => {
    expect(detectWeightIntent("log 82 kg")).toEqual({ weightKg: 82 });
    expect(detectWeightIntent("weight is 81.5")).toEqual({ weightKg: 81.5 });
  });

  it("converts pounds to kg", () => {
    expect(detectWeightIntent("log 180 lbs")).toEqual({ weightKg: Math.round(180 * 0.45359237 * 100) / 100 });
  });

  it("rejects out-of-range weights", () => {
    expect(detectWeightIntent("log 3 kg")).toBeNull();
    expect(detectWeightIntent("log 1000 kg")).toBeNull();
  });
});

describe("detectToolIntent", () => {
  it("classifies water logging", () => {
    expect(detectToolIntent("log 250 ml of water")).toEqual({
      action: "log_water",
      amountMl: 250,
    });
  });

  it("classifies weight logging", () => {
    expect(detectToolIntent("record 78kg")).toEqual({
      action: "log_weight",
      weightKg: 78,
    });
  });

  it("classifies page-open intents", () => {
    expect(detectToolIntent("open workouts")).toEqual({
      action: "open_workouts",
      args: {},
    });
    expect(detectToolIntent("show my analytics")).toEqual({
      action: "view_progress",
      args: {},
    });
    expect(detectToolIntent("set a goal")).toEqual({
      action: "open_goals",
      args: {},
    });
  });

  it("returns null for plain questions", () => {
    expect(detectToolIntent("How is my progress?")).toBeNull();
    expect(detectToolIntent("Give me a workout plan")).toBeNull();
  });
});
