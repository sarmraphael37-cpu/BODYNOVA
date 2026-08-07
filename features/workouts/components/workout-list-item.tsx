"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";
import { deleteWorkoutAction } from "@/features/workouts/actions";
import { workoutCategoryOptions } from "@/constants";
import { formatMinutes, formatNumber } from "@/utils/format";
import { formatDate } from "@/utils/dates";
import type { Workout } from "@/types/database";

interface WorkoutListItemProps {
  workout: Workout;
  href: string;
}

export function WorkoutListItem({ workout, href }: WorkoutListItemProps) {
  const categoryLabel =
    workoutCategoryOptions.find(
      (option) => option.value === workout.category
    )?.label ?? workout.category;

  return (
    <li className="flex items-center justify-between gap-4 py-2.5">
      <Link href={href} className="min-w-0 flex-1 rounded-md">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span className="truncate">{workout.name}</span>
          <Badge variant="secondary" className="shrink-0">
            {categoryLabel}
          </Badge>
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDate(workout.date)}
          <span className="mx-1.5">·</span>
          {formatMinutes(workout.duration_minutes)}
          {workout.calories_burned ? (
            <>
              <span className="mx-1.5">·</span>
              {formatNumber(workout.calories_burned, 0)} kcal
            </>
          ) : null}
        </p>
      </Link>
      <DeleteButton action={deleteWorkoutAction} id={workout.id} label="Delete" />
    </li>
  );
}
