import { z } from "zod";

export const logWaterSchema = z.object({
  date: z.string().min(1, { error: "Date is required." }),
  amount_ml: z.coerce
    .number({ error: "Amount is required." })
    .min(50, { error: "Amount must be at least 50 ml." })
    .max(5000, { error: "Amount must be at most 5000 ml." }),
});

export type LogWaterInput = z.infer<typeof logWaterSchema>;
