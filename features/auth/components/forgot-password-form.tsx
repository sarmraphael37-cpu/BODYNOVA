"use client";

import { useActionState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldWrapper } from "@/components/ui/field";
import { IconInput } from "@/features/auth/components/icon-input";
import {
  forgotPasswordAction,
  type AuthActionState,
} from "@/features/auth/actions";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    forgotPasswordAction,
    {}
  );

  const fieldErrors = state.fieldErrors;

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <FieldWrapper
        label="Email"
        htmlFor="email"
        error={fieldErrors?.email?.[0]}
        hint="We'll email you a 6-digit code to reset your password."
      >
        <IconInput
          id="email"
          name="email"
          type="email"
          icon={Mail}
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(fieldErrors?.email)}
        />
      </FieldWrapper>

      {state.error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        Send reset code
      </Button>
    </form>
  );
}
