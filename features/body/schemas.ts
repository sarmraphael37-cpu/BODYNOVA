import { z } from "zod";

export const logBodyMeasurementSchema = z.object({
  date: z.string().min(1, { error: "Date is required." }),
  weight_kg: z
    .union([
      z.coerce
        .number()
        .min(20, { error: "Weight must be at least 20 kg." })
        .max(500, { error: "Weight must be at most 500 kg." }),
      z.literal(""),
    ])
    .optional(),
  body_fat_percentage: z
    .union([
      z.coerce
        .number()
        .min(1, { error: "Body fat must be at least 1%." })
        .max(79, { error: "Body fat must be at most 79%." }),
      z.literal(""),
    ])
    .optional(),
  muscle_mass_kg: z
    .union([
      z.coerce
        .number()
        .min(10, { error: "Muscle mass must be at least 10 kg." })
        .max(300, { error: "Muscle mass must be at most 300 kg." }),
      z.literal(""),
    ])
    .optional(),
  waist_cm: z
    .union([
      z.coerce
        .number()
        .min(20, { error: "Waist must be at least 20 cm." })
        .max(300, { error: "Waist must be at most 300 cm." }),
      z.literal(""),
    ])
    .optional(),
  chest_cm: z
    .union([
      z.coerce
        .number()
        .min(20, { error: "Chest must be at least 20 cm." })
        .max(300, { error: "Chest must be at most 300 cm." }),
      z.literal(""),
    ])
    .optional(),
  arms_cm: z
    .union([
      z.coerce
        .number()
        .min(10, { error: "Arms must be at least 10 cm." })
        .max(200, { error: "Arms must be at most 200 cm." }),
      z.literal(""),
    ])
    .optional(),
  thighs_cm: z
    .union([
      z.coerce
        .number()
        .min(10, { error: "Thighs must be at least 10 cm." })
        .max(200, { error: "Thighs must be at most 200 cm." }),
      z.literal(""),
    ])
    .optional(),
  hips_cm: z
    .union([
      z.coerce
        .number()
        .min(20, { error: "Hips must be at least 20 cm." })
        .max(300, { error: "Hips must be at most 300 cm." }),
      z.literal(""),
    ])
    .optional(),
  neck_cm: z
    .union([
      z.coerce
        .number()
        .min(10, { error: "Neck must be at least 10 cm." })
        .max(200, { error: "Neck must be at most 200 cm." }),
      z.literal(""),
    ])
    .optional(),
  notes: z.string().max(500).trim().optional().or(z.literal("")),
});

export type LogBodyMeasurementInput = z.infer<typeof logBodyMeasurementSchema>;
