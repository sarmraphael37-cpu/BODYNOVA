import {
  Activity,
  Brain,
  Droplets,
  Dumbbell,
  Footprints,
  LayoutDashboard,
  Moon,
  NotepadText,
  Scale,
  Sparkles,
  Target,
  Trophy,
  Utensils,
  User,
  Settings,
  Ruler,
  BookOpen,
  Bell,
  FileBarChart,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  badge?: string;
};

export const mainNav: NavItem[] = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/weight", label: "Weight", icon: Scale },
  { href: "/app/body", label: "Body", icon: Ruler },
  { href: "/app/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/app/exercises", label: "Exercises", icon: BookOpen },
  { href: "/app/nutrition", label: "Nutrition", icon: Utensils },
  { href: "/app/hydration", label: "Hydration", icon: Droplets },
  { href: "/app/activity", label: "Activity", icon: Footprints },
  { href: "/app/sleep", label: "Sleep", icon: Moon },
  { href: "/app/goals", label: "Goals", icon: Target },
  { href: "/app/habits", label: "Habits", icon: NotepadText },
  { href: "/app/achievements", label: "Achievements", icon: Trophy },
];

export const intelligenceNav: NavItem[] = [
  { href: "/app/analytics", label: "Analytics", icon: FileBarChart },
  { href: "/app/reports", label: "Progress Reports", icon: Activity },
  { href: "/app/ai-coach", label: "AI Coach", icon: Brain, badge: "AI" },
];

export const accountNav: NavItem[] = [
  { href: "/app/notifications", label: "Notifications", icon: Bell },
  { href: "/app/profile", label: "Profile", icon: User },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export const mobileBottomNav: NavItem[] = [
  { href: "/app/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/app/analytics", label: "Progress", icon: Sparkles },
  { href: "/app/workouts", label: "Workout", icon: Dumbbell },
  { href: "/app/profile", label: "Profile", icon: User },
];

export const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: User },
  { href: "/admin/exercises", label: "Exercises", icon: Dumbbell },
  { href: "/admin/achievements", label: "Achievements", icon: Trophy },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: Activity },
];
