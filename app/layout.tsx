import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { getSiteUrl } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BodyNova — Smart Body Fitness Tracker",
    template: "%s · BodyNova",
  },
  description:
    "Track your body, understand your progress, and become your best self with BodyNova — a smart fitness intelligence platform for weight, body, workouts, nutrition, and habits.",
  keywords: [
    "fitness tracker",
    "weight tracking",
    "body measurements",
    "workout tracker",
    "nutrition tracker",
    "fitness intelligence",
    "goals",
    "habits",
  ],
  openGraph: {
    title: "BodyNova — Smart Body Fitness Tracker",
    description:
      "Track your body, understand your progress, and become your best self.",
    url: siteUrl,
    siteName: "BodyNova",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BodyNova — Smart Body Fitness Tracker",
    description:
      "Track your body, understand your progress, and become your best self.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
