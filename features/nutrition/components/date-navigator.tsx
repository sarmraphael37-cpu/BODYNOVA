"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

interface DateNavigatorProps {
  date: string;
}

export function DateNavigator({ date }: DateNavigatorProps) {
  const router = useRouter();

  return (
    <Input
      type="date"
      value={date}
      onChange={(event) => {
        const value = event.target.value;
        if (value) router.push(`/app/nutrition?date=${value}`);
      }}
      className="w-auto"
      aria-label="View date"
    />
  );
}
