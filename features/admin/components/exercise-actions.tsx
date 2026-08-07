"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import {
  toggleExerciseStatusAction,
  deleteExerciseAction,
} from "@/features/admin/actions";
import { DeleteButton } from "@/components/ui/delete-button";
import { Button } from "@/components/ui/button";

export function ExerciseActions({
  exerciseId,
  status,
}: {
  exerciseId: string;
  status: "active" | "inactive";
}) {
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleExerciseStatusAction(exerciseId);
        toast.success(status === "active" ? "Exercise hidden." : "Exercise visible.");
      } catch {
        toast.error("Failed to update the exercise.");
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant={status === "active" ? "ghost" : "outline"}
        size="sm"
        onClick={handleToggle}
        disabled={pending}
      >
        {status === "active" ? (
          <EyeOff className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        ) : (
          <Eye className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        )}
        {status === "active" ? "Hide" : "Show"}
      </Button>
      <DeleteButton action={deleteExerciseAction} id={exerciseId} />
    </div>
  );
}
