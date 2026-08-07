"use client";

import * as React from "react";
import type { FieldError, FieldValues, Path } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils/cn";

interface FieldWrapperProps {
  label: string;
  htmlFor?: string;
  error?: FieldError;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export function FieldWrapper({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: FieldWrapperProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}

export function getFieldError<T extends FieldValues>(
  errors: Partial<Record<Path<T>, FieldError | undefined>>,
  name: Path<T>
): FieldError | undefined {
  return errors[name];
}
