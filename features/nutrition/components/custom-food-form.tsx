"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldWrapper } from "@/components/ui/field";
import {
  createCustomFoodAction,
  type NutritionActionState,
} from "@/features/nutrition/actions";
import { createCustomFoodSchema } from "@/features/nutrition/schemas";

type CustomFoodFormValues = {
  name: string;
  serving_size: string;
  serving_unit: string;
  calories_per_serving: number | "";
  protein_g: number | "";
  carbs_g: number | "";
  fat_g: number | "";
  fiber_g: number | "";
};

export function CustomFoodForm() {
  const [open, setOpen] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomFoodFormValues>({
    resolver: zodResolver(
      createCustomFoodSchema
    ) as unknown as Resolver<CustomFoodFormValues>,
    defaultValues: {
      name: "",
      serving_size: "",
      serving_unit: "serving",
      calories_per_serving: "",
      protein_g: "",
      carbs_g: "",
      fat_g: "",
      fiber_g: "",
    },
  });

  const [state, formAction, isPending] = useActionState<NutritionActionState, FormData>(
    createCustomFoodAction,
    {}
  );

  React.useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Custom food saved.");
      reset({
        name: "",
        serving_size: "",
        serving_unit: "serving",
        calories_per_serving: "",
        protein_g: "",
        carbs_g: "",
        fat_g: "",
        fiber_g: "",
      });
    }
  }, [state, reset]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === null || value === "") continue;
      formData.set(key, String(value));
    }
    React.startTransition(() => formAction(formData));
  });

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        Add custom food
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Add custom food</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldWrapper label="Name" htmlFor="name" error={errors.name}>
              <Input
                id="name"
                type="text"
                placeholder="Greek yogurt"
                {...register("name")}
              />
            </FieldWrapper>
            <FieldWrapper
              label="Calories per serving"
              htmlFor="calories_per_serving"
              error={errors.calories_per_serving}
            >
              <Input
                id="calories_per_serving"
                type="number"
                inputMode="numeric"
                step="1"
                min={0}
                max={10000}
                placeholder="150"
                {...register("calories_per_serving")}
              />
            </FieldWrapper>
            <FieldWrapper
              label="Serving size"
              htmlFor="serving_size"
              error={errors.serving_size}
            >
              <Input
                id="serving_size"
                type="text"
                placeholder="170"
                {...register("serving_size")}
              />
            </FieldWrapper>
            <FieldWrapper
              label="Serving unit"
              htmlFor="serving_unit"
              error={errors.serving_unit}
              hint="Optional"
            >
              <Input
                id="serving_unit"
                type="text"
                placeholder="g"
                {...register("serving_unit")}
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
                placeholder="17"
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
                placeholder="20"
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
                placeholder="5"
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
                placeholder="2"
                {...register("fiber_g")}
              />
            </FieldWrapper>
          </div>
          <div className="flex justify-end">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                {isPending ? "Saving..." : "Save food"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
