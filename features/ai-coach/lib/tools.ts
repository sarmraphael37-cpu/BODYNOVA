// ---------------------------------------------------------------------------
// Pure intent detection for natural-language app actions. Deterministic and
// unit-testable. Execution (real DB writes) happens server-side in
// features/ai-coach/services/tools.ts and always derives the user from the
// authenticated session — never from the message text.
// ---------------------------------------------------------------------------

export type ToolAction =
  | "open_workouts"
  | "open_hydration"
  | "open_weight"
  | "open_sleep"
  | "open_goals"
  | "view_progress";

export type WaterIntent = { amountMl: number };
export type WeightIntent = { weightKg: number };

export type ToolIntent =
  | { action: "log_water"; amountMl: number }
  | { action: "log_weight"; weightKg: number }
  | { action: ToolAction; args: Record<string, never> };

const GLASS_ML = 250;
const BOTTLE_ML = 500;

const UNIT_TO_ML: Record<string, number> = {
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  l: 1000,
  liter: 1000,
  liters: 1000,
  glass: GLASS_ML,
  glasses: GLASS_ML,
  cup: 250,
  cups: 250,
  bottle: BOTTLE_ML,
  bottles: BOTTLE_ML,
};

function parseAmount(value: number, unit: string): number | null {
  const factor = UNIT_TO_ML[unit];
  if (!factor) return Math.round(value * GLASS_ML);
  return Math.round(value * factor);
}

export function detectWaterIntent(message: string): WaterIntent | null {
  const match = message.toLowerCase().match(
    /(?:log|add|record|drank|drink|had|tracked)?\s*(?<![-\d])(\d+(?:\.\d+)?)\s*(ml|milliliters?|l|liters?|glasses?|cups?|bottles?)?\s*(?:of\s+)?water/
  );
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  const amountMl = parseAmount(value, match[2] ?? "glass");
  if (amountMl === null || amountMl <= 0 || amountMl > 10000) return null;
  return { amountMl };
}

export function detectWeightIntent(message: string): WeightIntent | null {
  const match = message.toLowerCase().match(
    /(?:log|record|add|weigh|weight)\s*(?:is|=|at)?\s*(?<![-\d])(\d+(?:\.\d+)?)\s*(kg|kilos?|kilograms?|pounds?|lbs?)?/
  );
  if (!match) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  const unit = match[2] ?? "kg";
  let weightKg = unit.startsWith("lb") ? value * 0.45359237 : value;
  weightKg = Math.round(weightKg * 100) / 100;
  if (weightKg < 20 || weightKg > 500) return null;
  return { weightKg };
}

const OPEN_ACTIONS: { pattern: RegExp; action: ToolAction }[] = [
  { pattern: /open.*workout|show.*workout|workout.*page|go to workouts/i, action: "open_workouts" },
  { pattern: /open.*water|open.*hydrat|show.*hydrat/i, action: "open_hydration" },
  { pattern: /open.*weight|show.*weight|go to weight/i, action: "open_weight" },
  { pattern: /open.*sleep|show.*sleep/i, action: "open_sleep" },
  { pattern: /open.*goal|set a goal|go to goals/i, action: "open_goals" },
  { pattern: /open.*progress|view.*progress|open.*analytics|show.*analytics|explain.*progress/i, action: "view_progress" },
];

export function detectToolIntent(message: string): ToolIntent | null {
  const water = detectWaterIntent(message);
  if (water) return { action: "log_water", ...water };

  const weight = detectWeightIntent(message);
  if (weight) return { action: "log_weight", ...weight };

  for (const { pattern, action } of OPEN_ACTIONS) {
    if (pattern.test(message)) return { action, args: {} };
  }

  return null;
}

export const TOOL_LABELS: Record<ToolAction, string> = {
  open_workouts: "Open workouts",
  open_hydration: "Open hydration",
  open_weight: "Open weight",
  open_sleep: "Open sleep",
  open_goals: "Open goals",
  view_progress: "View progress",
};
