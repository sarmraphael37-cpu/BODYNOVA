import type { Metadata } from "next";
import { requireProfile } from "@/lib/dal/auth";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { calculateAge } from "@/services/calculations/fitness";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your personal profile.",
};

export default async function ProfilePage() {
  const profile = await requireProfile();

  const age = calculateAge(profile.date_of_birth);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your personal details.</p>
        </div>
        <LogoutButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal details</CardTitle>
          <CardDescription>
            {profile.email}
            {age !== null ? ` · ${age} years old` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}
