import { z } from "zod";

export const logSleepSchema = z.object({
  date: z.string().min(1, { error: "Date is required." }),
  duration_minutes: z.coerce
    .number({ error: "Duration is required." })
    .min(30, { error: "Duration must be at least 30 minutes." })
    .max(960, { error: "Duration must be at most 16 hours." }),
  quality: z
    .enum(["poor", "fair", "good", "excellent"])
    .optional()
    .or(z.literal("")),
  notes: z.string().max(500).trim().optional().or(z.literal("")),
  bedtime: z.string().optional().or(z.literal("")),
  wake_time: z.string().optional().or(z.literal("")),
});

export type LogSleepInput = z.infer<typeof logSleepSchema>;

export const qualityOptions: {
  value: "poor" | "fair" | "good" | "excellent";
  label: string;
}[] = [
  { value: "poor", label: "Poor" },
  { value: "fair", label: "Fair" },
  { value: "good", label: "Good" },
  { value: "excellent", label: "Excellent" },
];
