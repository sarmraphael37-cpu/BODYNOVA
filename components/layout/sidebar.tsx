"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import {
  mainNav,
  intelligenceNav,
  accountNav,
  type NavItem,
} from "@/components/layout/nav-config";
import { cn } from "@/utils/cn";
import { Separator } from "@/components/ui/separator";

function NavLinks({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1" aria-label="App navigation">
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-4 w-4" aria-hidden />
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto px-4 py-6">
      <Logo href="/app/dashboard" />
      <div className="flex flex-1 flex-col gap-6">
        <NavLinks items={mainNav} onNavigate={onNavigate} />
        <Separator />
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Intelligence
        </p>
        <NavLinks items={intelligenceNav} onNavigate={onNavigate} />
        <Separator />
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Account
        </p>
        <NavLinks items={accountNav} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
