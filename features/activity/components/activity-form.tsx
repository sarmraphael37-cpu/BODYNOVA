"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "@/components/ui/field";
import {
  logActivityAction,
  type ActivityActionState,
} from "@/features/activity/actions";
import { logActivitySchema } from "@/features/activity/schemas";

type ActivityFormValues = {
  date: string;
  steps: number | "";
  distance_km: number | "";
  active_minutes: number | "";
  calories_burned: number | "";
};

export function ActivityForm() {
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(logActivitySchema) as unknown as Resolver<ActivityFormValues>,
    defaultValues: {
      date: today,
      steps: "",
      distance_km: "",
      active_minutes: "",
      calories_burned: "",
    },
  });

  const [state, formAction, isPending] = useActionState<ActivityActionState, FormData>(
    logActivityAction,
    {}
  );

  React.useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Activity logged.");
      reset({
        date: today,
        steps: "",
        distance_km: "",
        active_minutes: "",
        calories_burned: "",
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
        <FieldWrapper label="Steps" htmlFor="steps" error={errors.steps}>
          <Input
            id="steps"
            type="number"
            inputMode="numeric"
            placeholder="8000"
            {...register("steps")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Distance (km)"
          htmlFor="distance_km"
          error={errors.distance_km}
          hint="Optional"
        >
          <Input
            id="distance_km"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="5.0"
            {...register("distance_km")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Active minutes"
          htmlFor="active_minutes"
          error={errors.active_minutes}
          hint="Optional"
        >
          <Input
            id="active_minutes"
            type="number"
            inputMode="numeric"
            placeholder="45"
            {...register("active_minutes")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Calories burned"
          htmlFor="calories_burned"
          error={errors.calories_burned}
          hint="Optional"
        >
          <Input
            id="calories_burned"
            type="number"
            inputMode="numeric"
            placeholder="300"
            {...register("calories_burned")}
          />
        </FieldWrapper>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          {isPending ? "Saving..." : "Log activity"}
        </Button>
      </div>
    </form>
  );
}
