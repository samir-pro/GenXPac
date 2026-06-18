"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product, StockStatus } from "@/types/database";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") throw new Error("Accès refusé");
  return { supabase, userId: user.id };
}

function parseProductForm(formData: FormData): Partial<Product> {
  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const images = String(formData.get("images") || "")
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);

  const num = (k: string) => {
    const v = formData.get(k);
    if (v === null || v === "") return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  return {
    name_en: String(formData.get("name_en") || ""),
    name_fr: String(formData.get("name_fr") || "") || null,
    name_ar: String(formData.get("name_ar") || "") || null,
    description_en: String(formData.get("description_en") || "") || null,
    description_fr: String(formData.get("description_fr") || "") || null,
    description_ar: String(formData.get("description_ar") || "") || null,
    brand: String(formData.get("brand") || "") || null,
    sku: String(formData.get("sku") || "") || null,
    category_id: String(formData.get("category_id") || "") || null,
    supplier_name: String(formData.get("supplier_name") || "") || null,
    supplier_url: String(formData.get("supplier_url") || "") || null,
    tags,
    images,
    cost_price: num("cost_price"),
    selling_price: num("selling_price") ?? 0,
    unit: String(formData.get("unit") || "pièce"),
    min_order_qty: num("min_order_qty") ?? 1,
    weight_kg: num("weight_kg"),
    lead_time_days: num("lead_time_days"),
    stock_status: (String(formData.get("stock_status") || "available") as StockStatus),
    is_published: formData.get("is_published") === "on",
  };
}

export async function createProduct(formData: FormData) {
  const { supabase, userId } = await assertAdmin();
  const payload = parseProductForm(formData);
  const { error } = await supabase.from("products").insert({ ...payload, created_by: userId, updated_by: userId });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const { supabase, userId } = await assertAdmin();
  const payload = parseProductForm(formData);
  const { error } = await supabase
    .from("products")
    .update({ ...payload, updated_by: userId, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(id: string) {
  const { supabase } = await assertAdmin();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
}

export async function togglePublish(id: string, next: boolean) {
  const { supabase } = await assertAdmin();
  const { error } = await supabase
    .from("products")
    .update({ is_published: next })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
}

export async function bulkImportProducts(
  products: Array<Partial<Product>>
): Promise<{ inserted: number; error?: string }> {
  const { supabase, userId } = await assertAdmin();
  if (!products.length) return { inserted: 0, error: "Aucune ligne valide" };
  const rows = products.map((p) => ({ ...p, created_by: userId, updated_by: userId }));
  const { error, count } = await supabase
    .from("products")
    .insert(rows, { count: "exact" });
  if (error) return { inserted: 0, error: error.message };
  revalidatePath("/admin/products");
  return { inserted: count ?? products.length };
}
