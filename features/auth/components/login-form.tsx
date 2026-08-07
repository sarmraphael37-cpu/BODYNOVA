"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldWrapper } from "@/components/ui/field";
import {
  loginSchema,
  type LoginInput,
} from "@/features/auth/schemas";
import { loginAction, type AuthActionState } from "@/features/auth/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    loginAction,
    {}
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit(() => undefined)}
      className="grid gap-4"
      noValidate
    >
      <FieldWrapper
        label="Email"
        htmlFor="email"
        error={errors.email}
      >
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
      >
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
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
