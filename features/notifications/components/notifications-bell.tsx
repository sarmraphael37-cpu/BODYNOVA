"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { relativeTime } from "@/utils/dates";
import { markNotificationRead } from "@/features/notifications/actions";
import type { Notification } from "@/types/database";

interface NotificationsBellProps {
  unreadCount: number;
  recent: Notification[];
}

export function NotificationsBell({ unreadCount, recent }: NotificationsBellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border bg-popover p-2 text-popover-foreground shadow-lg">
            <div className="flex items-center justify-between px-2 py-1.5">
              <p className="text-sm font-semibold">Notifications</p>
              <Link
                href="/app/notifications"
                className="text-xs text-primary hover:underline"
                onClick={() => setOpen(false)}
              >
                View all
              </Link>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {recent.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                  No notifications yet.
                </p>
              ) : (
                <ul className="space-y-0.5">
                  {recent.map((notification) => (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => {
                          void markNotificationRead(notification.id);
                        }}
                        className={cn(
                          "w-full rounded-md px-2 py-2 text-left text-sm hover:bg-accent",
                          !notification.read && "bg-primary/5"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex-1 font-medium">{notification.title}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {relativeTime(notification.created_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {notification.body}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
