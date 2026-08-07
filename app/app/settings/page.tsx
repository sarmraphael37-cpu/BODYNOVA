import type { Metadata } from "next";
import { requireProfile } from "@/lib/dal/auth";
import { PreferencesForm } from "@/features/settings/components/preferences-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your BodyNova preferences.",
};

export default async function SettingsPage() {
  const profile = await requireProfile();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Personalize your goals, units, and notifications.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
          <CardDescription>
            These apply across the whole app.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PreferencesForm preferences={profile.preferences} />
        </CardContent>
      </Card>
    </div>
  );
}
