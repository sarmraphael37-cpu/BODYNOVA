import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set up your profile",
  description: "Complete your BodyNova profile to get started.",
  robots: { index: false },
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
