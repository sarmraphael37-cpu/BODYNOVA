"use client";

import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "@/components/ui/field";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/features/auth/schemas";
import {
  resetPasswordAction,
  type AuthActionState,
} from "@/features/auth/actions";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    resetPasswordAction,
    {}
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit(() => undefined)}
      className="grid gap-4"
      noValidate
    >
      <FieldWrapper
        label="New password"
        htmlFor="password"
        error={errors.password}
        hint="At least 8 characters, including a letter and a number."
      >
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </FieldWrapper>

      <FieldWrapper
        label="Confirm new password"
        htmlFor="confirmPassword"
        error={errors.confirmPassword}
      >
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
      </FieldWrapper>

      {state.error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        Update password
      </Button>
    </form>
  );
}
