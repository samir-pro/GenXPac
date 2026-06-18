import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import { createProduct } from "../actions";
import type { Category } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = await createClient();
  const [{ data: categories }, { data: tagProducts }] = await Promise.all([
    supabase.from("categories").select("*").order("name_en"),
    supabase.from("products").select("tags").not("tags", "is", null),
  ]);

  const tagSet = new Set<string>();
  for (const p of tagProducts ?? []) for (const tag of (p.tags as string[]) ?? []) tagSet.add(tag);
  const allTags = Array.from(tagSet).sort();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux produits
      </Link>
      <h2 className="text-2xl font-bold">Nouveau produit</h2>
      <ProductForm
        categories={(categories ?? []) as Category[]}
        allTags={allTags}
        action={createProduct}
      />
    </div>
  );
}
