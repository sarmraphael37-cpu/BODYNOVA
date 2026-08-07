"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldWrapper } from "@/components/ui/field";
import { IconInput } from "@/features/auth/components/icon-input";
import { PasswordInput } from "@/features/auth/components/password-input";
import { registerAction, type AuthActionState } from "@/features/auth/actions";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    registerAction,
    {}
  );

  const fieldErrors = state.fieldErrors;

  return (
    <form action={formAction} className="grid gap-4" noValidate>
      <FieldWrapper
        label="Full name"
        htmlFor="full_name"
        error={fieldErrors?.full_name?.[0]}
      >
        <IconInput
          id="full_name"
          name="full_name"
          icon={User}
          autoComplete="name"
          placeholder="Alex Johnson"
          aria-invalid={Boolean(fieldErrors?.full_name)}
        />
      </FieldWrapper>

      <FieldWrapper label="Email" htmlFor="email" error={fieldErrors?.email?.[0]}>
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

      <FieldWrapper
        label="Password"
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

      {state.error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        Create account
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        By creating an account you agree to our{" "}
        <Link href="/terms" className="text-primary hover:underline">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </form>
  );
}
