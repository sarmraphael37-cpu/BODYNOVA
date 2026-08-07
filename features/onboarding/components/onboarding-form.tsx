"use client";

import * as React from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  activityLevelOptions,
  fitnessGoalOptions,
  fitnessLevelOptions,
  genderOptions,
} from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";
import { FieldWrapper } from "@/components/ui/field";
import {
  completeOnboardingAction,
  type OnboardingActionState,
} from "@/features/onboarding/actions";
import { onboardingSchema, type OnboardingInput } from "@/features/onboarding/schemas";
import { cn } from "@/utils/cn";

const steps = [
  { id: "basics", title: "About you", description: "Tell us the basics." },
  { id: "fitness", title: "Your fitness", description: "Where do you want to go?" },
  { id: "targets", title: "Daily targets", description: "Set your starting goals." },
];

const unitOptions: SelectOption[] = [
  { value: "metric", label: "Metric (kg, cm)" },
  { value: "imperial", label: "Imperial (lb, in)" },
];

export function OnboardingForm() {
  const [step, setStep] = React.useState(0);

  const resolver = zodResolver(onboardingSchema) as unknown as Resolver<OnboardingInput>;

  const {
    register,
    setValue,
    handleSubmit,
    trigger,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingInput>({
    resolver,
    defaultValues: {
      full_name: "",
      gender: undefined,
      date_of_birth: "",
      height_cm: "",
      weight_kg: "",
      unit_system: "metric",
      fitness_level: undefined,
      activity_level: undefined,
      primary_goal: undefined,
      water_target_ml: 2500,
      step_target: 8000,
    },
  });

  const [state, formAction, isPending] = useActionState<
    OnboardingActionState,
    FormData
  >(completeOnboardingAction, {});

  React.useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  const watchFields = useWatch({
    control,
    name: ["gender", "fitness_level", "activity_level", "primary_goal", "unit_system"],
  });

  const next = async () => {
    const fieldsByStep: (keyof OnboardingInput)[][] = [
      ["full_name", "gender", "date_of_birth", "height_cm", "weight_kg"],
      ["unit_system", "fitness_level", "activity_level", "primary_goal"],
      ["water_target_ml", "step_target"],
    ];
    const valid = await trigger(fieldsByStep[step]);
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === null || value === "") continue;
      formData.set(key, String(value));
    }
    React.startTransition(() => formAction(formData));
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-8">
      <ol className="flex items-center gap-2">
        {steps.map((s, index) => (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => index < step && setStep(index)}
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                index < step && "border-primary bg-primary text-primary-foreground",
                index === step && "border-primary text-primary",
                index > step && "border-border text-muted-foreground"
              )}
              aria-label={`Step ${index + 1}: ${s.title}`}
            >
              {index < step ? <Check className="h-4 w-4" aria-hidden /> : index + 1}
            </button>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-tight">{s.title}</p>
              <p className="text-xs text-muted-foreground leading-tight">
                {s.description}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="grid gap-6">
        {step === 0 && (
          <>
            <FieldWrapper
              label="Full name"
              htmlFor="full_name"
              error={errors.full_name}
            >
              <Input
                id="full_name"
                autoComplete="name"
                placeholder="Alex Nova"
                {...register("full_name")}
              />
            </FieldWrapper>
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldWrapper
                label="Gender"
                error={errors.gender}
              >
                <Select
                  options={genderOptions}
                  value={watchFields[0] ?? ""}
                  onValueChange={(value) => setValue("gender", value as OnboardingInput["gender"])}
                  placeholder="Select gender"
                />
              </FieldWrapper>
              <FieldWrapper
                label="Date of birth"
                htmlFor="date_of_birth"
                error={errors.date_of_birth}
              >
                <Input
                  id="date_of_birth"
                  type="date"
                  max={new Date().toISOString().slice(0, 10)}
                  {...register("date_of_birth")}
                />
              </FieldWrapper>
              <FieldWrapper
                label="Height (cm)"
                htmlFor="height_cm"
                error={errors.height_cm}
              >
                <Input
                  id="height_cm"
                  type="number"
                  inputMode="decimal"
                  placeholder="175"
                  {...register("height_cm")}
                />
              </FieldWrapper>
              <FieldWrapper
                label="Current weight (kg)"
                htmlFor="weight_kg"
                error={errors.weight_kg}
              >
                <Input
                  id="weight_kg"
                  type="number"
                  inputMode="decimal"
                  placeholder="70"
                  {...register("weight_kg")}
                />
              </FieldWrapper>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <FieldWrapper label="Unit system">
              <Select
                options={unitOptions}
                value={watchFields[4] ?? "metric"}
                onValueChange={(value) => setValue("unit_system", value as "metric" | "imperial")}
              />
            </FieldWrapper>
            <FieldWrapper label="Fitness level" error={errors.fitness_level}>
              <Select
                options={fitnessLevelOptions}
                value={watchFields[1] ?? ""}
                onValueChange={(value) => setValue("fitness_level", value as OnboardingInput["fitness_level"])}
                placeholder="How often do you train?"
              />
            </FieldWrapper>
            <FieldWrapper label="Activity level" error={errors.activity_level}>
              <Select
                options={activityLevelOptions}
                value={watchFields[2] ?? ""}
                onValueChange={(value) => setValue("activity_level", value as OnboardingInput["activity_level"])}
                placeholder="How active are you day to day?"
              />
            </FieldWrapper>
            <FieldWrapper label="Main goal" error={errors.primary_goal}>
              <Select
                options={fitnessGoalOptions}
                value={watchFields[3] ?? ""}
                onValueChange={(value) => setValue("primary_goal", value as OnboardingInput["primary_goal"])}
                placeholder="What do you want to achieve?"
              />
            </FieldWrapper>
          </>
        )}

        {step === 2 && (
          <>
            <FieldWrapper
              label="Daily water target (ml)"
              htmlFor="water_target_ml"
              error={errors.water_target_ml}
              hint="2,500 ml (~10 cups) is a good default."
            >
              <Input
                id="water_target_ml"
                type="number"
                inputMode="numeric"
                {...register("water_target_ml")}
              />
            </FieldWrapper>
            <FieldWrapper
              label="Daily step target"
              htmlFor="step_target"
              error={errors.step_target}
              hint="8,000 steps a day is a strong baseline."
            >
              <Input
                id="step_target"
                type="number"
                inputMode="numeric"
                {...register("step_target")}
              />
            </FieldWrapper>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={prev}
          disabled={step === 0 || isSubmitting || isPending}
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button type="button" onClick={next} disabled={isSubmitting || isPending}>
            Continue
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting || isPending}>
            {isPending || isSubmitting ? "Saving..." : "Finish setup"}
          </Button>
        )}
      </div>
    </form>
  );
}
