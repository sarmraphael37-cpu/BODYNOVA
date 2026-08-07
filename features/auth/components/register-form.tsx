"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "@/components/ui/field";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";
import { registerAction, type AuthActionState } from "@/features/auth/actions";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    registerAction,
    {}
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { full_name: "", email: "", password: "" },
  });

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit(() => undefined)}
      className="grid gap-4"
      noValidate
    >
      <FieldWrapper label="Full name" htmlFor="full_name" error={errors.full_name}>
        <Input
          id="full_name"
          autoComplete="name"
          placeholder="Alex Johnson"
          aria-invalid={Boolean(errors.full_name)}
          {...register("full_name")}
        />
      </FieldWrapper>

      <FieldWrapper label="Email" htmlFor="email" error={errors.email}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </FieldWrapper>

      <FieldWrapper
        label="Password"
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
