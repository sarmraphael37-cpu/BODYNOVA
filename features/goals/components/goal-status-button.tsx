"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button, type ButtonProps } from "@/components/ui/button";
import { updateGoalStatusAction } from "@/features/goals/actions";
import type { GoalStatus } from "@/types/database";

interface GoalStatusButtonProps {
  goalId: string;
  status: GoalStatus;
  label: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}

export function GoalStatusButton({
  goalId,
  status,
  label,
  variant = "outline",
  size = "sm",
}: GoalStatusButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      try {
        await updateGoalStatusAction(goalId, status);
        toast.success("Goal updated.");
      } catch {
        toast.error("Failed to update the goal.");
      }
    });
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={pending}
    >
      {label}
    </Button>
  );
}
