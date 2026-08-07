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
  logWaterAction,
  type WaterActionState,
} from "@/features/hydration/actions";
import { logWaterSchema } from "@/features/hydration/schemas";

type WaterFormValues = {
  date: string;
  amount_ml: number | "";
};

export function WaterForm() {
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<WaterFormValues>({
    resolver: zodResolver(logWaterSchema) as unknown as Resolver<WaterFormValues>,
    defaultValues: {
      date: today,
      amount_ml: "",
    },
  });

  const [state, formAction, isPending] = useActionState<WaterActionState, FormData>(
    logWaterAction,
    {}
  );

  React.useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Water logged.");
      reset({ date: today, amount_ml: "" });
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
        <FieldWrapper label="Amount (ml)" htmlFor="amount_ml" error={errors.amount_ml}>
          <Input
            id="amount_ml"
            type="number"
            inputMode="numeric"
            step="50"
            placeholder="250"
            {...register("amount_ml")}
          />
        </FieldWrapper>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Quick add</span>
        {[250, 500, 750].map((preset) => (
          <Button
            key={preset}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setValue("amount_ml", preset)}
          >
            {preset} ml
          </Button>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          {isPending ? "Saving..." : "Log water"}
        </Button>
      </div>
    </form>
  );
}
