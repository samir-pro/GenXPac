"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/(auth)/actions";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

export function AppShell({
  nav,
  title,
  userLabel,
  children,
}: {
  nav: NavItem[];
  title: string;
  userLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { t, dir } = useI18n();
  const [open, setOpen] = useState(false);

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b px-4 md:px-6">
        <span className="text-xl font-bold text-primary">GenXPac</span>
        <button
          className="rounded-md p-1 text-muted-foreground hover:bg-accent md:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto space-y-1 p-3">
        {nav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" &&
              item.href !== "/catalog" &&
              pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge ? (
                <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-bold text-destructive-foreground">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <div className="mb-2 truncate px-3 text-xs text-muted-foreground">
          {userLabel}
        </div>
        <form action={logoutAction}>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 py-3">
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-e bg-background md:flex md:flex-col">
        {SidebarContent}
      </aside>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside
            className={cn(
              "absolute top-0 h-full w-72 bg-background shadow-xl",
              dir === "rtl" ? "right-0" : "left-0"
            )}
          >
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-base font-semibold md:text-lg">{title}</h1>
          </div>
          <LanguageSwitcher />
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
