import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { requireProfile } from "@/lib/dal/auth";
import { getNotifications } from "@/features/notifications/queries";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import { NotificationActions } from "@/features/notifications/components/notification-actions";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notifications",
};

export default async function NotificationsPage() {
  await requireProfile();
  const notifications = await getNotifications();

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount === 1 ? "1 unread" : `${unreadCount} unread`}
          </p>
        </div>
        <NotificationActions hasNotifications={notifications.length > 0} />
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You're all caught up. New activity will show up here."
        />
      ) : (
        <div className="divide-y rounded-xl border bg-card">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
}
