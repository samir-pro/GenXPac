import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/product-form";
import { updateProduct } from "../../actions";
import type { Category, Product } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("name_en"),
  ]);

  if (!product) notFound();

  async function action(formData: FormData) {
    "use server";
    await updateProduct(id, formData);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Retour aux produits
      </Link>
      <h2 className="text-2xl font-bold">Modifier le produit</h2>
      <ProductForm
        categories={(categories ?? []) as Category[]}
        product={product as Product}
        action={action}
      />
    </div>
  );
}
