"use client";

import { Store, ShoppingBag, MessageSquare } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";
import { useI18n } from "@/lib/i18n";

export function ShopShell({
  userLabel,
  children,
}: {
  userLabel: string;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const nav: NavItem[] = [
    { href: "/catalog", label: t("catalog"), icon: Store },
    { href: "/preorders", label: t("myOrders"), icon: ShoppingBag },
    { href: "/messages", label: t("messages"), icon: MessageSquare },
  ];
  return (
    <AppShell nav={nav} title="GenXPac" userLabel={userLabel}>
      {children}
    </AppShell>
  );
}
