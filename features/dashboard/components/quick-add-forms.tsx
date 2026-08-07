"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { sleepQualityOptions, mealTypeOptions } from "@/constants";
import { logWeightAction, type WeightActionState } from "@/features/weight/actions";
import { logWaterAction, type WaterActionState } from "@/features/hydration/actions";
import { logActivityAction, type ActivityActionState } from "@/features/activity/actions";
import { logSleepAction, type SleepActionState } from "@/features/sleep/actions";
import { logFoodEntryAction, type NutritionActionState } from "@/features/nutrition/actions";

interface QuickFormProps {
  onSuccess: () => void;
}

function fieldError(
  fieldErrors: Record<string, string[]> | undefined,
  name: string
): string | undefined {
  return fieldErrors?.[name]?.[0];
}

function QuickSubmit({ pending, label }: { pending: boolean; label: string }) {
  return (
    <div className="flex justify-end">
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : label}
      </Button>
    </div>
  );
}

export function QuickWeightForm({ onSuccess }: QuickFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [state, formAction, isPending] = useActionState<WeightActionState, FormData>(
    logWeightAction,
    {}
  );
  const [weight, setWeight] = React.useState("");
  const [bodyFat, setBodyFat] = React.useState("");

  React.useEffect(() => {
    if (state.success) {
      toast.success("Weight logged");
      onSuccess();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, onSuccess]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("date", today);
    if (weight) formData.set("weight_kg", weight);
    if (bodyFat) formData.set("body_fat_percentage", bodyFat);
    React.startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <FieldWrapper label="Weight (kg)" htmlFor="quick-weight" error={fieldError(state.fieldErrors, "weight_kg")}>
        <Input
          id="quick-weight"
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="70.5"
          value={weight}
          onChange={(event) => setWeight(event.target.value)}
        />
      </FieldWrapper>
      <FieldWrapper
        label="Body fat (%)"
        htmlFor="quick-body-fat"
        hint="Optional"
        error={fieldError(state.fieldErrors, "body_fat_percentage")}
      >
        <Input
          id="quick-body-fat"
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="18.5"
          value={bodyFat}
          onChange={(event) => setBodyFat(event.target.value)}
        />
      </FieldWrapper>
      <QuickSubmit pending={isPending} label="Log weight" />
    </form>
  );
}

export function QuickWaterForm({ onSuccess }: QuickFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [state, formAction, isPending] = useActionState<WaterActionState, FormData>(
    logWaterAction,
    {}
  );
  const [amount, setAmount] = React.useState("500");

  React.useEffect(() => {
    if (state.success) {
      toast.success("Water logged");
      onSuccess();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, onSuccess]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("date", today);
    formData.set("amount_ml", amount);
    React.startTransition(() => formAction(formData));
  }

  const presets = [
    { value: "250", label: "250 ml" },
    { value: "500", label: "500 ml" },
    { value: "750", label: "750 ml" },
    { value: "1000", label: "1 L" },
  ];

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <FieldWrapper label="Amount" htmlFor="quick-water" error={fieldError(state.fieldErrors, "amount_ml")}>
        <Input
          id="quick-water"
          type="number"
          inputMode="numeric"
          placeholder="500"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </FieldWrapper>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Water quick amounts">
        {presets.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => setAmount(preset.value)}
            className="rounded-full border bg-background px-3 py-1 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {preset.label}
          </button>
        ))}
      </div>
      <QuickSubmit pending={isPending} label="Log water" />
    </form>
  );
}

