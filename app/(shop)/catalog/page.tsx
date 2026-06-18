import { createClient } from "@/lib/supabase/server";
import { CatalogBrowser } from "@/components/shop/catalog-browser";
import type { Category, Product } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name_en"),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Catalogue</h2>
      <CatalogBrowser
        products={(products ?? []) as Product[]}
        categories={(categories ?? []) as Category[]}
      />
    </div>
  );
}
