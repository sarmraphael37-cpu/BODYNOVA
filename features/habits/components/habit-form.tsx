"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "@/components/ui/field";
import {
  createHabitAction,
  type HabitActionState,
} from "@/features/habits/actions";
import { createHabitSchema } from "@/features/habits/schemas";

type HabitFormValues = {
  name: string;
  target_per_week: number | "";
};

export function HabitForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(createHabitSchema) as unknown as Resolver<HabitFormValues>,
    defaultValues: {
      name: "",
      target_per_week: 7,
    },
  });

  const [state, formAction, isPending] = useActionState<HabitActionState, FormData>(
    createHabitAction,
    {}
  );

  React.useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Habit created.");
      reset({ name: "", target_per_week: 7 });
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

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4">
        <FieldWrapper label="Name" htmlFor="name" error={errors.name}>
          <Input id="name" placeholder="Drink water" {...register("name")} />
        </FieldWrapper>
        <FieldWrapper
          label="Target per week"
          htmlFor="target_per_week"
          error={errors.target_per_week}
          hint="How many days a week?"
        >
          <Input
            id="target_per_week"
            type="number"
            min={1}
            max={7}
            {...register("target_per_week")}
          />
        </FieldWrapper>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Check className="mr-2 h-4 w-4" aria-hidden />
          {isPending ? "Creating..." : "Create habit"}
        </Button>
      </div>
    </form>
  );
}
