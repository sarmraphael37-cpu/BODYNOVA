"use server";

import { randomBytes, randomInt, createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/env";
import { sendPasswordResetCode, sendWelcomeEmail } from "@/lib/email";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/features/auth/schemas";

const RESET_CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export type AuthActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

// Resolves an email to a user id using GoTrue's admin users API (service role).
// auth.users is not exposed through the PostgREST schema, so the lookup cannot
// go through the normal database client.
async function findUserIdByEmail(email: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;

  const response = await fetch(
    `${url}/auth/v1/admin/users?filter=${encodeURIComponent(email)}`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) return null;

  const body = (await response.json()) as
    | { users?: { id: string; email?: string | null }[] }
    | { id: string; email?: string | null }[];

  const users = Array.isArray(body) ? body : body.users ?? [];
  const user = users.find((entry) => (entry.email ?? "").toLowerCase() === email);
  return user?.id ?? null;
}

export async function loginAction(
  _state: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data as LoginInput;
  const supabase = await createClient();

  let signInError: { code?: string; message?: string } | null = null;
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    signInError = error;
  } catch (unexpectedError) {
    console.error("[auth] signInWithPassword threw", unexpectedError);
    return {
      error:
        "Unable to reach the sign-in service. Check your connection and try again.",
    };
  }

  if (signInError) {
    if (
      signInError.code === "email_not_confirmed" ||
      /not confirmed/i.test(signInError.message ?? "")
    ) {
      return {
        error:
          "Your email isn't confirmed yet. Check your inbox (and spam folder) for the confirmation link we sent when you signed up, then sign in again.",
      };
    }
    return { error: "Invalid email or password." };
  }

  redirect("/app/dashboard");
}

export async function registerAction(
  _state: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { full_name, email, password } = parsed.data as RegisterInput;
  const supabase = await createClient();

  const siteUrl = getSiteUrl();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered")) {
      return { error: "An account with this email already exists. Please sign in." };
    }
    return { error: error.message };
  }

  // Send the welcome email. This must never block account creation, so any
  // failure is logged and swallowed.
  if (data.user) {
    try {
      await sendWelcomeEmail(data.user.email ?? email, full_name);
    } catch (welcomeError) {
      console.error("[email] Failed to send welcome email", welcomeError);
    }
  }

  // If the project requires email confirmation, no session is returned.
  if (!data.session && data.user) {
    redirect(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  redirect("/onboarding");
}

export async function forgotPasswordAction(
  _state: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email } = parsed.data as ForgotPasswordInput;
  const normalizedEmail = email.toLowerCase();

  try {
    const userId = await findUserIdByEmail(normalizedEmail);

    // Only issue a code when the account exists. Otherwise silently skip so
    // the response never reveals whether an email is registered.
    if (userId) {
      const admin = createAdminClient();
      const code = randomInt(100000, 1000000).toString();
      const salt = randomBytes(16).toString("hex");
      const codeHash = createHash("sha256")
        .update(`${salt}:${code}`)
        .digest("hex");

      await admin.from("password_resets").insert({
        user_id: userId,
        email: normalizedEmail,
        code_hash: codeHash,
        code_salt: salt,
        expires_at: new Date(Date.now() + RESET_CODE_TTL_MS).toISOString(),
      });

      try {
        await sendPasswordResetCode(email, code);
      } catch (sendError) {
        console.error("[email] Failed to send password reset code", sendError);
      }
    }
  } catch (issueError) {
    console.error("[auth] Failed to issue password reset code", issueError);
  }

  // Always report success.
  redirect(`/forgot-password?sent=1&email=${encodeURIComponent(email)}`);
}

export async function resetPasswordAction(
  _state: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const { email, code, password } = parsed.data as ResetPasswordInput;
  const admin = createAdminClient();

  const { data: rows } = await admin
    .from("password_resets")
    .select("*")
    .eq("email", email.toLowerCase())
    .is("used_at", null)
    .order("created_at", { ascending: false })
    .limit(1);

  const reset = rows?.[0];
  if (!reset) {
    return { error: "That reset code isn't valid. Please request a new one." };
  }

  if (new Date(reset.expires_at).getTime() < Date.now()) {
    return { error: "That code has expired. Please request a new one." };
  }

  const attemptedHash = createHash("sha256")
    .update(`${reset.code_salt}:${code}`)
    .digest("hex");

  if (attemptedHash !== reset.code_hash) {
    return { error: "That reset code isn't valid. Please request a new one." };
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(
    reset.user_id,
    { password }
  );

  if (updateError) {
    return { error: updateError.message };
  }

  await admin
    .from("password_resets")
    .update({ used_at: new Date().toISOString() })
    .eq("id", reset.id);

  redirect("/login?reset=1");
}
