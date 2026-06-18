import { createClient } from "@/lib/supabase/server";
import { DashboardView } from "@/components/admin/dashboard-view";
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

  return (
    <DashboardView
      stats={{
        productsCount: products.count ?? 0,
        pendingCount,
        totalUnits,
        pendingClientsCount: pendingClients.count ?? 0,
        revenue,
      }}
      recent={recentRows.map((r) => ({
        id: r.id,
        quantity: r.quantity,
        status: r.status,
        created_at: r.created_at,
        productName: r.product?.name_fr ?? r.product?.name_en ?? "produit",
        shopName: r.client?.shop_name ?? "Boutique",
      }))}
    />
  );
}
