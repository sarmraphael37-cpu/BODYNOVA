"use client";

import * as React from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import {
  activityLevelOptions,
  fitnessGoalOptions,
  fitnessLevelOptions,
  genderOptions,
} from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FieldWrapper } from "@/components/ui/field";
import {
  updateProfileAction,
  type ProfileActionState,
} from "@/features/profile/actions";
import { updateProfileSchema } from "@/features/profile/schemas";
import type { Profile } from "@/types/database";

type ProfileFormValues = {
  full_name: string;
  date_of_birth: string;
  gender: string;
  height_cm: number | "";
  unit_system: string;
  fitness_level: string;
  activity_level: string;
  primary_goal: string;
};

const unitOptions = [
  { value: "metric", label: "Metric (kg, cm)" },
  { value: "imperial", label: "Imperial (lb, in)" },
];

export function ProfileForm({ profile }: { profile: Profile }) {
  const {
    register,
    setValue,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(updateProfileSchema) as unknown as Resolver<ProfileFormValues>,
    defaultValues: {
      full_name: profile.full_name ?? "",
      date_of_birth: profile.date_of_birth ?? "",
      gender: profile.gender ?? "",
      height_cm: profile.height_cm ?? "",
      unit_system: profile.unit_system,
      fitness_level: profile.fitness_level ?? "",
      activity_level: profile.activity_level ?? "",
      primary_goal: profile.primary_goal ?? "",
    },
  });

  const [state, formAction, isPending] = useActionState<ProfileActionState, FormData>(
    updateProfileAction,
    {}
  );

  React.useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success("Profile updated.");
  }, [state]);

  const watchFields = useWatch({
    control,
    name: ["gender", "height_cm", "unit_system", "fitness_level", "activity_level", "primary_goal"],
  });

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
        <FieldWrapper label="Full name" htmlFor="full_name" error={errors.full_name}>
          <Input id="full_name" autoComplete="name" {...register("full_name")} />
        </FieldWrapper>
        <FieldWrapper label="Gender" error={errors.gender}>
          <Select
            options={genderOptions}
            value={watchFields[0] ?? ""}
            onValueChange={(value) => setValue("gender", value)}
            placeholder="Select gender"
          />
        </FieldWrapper>
        <FieldWrapper
          label="Date of birth"
          htmlFor="date_of_birth"
          error={errors.date_of_birth}
        >
          <Input id="date_of_birth" type="date" max={new Date().toISOString().slice(0, 10)} {...register("date_of_birth")} />
        </FieldWrapper>
        <FieldWrapper label="Height (cm)" htmlFor="height_cm" error={errors.height_cm}>
          <Input id="height_cm" type="number" inputMode="decimal" placeholder="175" {...register("height_cm")} />
        </FieldWrapper>
        <FieldWrapper label="Unit system" error={errors.unit_system}>
          <Select
            options={unitOptions}
            value={watchFields[2] ?? "metric"}
            onValueChange={(value) => setValue("unit_system", value)}
          />
        </FieldWrapper>
        <FieldWrapper label="Fitness level" error={errors.fitness_level}>
          <Select
            options={fitnessLevelOptions}
            value={watchFields[3] ?? ""}
            onValueChange={(value) => setValue("fitness_level", value)}
            placeholder="Select level"
          />
        </FieldWrapper>
        <FieldWrapper label="Activity level" error={errors.activity_level}>
          <Select
            options={activityLevelOptions}
            value={watchFields[4] ?? ""}
            onValueChange={(value) => setValue("activity_level", value)}
            placeholder="Select activity"
          />
        </FieldWrapper>
        <FieldWrapper label="Main goal" error={errors.primary_goal}>
          <Select
            options={fitnessGoalOptions}
            value={watchFields[5] ?? ""}
            onValueChange={(value) => setValue("primary_goal", value)}
            placeholder="Select goal"
          />
        </FieldWrapper>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isPending || isSubmitting}>
          <Save className="mr-2 h-4 w-4" aria-hidden />
          {isPending || isSubmitting ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
