import { z } from "zod";

export const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  unit_system: z.enum(["metric", "imperial"]),
  water_target_ml: z
    .union([
      z.coerce
        .number()
        .min(250, { error: "Water target must be at least 250 ml." })
        .max(10000, { error: "Water target must be at most 10,000 ml." }),
      z.literal(""),
    ])
    .optional(),
  step_target: z
    .union([
      z.coerce
        .number()
        .min(1000, { error: "Step target must be at least 1,000." })
        .max(100000, { error: "Step target must be at most 100,000." }),
      z.literal(""),
    ])
    .optional(),
  calorie_target: z
    .union([
      z.coerce
        .number()
        .min(500, { error: "Calorie target must be at least 500." })
        .max(10000, { error: "Calorie target must be at most 10,000." }),
      z.literal(""),
    ])
    .optional(),
  workout_reminders: z.coerce.boolean().optional(),
  water_reminders: z.coerce.boolean().optional(),
  weight_reminders: z.coerce.boolean().optional(),
  goal_notifications: z.coerce.boolean().optional(),
  achievement_notifications: z.coerce.boolean().optional(),
  weekly_reports: z.coerce.boolean().optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
