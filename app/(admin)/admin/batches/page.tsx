import { createClient } from "@/lib/supabase/server";
import { BatchesManager } from "@/components/admin/batches-manager";
import type { Batch, Preorder } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function BatchesPage() {
  const supabase = await createClient();

  const [{ data: batches }, { data: preorders }] = await Promise.all([
    supabase.from("batches").select("*").order("created_at", { ascending: false }),
    supabase
      .from("preorders")
      .select("batch_id, quantity, product_id, status")
      .not("batch_id", "is", null)
      .neq("status", "cancelled"),
  ]);

  const counts: Record<string, { units: number; products: number }> = {};
  const productSets: Record<string, Set<string>> = {};
  for (const r of (preorders ?? []) as Pick<
    Preorder,
    "batch_id" | "quantity" | "product_id"
  >[]) {
    if (!r.batch_id) continue;
    if (!counts[r.batch_id]) {
      counts[r.batch_id] = { units: 0, products: 0 };
      productSets[r.batch_id] = new Set();
    }
    counts[r.batch_id].units += r.quantity || 0;
    productSets[r.batch_id].add(r.product_id);
  }
  for (const id of Object.keys(counts)) {
    counts[id].products = productSets[id].size;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Lots Chine</h2>
        <p className="text-sm text-muted-foreground">
          Regroupez les pré-commandes confirmées en lots à commander ensemble.
        </p>
      </div>
      <BatchesManager batches={(batches ?? []) as Batch[]} counts={counts} />
    </div>
  );
}
