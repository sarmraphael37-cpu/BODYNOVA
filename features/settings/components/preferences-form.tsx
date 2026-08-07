"use client";

import * as React from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FieldWrapper } from "@/components/ui/field";
import {
  updatePreferencesAction,
  type PreferencesActionState,
} from "@/features/settings/actions";
import { updatePreferencesSchema } from "@/features/settings/schemas";
import type { UserPreferences } from "@/types/database";

type PreferencesFormValues = {
  theme: string;
  unit_system: string;
  water_target_ml: number | "";
  step_target: number | "";
  calorie_target: number | "";
  workout_reminders: boolean;
  water_reminders: boolean;
  weight_reminders: boolean;
  goal_notifications: boolean;
  achievement_notifications: boolean;
  weekly_reports: boolean;
};

const themeOptions = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const unitOptions = [
  { value: "metric", label: "Metric (kg, cm)" },
  { value: "imperial", label: "Imperial (lb, in)" },
];

const notificationOptions: { key: keyof PreferencesFormValues; label: string; description: string }[] = [
  { key: "workout_reminders", label: "Workout reminders", description: "Get a nudge to train." },
  { key: "water_reminders", label: "Water reminders", description: "Stay hydrated throughout the day." },
  { key: "weight_reminders", label: "Weight reminders", description: "Reminders to log your weight." },
  { key: "goal_notifications", label: "Goal updates", description: "Updates on your goals." },
  { key: "achievement_notifications", label: "Achievements", description: "Know when you unlock badges." },
  { key: "weekly_reports", label: "Weekly reports", description: "A weekly summary of your progress." },
];

export function PreferencesForm({ preferences }: { preferences: UserPreferences | null }) {
  const defaults: PreferencesFormValues = {
    theme: preferences?.theme ?? "system",
    unit_system: preferences?.unit_system ?? "metric",
    water_target_ml: preferences?.water_target_ml ?? 2500,
    step_target: preferences?.step_target ?? 8000,
    calorie_target: preferences?.calorie_target ?? "",
    workout_reminders: preferences?.notification_settings.workout_reminders ?? true,
    water_reminders: preferences?.notification_settings.water_reminders ?? true,
    weight_reminders: preferences?.notification_settings.weight_reminders ?? true,
    goal_notifications: preferences?.notification_settings.goal_notifications ?? true,
    achievement_notifications: preferences?.notification_settings.achievement_notifications ?? true,
    weekly_reports: preferences?.notification_settings.weekly_reports ?? true,
  };

  const {
    register,
    setValue,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PreferencesFormValues>({
    resolver: zodResolver(updatePreferencesSchema) as unknown as Resolver<PreferencesFormValues>,
    defaultValues: defaults,
  });

  const [state, formAction, isPending] = useActionState<PreferencesActionState, FormData>(
    updatePreferencesAction,
    {}
  );

  React.useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) toast.success("Preferences saved.");
  }, [state]);

  const watchFields = useWatch({
    control,
    name: ["theme", "unit_system"],
  });

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === null || value === "") continue;
      formData.set(key, String(value));
    }
    for (const option of notificationOptions) {
      if (!formData.has(option.key)) formData.set(option.key, "false");
    }
    React.startTransition(() => formAction(formData));
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper label="Theme" error={errors.theme}>
          <Select
            options={themeOptions}
            value={watchFields[0] ?? "system"}
            onValueChange={(value) => setValue("theme", value)}
          />
        </FieldWrapper>
        <FieldWrapper label="Unit system" error={errors.unit_system}>
          <Select
            options={unitOptions}
            value={watchFields[1] ?? "metric"}
            onValueChange={(value) => setValue("unit_system", value)}
          />
        </FieldWrapper>
        <FieldWrapper label="Daily water target (ml)" htmlFor="water_target_ml" error={errors.water_target_ml}>
          <Input id="water_target_ml" type="number" inputMode="numeric" {...register("water_target_ml")} />
        </FieldWrapper>
        <FieldWrapper label="Daily step target" htmlFor="step_target" error={errors.step_target}>
          <Input id="step_target" type="number" inputMode="numeric" {...register("step_target")} />
        </FieldWrapper>
        <FieldWrapper
          label="Calorie target"
          htmlFor="calorie_target"
          error={errors.calorie_target}
          hint="Optional"
        >
          <Input id="calorie_target" type="number" inputMode="numeric" placeholder="2200" {...register("calorie_target")} />
        </FieldWrapper>
      </div>

      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium">Notifications</legend>
        {notificationOptions.map((option) => (
          <label
            key={option.key}
            className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border px-4 py-3"
          >
            <div>
              <p className="text-sm font-medium">{option.label}</p>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </div>
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-primary"
              {...register(option.key)}
            />
          </label>
        ))}
      </fieldset>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Save className="mr-2 h-4 w-4" aria-hidden />
          {isPending ? "Saving..." : "Save preferences"}
        </Button>
      </div>
    </form>
  );
}
