import { z } from "zod";

export const exerciseRowSchema = z.object({
  exercise_id: z.string().max(100).optional().or(z.literal("")),
  name: z
    .string()
    .trim()
    .max(80, { error: "Exercise name must be at most 80 characters." }),
  sets: z
    .union([
      z.coerce
        .number()
        .min(1, { error: "Sets must be at least 1." })
        .max(100, { error: "Sets must be at most 100." }),
      z.literal(""),
    ])
    .optional(),
  reps: z
    .union([
      z.coerce
        .number()
        .min(1, { error: "Reps must be at least 1." })
        .max(1000, { error: "Reps must be at most 1000." }),
      z.literal(""),
    ])
    .optional(),
  weight_kg: z
    .union([
      z.coerce
        .number()
        .min(0, { error: "Weight must be at least 0 kg." })
        .max(1000, { error: "Weight must be at most 1000 kg." }),
      z.literal(""),
    ])
    .optional(),
});

export const createWorkoutSchema = z.object({
  date: z.string().min(1, { error: "Date is required." }),
  name: z
    .string()
    .trim()
    .min(1, { error: "Name is required." })
    .max(80, { error: "Name must be at most 80 characters." }),
  category: z.enum([
    "strength",
    "cardio",
    "running",
    "walking",
    "cycling",
    "hiit",
    "yoga",
    "stretching",
    "mobility",
    "sports",
    "custom",
  ]),
  duration_minutes: z.coerce
    .number({ error: "Duration is required." })
    .min(1, { error: "Duration must be at least 1 minute." })
    .max(1440, { error: "Duration must be at most 1440 minutes." }),
  calories_burned: z
    .union([
      z.coerce
        .number()
        .min(1, { error: "Calories must be at least 1." })
        .max(10000, { error: "Calories must be at most 10000." }),
      z.literal(""),
    ])
    .optional(),
  distance_km: z
    .union([
      z.coerce
        .number()
        .min(0, { error: "Distance must be at least 0 km." })
        .max(500, { error: "Distance must be at most 500 km." }),
      z.literal(""),
    ])
    .optional(),
  notes: z.string().max(500).trim().optional().or(z.literal("")),
  exercises: z.array(exerciseRowSchema).optional(),
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
