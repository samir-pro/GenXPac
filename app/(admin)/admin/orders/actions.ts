"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PreorderStatus } from "@/types/database";

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
  return supabase;
}

export async function updatePreorderStatus(id: string, status: PreorderStatus) {
  const supabase = await assertAdmin();
  const { error } = await supabase
    .from("preorders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
}

export async function updateProductPreordersStatus(
  productId: string,
  status: PreorderStatus
) {
  const supabase = await assertAdmin();
  const { error } = await supabase
    .from("preorders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("product_id", productId)
    .neq("status", "cancelled");
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
}

export async function setAgreedPrice(id: string, price: number | null) {
  const supabase = await assertAdmin();
  const { error } = await supabase
    .from("preorders")
    .update({ agreed_price: price })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
}

export async function assignToBatch(productId: string, batchId: string | null) {
  const supabase = await assertAdmin();
  const { error } = await supabase
    .from("preorders")
    .update({ batch_id: batchId })
    .eq("product_id", productId)
    .neq("status", "cancelled");
  if (error) throw new Error(error.message);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/batches");
}
