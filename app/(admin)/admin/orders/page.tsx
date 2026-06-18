import { createClient } from "@/lib/supabase/server";
import { OrdersView, type PreorderRow } from "@/components/admin/orders-view";
import type { Batch, Product } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = await createClient();

  const [{ data: preorders }, { data: batches }] = await Promise.all([
    supabase
      .from("preorders")
      .select("*, product:products(*), client:profiles(id, shop_name, full_name)")
      .order("created_at", { ascending: false }),
    supabase.from("batches").select("*").order("created_at", { ascending: false }),
  ]);

  const rows = (preorders ?? []) as unknown as PreorderRow[];

  // Group by product
  const map = new Map<
    string,
    { product: Product; rows: PreorderRow[]; totalUnits: number; shops: number }
  >();
  for (const r of rows) {
    if (!r.product) continue;
    const existing = map.get(r.product.id);
    if (existing) {
      existing.rows.push(r);
    } else {
      map.set(r.product.id, {
        product: r.product,
        rows: [r],
        totalUnits: 0,
        shops: 0,
      });
    }
  }
  const groups = Array.from(map.values()).map((g) => {
    const active = g.rows.filter((r) => r.status !== "cancelled");
    return {
      ...g,
      totalUnits: active.reduce((s, r) => s + (r.quantity || 0), 0),
      shops: new Set(active.map((r) => r.client_id)).size,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Commandes agrégées</h2>
        <p className="text-sm text-muted-foreground">
          Total des pré-commandes par produit, regroupant toutes les boutiques.
        </p>
      </div>
      <OrdersView groups={groups} batches={(batches ?? []) as Batch[]} />
    </div>
  );
}
