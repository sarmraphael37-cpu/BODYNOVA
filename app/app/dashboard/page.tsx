import type { Metadata } from "next";
import { format } from "date-fns";
import { requireProfile } from "@/lib/dal/auth";
import { getDashboardData } from "@/features/dashboard/queries";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your fitness dashboard at a glance.",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ quick?: string }>;
}) {
  await requireProfile();
  const [data, params] = await Promise.all([getDashboardData(), searchParams]);

  return (
    <DashboardContent
      data={data}
      greeting={getGreeting()}
      dateLabel={format(new Date(), "EEEE, MMMM d")}
      initialQuickAdd={params.quick === "add"}
    />
  );
}
