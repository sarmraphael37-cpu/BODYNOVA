import type { Metadata } from "next";
import { requireProfile } from "@/lib/dal/auth";
import { getDashboardData } from "@/features/dashboard/queries";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your fitness dashboard at a glance.",
};

export default async function DashboardPage() {
  const profile = await requireProfile();
  const data = await getDashboardData();

  return <DashboardContent data={data} profileName={profile.full_name ?? ""} />;
}
