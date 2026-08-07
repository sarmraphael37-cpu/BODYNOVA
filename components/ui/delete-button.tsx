"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeleteButtonProps {
  action: (id: string) => Promise<void>;
  id: string;
  label?: string;
}

export function DeleteButton({ action, id, label = "Delete" }: DeleteButtonProps) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  function handleClick() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    setConfirming(false);
    startTransition(async () => {
      try {
        await action(id);
        toast.success("Deleted.");
      } catch {
        toast.error("Failed to delete. Please try again.");
      }
    });
  }

  return (
    <Button
      type="button"
      variant={confirming ? "destructive" : "ghost"}
      size="sm"
      onClick={handleClick}
      disabled={pending}
      aria-label={label}
    >
      <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden />
      {confirming ? "Confirm" : label}
    </Button>
  );
}
