import { requireProfile } from "@/lib/dal/auth";
import { getNotificationsSummary } from "@/features/notifications/queries";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { MobileBottomNav } from "@/components/layout/mobile-nav";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireProfile();
  const { unreadCount, recent } = await getNotificationsSummary();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background lg:block">
        <Sidebar />
      </aside>
      <div className="lg:pl-64">
        <TopBar unreadCount={unreadCount} recentNotifications={recent} />
        <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-24 lg:px-8 lg:pb-10">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
