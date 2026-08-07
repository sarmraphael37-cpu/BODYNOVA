"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Plus, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { Sidebar } from "@/components/layout/sidebar";
import { NotificationsBell } from "@/features/notifications/components/notifications-bell";
import { LogoutButton } from "@/features/auth/components/logout-button";
import type { Notification } from "@/types/database";

interface TopBarProps {
  unreadCount?: number;
  recentNotifications?: Notification[];
}

export function TopBar({ unreadCount = 0, recentNotifications = [] }: TopBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </Button>
        <span className="lg:hidden">
          <Logo href="/app/dashboard" />
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:inline-flex"
          aria-label="Quick add"
          onClick={() => router.push("/app/dashboard?quick=add")}
        >
          <Plus className="h-5 w-5" aria-hidden />
        </Button>
        <NotificationsBell unreadCount={unreadCount} recent={recentNotifications} />
        <ThemeToggle />
        <LogoutButton />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="absolute inset-y-0 left-0 w-72 border-r bg-background shadow-lg">
            <div className="flex items-center justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" aria-hidden />
              </Button>
            </div>
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </header>
  );
}
