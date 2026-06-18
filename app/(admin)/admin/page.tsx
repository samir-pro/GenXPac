import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Preorder, Product, Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [products, preorders, pendingClients] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("preorders")
      .select("quantity, agreed_price, status, product:products(selling_price)"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "client")
      .eq("approved", false),
  ]);

  const rows = (preorders.data ?? []) as unknown as Array<
    Pick<Preorder, "quantity" | "agreed_price" | "status"> & {
      product: Pick<Product, "selling_price"> | null;
    }
  >;

  const activeRows = rows.filter((r) => r.status !== "cancelled");
  const pendingCount = rows.filter((r) => r.status === "pending").length;
  const totalUnits = activeRows.reduce((s, r) => s + (r.quantity || 0), 0);
  const revenue = activeRows.reduce(
    (s, r) =>
      s + (r.quantity || 0) * (r.agreed_price ?? r.product?.selling_price ?? 0),
    0
  );

  const { data: recent } = await supabase
    .from("preorders")
    .select(
      "id, quantity, status, created_at, product:products(name_fr, name_en), client:profiles(shop_name)"
    )
    .order("created_at", { ascending: false })
    .limit(8);

  const recentRows = (recent ?? []) as unknown as Array<
    Pick<Preorder, "id" | "quantity" | "status" | "created_at"> & {
      product: Pick<Product, "name_fr" | "name_en"> | null;
      client: Pick<Profile, "shop_name"> | null;
    }
  >;

  const stats = [
    {
      label: "Produits",
      value: products.count ?? 0,
      icon: Package,
      href: "/admin/products",
    },
    {
      label: "Pré-commandes en attente",
      value: pendingCount,
      icon: ShoppingCart,
      href: "/admin/orders",
    },
    {
      label: "Unités à commander",
      value: totalUnits,
      icon: TrendingUp,
      href: "/admin/orders",
    },
    {
      label: "Clients à valider",
      value: pendingClients.count ?? 0,
      icon: Users,
      href: "/admin/clients",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.label} href={s.href}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{s.value}</div>
                    <div className="text-sm text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Chiffre d&apos;affaires potentiel (commandes actives)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {formatPrice(revenue)}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Basé sur {totalUnits} unités pré-commandées.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Activité récente</CardTitle>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Voir tout <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {recentRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucune pré-commande pour le moment.
            </p>
          ) : (
            <ul className="divide-y">
              {recentRows.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <div>
                    <span className="font-medium">
                      {r.client?.shop_name ?? "Boutique"}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      a commandé {r.quantity} ×{" "}
                      {r.product?.name_fr ?? r.product?.name_en ?? "produit"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(r.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
