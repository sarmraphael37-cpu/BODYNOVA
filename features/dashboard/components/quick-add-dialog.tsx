"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Droplets,
  Footprints,
  Moon,
  Scale,
  Utensils,
  ArrowRight,
} from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/utils/cn";
import {
  QuickWeightForm,
  QuickWaterForm,
  QuickActivityForm,
  QuickSleepForm,
  QuickMealForm,
} from "@/features/dashboard/components/quick-add-forms";

interface QuickAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const tabs = [
  { value: "weight", label: "Weight", icon: Scale },
  { value: "water", label: "Water", icon: Droplets },
  { value: "activity", label: "Activity", icon: Footprints },
  { value: "sleep", label: "Sleep", icon: Moon },
  { value: "meal", label: "Meal", icon: Utensils },
] as const;

type TabValue = (typeof tabs)[number]["value"];

export function QuickAddDialog({ open, onOpenChange }: QuickAddDialogProps) {
  const router = useRouter();
  const [tab, setTab] = React.useState<TabValue>("weight");

  function handleOpenChange(next: boolean) {
    if (next) setTab("weight");
    onOpenChange(next);
  }

  function handleSuccess() {
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Quick add"
      description="Log an entry in seconds — it updates your dashboard instantly."
    >
      <div
        role="tablist"
        aria-label="Quick add category"
        className="mb-5 flex flex-wrap gap-1.5 rounded-md bg-secondary p-1"
      >
        {tabs.map((item) => {
          const Icon = item.icon;
          const selected = tab === item.value;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setTab(item.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "bg-background text-foreground shadow-sm dark:bg-card"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "weight" && <QuickWeightForm onSuccess={handleSuccess} />}
      {tab === "water" && <QuickWaterForm onSuccess={handleSuccess} />}
      {tab === "activity" && <QuickActivityForm onSuccess={handleSuccess} />}
      {tab === "sleep" && <QuickSleepForm onSuccess={handleSuccess} />}
      {tab === "meal" && <QuickMealForm onSuccess={handleSuccess} />}

      <p className="mt-6 flex items-center gap-1 text-xs text-muted-foreground">
        Logging exercises with sets and reps?
        <Link
          href="/app/workouts/new"
          className="inline-flex items-center gap-0.5 font-medium text-primary underline-offset-4 hover:underline"
        >
          Log a full workout
          <ArrowRight className="h-3 w-3" aria-hidden />
        </Link>
      </p>
    </Dialog>
  );
}
