import { z } from "zod";

export const logActivitySchema = z.object({
  date: z.string().min(1, { error: "Date is required." }),
  steps: z.coerce
    .number({ error: "Steps are required." })
    .min(0, { error: "Steps must be at least 0." })
    .max(200000, { error: "Steps must be at most 200,000." }),
  distance_km: z
    .union([
      z.coerce
        .number()
        .min(0, { error: "Distance must be at least 0 km." })
        .max(100, { error: "Distance must be at most 100 km." }),
      z.literal(""),
    ])
    .optional(),
  active_minutes: z
    .union([
      z.coerce
        .number()
        .min(0, { error: "Active minutes must be at least 0." })
        .max(1440, { error: "Active minutes must be at most 1440." }),
      z.literal(""),
    ])
    .optional(),
  calories_burned: z
    .union([
      z.coerce
        .number()
        .min(0, { error: "Calories must be at least 0." })
        .max(10000, { error: "Calories must be at most 10,000." }),
      z.literal(""),
    ])
    .optional(),
});

export type LogActivityInput = z.infer<typeof logActivitySchema>;
