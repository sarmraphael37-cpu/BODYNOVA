import { z } from "zod";
import type { GoalType } from "@/types/database";

export const createGoalSchema = z.object({
  type: z.enum([
    "weight",
    "workouts",
    "steps",
    "water",
    "habit",
    "sleep",
    "distance",
  ]),
  title: z
    .string()
    .trim()
    .min(2, { error: "Title must be at least 2 characters." })
    .max(80, { error: "Title must be at most 80 characters." }),
  target_value: z.coerce
    .number({ error: "Target is required." })
    .min(1, { error: "Target must be at least 1." }),
  unit: z.string().max(30).optional().or(z.literal("")),
  target_date: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      error: "Target date must be a valid date.",
    })
    .optional()
    .or(z.literal("")),
  start_value: z.coerce
    .number()
    .min(0)
    .optional()
    .or(z.literal("")),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const goalTypeOptions: {
  value: GoalType;
  label: string;
  description: string;
}[] = [
  {
    value: "weight",
    label: "Weight",
    description: "Hit a target weight.",
  },
  {
    value: "workouts",
    label: "Workouts",
    description: "Complete a number of workouts.",
  },
  {
    value: "steps",
    label: "Steps",
    description: "Reach a daily step count.",
  },
  {
    value: "water",
    label: "Water",
    description: "Hit a daily water intake.",
  },
  {
    value: "habit",
    label: "Habit",
    description: "Build a consistent habit.",
  },
  {
    value: "sleep",
    label: "Sleep",
    description: "Improve your sleep.",
  },
  {
    value: "distance",
    label: "Distance",
    description: "Cover a total distance.",
  },
];
