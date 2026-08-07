"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldWrapper } from "@/components/ui/field";
import {
  logWeightAction,
  type WeightActionState,
} from "@/features/weight/actions";
import { logWeightSchema } from "@/features/weight/schemas";

type WeightFormValues = {
  date: string;
  weight_kg: number | "";
  body_fat_percentage: number | "";
  notes: string;
};

export function WeightForm() {
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WeightFormValues>({
    resolver: zodResolver(logWeightSchema) as unknown as Resolver<WeightFormValues>,
    defaultValues: {
      date: today,
      weight_kg: "",
      body_fat_percentage: "",
      notes: "",
    },
  });

  const [state, formAction, isPending] = useActionState<WeightActionState, FormData>(
    logWeightAction,
    {}
  );

  React.useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Weight logged.");
      reset({ date: today, weight_kg: "", body_fat_percentage: "", notes: "" });
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
        <FieldWrapper label="Weight (kg)" htmlFor="weight_kg" error={errors.weight_kg}>
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
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          {isPending ? "Saving..." : "Log weight"}
        </Button>
      </div>
    </form>
  );
}
