import { z } from "zod";

export const onboardingSchema = z.object({
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
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  height_cm: z
    .union([z.coerce.number().min(50, { error: "Height must be at least 50 cm." }).max(280, { error: "Height must be at most 280 cm." }), z.literal("")])
    .optional(),
  weight_kg: z
    .union([z.coerce.number().min(20, { error: "Weight must be at least 20 kg." }).max(500, { error: "Weight must be at most 500 kg." }), z.literal("")])
    .optional(),
  unit_system: z.enum(["metric", "imperial"]).default("metric"),
  fitness_level: z
    .enum(["beginner", "intermediate", "advanced"])
    .optional(),
  activity_level: z
    .enum(["sedentary", "light", "moderate", "active", "very_active"])
    .optional(),
  primary_goal: z
    .enum(["lose_weight", "gain_weight", "build_muscle", "maintain_weight", "improve_fitness", "improve_endurance", "general_health"])
    .optional(),
  water_target_ml: z
    .union([z.coerce.number().min(250, { error: "Water target must be at least 250 ml." }).max(10000, { error: "Water target must be at most 10,000 ml." }), z.literal("")])
    .optional(),
  step_target: z
    .union([z.coerce.number().min(1000, { error: "Step target must be at least 1,000." }).max(100000, { error: "Step target must be at most 100,000." }), z.literal("")])
    .optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
