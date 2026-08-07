"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  markAllNotificationsRead,
  clearAllNotifications,
} from "@/features/notifications/actions";
import { toast } from "sonner";

interface NotificationActionsProps {
  hasNotifications: boolean;
}

export function NotificationActions({ hasNotifications }: NotificationActionsProps) {
  const router = useRouter();
  const [markPending, markTransition] = useTransition();
  const [clearPending, clearTransition] = useTransition();

  function handleMarkAll() {
    markTransition(async () => {
      try {
        await markAllNotificationsRead();
        toast.success("All notifications marked as read.");
        router.refresh();
      } catch {
        toast.error("Failed to mark notifications as read. Please try again.");
      }
    });
  }

  function handleClearAll() {
    clearTransition(async () => {
      try {
        await clearAllNotifications();
        toast.success("All notifications cleared.");
        router.refresh();
      } catch {
        toast.error("Failed to clear notifications. Please try again.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleMarkAll}
        disabled={markPending || clearPending || !hasNotifications}
      >
        Mark all read
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleClearAll}
        disabled={clearPending || markPending || !hasNotifications}
      >
        Clear all
      </Button>
    </div>
  );
}
