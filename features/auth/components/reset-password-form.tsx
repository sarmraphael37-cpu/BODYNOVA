"use client";

import { useActionState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldWrapper } from "@/components/ui/field";
import { IconInput } from "@/features/auth/components/icon-input";
import { PasswordInput } from "@/features/auth/components/password-input";
import {
  resetPasswordAction,
  type AuthActionState,
} from "@/features/auth/actions";

export function ResetPasswordForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    resetPasswordAction,
    {}
  );

  const fieldErrors = state.fieldErrors;

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <input type="hidden" name="email" value={email} />

      <FieldWrapper
        label="Reset code"
        htmlFor="code"
        error={fieldErrors?.code?.[0]}
        hint="Enter the 6-digit code we emailed you."
      >
        <IconInput
          id="code"
          name="code"
          icon={KeyRound}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          aria-invalid={Boolean(fieldErrors?.code)}
        />
      </FieldWrapper>

      <FieldWrapper
        label="New password"
        htmlFor="password"
        error={fieldErrors?.password?.[0]}
        hint="At least 8 characters, including a letter and a number."
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={Boolean(fieldErrors?.password)}
        />
      </FieldWrapper>

      <FieldWrapper
        label="Confirm new password"
        htmlFor="confirmPassword"
        error={fieldErrors?.confirmPassword?.[0]}
      >
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="••••••••"
          aria-invalid={Boolean(fieldErrors?.confirmPassword)}
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