export function QuickActivityForm({ onSuccess }: QuickFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [state, formAction, isPending] = useActionState<ActivityActionState, FormData>(
    logActivityAction,
    {}
  );
  const [steps, setSteps] = React.useState("");
  const [activeMinutes, setActiveMinutes] = React.useState("");
  const [distance, setDistance] = React.useState("");

  React.useEffect(() => {
    if (state.success) {
      toast.success("Activity logged");
      onSuccess();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, onSuccess]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("date", today);
    if (steps) formData.set("steps", steps);
    if (activeMinutes) formData.set("active_minutes", activeMinutes);
    if (distance) formData.set("distance_km", distance);
    React.startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper label="Steps" htmlFor="quick-steps" error={fieldError(state.fieldErrors, "steps")}>
          <Input
            id="quick-steps"
            type="number"
            inputMode="numeric"
            placeholder="8000"
            value={steps}
            onChange={(event) => setSteps(event.target.value)}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Active minutes"
          htmlFor="quick-active-minutes"
          hint="Optional"
          error={fieldError(state.fieldErrors, "active_minutes")}
        >
          <Input
            id="quick-active-minutes"
            type="number"
            inputMode="numeric"
            placeholder="30"
            value={activeMinutes}
            onChange={(event) => setActiveMinutes(event.target.value)}
          />
        </FieldWrapper>
      </div>
      <FieldWrapper
        label="Distance (km)"
        htmlFor="quick-distance"
        hint="Optional"
        error={fieldError(state.fieldErrors, "distance_km")}
      >
        <Input
          id="quick-distance"
          type="number"
          inputMode="decimal"
          step="0.1"
          placeholder="5.2"
          value={distance}
          onChange={(event) => setDistance(event.target.value)}
        />
      </FieldWrapper>
      <QuickSubmit pending={isPending} label="Log activity" />
    </form>
  );
}

export function QuickSleepForm({ onSuccess }: QuickFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [state, formAction, isPending] = useActionState<SleepActionState, FormData>(
    logSleepAction,
    {}
  );
  const [duration, setDuration] = React.useState("");
  const [quality, setQuality] = React.useState("");

  React.useEffect(() => {
    if (state.success) {
      toast.success("Sleep logged");
      onSuccess();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, onSuccess]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("date", today);
    if (duration) formData.set("duration_minutes", duration);
    if (quality) formData.set("quality", quality);
    React.startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper
          label="Duration (minutes)"
          htmlFor="quick-sleep"
          error={fieldError(state.fieldErrors, "duration_minutes")}
        >
          <Input
            id="quick-sleep"
            type="number"
            inputMode="numeric"
            placeholder="480"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
          />
        </FieldWrapper>
        <FieldWrapper label="Quality" htmlFor="quick-quality" error={fieldError(state.fieldErrors, "quality")}>
          <Select
            id="quick-quality"
            value={quality}
            onValueChange={setQuality}
            options={sleepQualityOptions}
            placeholder="Select quality"
          />
        </FieldWrapper>
      </div>
      <QuickSubmit pending={isPending} label="Log sleep" />
    </form>
  );
}

export function QuickMealForm({ onSuccess }: QuickFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [state, formAction, isPending] = useActionState<NutritionActionState, FormData>(
    logFoodEntryAction,
    {}
  );
  const [mealType, setMealType] = React.useState("breakfast");
  const [foodName, setFoodName] = React.useState("");
  const [calories, setCalories] = React.useState("");
  const [protein, setProtein] = React.useState("");

  React.useEffect(() => {
    if (state.success) {
      toast.success("Meal logged");
      onSuccess();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, onSuccess]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.set("date", today);
    formData.set("meal_type", mealType);
    if (foodName) formData.set("food_name", foodName);
    if (calories) formData.set("calories", calories);
    if (protein) formData.set("protein_g", protein);
    React.startTransition(() => formAction(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper label="Meal" htmlFor="quick-meal-type" error={fieldError(state.fieldErrors, "meal_type")}>
          <Select
            id="quick-meal-type"
            value={mealType}
            onValueChange={setMealType}
            options={mealTypeOptions}
          />
        </FieldWrapper>
        <FieldWrapper label="Food" htmlFor="quick-food" error={fieldError(state.fieldErrors, "food_name")}>
          <Input
            id="quick-food"
            placeholder="Chicken breast"
            value={foodName}
            onChange={(event) => setFoodName(event.target.value)}
          />
        </FieldWrapper>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper label="Calories" htmlFor="quick-calories" error={fieldError(state.fieldErrors, "calories")}>
          <Input
            id="quick-calories"
            type="number"
            inputMode="numeric"
            placeholder="400"
            value={calories}
            onChange={(event) => setCalories(event.target.value)}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Protein (g)"
          htmlFor="quick-protein"
          hint="Optional"
          error={fieldError(state.fieldErrors, "protein_g")}
        >
          <Input
            id="quick-protein"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="30"
            value={protein}
            onChange={(event) => setProtein(event.target.value)}
          />
        </FieldWrapper>
      </div>
      <QuickSubmit pending={isPending} label="Log meal" />
    </form>
  );
}
