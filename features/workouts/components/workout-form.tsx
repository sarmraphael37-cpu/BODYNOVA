"use client";

import * as React from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  type Resolver,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useActionState } from "react";
import { toast } from "sonner";
import { Plus, X, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { FieldWrapper } from "@/components/ui/field";
import {
  createWorkoutAction,
  type WorkoutActionState,
} from "@/features/workouts/actions";
import { createWorkoutSchema } from "@/features/workouts/schemas";
import { workoutCategoryOptions } from "@/constants";
import type { Exercise } from "@/types/database";

type WorkoutFormValues = {
  date: string;
  name: string;
  category: string;
  duration_minutes: number | "";
  calories_burned: number | "";
  distance_km: number | "";
  notes: string;
  exercises: {
    exercise_id: string;
    name: string;
    sets: number | "";
    reps: number | "";
    weight_kg: number | "";
  }[];
};

interface WorkoutFormProps {
  exercises: Exercise[];
}

export function WorkoutForm({ exercises }: WorkoutFormProps) {
  const today = new Date().toISOString().slice(0, 10);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<WorkoutFormValues>({
    resolver: zodResolver(createWorkoutSchema) as unknown as Resolver<WorkoutFormValues>,
    defaultValues: {
      date: today,
      name: "",
      category: "",
      duration_minutes: "",
      calories_burned: "",
      distance_km: "",
      notes: "",
      exercises: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "exercises",
  });

  const watchedExercises = useWatch({ control, name: "exercises" }) ?? [];
  const category = useWatch({ control, name: "category" });

  const exercisesByField = React.useMemo(() => {
    const map = new Map<string, Exercise>();
    for (const exercise of exercises) map.set(exercise.id, exercise);
    return map;
  }, [exercises]);

  const exerciseOptions = exercises.map((exercise) => ({
    value: exercise.id,
    label: exercise.name,
  }));

  const [state, formAction, isPending] = useActionState<WorkoutActionState, FormData>(
    createWorkoutAction,
    {}
  );

  React.useEffect(() => {
    if (state.error) toast.error(state.error);
    if (state.success) {
      toast.success("Workout saved.");
      reset({
        date: today,
        name: "",
        category: "",
        duration_minutes: "",
        calories_burned: "",
        distance_km: "",
        notes: "",
        exercises: [],
      });
    }
  }, [state, reset, today]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (value === undefined || value === null || value === "") continue;
      formData.set(key, String(value));
    }
    formData.set("exercises", JSON.stringify(values.exercises));
    React.startTransition(() => formAction(formData));
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldWrapper label="Date" htmlFor="date" error={errors.date}>
          <Input id="date" type="date" max={today} {...register("date")} />
        </FieldWrapper>
        <FieldWrapper label="Name" htmlFor="name" error={errors.name}>
          <Input
            id="name"
            type="text"
            placeholder="Morning push day"
            {...register("name")}
          />
        </FieldWrapper>
        <FieldWrapper label="Category" htmlFor="category" error={errors.category}>
          <Select
            id="category"
            value={category}
            onValueChange={(value) => setValue("category", value)}
            options={workoutCategoryOptions}
            placeholder="Select category"
          />
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
            min={1}
            max={1440}
            placeholder="60"
            {...register("duration_minutes")}
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
            min={1}
            placeholder="350"
            {...register("calories_burned")}
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
            min={0}
            placeholder="5.0"
            {...register("distance_km")}
          />
        </FieldWrapper>
        <FieldWrapper
          label="Notes"
          htmlFor="notes"
          error={errors.notes}
          hint="Optional"
          className="sm:col-span-2"
        >
          <Textarea
            id="notes"
            rows={2}
            placeholder="Felt strong today"
            {...register("notes")}
          />
        </FieldWrapper>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Exercises</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ exercise_id: "", name: "", sets: "", reps: "", weight_kg: "" })
            }
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Add exercise
          </Button>
        </div>
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No exercises yet. Add one to record the details of your workout.
          </p>
        ) : (
          <div className="grid gap-4">
            {fields.map((field, index) => (
              <div key={field.id} className="rounded-md border p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldWrapper
                    label="Exercise"
                    error={errors.exercises?.[index]?.exercise_id}
                  >
                    <Select
                      value={watchedExercises[index]?.exercise_id ?? ""}
                      onValueChange={(value) => {
                        const exercise = exercisesByField.get(value);
                        setValue(`exercises.${index}.exercise_id`, value);
                        setValue(
                          `exercises.${index}.name`,
                          exercise ? exercise.name : ""
                        );
                      }}
                      options={exerciseOptions}
                      placeholder="Select exercise"
                    />
                  </FieldWrapper>
                  <FieldWrapper
                    label="Name"
                    error={errors.exercises?.[index]?.name}
                    hint="Optional"
                  >
                    <Input
                      type="text"
                      placeholder="Custom exercise name"
                      {...register(`exercises.${index}.name`)}
                    />
                  </FieldWrapper>
                  <FieldWrapper
                    label="Sets"
                    error={errors.exercises?.[index]?.sets}
                    hint="Optional"
                  >
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      placeholder="3"
                      {...register(`exercises.${index}.sets`)}
                    />
                  </FieldWrapper>
                  <FieldWrapper
                    label="Reps"
                    error={errors.exercises?.[index]?.reps}
                    hint="Optional"
                  >
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      placeholder="10"
                      {...register(`exercises.${index}.reps`)}
                    />
                  </FieldWrapper>
                  <FieldWrapper
                    label="Weight (kg)"
                    error={errors.exercises?.[index]?.weight_kg}
                    hint="Optional"
                  >
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      min={0}
                      placeholder="60"
                      {...register(`exercises.${index}.weight_kg`)}
                    />
                  </FieldWrapper>
                  <div className="flex items-end justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          <Dumbbell className="mr-2 h-4 w-4" aria-hidden />
          {isPending ? "Saving..." : "Save workout"}
        </Button>
      </div>
    </form>
  );
}
