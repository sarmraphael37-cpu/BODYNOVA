import { z } from "zod";

export const createHabitSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Name is required." })
    .max(50, { error: "Name must be at most 50 characters." }),
  target_per_week: z.coerce
    .number()
    .min(1, { error: "Target must be at least 1 day per week." })
    .max(7, { error: "Target must be at most 7 days per week." })
    .default(7),
  color: z.string().max(20).trim().optional().or(z.literal("")),
  icon: z.string().max(30).trim().optional().or(z.literal("")),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
