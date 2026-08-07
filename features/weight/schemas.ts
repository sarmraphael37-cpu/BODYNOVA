import { z } from "zod";

export const logWeightSchema = z.object({
  date: z.string().min(1, { error: "Date is required." }),
  weight_kg: z.coerce
    .number({ error: "Weight is required." })
    .min(20, { error: "Weight must be at least 20 kg." })
    .max(500, { error: "Weight must be at most 500 kg." }),
  body_fat_percentage: z
    .union([
      z.coerce
        .number()
        .min(1, { error: "Body fat must be at least 1%." })
        .max(79, { error: "Body fat must be at most 79%." }),
      z.literal(""),
    ])
    .optional(),
  notes: z.string().max(500).trim().optional().or(z.literal("")),
});

export const updateWeightSchema = logWeightSchema.extend({
  id: z.string().min(1),
});

export type LogWeightInput = z.infer<typeof logWeightSchema>;
export type UpdateWeightInput = z.infer<typeof updateWeightSchema>;
