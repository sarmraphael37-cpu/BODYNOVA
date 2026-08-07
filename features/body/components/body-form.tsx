"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { toast } from "sonner";
import { Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldWrapper } from "@/components/ui/field";
import {
  logBodyMeasurementAction,
  type BodyActionState,
} from "@/features/body/actions";
import { logBodyMeasurementSchema } from "@/features/body/schemas";

type BodyFormValues = {
  date: string;
  weight_kg: number | "";
  body_fat_percentage: number | "";
  muscle_mass_kg: number | "";
  waist_cm: number | "";
  chest_cm: number | "";
  arms_cm: number | "";
  thighs_cm: number | "";
  hips_cm: number | "";
  neck_cm: number | "";
  notes: string;
};

const emptyValues = {
  weight_kg: "",
  body_fat_percentage: "",
  muscle_mass_kg: "",
  waist_cm: "",
  chest_cm: "",
  arms_cm: "",
  thighs_cm: "",
  hips_cm: "",
  neck_cm: "",
  notes: "",
} as const;

export function BodyForm() {
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BodyFormValues>({
    resolver: zodResolver(
      logBodyMeasurementSchema
    ) as unknown as Resolver<BodyFormValues>,
    defaultValues: { ...emptyValues, date: today },
  });

  const [state, formAction, isPending] = useActionState<BodyActionState, FormData>(
    logBodyMeasurementAction,
    {}
  );

  React.useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Measurements logged.");
      reset({ ...emptyValues, date: today });
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
        <FieldWrapper
          label="Weight (kg)"
          htmlFor="weight_kg"
          error={errors.weight_kg}
          hint="Optional"
        >
          <Input
            id="weight_kg"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="70.5"
            {...register("weight_kg")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Body fat (%)"
          htmlFor="body_fat_percentage"
          error={errors.body_fat_percentage}
          hint="Optional"
        >
          <Input
            id="body_fat_percentage"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="18.5"
            {...register("body_fat_percentage")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Muscle mass (kg)"
          htmlFor="muscle_mass_kg"
          error={errors.muscle_mass_kg}
          hint="Optional"
        >
          <Input
            id="muscle_mass_kg"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="35.0"
            {...register("muscle_mass_kg")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Waist (cm)"
          htmlFor="waist_cm"
          error={errors.waist_cm}
          hint="Optional"
        >
          <Input
            id="waist_cm"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="80"
            {...register("waist_cm")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Chest (cm)"
          htmlFor="chest_cm"
          error={errors.chest_cm}
          hint="Optional"
        >
          <Input
            id="chest_cm"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="100"
            {...register("chest_cm")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Arms (cm)"
          htmlFor="arms_cm"
          error={errors.arms_cm}
          hint="Optional"
        >
          <Input
            id="arms_cm"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="35"
            {...register("arms_cm")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Thighs (cm)"
          htmlFor="thighs_cm"
          error={errors.thighs_cm}
          hint="Optional"
        >
          <Input
            id="thighs_cm"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="55"
            {...register("thighs_cm")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Hips (cm)"
          htmlFor="hips_cm"
          error={errors.hips_cm}
          hint="Optional"
        >
          <Input
            id="hips_cm"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="95"
            {...register("hips_cm")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Neck (cm)"
          htmlFor="neck_cm"
          error={errors.neck_cm}
          hint="Optional"
        >
          <Input
            id="neck_cm"
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="38"
            {...register("neck_cm")}
          />
        </FieldWrapper>
        <FieldWrapper label="Notes" htmlFor="notes" error={errors.notes} hint="Optional">
          <Textarea
            id="notes"
            rows={1}
            placeholder="Feeling good today"
            {...register("notes")}
          />
        </FieldWrapper>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Ruler className="mr-2 h-4 w-4" aria-hidden />
          {isPending ? "Saving..." : "Save measurements"}
        </Button>
      </div>
    </form>
  );
}
