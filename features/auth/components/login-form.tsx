"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldWrapper } from "@/components/ui/field";
import { IconInput } from "@/features/auth/components/icon-input";
import { PasswordInput } from "@/features/auth/components/password-input";
import { loginAction, type AuthActionState } from "@/features/auth/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    loginAction,
    {}
  );

  const fieldErrors = state.fieldErrors;

  return (
    <form action={formAction} className="grid gap-4" noValidate>
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
      >
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={Boolean(fieldErrors?.password)}
        />
      </FieldWrapper>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-primary hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {state.error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        Sign in
      </Button>
    </form>
  );
}
