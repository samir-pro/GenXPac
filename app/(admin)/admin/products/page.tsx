import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "@/components/admin/products-table";
import type { ProductWithMeta } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, creator:profiles!created_by(full_name,email), updater:profiles!updated_by(full_name,email)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Produits</h2>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4" /> Ajouter un produit
          </Button>
        </Link>
      </div>
      <ProductsTable products={(products ?? []) as unknown as ProductWithMeta[]} />
    </div>
  );
}
