import Link from "next/link";
import { requireAdmin } from "@/lib/dal/auth";
import { Logo } from "@/components/layout/logo";
import { adminNav } from "@/components/layout/nav-config";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/utils/cn";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r bg-background">
        <div className="flex h-16 items-center border-b px-6">
          <Logo href="/admin/dashboard" />
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {adminNav.map((item) => (
            <AdminNavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="flex h-16 items-center justify-between border-b px-6">
          <p className="text-sm text-muted-foreground">Admin console</p>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/app/dashboard"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Back to app
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminNavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
      <span className="flex-1">{label}</span>
    </Link>
  );
}
