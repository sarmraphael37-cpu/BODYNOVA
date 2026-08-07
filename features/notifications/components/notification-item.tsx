"use client";

import { useTransition } from "react";
import {
  Bell,
  Dumbbell,
  Droplets,
  Scale,
  Target,
  Trophy,
  FileBarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { relativeTime } from "@/utils/dates";
import { markNotificationRead } from "@/features/notifications/actions";
import type { Notification } from "@/types/database";
import { toast } from "sonner";

const typeIcons: Record<Notification["type"], typeof Bell> = {
  workout: Dumbbell,
  water: Droplets,
  weight: Scale,
  goal: Target,
  achievement: Trophy,
  weekly_report: FileBarChart,
  system: Bell,
};

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const Icon = typeIcons[notification.type];
  const [pending, startTransition] = useTransition();

  function handleMarkRead() {
    startTransition(async () => {
      try {
        await markNotificationRead(notification.id);
      } catch {
        toast.error("Failed to mark as read. Please try again.");
      }
    });
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg px-3 py-3",
        !notification.read && "bg-muted/40"
      )}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="flex-1 truncate text-sm font-medium">
            {notification.title}
          </span>
          {!notification.read && (
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-primary"
              aria-label="Unread"
            />
          )}
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {relativeTime(notification.created_at)}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{notification.body}</p>
      </div>
      {!notification.read && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleMarkRead}
          disabled={pending}
          className="shrink-0"
        >
          Mark read
        </Button>
      )}
    </div>
  );
}
