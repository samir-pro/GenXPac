"use client";

import Link from "next/link";
import { Package, ShoppingCart, Users, TrendingUp, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatDate } from "@/lib/utils";

export interface DashboardStats {
  productsCount: number;
  pendingCount: number;
  totalUnits: number;
  pendingClientsCount: number;
  revenue: number;
}

export interface RecentRow {
  id: string;
  quantity: number;
  status: string;
  created_at: string;
  productName: string;
  shopName: string;
}

export function DashboardView({
  stats,
  recent,
}: {
  stats: DashboardStats;
  recent: RecentRow[];
}) {
  const { t } = useI18n();

  const statCards = [
    { label: t("totalProducts"), value: stats.productsCount, icon: Package, href: "/admin/products" },
    { label: t("pendingOrders"), value: stats.pendingCount, icon: ShoppingCart, href: "/admin/orders" },
    { label: t("unitsToOrder"), value: stats.totalUnits, icon: TrendingUp, href: "/admin/orders" },
    { label: t("clientsToValidate"), value: stats.pendingClientsCount, icon: Users, href: "/admin/clients" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4 md:p-6">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xl md:text-2xl font-bold">{s.value}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{s.label}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">{t("potentialRevenue")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-primary">
            {formatPrice(stats.revenue)}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("basedOn")} {stats.totalUnits} {t("preorderedUnits")}.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base md:text-lg">{t("recentActivity")}</CardTitle>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            {t("viewAll")} <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noRecentActivity")}</p>
          ) : (
            <ul className="divide-y">
              {recent.map((r) => (
                <li key={r.id} className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <span className="font-medium">{r.shopName}</span>{" "}
                    <span className="text-muted-foreground">
                      {t("orderedVerb")} {r.quantity} × {r.productName}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(r.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
