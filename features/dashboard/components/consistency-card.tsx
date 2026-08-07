"use client";

import { Gauge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ConsistencyRing } from "@/features/dashboard/components/consistency-ring";

interface ConsistencyCardProps {
  value: number;
}

export function ConsistencyCard({ value }: ConsistencyCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" aria-hidden />
          Consistency
        </CardTitle>
        <CardDescription>Your activity streak habit</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center py-2">
        <ConsistencyRing value={value} />
      </CardContent>
    </Card>
  );
}
