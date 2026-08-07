import { z } from "zod";
import type { MealType } from "@/types/database";

export const logFoodEntrySchema = z.object({
  date: z.string().min(1, { error: "Date is required." }),
  meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  food_id: z.string().optional().or(z.literal("")),
  food_name: z
    .string()
    .trim()
    .min(1, { error: "Food name is required." })
    .max(80, { error: "Food name must be at most 80 characters." }),
  servings: z.coerce
    .number({ error: "Servings is required." })
    .min(0.1, { error: "Servings must be at least 0.1." })
    .max(100, { error: "Servings must be at most 100." }),
  calories: z.coerce
    .number({ error: "Calories are required." })
    .min(0, { error: "Calories must be at least 0." })
    .max(10000, { error: "Calories must be at most 10000." }),
  protein_g: z
    .union([
      z.coerce
        .number()
        .min(0, { error: "Protein must be at least 0g." })
        .max(1000, { error: "Protein must be at most 1000g." }),
      z.literal(""),
    ])
    .optional(),
  carbs_g: z
    .union([
      z.coerce
        .number()
        .min(0, { error: "Carbs must be at least 0g." })
        .max(1000, { error: "Carbs must be at most 1000g." }),
      z.literal(""),
    ])
    .optional(),
  fat_g: z
    .union([
      z.coerce
        .number()
        .min(0, { error: "Fat must be at least 0g." })
        .max(1000, { error: "Fat must be at most 1000g." }),
      z.literal(""),
    ])
    .optional(),
  fiber_g: z
    .union([
      z.coerce
        .number()
        .min(0, { error: "Fiber must be at least 0g." })
        .max(1000, { error: "Fiber must be at most 1000g." }),
      z.literal(""),
    ])
    .optional(),
});

export type LogFoodEntryInput = z.infer<typeof logFoodEntrySchema>;

export const createCustomFoodSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: "Food name is required." })
    .max(80, { error: "Food name must be at most 80 characters." }),
  serving_size: z
    .string()
    .trim()
    .min(1, { error: "Serving size is required." })
    .max(50, { error: "Serving size must be at most 50 characters." }),
  serving_unit: z.string().max(30).optional().or(z.literal("")),
  calories_per_serving: z.coerce
    .number({ error: "Calories are required." })
    .min(0, { error: "Calories must be at least 0." })
    .max(10000, { error: "Calories must be at most 10000." }),
  protein_g: z
    .coerce
    .number()
    .min(0)
    .max(1000)
    .optional()
    .or(z.literal("")),
  carbs_g: z
    .coerce
    .number()
    .min(0)
    .max(1000)
    .optional()
    .or(z.literal("")),
  fat_g: z
    .coerce
    .number()
    .min(0)
    .max(1000)
    .optional()
    .or(z.literal("")),
  fiber_g: z
    .coerce
    .number()
    .min(0)
    .max(1000)
    .optional()
    .or(z.literal("")),
});

export type CreateCustomFoodInput = z.infer<typeof createCustomFoodSchema>;

export const mealTypeOptions: { value: MealType; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
];
