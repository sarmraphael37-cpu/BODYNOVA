"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const muscleGroupOptions: { value: string; label: string }[] = [
  { value: "all", label: "All muscle groups" },
  { value: "chest", label: "Chest" },
  { value: "back", label: "Back" },
  { value: "shoulders", label: "Shoulders" },
  { value: "arms", label: "Arms" },
  { value: "legs", label: "Legs" },
  { value: "core", label: "Core" },
  { value: "full_body", label: "Full body" },
  { value: "cardio", label: "Cardio" },
];

const difficultyOptions: { value: string; label: string }[] = [
  { value: "all", label: "All difficulties" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function ExercisesFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") ?? "";
  const currentMuscle = searchParams.get("muscle") ?? "all";
  const currentDifficulty = searchParams.get("difficulty") ?? "all";

  const updateParams = (patch: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder="Search exercises…"
          defaultValue={currentSearch}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              updateParams({ q: event.currentTarget.value });
            }
          }}
          onBlur={(event) => {
            if (event.target.value !== currentSearch) {
              updateParams({ q: event.target.value });
            }
          }}
          className="pl-9"
        />
      </div>
      <Select
        value={currentMuscle}
        onValueChange={(value) => updateParams({ muscle: value })}
        options={muscleGroupOptions}
        placeholder="Muscle group"
        className="sm:w-44"
      />
      <Select
        value={currentDifficulty}
        onValueChange={(value) => updateParams({ difficulty: value })}
        options={difficultyOptions}
        placeholder="Difficulty"
        className="sm:w-44"
      />
      {currentSearch !== "" && (
        <Button variant="ghost" size="sm" onClick={() => router.push(pathname)}>
          <X className="mr-1.5 h-4 w-4" aria-hidden />
          Clear
        </Button>
      )}
    </div>
  );
}
