import { z } from "zod";

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, { error: "Name must be at least 2 characters." })
    .max(80, { error: "Name must be at most 80 characters." })
    .trim(),
  date_of_birth: z
    .string()
    .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
      error: "Please enter a valid date.",
    })
    .optional()
    .or(z.literal("")),
  gender: z
    .enum(["male", "female", "other", "prefer_not_to_say"])
    .optional()
    .or(z.literal("")),
  height_cm: z
    .union([
      z.coerce
        .number()
        .min(50, { error: "Height must be at least 50 cm." })
        .max(280, { error: "Height must be at most 280 cm." }),
      z.literal(""),
    ])
    .optional(),
  unit_system: z.enum(["metric", "imperial"]),
  fitness_level: z
    .enum(["beginner", "intermediate", "advanced"])
    .optional()
    .or(z.literal("")),
  activity_level: z
    .enum(["sedentary", "light", "moderate", "active", "very_active"])
    .optional()
    .or(z.literal("")),
  primary_goal: z
    .enum([
      "lose_weight",
      "gain_weight",
      "build_muscle",
      "maintain_weight",
      "improve_fitness",
      "improve_endurance",
      "general_health",
    ])
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
