import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, UserPreferences } from "@/types/database";

export type CurrentUser = {
  id: string;
  email: string;
};

export const getUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return {
    id: user.id,
    email: user.email ?? "",
  };
});

export const requireUser = cache(async (): Promise<CurrentUser> => {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
});

export const getProfile = cache(
  async (): Promise<(Profile & { preferences: UserPreferences | null }) | null> => {
    const user = await getUser();
    if (!user) return null;

    const supabase = await createClient();

    const [profileResult, preferencesResult] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    if (profileResult.error || !profileResult.data) return null;

    return {
      ...profileResult.data,
      preferences: preferencesResult.data ?? null,
    };
  }
);

export const requireProfile = cache(
  async (): Promise<Profile & { preferences: UserPreferences | null }> => {
    const profile = await getProfile();
    if (!profile) {
      redirect("/login");
    }
    if (!profile.onboarding_completed) {
      redirect("/onboarding");
    }
    return profile;
  }
);

export const isAdmin = cache(async (): Promise<boolean> => {
  const user = await getUser();
  if (!user) return false;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return data?.role === "admin";
});

export const requireAdmin = cache(async (): Promise<CurrentUser> => {
  const user = await requireUser();
  const admin = await isAdmin();
  if (!admin) {
    redirect("/app/dashboard");
  }
  return user;
});
