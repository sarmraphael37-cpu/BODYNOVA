"use client";

import * as React from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { toast } from "sonner";
import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FieldWrapper } from "@/components/ui/field";
import {
  logSleepAction,
  type SleepActionState,
} from "@/features/sleep/actions";
import { logSleepSchema, qualityOptions } from "@/features/sleep/schemas";

type SleepFormValues = {
  date: string;
  duration_minutes: number | "";
  quality: string;
  notes: string;
};

export function SleepForm() {
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<SleepFormValues>({
    resolver: zodResolver(logSleepSchema) as unknown as Resolver<SleepFormValues>,
    defaultValues: {
      date: today,
      duration_minutes: "",
      quality: "",
      notes: "",
    },
  });

  const quality = useWatch({ control, name: "quality" });

  const [state, formAction, isPending] = useActionState<SleepActionState, FormData>(
    logSleepAction,
    {}
  );

  React.useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Sleep logged.");
      reset({ date: today, duration_minutes: "", quality: "", notes: "" });
    }
  }, [state, reset, today]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === null || value === "") continue;
      formData.set(key, String(value));
    }
    React.startTransition(() => formAction(formData));
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper label="Date" htmlFor="date" error={errors.date}>
          <Input id="date" type="date" max={today} {...register("date")} />
        </FieldWrapper>
        <FieldWrapper
          label="Duration (minutes)"
          htmlFor="duration_minutes"
          error={errors.duration_minutes}
        >
          <Input
            id="duration_minutes"
            type="number"
            inputMode="numeric"
            min={30}
            max={960}
            step={15}
            placeholder="480"
            {...register("duration_minutes")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Quality"
          htmlFor="quality"
          error={errors.quality}
          hint="Optional"
        >
          <Select
            id="quality"
            value={quality}
            onValueChange={(value) => setValue("quality", value)}
            options={qualityOptions}
            placeholder="Select quality"
          />
        </FieldWrapper>
        <FieldWrapper label="Notes" htmlFor="notes" error={errors.notes} hint="Optional">
          <Textarea
            id="notes"
            rows={1}
            placeholder="Slept well"
            {...register("notes")}
          />
        </FieldWrapper>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Moon className="mr-2 h-4 w-4" aria-hidden />
          {isPending ? "Saving..." : "Log sleep"}
        </Button>
      </div>
    </form>
  );
}
