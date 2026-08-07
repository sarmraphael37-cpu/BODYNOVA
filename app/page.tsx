import Link from "next/link";
import {
  Activity,
  Brain,
  Droplets,
  Dumbbell,
  Footprints,
  HeartPulse,
  Moon,
  Scale,
  Sparkles,
  Target,
  Utensils,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const features = [
  {
    icon: Scale,
    title: "Weight & body tracking",
    description:
      "Log weight, body fat, and measurements, then watch your trends unfold over time.",
  },
  {
    icon: Dumbbell,
    title: "Workouts & exercises",
    description:
      "Record strength and cardio sessions against a built-in exercise library.",
  },
  {
    icon: Utensils,
    title: "Nutrition",
    description:
      "Track calories and macros to keep your nutrition aligned with your goals.",
  },
  {
    icon: Footprints,
    title: "Activity & sleep",
    description:
      "Steps, active minutes, hydration, and sleep quality in one daily snapshot.",
  },
  {
    icon: Target,
    title: "Goals & habits",
    description:
      "Set measurable goals and build habits with consistency you can see.",
  },
  {
    icon: Brain,
    title: "AI-powered coaching",
    description:
      "Personalized insights and progress reports generated from your own data.",
  },
];

const highlights = [
  { icon: HeartPulse, title: "Health first", description: "Body-composition aware guidance" },
  { icon: Sparkles, title: "Beautiful insights", description: "Charts that make progress obvious" },
  { icon: Activity, title: "Private by design", description: "Your data stays yours with row-level security" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo href="/" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden />
              Smart fitness intelligence for your body
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Track your body.{" "}
              <span className="text-primary">Understand</span> your progress.
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              BodyNova brings weight, body composition, workouts, nutrition,
              sleep, and habits together into one private dashboard with
              AI-powered coaching insights.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start tracking free
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Explore the app</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border bg-card p-6 shadow-sm"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
            <div className="flex flex-col justify-center gap-2 rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm">
              <Droplets className="h-6 w-6" aria-hidden />
              <p className="text-sm opacity-90">
                From hydration streaks to 90-day weight trends — nothing gets
                lost.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t bg-card/50">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything your fitness journey needs
              </h2>
              <p className="mt-3 text-muted-foreground">
                A single source of truth for the signals that matter.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border bg-card p-6 shadow-sm"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col items-center gap-6 rounded-3xl border bg-card p-10 text-center shadow-sm">
            <Moon className="h-8 w-8 text-primary" aria-hidden />
            <h2 className="max-w-xl text-3xl font-bold tracking-tight">
              Your best body is built one logged day at a time.
            </h2>
            <p className="max-w-md text-muted-foreground">
              Join BodyNova and turn daily tracking into measurable, lasting
              progress.
            </p>
            <Button size="lg" asChild>
              <Link href="/register">Get started free</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <Logo href="/" />
          <p>© {new Date().getFullYear()} BodyNova. Built for people who show up.</p>
        </div>
      </footer>
    </div>
  );
}
