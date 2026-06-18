import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ProductsTable } from "@/components/admin/products-table";
import type { Category, ProductWithMeta } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(*), creator:profiles!created_by(full_name,email), updater:profiles!updated_by(full_name,email)")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name_en"),
  ]);

  const tagSet = new Set<string>();
  for (const p of products ?? []) {
    for (const tag of ((p as unknown as { tags?: string[] }).tags ?? [])) {
      tagSet.add(tag);
    }
  }
  const allTags = Array.from(tagSet).sort();

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
      <ProductsTable
        products={(products ?? []) as unknown as ProductWithMeta[]}
        categories={(categories ?? []) as Category[]}
        allTags={allTags}
      />
    </div>
  );
}
