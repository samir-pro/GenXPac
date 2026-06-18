"use client";

import {
  LayoutDashboard,
  Package,
  Upload,
  ShoppingCart,
  Users,
  Boxes,
  MessageSquare,
} from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";
import { useI18n } from "@/lib/i18n";

export function AdminShell({
  userLabel,
  pendingClients,
  children,
}: {
  userLabel: string;
  pendingClients: number;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const nav: NavItem[] = [
    { href: "/admin", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/admin/products", label: t("products"), icon: Package },
    { href: "/admin/import", label: t("import"), icon: Upload },
    { href: "/admin/orders", label: t("orders"), icon: ShoppingCart },
    {
      href: "/admin/clients",
      label: t("clients"),
      icon: Users,
      badge: pendingClients || undefined,
    },
    { href: "/admin/batches", label: t("batches"), icon: Boxes },
    { href: "/admin/messages", label: t("messages"), icon: MessageSquare },
  ];
  return (
    <AppShell nav={nav} title="Administration" userLabel={userLabel}>
      {children}
    </AppShell>
  );
}
