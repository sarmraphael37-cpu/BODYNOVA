"use client";

import * as React from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { toast } from "sonner";
import { Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FieldWrapper } from "@/components/ui/field";
import {
  logFoodEntryAction,
  type NutritionActionState,
} from "@/features/nutrition/actions";
import { logFoodEntrySchema, mealTypeOptions } from "@/features/nutrition/schemas";
import type { NutritionFood } from "@/types/database";

type FoodFormValues = {
  date: string;
  meal_type: string;
  food_id: string;
  food_name: string;
  servings: number | "";
  calories: number | "";
  protein_g: number | "";
  carbs_g: number | "";
  fat_g: number | "";
  fiber_g: number | "";
};

interface FoodFormProps {
  foods: NutritionFood[];
}

export function FoodForm({ foods }: FoodFormProps) {
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FoodFormValues>({
    resolver: zodResolver(logFoodEntrySchema) as unknown as Resolver<FoodFormValues>,
    defaultValues: {
      date: today,
      meal_type: "breakfast",
      food_id: "",
      food_name: "",
      servings: 1,
      calories: "",
      protein_g: "",
      carbs_g: "",
      fat_g: "",
      fiber_g: "",
    },
  });

  const mealType = useWatch({ control, name: "meal_type" });
  const foodId = useWatch({ control, name: "food_id" });

  const foodMap = React.useMemo(
    () => new Map(foods.map((food) => [food.id, food])),
    [foods]
  );

  const foodOptions = React.useMemo(
    () => foods.map((food) => ({ value: food.id, label: food.name })),
    [foods]
  );

  React.useEffect(() => {
    const food = foodId ? foodMap.get(foodId) : undefined;
    if (!food) return;
    setValue("food_name", food.name);
    setValue("calories", food.calories_per_serving);
    setValue("protein_g", food.protein_g);
    setValue("carbs_g", food.carbs_g);
    setValue("fat_g", food.fat_g);
    setValue("fiber_g", food.fiber_g);
  }, [foodId, foodMap, setValue]);

  const [state, formAction, isPending] = useActionState<NutritionActionState, FormData>(
    logFoodEntryAction,
    {}
  );

  React.useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Food logged.");
      reset({
        date: today,
        meal_type: "breakfast",
        food_id: "",
        food_name: "",
        servings: 1,
        calories: "",
        protein_g: "",
        carbs_g: "",
        fat_g: "",
        fiber_g: "",
      });
    }
  }, [state, reset, today]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === null || value === "") continue;
      formData.set(key, String(value));
    }
    formAction(formData);
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper label="Date" htmlFor="date" error={errors.date}>
          <Input id="date" type="date" max={today} {...register("date")} />
        </FieldWrapper>
        <FieldWrapper label="Meal" htmlFor="meal_type" error={errors.meal_type}>
          <Select
            id="meal_type"
            value={mealType}
            onValueChange={(value) => setValue("meal_type", value)}
            options={mealTypeOptions}
            placeholder="Select meal"
          />
        </FieldWrapper>
        <FieldWrapper
          label="Food"
          htmlFor="food_id"
          error={errors.food_id}
          hint="Auto-fills nutrition facts"
        >
          <Select
            id="food_id"
            value={foodId}
            onValueChange={(value) => setValue("food_id", value)}
            options={foodOptions}
            placeholder="Choose a food"
          />
        </FieldWrapper>
        <FieldWrapper label="Servings" htmlFor="servings" error={errors.servings}>
          <Input
            id="servings"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0.1}
            max={100}
            placeholder="1"
            {...register("servings")}
          />
        </FieldWrapper>
        <FieldWrapper label="Calories" htmlFor="calories" error={errors.calories}>
          <Input
            id="calories"
            type="number"
            inputMode="numeric"
            step="1"
            min={0}
            max={10000}
            placeholder="250"
            {...register("calories")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Protein (g)"
          htmlFor="protein_g"
          error={errors.protein_g}
          hint="Optional"
        >
          <Input
            id="protein_g"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0}
            max={1000}
            placeholder="20"
            {...register("protein_g")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Carbs (g)"
          htmlFor="carbs_g"
          error={errors.carbs_g}
          hint="Optional"
        >
          <Input
            id="carbs_g"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0}
            max={1000}
            placeholder="30"
            {...register("carbs_g")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Fat (g)"
          htmlFor="fat_g"
          error={errors.fat_g}
          hint="Optional"
        >
          <Input
            id="fat_g"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0}
            max={1000}
            placeholder="10"
            {...register("fat_g")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Fiber (g)"
          htmlFor="fiber_g"
          error={errors.fiber_g}
          hint="Optional"
        >
          <Input
            id="fiber_g"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0}
            max={1000}
            placeholder="5"
            {...register("fiber_g")}
          />
        </FieldWrapper>
      </div>
      <input type="hidden" {...register("food_name")} />
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Utensils className="mr-2 h-4 w-4" aria-hidden />
          {isPending ? "Saving..." : "Add food"}
        </Button>
      </div>
    </form>
  );
}
