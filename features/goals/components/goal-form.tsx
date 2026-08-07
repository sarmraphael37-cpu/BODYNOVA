"use client";

import * as React from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { toast } from "sonner";
import { Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FieldWrapper } from "@/components/ui/field";
import {
  createGoalAction,
  type GoalActionState,
} from "@/features/goals/actions";
import { createGoalSchema, goalTypeOptions } from "@/features/goals/schemas";

type GoalFormValues = {
  type: string;
  title: string;
  target_value: number | "";
  unit: string;
  target_date: string;
  start_value: number | "";
};

export function GoalForm() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<GoalFormValues>({
    resolver: zodResolver(createGoalSchema) as unknown as Resolver<GoalFormValues>,
    defaultValues: {
      type: "",
      title: "",
      target_value: "",
      unit: "",
      target_date: "",
      start_value: "",
    },
  });

  const type = useWatch({ control, name: "type" });

  const [state, formAction, isPending] = useActionState<GoalActionState, FormData>(
    createGoalAction,
    {}
  );

  React.useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Goal created.");
      reset({
        type: "",
        title: "",
        target_value: "",
        unit: "",
        target_date: "",
        start_value: "",
      });
    }
  }, [state, reset]);

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
      <FieldWrapper label="Type" htmlFor="type" error={errors.type}>
        <Select
          id="type"
          value={type}
          onValueChange={(value) => setValue("type", value)}
          options={goalTypeOptions}
          placeholder="Select goal type"
        />
      </FieldWrapper>
      <FieldWrapper label="Title" htmlFor="title" error={errors.title}>
        <Input
          id="title"
          type="text"
          placeholder="Reach my goal"
          {...register("title")}
        />
      </FieldWrapper>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper
          label="Target value"
          htmlFor="target_value"
          error={errors.target_value}
        >
          <Input
            id="target_value"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={1}
            placeholder="70"
            {...register("target_value")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Unit"
          htmlFor="unit"
          error={errors.unit}
          hint="Optional"
        >
          <Input id="unit" type="text" placeholder="kg" {...register("unit")} />
        </FieldWrapper>
        <FieldWrapper
          label="Target date"
          htmlFor="target_date"
          error={errors.target_date}
          hint="Optional"
        >
          <Input
            id="target_date"
            type="date"
            {...register("target_date")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Start value"
          htmlFor="start_value"
          error={errors.start_value}
          hint="Optional"
        >
          <Input
            id="start_value"
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0}
            placeholder="0"
            {...register("start_value")}
          />
        </FieldWrapper>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Target className="mr-2 h-4 w-4" aria-hidden />
          {isPending ? "Creating..." : "Create goal"}
        </Button>
      </div>
    </form>
  );
}
